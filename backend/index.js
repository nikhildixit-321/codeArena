const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const compression = require('compression');
const http = require('http');
const { Server } = require('socket.io');
require('./config/passport');
const authRoutes = require('./routes/auth');
const questionRoutes = require('./routes/questions');
const executeRoutes = require('./routes/execute');

const app = express();
app.use(compression());
const server = http.createServer(app);
const allowedOrigins = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : ['http://localhost:5173'];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware - Allow all origins temporarily for debugging
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'));

// Session management
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: (MongoStore.default || MongoStore).create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'sessions'
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    secure: process.env.NODE_ENV === 'production', // Set to false for development
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' // 'none' for cross-origin in production, 'lax' for development
  }
}));

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Database connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/execute', executeRoutes);
app.use('/api/match', require('./routes/matchRoutes'));
app.use('/api/users', require('./routes/users'));

// Basic route
app.get('/', (req, res) => {
  res.send('CodeGame API is running...');
});

const { executeCode } = require('./utils/judge');
const { submitToLeetCode } = require('./utils/leetcode');
const Match = require('./models/Match');
const Question = require('./models/Question');
const User = require('./models/User');

// Matchmaking Queue
let waitingQueue = [];

// Socket.io connection logic
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Identity event to track user data on socket
  socket.on('identify', ({ userId, rating }) => {
    socket.data.userId = userId;
    socket.data.rating = rating;
    console.log(`User identified: ${userId} (${socket.id}) with rating ${rating}`);
  });

  socket.on('joinMatchRoom', async ({ matchId }) => {
    try {
      socket.join(`match_${matchId}`);
      console.log(`Socket ${socket.id} joined match room: match_${matchId}`);

      // Update the match document with the new socketId to prevent accidental disconnect penalties
      const match = await Match.findById(matchId);
      if (match && match.status === 'active') {
        const userId = socket.data.userId;
        if (userId) {
          const playerIndex = match.players.findIndex(p => p.user.toString() === userId.toString());
          if (playerIndex !== -1) {
            match.players[playerIndex].socketId = socket.id;
            await match.save();
            console.log(`Updated socketId for player ${userId} in match ${matchId}`);
          }
        }
      }
    } catch (err) {
      console.error('joinMatchRoom error:', err);
    }
  });

  socket.on('joinQueue', async ({ userId }) => {
    try {
      const user = await User.findById(userId);
      if (!user) return;

      const player = {
        userId: user._id,
        socketId: socket.id,
        rating: user.rating,
        username: user.username
      };

      // Update socket data if not already set
      socket.data.userId = user._id;
      socket.data.rating = user.rating;

      // Check if user is already in queue
      if (waitingQueue.find(p => p.userId.toString() === userId.toString())) return;

      // Find match
      const opponent = waitingQueue.find(p => Math.abs(p.rating - user.rating) <= 200);

      if (opponent) {
        // Remove opponent from queue
        waitingQueue = waitingQueue.filter(p => p.userId.toString() !== opponent.userId.toString());

        // Targeted Question: Find a question close to the average rating of both players
        const avgRating = (user.rating + (opponent.rating || 600)) / 2;
        const potentialQuestions = await Question.find({
          rating: { $gte: avgRating - 300, $lte: avgRating + 300 }
        });

        const question = potentialQuestions.length > 0
          ? potentialQuestions[Math.floor(Math.random() * potentialQuestions.length)]
          : await Question.findOne().skip(Math.floor(Math.random() * await Question.countDocuments()));

        const duration = (question.timeLimit && question.timeLimit >= 60)
          ? question.timeLimit
          : (question.difficulty === 'Hard' ? 45 * 60 : question.difficulty === 'Medium' ? 25 * 60 : 15 * 60);

        // Create match
        const newMatch = await Match.create({
          players: [
            { user: opponent.userId, socketId: opponent.socketId, status: 'ready' },
            { user: user._id, socketId: socket.id, status: 'ready' }
          ],
          question: question._id,
          status: 'active',
          startTime: new Date()
        });

        const matchDataBase = {
          matchId: newMatch._id,
          question,
          duration
        };

        io.to(opponent.socketId).emit('matchFound', {
          ...matchDataBase,
          opponent: { username: user.username, rating: user.rating }
        });
        io.to(socket.id).emit('matchFound', {
          ...matchDataBase,
          opponent: { username: opponent.username, rating: opponent.rating }
        });

        // Server-side Match Auto-Ending
        setTimeout(async () => {
          const m = await Match.findById(newMatch._id);
          if (m && m.status === 'active') {
            m.status = 'completed';
            m.endTime = new Date();

            // Deciding winner by score or tie-break
            const p1 = m.players[0];
            const p2 = m.players[1];
            let winnerId = null;

            if ((p1.score || 0) > (p2.score || 0)) winnerId = p1.user;
            else if ((p2.score || 0) > (p1.score || 0)) winnerId = p2.user;
            else if ((p1.score || 0) === (p2.score || 0) && (p1.score || 0) > 0) {
              winnerId = (p1.executionTime || Infinity) < (p2.executionTime || Infinity) ? p1.user : p2.user;
            }

            m.winner = winnerId;
            let ratingChanges = [];

            if (winnerId) {
              const winner = await User.findById(winnerId);
              const loserId = m.players.find(p => p.user.toString() !== winnerId.toString()).user;
              const loser = await User.findById(loserId);

              if (winner && loser) {
                winner.rating += 20;
                winner.matchesPlayed += 1;
                winner.matchesWon += 1;
                await winner.save();

                loser.rating = Math.max(0, loser.rating - 12);
                loser.matchesPlayed += 1;
                await loser.save();

                ratingChanges = [
                  { userId: winnerId, change: 20 },
                  { userId: loserId.toString(), change: -12 }
                ];
              }
            }

            await m.save();
            io.to(`match_${newMatch._id}`).emit('matchEnded', {
              reason: 'Time expired',
              winner: winnerId,
              ratingChanges
            });
          }
        }, duration * 1000);
      } else {
        waitingQueue.push(player);
        socket.emit('waiting', { message: 'Searching for opponent...' });

        // Targeted Notification: Only notify users within +/- 150 rating range
        const sockets = await io.fetchSockets();
        const challengerRating = user.rating !== undefined ? user.rating : 600;

        for (const s of sockets) {
          // Skip if same socket or same user
          if (s.id === socket.id) continue;
          if (s.data.userId?.toString() === user._id.toString()) continue;

          const targetRating = s.data.rating !== undefined ? s.data.rating : 600;
          const ratingDiff = Math.abs(challengerRating - targetRating);

          if (ratingDiff <= 150) {
            console.log(`Sending challenge notification to socket ${s.id} (Rating: ${targetRating})`);
            s.emit('newChallenger', {
              challengerId: user._id,
              username: user.username,
              rating: user.rating,
              avatar: user.avatar
            });
          }
        }
      }
    } catch (err) {
      console.error('Matchmaking error:', err);
    }
  });

  socket.on('acceptChallenge', async ({ challengerId, acceptorId }) => {
    try {
      const challenger = waitingQueue.find(p => p.userId.toString() === challengerId.toString());
      if (!challenger) {
        socket.emit('error', { message: 'Challenge no longer available' });
        return;
      }

      const acceptorUser = await User.findById(acceptorId);
      if (!acceptorUser) return;

      // Remove challenger from queue
      waitingQueue = waitingQueue.filter(p => p.userId.toString() !== challengerId.toString());

      // Targeted Question: Find a question close to the average rating of both players
      const avgRating = (acceptorUser.rating + (challenger.rating || 600)) / 2;
      const potentialQuestions = await Question.find({
        rating: { $gte: avgRating - 300, $lte: avgRating + 300 }
      });

      const question = potentialQuestions.length > 0
        ? potentialQuestions[Math.floor(Math.random() * potentialQuestions.length)]
        : await Question.findOne().skip(Math.floor(Math.random() * await Question.countDocuments()));

      if (!question) {
        socket.emit('error', { message: 'Failed to retrieve question.' });
        return;
      }

      // Calculate duration - Use difficulty fallback if timeLimit is missing or too low (< 1 min)
      const duration = (question.timeLimit && question.timeLimit >= 60)
        ? question.timeLimit
        : (question.difficulty === 'Hard' ? 45 * 60 : question.difficulty === 'Medium' ? 25 * 60 : 15 * 60);

      // Create match
      const newMatch = await Match.create({
        players: [
          { user: challenger.userId, socketId: challenger.socketId, status: 'ready' },
          { user: acceptorUser._id, socketId: socket.id, status: 'ready' }
        ],
        question: question._id,
        status: 'active',
        startTime: new Date()
      });

      // Join both players to a private room
      const matchRoom = `match_${newMatch._id}`;
      socket.join(matchRoom);

      const challengerSocket = io.sockets.sockets.get(challenger.socketId);
      if (challengerSocket) {
        challengerSocket.join(matchRoom);
      }

      const matchDataBase = {
        matchId: newMatch._id,
        question,
        duration
      };

      io.to(challenger.socketId).emit('matchFound', {
        ...matchDataBase,
        opponent: { username: acceptorUser.username, rating: acceptorUser.rating }
      });
      io.to(socket.id).emit('matchFound', {
        ...matchDataBase,
        opponent: { username: challenger.username, rating: challenger.rating }
      });

      // Server-side Match Auto-Ending
      setTimeout(async () => {
        const m = await Match.findById(newMatch._id);
        if (m && m.status === 'active') {
          m.status = 'completed';
          m.endTime = new Date();

          const p1 = m.players[0];
          const p2 = m.players[1];
          let winnerId = null;

          if ((p1.score || 0) > (p2.score || 0)) winnerId = p1.user;
          else if ((p2.score || 0) > (p1.score || 0)) winnerId = p2.user;
          else if ((p1.score || 0) === (p2.score || 0) && (p1.score || 0) > 0) {
            winnerId = (p1.executionTime || Infinity) < (p2.executionTime || Infinity) ? p1.user : p2.user;
          }

          m.winner = winnerId;
          let ratingChanges = [];

          if (winnerId) {
            const winner = await User.findById(winnerId);
            const loserId = m.players.find(p => p.user.toString() !== winnerId.toString()).user;
            const loser = await User.findById(loserId);

            if (winner && loser) {
              winner.rating += 20;
              winner.matchesPlayed += 1;
              winner.matchesWon += 1;
              await winner.save();

              loser.rating = Math.max(0, loser.rating - 12);
              loser.matchesPlayed += 1;
              await loser.save();

              ratingChanges = [
                { userId: winnerId, change: 20 },
                { userId: loserId.toString(), change: -12 }
              ];
            }
          }

          await m.save();
          io.to(matchRoom).emit('matchEnded', {
            reason: 'Time expired',
            winner: winnerId,
            ratingChanges
          });
        }
      }, duration * 1000);

    } catch (err) {
      console.error('Accept challenge error:', err);
    }
  });

  socket.on('submitCode', async ({ matchId, userId, code, language }) => {
    try {
      const match = await Match.findById(matchId).populate('question');
      if (!match || match.status !== 'active') return;

      const playerIndex = match.players.findIndex(p => p.user.toString() === userId.toString());
      if (playerIndex === -1) return;

      // Judge the code
      const judgment = await executeCode(code, match.question.testCases, language || 'javascript');

      // Always update the code and execution time for the player
      match.players[playerIndex].code = code;
      match.players[playerIndex].executionTime = judgment.avgTime;

      if (judgment.allPassed) {
        // WINNER FOUND! End match immediately.
        match.players[playerIndex].status = 'finished';
        match.players[playerIndex].score = 100;
        match.status = 'completed';
        match.winner = userId;
        match.endTime = new Date();

        // Update user ratings (Winner +20, Loser -12)
        const winnerId = userId;
        const opponentIndex = match.players.findIndex(p => p.user.toString() !== userId.toString());
        const opponentId = match.players[opponentIndex].user;

        const winnerUser = await User.findById(winnerId);
        const loserUser = await User.findById(opponentId);

        let ratingChanges = [];

        if (winnerUser && loserUser) {
          winnerUser.rating += 20;
          winnerUser.matchesPlayed += 1;
          winnerUser.matchesWon += 1;
          await winnerUser.save();

          loserUser.rating = Math.max(0, loserUser.rating - 12);
          loserUser.matchesPlayed += 1;
          await loserUser.save();

          ratingChanges = [
            { userId: winnerId, change: 20 },
            { userId: opponentId, change: -12 }
          ];

          // --- NEW: Auto-submit to LeetCode for winner ---
          if (winnerUser.settings?.autoSubmitEnabled && winnerUser.settings?.leetcodeSession && match.question.leetcodeSlug) {
            console.log(`Auto-submitting to LeetCode for winner ${winnerUser.username}...`);
            try {
              submitToLeetCode(
                winnerUser.settings.leetcodeSession,
                match.question.leetcodeSlug,
                match.question.leetcodeId,
                language || 'javascript',
                code
              ).catch(err => console.error("Auto-submit background failure:", err.message));
            } catch (err) {
              console.error("Auto-submit initiation failed:", err.message);
            }
          }
        }

        await match.save();

        // Notify both players that the match has ended
        io.to(`match_${matchId}`).emit('matchEnded', {
          winner: winnerId,
          judgment,
          ratingChanges
        });

      } else {
        // Incorrect submission - Just notify the user and allow them to try again
        // We don't mark status as 'finished' so they can continue
        socket.emit('submissionResult', { judgment });

        // Notify opponent that the user attempted
        const opponentIndex = match.players.findIndex(p => p.user.toString() !== userId.toString());
        const opponentSocketId = match.players[opponentIndex].socketId;
        if (opponentSocketId) {
          io.to(opponentSocketId).emit('opponentSubmitted', { message: 'Opponent has submitted!' });
        }

        await match.save();
      }
    } catch (err) {
      console.error('Submission error:', err);
    }
  });

  socket.on('abortMatch', async ({ matchId, userId }) => {
    try {
      const match = await Match.findById(matchId);
      if (!match || match.status !== 'active') return;

      const player = match.players.find(p => p.user.toString() === userId.toString());
      if (!player) return;

      // Aborting user loses 20 points
      const user = await User.findById(userId);
      if (user) {
        user.rating = Math.max(0, user.rating - 20);
        user.matchesPlayed += 1;
        await user.save();
      }

      // Opponent wins and gets 20 points
      const winnerPlayer = match.players.find(p => p.user.toString() !== userId.toString());
      if (winnerPlayer) {
        const winnerUser = await User.findById(winnerPlayer.user);
        if (winnerUser) {
          winnerUser.rating += 20;
          winnerUser.matchesPlayed += 1;
          winnerUser.matchesWon += 1;
          await winnerUser.save();
        }
      }

      match.status = 'completed';
      match.winner = winnerPlayer?.user; // Opponent wins
      match.endTime = new Date();
      await match.save();

      io.to(`match_${matchId}`).emit('matchAborted', {
        abortedBy: userId,
        message: 'Opponent aborted.',
        ratingChanges: [
          { userId, change: -20 },
          { userId: winnerPlayer?.user, change: 20 }
        ]
      });

    } catch (err) {
      console.error('Abort Error:', err);
    }
  });

  socket.on('disconnect', async () => {
    console.log('User disconnected:', socket.id);
    waitingQueue = waitingQueue.filter(p => p.socketId !== socket.id);

    // Check if player was in an active match
    try {
      const activeMatch = await Match.findOne({
        status: 'active',
        'players.socketId': socket.id
      });

      if (activeMatch) {
        const userId = socket.data.userId;
        console.log(`User ${userId} disconnected during active match ${activeMatch._id}. Waiting for grace period...`);

        // 5-second grace period for reconnection
        setTimeout(async () => {
          const currentMatch = await Match.findById(activeMatch._id);
          if (!currentMatch || currentMatch.status !== 'active') return;

          const player = currentMatch.players.find(p => p.user.toString() === userId?.toString());

          // If the player's socketId is still the old one, it means they haven't reconnected
          if (player && player.socketId === socket.id) {
            console.log(`Grace period expired for user ${userId}. Ending match.`);

            const opponentPlayer = currentMatch.players.find(p => p.user.toString() !== userId?.toString());

            // Penalize the disconnected player
            const user = await User.findById(player.user);
            if (user) {
              user.rating = Math.max(0, user.rating - 20);
              user.matchesPlayed += 1;
              await user.save();
            }

            // Award win to opponent
            if (opponentPlayer) {
              const winnerUser = await User.findById(opponentPlayer.user);
              if (winnerUser) {
                winnerUser.rating += 20;
                winnerUser.matchesPlayed += 1;
                winnerUser.matchesWon += 1;
                await winnerUser.save();
              }
            }

            // Complete match
            currentMatch.status = 'completed';
            currentMatch.winner = opponentPlayer?.user;
            currentMatch.endTime = new Date();
            await currentMatch.save();

            // Notify opponent
            io.to(`match_${currentMatch._id}`).emit('matchEnded', {
              winner: opponentPlayer?.user,
              winnerId: opponentPlayer?.user,
              reason: 'Opponent disconnected',
              ratingChanges: [
                { userId: player.user, change: -20 },
                { userId: opponentPlayer?.user, change: 20 }
              ]
            });
          } else {
            console.log(`User ${userId} reconnected within grace period. Match continues.`);
          }
        }, 5000);
      }
    } catch (err) {
      console.error('Disconnect match cleanup error:', err);
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

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

// Basic route
app.get('/', (req, res) => {
  res.send('CodeGame API is running...');
});

const { executeCode } = require('./utils/judge');
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

  socket.on('joinMatchRoom', ({ matchId }) => {
    socket.join(`match_${matchId}`);
    console.log(`Socket ${socket.id} joined match room: match_${matchId}`);
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

        const duration = question.timeLimit || (question.difficulty === 'Hard' ? 45 * 60 : question.difficulty === 'Medium' ? 25 * 60 : 15 * 60);

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
            await m.save();
            io.to(`match_${newMatch._id}`).emit('matchEnded', {
              reason: 'Time expired',
              winner: null
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

      // Calculate duration
      const duration = question.timeLimit || (question.difficulty === 'Hard' ? 45 * 60 : question.difficulty === 'Medium' ? 25 * 60 : 15 * 60);

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
          await m.save();
          io.to(matchRoom).emit('matchEnded', {
            reason: 'Time expired',
            winner: null
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

      match.players[playerIndex].code = code;
      match.players[playerIndex].executionTime = judgment.avgTime;

      if (judgment.allPassed) {
        match.players[playerIndex].status = 'finished';
        match.players[playerIndex].score = 100; // Correct
      } else {
        match.players[playerIndex].status = 'finished';
        match.players[playerIndex].score = 0; // Wrong
      }

      // Check if all finished
      const allFinished = match.players.every(p => p.status === 'finished');
      if (allFinished) {
        match.status = 'completed';
        match.endTime = new Date();

        // Decide winner
        const p1 = match.players[0];
        const p2 = match.players[1];

        let winnerId = null;
        if (p1.score > p2.score) winnerId = p1.user;
        else if (p2.score > p1.score) winnerId = p2.user;
        else if (p1.score === p2.score && p1.score > 0) {
          // Tie-break with execution time
          winnerId = p1.executionTime < p2.executionTime ? p1.user : p2.user;
        }

        match.winner = winnerId;

        // Update user ratings
        if (winnerId) {
          const winner = await User.findById(winnerId);
          const loserId = match.players.find(p => p.user.toString() !== winnerId.toString()).user;
          const loser = await User.findById(loserId);

          winner.rating += 20; // New rule: +20 for win
          winner.matchesPlayed += 1;
          winner.matchesWon += 1;

          loser.rating -= 12; // New rule: -12 for loss
          loser.matchesPlayed += 1;

          await winner.save();
          await loser.save();
        }

        await match.save();
        io.to(match.players[0].socketId).emit('matchEnded', { winner: winnerId, judgment });
        io.to(match.players[1].socketId).emit('matchEnded', { winner: winnerId, judgment });
      } else {
        await match.save();
        socket.emit('submissionResult', { judgment });
        // Notify opponent
        const opponent = match.players.find(p => p.user.toString() !== userId.toString());
        io.to(opponent.socketId).emit('opponentSubmitted', { message: 'Opponent has submitted!' });
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
        user.rating -= 20;
        await user.save();
      }

      match.status = 'completed';
      match.winner = match.players.find(p => p.user.toString() !== userId.toString()).user; // Opponent wins
      await match.save();

      io.to(matchId).emit('matchAborted', { abortedBy: userId, message: 'Opponent aborted.' });

    } catch (err) {
      console.error('Abort Error:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    waitingQueue = waitingQueue.filter(p => p.socketId !== socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

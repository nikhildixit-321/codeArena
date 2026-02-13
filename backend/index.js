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
const http = require('http');
const { Server } = require('socket.io');
require('./config/passport');
const authRoutes = require('./routes/auth');
const questionRoutes = require('./routes/questions');
const executeRoutes = require('./routes/execute');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware - Allow all origins temporarily for debugging
app.use(cors({
  origin: true,
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
    secure: true, // Always true for cross-origin in production
    httpOnly: true,
    sameSite: 'none' // Required for cross-origin cookies
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

      // Check if user is already in queue
      if (waitingQueue.find(p => p.userId.toString() === userId.toString())) return;

      // Find match
      const opponent = waitingQueue.find(p => Math.abs(p.rating - user.rating) <= 200);

      if (opponent) {
        // Remove opponent from queue
        waitingQueue = waitingQueue.filter(p => p.userId.toString() !== opponent.userId.toString());

        // Select random question for the match
        const question = await Question.findOne().skip(Math.floor(Math.random() * await Question.countDocuments()));

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

        const matchData = {
          matchId: newMatch._id,
          question,
          opponent: { username: opponent.username, rating: opponent.rating }
        };

        const matchDataOpponent = {
          matchId: newMatch._id,
          question,
          opponent: { username: user.username, rating: user.rating }
        };

        io.to(opponent.socketId).emit('matchFound', matchDataOpponent);
        io.to(socket.id).emit('matchFound', matchData);
      } else {
        waitingQueue.push(player);
        socket.emit('waiting', { message: 'Searching for opponent...' });
      }
    } catch (err) {
      console.error('Matchmaking error:', err);
    }
  });

  socket.on('submitCode', async ({ matchId, userId, code }) => {
    try {
      const match = await Match.findById(matchId).populate('question');
      if (!match || match.status !== 'active') return;

      const playerIndex = match.players.findIndex(p => p.user.toString() === userId.toString());
      if (playerIndex === -1) return;

      // Judge the code
      const judgment = executeCode(code, match.question.testCases);
      
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
          
          winner.rating += 25;
          winner.matchesPlayed += 1;
          winner.matchesWon += 1;
          
          loser.rating -= 25;
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

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    waitingQueue = waitingQueue.filter(p => p.socketId !== socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

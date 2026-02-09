const mongoose = require('mongoose');
const Question = require('./models/Question');
const dotenv = require('dotenv');

dotenv.config();

const questions = [
  {
    title: "Two Sum",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    difficulty: "Easy",
    rating: 800,
    source: "LeetCode",
    testCases: [
      { input: "[2,7,11,15], 9", output: "[0,1]" },
      { input: "[3,2,4], 6", output: "[1,2]" }
    ],
    timeLimit: 1,
    memoryLimit: 256
  },
  {
    title: "Watermelon",
    description: "One hot summer day Pete and his friend Billy decided to buy a watermelon. They chose the biggest and the ripest one, in their opinion. After that the watermelon was weighed, and the scales showed w kilos. They rushed home, dying of thirst, and decided to divide the berry, however they faced a hard problem.",
    difficulty: "Easy",
    rating: 800,
    source: "Codeforces",
    testCases: [
      { input: "8", output: "YES" },
      { input: "3", output: "NO" }
    ],
    timeLimit: 1,
    memoryLimit: 256
  }
];

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    await Question.deleteMany({});
    await Question.insertMany(questions);
    console.log('Questions seeded!');
    process.exit();
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });

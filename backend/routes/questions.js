const express = require('express');
const axios = require('axios');
const router = express.Router();
const Question = require('../models/Question');

// ============================================================
// ADMIN: Seed Battle Ground questions into MongoDB
// GET /api/questions/seed-battle-questions?key=admin123
// ============================================================
const BATTLE_QUESTIONS = [
  {
    title: "Two Sum", difficulty: "Easy", rating: 800, source: "LeetCode",
    leetcodeSlug: "two-sum", leetcodeId: "1", functionName: "twoSum",
    description: "Given an array of integers <code>nums</code> and an integer <code>target</code>, return <em>indices</em> of the two numbers such that they add up to <code>target</code>.",
    examples: [{ input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "nums[0] + nums[1] == 9" }, { input: "nums = [3,2,4], target = 6", output: "[1,2]" }],
    constraints: ["2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9", "Only one valid answer exists."],
    starterCode: { javascript: "function twoSum(nums, target) {\n\n}", python: "class Solution:\n    def twoSum(self, nums, target):\n        pass", cpp: "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        \n    }\n};", java: "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        \n    }\n}" },
    testCases: [{ input: "[2,7,11,15], 9", output: "[0,1]" }, { input: "[3,2,4], 6", output: "[1,2]" }, { input: "[3,3], 6", output: "[0,1]" }]
  },
  {
    title: "Palindrome Number", difficulty: "Easy", rating: 700, source: "LeetCode",
    leetcodeSlug: "palindrome-number", leetcodeId: "9", functionName: "isPalindrome",
    description: "Given an integer <code>x</code>, return <code>true</code> if <code>x</code> is a palindrome, and <code>false</code> otherwise.",
    examples: [{ input: "x = 121", output: "true", explanation: "121 reads as 121 from both ends." }, { input: "x = -121", output: "false" }],
    constraints: ["-2^31 <= x <= 2^31 - 1"],
    starterCode: { javascript: "function isPalindrome(x) {\n\n}", python: "class Solution:\n    def isPalindrome(self, x):\n        pass", cpp: "class Solution {\npublic:\n    bool isPalindrome(int x) {\n        \n    }\n};", java: "class Solution {\n    public boolean isPalindrome(int x) {\n        \n    }\n}" },
    testCases: [{ input: "121", output: "true" }, { input: "-121", output: "false" }, { input: "10", output: "false" }]
  },
  {
    title: "FizzBuzz", difficulty: "Easy", rating: 600, source: "LeetCode",
    leetcodeSlug: "fizz-buzz", leetcodeId: "412", functionName: "fizzBuzz",
    description: "Given an integer <code>n</code>, return a string array where multiples of 3 are \"Fizz\", multiples of 5 are \"Buzz\", multiples of both are \"FizzBuzz\", otherwise the number itself.",
    examples: [{ input: "n = 3", output: '["1","2","Fizz"]' }, { input: "n = 5", output: '["1","2","Fizz","4","Buzz"]' }],
    constraints: ["1 <= n <= 10^4"],
    starterCode: { javascript: "function fizzBuzz(n) {\n\n}", python: "class Solution:\n    def fizzBuzz(self, n):\n        pass", cpp: "class Solution {\npublic:\n    vector<string> fizzBuzz(int n) {\n        \n    }\n};", java: "class Solution {\n    public List<String> fizzBuzz(int n) {\n        \n    }\n}" },
    testCases: [{ input: "3", output: '["1","2","Fizz"]' }, { input: "5", output: '["1","2","Fizz","4","Buzz"]' }, { input: "15", output: '["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]' }]
  },
  {
    title: "Running Sum of 1d Array", difficulty: "Easy", rating: 650, source: "LeetCode",
    leetcodeSlug: "running-sum-of-1d-array", leetcodeId: "1480", functionName: "runningSum",
    description: "Given an array <code>nums</code>, return the running sum where <code>runningSum[i] = sum(nums[0]…nums[i])</code>.",
    examples: [{ input: "nums = [1,2,3,4]", output: "[1,3,6,10]" }, { input: "nums = [1,1,1,1,1]", output: "[1,2,3,4,5]" }],
    constraints: ["1 <= nums.length <= 1000"],
    starterCode: { javascript: "function runningSum(nums) {\n\n}", python: "class Solution:\n    def runningSum(self, nums):\n        pass", cpp: "class Solution {\npublic:\n    vector<int> runningSum(vector<int>& nums) {\n        \n    }\n};", java: "class Solution {\n    public int[] runningSum(int[] nums) {\n        \n    }\n}" },
    testCases: [{ input: "[1,2,3,4]", output: "[1,3,6,10]" }, { input: "[1,1,1,1,1]", output: "[1,2,3,4,5]" }, { input: "[3,1,2,10,1]", output: "[3,4,6,16,17]" }]
  },
  {
    title: "Contains Duplicate", difficulty: "Easy", rating: 750, source: "LeetCode",
    leetcodeSlug: "contains-duplicate", leetcodeId: "217", functionName: "containsDuplicate",
    description: "Given an integer array <code>nums</code>, return <code>true</code> if any value appears at least twice, and <code>false</code> if every element is distinct.",
    examples: [{ input: "nums = [1,2,3,1]", output: "true" }, { input: "nums = [1,2,3,4]", output: "false" }],
    constraints: ["1 <= nums.length <= 10^5"],
    starterCode: { javascript: "function containsDuplicate(nums) {\n\n}", python: "class Solution:\n    def containsDuplicate(self, nums):\n        pass", cpp: "class Solution {\npublic:\n    bool containsDuplicate(vector<int>& nums) {\n        \n    }\n};", java: "class Solution {\n    public boolean containsDuplicate(int[] nums) {\n        \n    }\n}" },
    testCases: [{ input: "[1,2,3,1]", output: "true" }, { input: "[1,2,3,4]", output: "false" }, { input: "[1,1,1,3,3,4,3,2,4,2]", output: "true" }]
  },
  {
    title: "Maximum Subarray", difficulty: "Easy", rating: 850, source: "LeetCode",
    leetcodeSlug: "maximum-subarray", leetcodeId: "53", functionName: "maxSubArray",
    description: "Given an integer array <code>nums</code>, find the contiguous subarray which has the largest sum and return its sum.",
    examples: [{ input: "nums = [-2,1,-3,4,-1,2,1,-5,4]", output: "6", explanation: "[4,-1,2,1] has sum 6." }],
    constraints: ["1 <= nums.length <= 10^5"],
    starterCode: { javascript: "function maxSubArray(nums) {\n\n}", python: "class Solution:\n    def maxSubArray(self, nums):\n        pass", cpp: "class Solution {\npublic:\n    int maxSubArray(vector<int>& nums) {\n        \n    }\n};", java: "class Solution {\n    public int maxSubArray(int[] nums) {\n        \n    }\n}" },
    testCases: [{ input: "[-2,1,-3,4,-1,2,1,-5,4]", output: "6" }, { input: "[1]", output: "1" }, { input: "[5,4,-1,7,8]", output: "23" }]
  },
  {
    title: "Best Time to Buy and Sell Stock", difficulty: "Easy", rating: 900, source: "LeetCode",
    leetcodeSlug: "best-time-to-buy-and-sell-stock", leetcodeId: "121", functionName: "maxProfit",
    description: "Given an array of prices, return the maximum profit you can achieve from a single buy and sell. Return 0 if no profit is possible.",
    examples: [{ input: "prices = [7,1,5,3,6,4]", output: "5" }, { input: "prices = [7,6,4,3,1]", output: "0" }],
    constraints: ["1 <= prices.length <= 10^5"],
    starterCode: { javascript: "function maxProfit(prices) {\n\n}", python: "class Solution:\n    def maxProfit(self, prices):\n        pass", cpp: "class Solution {\npublic:\n    int maxProfit(vector<int>& prices) {\n        \n    }\n};", java: "class Solution {\n    public int maxProfit(int[] prices) {\n        \n    }\n}" },
    testCases: [{ input: "[7,1,5,3,6,4]", output: "5" }, { input: "[7,6,4,3,1]", output: "0" }, { input: "[1,2]", output: "1" }]
  },
  {
    title: "Valid Parentheses", difficulty: "Easy", rating: 820, source: "LeetCode",
    leetcodeSlug: "valid-parentheses", leetcodeId: "20", functionName: "isValid",
    description: "Given a string <code>s</code> of brackets '()[]{}', determine if the input string is valid (properly closed and ordered).",
    examples: [{ input: 's = "()"', output: "true" }, { input: 's = "()[]{}"', output: "true" }, { input: 's = "(]"', output: "false" }],
    constraints: ["1 <= s.length <= 10^4", "s consists of parentheses only '()[]{}'."],
    starterCode: { javascript: "function isValid(s) {\n\n}", python: "class Solution:\n    def isValid(self, s):\n        pass", cpp: "class Solution {\npublic:\n    bool isValid(string s) {\n        \n    }\n};", java: "class Solution {\n    public boolean isValid(String s) {\n        \n    }\n}" },
    testCases: [{ input: '"()"', output: "true" }, { input: '"()[]{}"', output: "true" }, { input: '"(]"', output: "false" }]
  },
  {
    title: "Climbing Stairs", difficulty: "Easy", rating: 860, source: "LeetCode",
    leetcodeSlug: "climbing-stairs", leetcodeId: "70", functionName: "climbStairs",
    description: "You are climbing a staircase with <code>n</code> steps. You can climb 1 or 2 steps at a time. In how many distinct ways can you reach the top?",
    examples: [{ input: "n = 2", output: "2" }, { input: "n = 3", output: "3" }],
    constraints: ["1 <= n <= 45"],
    starterCode: { javascript: "function climbStairs(n) {\n\n}", python: "class Solution:\n    def climbStairs(self, n):\n        pass", cpp: "class Solution {\npublic:\n    int climbStairs(int n) {\n        \n    }\n};", java: "class Solution {\n    public int climbStairs(int n) {\n        \n    }\n}" },
    testCases: [{ input: "2", output: "2" }, { input: "3", output: "3" }, { input: "5", output: "8" }]
  },
  {
    title: "Binary Search", difficulty: "Easy", rating: 760, source: "LeetCode",
    leetcodeSlug: "binary-search", leetcodeId: "704", functionName: "search",
    description: "Given an array of integers <code>nums</code> sorted in ascending order, and an integer <code>target</code>, return the index. If not found, return -1.",
    examples: [{ input: "nums = [-1,0,3,5,9,12], target = 9", output: "4" }, { input: "nums = [-1,0,3,5,9,12], target = 2", output: "-1" }],
    constraints: ["1 <= nums.length <= 10^4", "All elements are unique.", "nums is sorted ascending."],
    starterCode: { javascript: "function search(nums, target) {\n\n}", python: "class Solution:\n    def search(self, nums, target):\n        pass", cpp: "class Solution {\npublic:\n    int search(vector<int>& nums, int target) {\n        \n    }\n};", java: "class Solution {\n    public int search(int[] nums, int target) {\n        \n    }\n}" },
    testCases: [{ input: "[-1,0,3,5,9,12], 9", output: "4" }, { input: "[-1,0,3,5,9,12], 2", output: "-1" }, { input: "[5], 5", output: "0" }]
  },
  {
    title: "Longest Substring Without Repeating Characters", difficulty: "Medium", rating: 1200, source: "LeetCode",
    leetcodeSlug: "longest-substring-without-repeating-characters", leetcodeId: "3", functionName: "lengthOfLongestSubstring",
    description: "Given a string <code>s</code>, find the length of the longest substring without repeating characters.",
    examples: [{ input: 's = "abcabcbb"', output: "3", explanation: '"abc" has length 3.' }, { input: 's = "bbbbb"', output: "1" }],
    constraints: ["0 <= s.length <= 5 * 10^4"],
    starterCode: { javascript: "function lengthOfLongestSubstring(s) {\n\n}", python: "class Solution:\n    def lengthOfLongestSubstring(self, s):\n        pass", cpp: "class Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        \n    }\n};", java: "class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        \n    }\n}" },
    testCases: [{ input: '"abcabcbb"', output: "3" }, { input: '"bbbbb"', output: "1" }, { input: '"pwwkew"', output: "3" }]
  },
  {
    title: "Reverse Integer", difficulty: "Medium", rating: 1000, source: "LeetCode",
    leetcodeSlug: "reverse-integer", leetcodeId: "7", functionName: "reverse",
    description: "Given a signed 32-bit integer <code>x</code>, return <code>x</code> with its digits reversed. Return 0 if result overflows 32-bit range.",
    examples: [{ input: "x = 123", output: "321" }, { input: "x = -123", output: "-321" }],
    constraints: ["-2^31 <= x <= 2^31 - 1"],
    starterCode: { javascript: "function reverse(x) {\n\n}", python: "class Solution:\n    def reverse(self, x):\n        pass", cpp: "class Solution {\npublic:\n    int reverse(int x) {\n        \n    }\n};", java: "class Solution {\n    public int reverse(int x) {\n        \n    }\n}" },
    testCases: [{ input: "123", output: "321" }, { input: "-123", output: "-321" }, { input: "120", output: "21" }]
  },
  {
    title: "Product of Array Except Self", difficulty: "Medium", rating: 1250, source: "LeetCode",
    leetcodeSlug: "product-of-array-except-self", leetcodeId: "238", functionName: "productExceptSelf",
    description: "Given an integer array <code>nums</code>, return an array where each element is the product of all other elements (without division, in O(n)).",
    examples: [{ input: "nums = [1,2,3,4]", output: "[24,12,8,6]" }],
    constraints: ["2 <= nums.length <= 10^5"],
    starterCode: { javascript: "function productExceptSelf(nums) {\n\n}", python: "class Solution:\n    def productExceptSelf(self, nums):\n        pass", cpp: "class Solution {\npublic:\n    vector<int> productExceptSelf(vector<int>& nums) {\n        \n    }\n};", java: "class Solution {\n    public int[] productExceptSelf(int[] nums) {\n        \n    }\n}" },
    testCases: [{ input: "[1,2,3,4]", output: "[24,12,8,6]" }, { input: "[-1,1,0,-3,3]", output: "[0,0,9,0,0]" }]
  },
  {
    title: "Find Minimum in Rotated Sorted Array", difficulty: "Medium", rating: 1150, source: "LeetCode",
    leetcodeSlug: "find-minimum-in-rotated-sorted-array", leetcodeId: "153", functionName: "findMin",
    description: "Given a rotated sorted array of unique elements, return the minimum element in O(log n) time.",
    examples: [{ input: "nums = [3,4,5,1,2]", output: "1" }, { input: "nums = [4,5,6,7,0,1,2]", output: "0" }],
    constraints: ["1 <= n <= 5000", "All integers are unique."],
    starterCode: { javascript: "function findMin(nums) {\n\n}", python: "class Solution:\n    def findMin(self, nums):\n        pass", cpp: "class Solution {\npublic:\n    int findMin(vector<int>& nums) {\n        \n    }\n};", java: "class Solution {\n    public int findMin(int[] nums) {\n        \n    }\n}" },
    testCases: [{ input: "[3,4,5,1,2]", output: "1" }, { input: "[4,5,6,7,0,1,2]", output: "0" }, { input: "[11,13,15,17]", output: "11" }]
  },
  {
    title: "3Sum", difficulty: "Medium", rating: 1350, source: "LeetCode",
    leetcodeSlug: "3sum", leetcodeId: "15", functionName: "threeSum",
    description: "Given an integer array nums, return all triplets [nums[i], nums[j], nums[k]] such that they sum to zero (no duplicates).",
    examples: [{ input: "nums = [-1,0,1,2,-1,-4]", output: "[[-1,-1,2],[-1,0,1]]" }],
    constraints: ["3 <= nums.length <= 3000"],
    starterCode: { javascript: "function threeSum(nums) {\n\n}", python: "class Solution:\n    def threeSum(self, nums):\n        pass", cpp: "class Solution {\npublic:\n    vector<vector<int>> threeSum(vector<int>& nums) {\n        \n    }\n};", java: "class Solution {\n    public List<List<Integer>> threeSum(int[] nums) {\n        \n    }\n}" },
    testCases: [{ input: "[-1,0,1,2,-1,-4]", output: "[[-1,-1,2],[-1,0,1]]" }, { input: "[0,1,1]", output: "[]" }, { input: "[0,0,0]", output: "[[0,0,0]]" }]
  },
  {
    title: "Median of Two Sorted Arrays", difficulty: "Hard", rating: 1800, source: "LeetCode",
    leetcodeSlug: "median-of-two-sorted-arrays", leetcodeId: "4", functionName: "findMedianSortedArrays",
    description: "Given two sorted arrays <code>nums1</code> and <code>nums2</code>, return the median of the merged sorted array in O(log(m+n)).",
    examples: [{ input: "nums1 = [1,3], nums2 = [2]", output: "2.00000" }, { input: "nums1 = [1,2], nums2 = [3,4]", output: "2.50000" }],
    constraints: ["0 <= m, n <= 1000"],
    starterCode: { javascript: "function findMedianSortedArrays(nums1, nums2) {\n\n}", python: "class Solution:\n    def findMedianSortedArrays(self, nums1, nums2):\n        pass", cpp: "class Solution {\npublic:\n    double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {\n        \n    }\n};", java: "class Solution {\n    public double findMedianSortedArrays(int[] nums1, int[] nums2) {\n        \n    }\n}" },
    testCases: [{ input: "[1,3], [2]", output: "2.00000" }, { input: "[1,2], [3,4]", output: "2.50000" }]
  },
];

router.get('/seed-battle-questions', async (req, res) => {
  if (req.query.key !== 'battleground2025') {
    return res.status(403).json({ message: 'Forbidden: Invalid key' });
  }
  try {
    const results = [];
    for (const q of BATTLE_QUESTIONS) {
      const existing = await Question.findOne({ leetcodeId: q.leetcodeId });
      if (existing) {
        await Question.findByIdAndUpdate(existing._id, q, { new: true });
        results.push(`Updated: ${q.title}`);
      } else {
        await Question.create(q);
        results.push(`Created: ${q.title}`);
      }
    }
    const total = await Question.countDocuments();
    res.json({ success: true, results, totalInDB: total });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================
// ADMIN: Sync ALL ~3000 free LeetCode questions into MongoDB
// GET /api/questions/sync-leetcode?key=battleground2025
// This runs in background — check /api/questions/count to see progress
// ============================================================
const { fetchAllLeetCodeQuestions, fetchQuestionDetails, buildQuestionDoc } = require('../utils/leetcodeSync');

let syncStatus = { running: false, done: 0, total: 0, errors: 0, lastError: '' };

router.get('/sync-status', (req, res) => {
  res.json(syncStatus);
});

router.get('/count', async (req, res) => {
  try {
    const count = await require('../models/Question').countDocuments();
    res.json({ total: count });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/sync-leetcode', async (req, res) => {
  if (req.query.key !== 'battleground2025') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  if (syncStatus.running) {
    return res.json({ message: 'Sync already in progress', syncStatus });
  }

  // Start sync in background - don't await so the request returns immediately
  res.json({ message: '🚀 Sync started in background! Visit /api/questions/sync-status to check progress.' });

  (async () => {
    syncStatus = { running: true, done: 0, total: 0, errors: 0, lastError: '' };
    try {
      const LC_Q = require('../models/Question');
      console.log('📥 Fetching all LeetCode questions...');
      const allQuestions = await fetchAllLeetCodeQuestions(3500);
      syncStatus.total = allQuestions.length;
      console.log(`✅ Got ${allQuestions.length} questions. Starting detail sync...`);

      // Process in batches of 5 (to avoid rate limiting)
      const BATCH_SIZE = 5;
      const DELAY_MS = 1500; // 1.5s between batches to avoid rate limit

      for (let i = 0; i < allQuestions.length; i += BATCH_SIZE) {
        const batch = allQuestions.slice(i, i + BATCH_SIZE);

        await Promise.all(batch.map(async (basic) => {
          try {
            // Skip if already in DB
            const exists = await LC_Q.findOne({ leetcodeId: basic.id });
            if (exists) {
              syncStatus.done++;
              return;
            }

            // Fetch full details
            const details = await fetchQuestionDetails(basic.titleSlug);
            const doc = buildQuestionDoc(basic, details);

            // Only save if we have test cases
            if (doc.testCases.length > 0) {
              await LC_Q.create(doc);
            } else {
              // Save without test cases - still useful for display
              doc.testCases = [{ input: 'N/A', output: 'N/A', isHidden: false }];
              await LC_Q.create(doc);
            }
            syncStatus.done++;
          } catch (err) {
            syncStatus.errors++;
            syncStatus.lastError = `${basic.title}: ${err.message}`;
            syncStatus.done++;
          }
        }));

        // Rate limit delay between batches
        await new Promise(r => setTimeout(r, DELAY_MS));

        if (i % 50 === 0) {
          const total = await require('../models/Question').countDocuments();
          console.log(`📊 Progress: ${syncStatus.done}/${syncStatus.total} processed | ${total} in DB`);
        }
      }

      syncStatus.running = false;
      const finalCount = await require('../models/Question').countDocuments();
      console.log(`🎉 Sync complete! Total in DB: ${finalCount}`);
    } catch (err) {
      syncStatus.running = false;
      syncStatus.lastError = err.message;
      console.error('❌ Sync failed:', err.message);
    }
  })();
});

// ============================================================
// Battle Ground: Get a random question by difficulty/rating
// GET /api/questions/battle-random?difficulty=Easy
// ============================================================
router.get('/battle-random', async (req, res) => {
  try {
    const LC_Q = require('../models/Question');
    const { difficulty, minRating = 0, maxRating = 9999 } = req.query;

    const filter = {};
    if (difficulty) filter.difficulty = difficulty;
    if (minRating || maxRating) filter.rating = { $gte: parseInt(minRating), $lte: parseInt(maxRating) };
    // Must have at least one resolvable test case
    filter['testCases.0'] = { $exists: true };

    const count = await LC_Q.countDocuments(filter);
    if (count === 0) return res.status(404).json({ message: 'No questions found' });

    const randomSkip = Math.floor(Math.random() * count);
    const question = await LC_Q.findOne(filter).skip(randomSkip);
    res.json(question);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// In-memory cache
const cache = {
  cfProblems: null,
  cfTime: 0,
  leetcodeList: new Map(), // Map<query, {data, time}>
  leetcodeTopics: null
};

const CACHE_TTL = 30 * 60 * 1000; // 30 minutes
const LEETCODE_API = 'https://leetcode.com/graphql';

// Fetch Codeforces Problems with pagination and rating filter
router.get('/codeforces', async (req, res) => {
  try {
    const { page = 1, limit = 50, minRating = 0, maxRating = 5000, search = '', difficulty = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    let allProblems;
    const now = Date.now();

    if (cache.cfProblems && (now - cache.cfTime < CACHE_TTL)) {
      allProblems = cache.cfProblems;
    } else {
      const response = await axios.get('https://codeforces.com/api/problemset.problems');
      if (response.data.status !== 'OK') {
        return res.status(500).json({ message: 'Codeforces API error' });
      }
      allProblems = response.data.result.problems;
      cache.cfProblems = allProblems;
      cache.cfTime = now;
    }

    // Filter by rating and search
    let cfMin = parseInt(minRating);
    let cfMax = parseInt(maxRating);
    if (difficulty === 'Easy') { cfMin = 0; cfMax = 1200; }
    else if (difficulty === 'Medium') { cfMin = 1201; cfMax = 1900; }
    else if (difficulty === 'Hard') { cfMin = 1901; cfMax = 5000; }

    allProblems = allProblems.filter(p => {
      const rating = p.rating || 0;
      const matchesRating = rating >= cfMin && rating <= cfMax;
      const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
      return matchesRating && matchesSearch;
    });

    // Sort by rating (ascending)
    allProblems.sort((a, b) => (a.rating || 0) - (b.rating || 0));

    const total = allProblems.length;

    // Paginate results
    const paginatedProblems = allProblems.slice(skip, skip + parseInt(limit));

    const formattedProblems = paginatedProblems.map(p => ({
      id: p.contestId ? `${p.contestId}${p.index}` : p.index,
      title: p.name,
      titleSlug: p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      difficulty: p.rating || 'Unrated',
      tags: p.tags || [],
      contestId: p.contestId,
      index: p.index,
      problemsetName: p.problemsetName,
      type: p.type,
      points: p.points,
      source: 'Codeforces',
      link: p.contestId
        ? `https://codeforces.com/problemset/problem/${p.contestId}/${p.index}`
        : `https://codeforces.com/problemsets`,
      updatedAt: new Date().toISOString()
    }));

    res.json({
      total: total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
      questions: formattedProblems
    });
  } catch (err) {
    console.error('Codeforces Fetch Error:', err.message);
    res.status(500).json({
      message: 'Failed to fetch from Codeforces',
      error: err.message
    });
  }
});

// Fetch Codeforces rating ranges
router.get('/codeforces/ratings', async (req, res) => {
  try {
    const response = await axios.get('https://codeforces.com/api/problemset.problems');

    if (response.data.status !== 'OK') {
      return res.status(500).json({ message: 'Failed to fetch' });
    }

    const problems = response.data.result.problems;
    const ratings = [...new Set(problems.map(p => p.rating).filter(r => r))].sort((a, b) => a - b);

    // Group into ranges
    const ranges = [];
    for (let i = 0; i < ratings.length; i += 100) {
      const min = ratings[i];
      const max = ratings[Math.min(i + 99, ratings.length - 1)];
      ranges.push({ min, max, label: `${min}-${max}` });
    }

    res.json(ranges);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Fetch Codeforces Featured Problem (from recent contest)
router.get('/codeforces/featured', async (req, res) => {
  try {
    // Get recent contests
    const contestsRes = await axios.get('https://codeforces.com/api/contest.list?gym=false');

    if (contestsRes.data.status !== 'OK') {
      return res.status(500).json({ message: 'Failed to fetch contests' });
    }

    // Find most recent finished contest
    const finishedContests = contestsRes.data.result.filter(c => c.phase === 'FINISHED');
    const recentContest = finishedContests[0];

    if (!recentContest) {
      return res.status(404).json({ message: 'No recent contests found' });
    }

    // Get problems from recent contest
    const problemsRes = await axios.get(`https://codeforces.com/api/contest.standings?contestId=${recentContest.id}&from=1&count=1`);

    if (problemsRes.data.status !== 'OK') {
      return res.status(500).json({ message: 'Failed to fetch contest problems' });
    }

    const problems = problemsRes.data.result.problems;
    const featuredProblem = problems[0];

    res.json({
      contest: {
        id: recentContest.id,
        name: recentContest.name,
        startTime: new Date(recentContest.startTimeSeconds * 1000).toISOString()
      },
      question: {
        id: `${featuredProblem.contestId}${featuredProblem.index}`,
        title: featuredProblem.name,
        difficulty: featuredProblem.rating || 'Unrated',
        tags: featuredProblem.tags || [],
        contestId: featuredProblem.contestId,
        index: featuredProblem.index,
        source: 'Codeforces Featured',
        link: `https://codeforces.com/problemset/problem/${featuredProblem.contestId}/${featuredProblem.index}`
      }
    });
  } catch (err) {
    console.error('Codeforces Featured Error:', err.message);
    res.status(500).json({ message: 'Failed to fetch featured problem' });
  }
});

// Fetch LeetCode Topics
router.get('/leetcode/topics', async (req, res) => {
  try {
    const LEETCODE_API = 'https://leetcode.com/graphql';

    const query = `
      query getTopicTags {
        topicTagSlugs
      }
    `;

    const response = await axios.post(LEETCODE_API, { query }, {
      headers: {
        'Content-Type': 'application/json',
        'Referer': 'https://leetcode.com/',
        'Origin': 'https://leetcode.com',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    // Fallback: Common LeetCode topics
    const commonTopics = [
      'Array', 'String', 'Hash Table', 'Math', 'Dynamic Programming',
      'Sorting', 'Greedy', 'Depth-First Search', 'Binary Search', 'Database',
      'Breadth-First Search', 'Tree', 'Matrix', 'Two Pointers', 'Binary Tree',
      'Bit Manipulation', 'Heap (Priority Queue)', 'Stack', 'Prefix Sum',
      'Simulation', 'Graph', 'Design', 'Counting', 'Sliding Window', 'Backtracking'
    ];

    res.json(commonTopics);
  } catch (err) {
    // Return common topics if API fails
    res.json([
      'Array', 'String', 'Hash Table', 'Math', 'Dynamic Programming',
      'Sorting', 'Greedy', 'Depth-First Search', 'Binary Search', 'Database',
      'Breadth-First Search', 'Tree', 'Matrix', 'Two Pointers', 'Binary Tree'
    ]);
  }
});

// Fetch LeetCode Problems by Topic
router.get('/leetcode/topic/:topicSlug', async (req, res) => {
  try {
    const { topicSlug } = req.params;
    const { page = 1, limit = 50, search = '', difficulty = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const now = Date.now();
    const cacheKey = `topic_${topicSlug}_${page}_${limit}_${search}_${difficulty}`;
    if (cache.leetcodeList.has(cacheKey) && (now - cache.leetcodeList.get(cacheKey).time < CACHE_TTL)) {
      return res.json(cache.leetcodeList.get(cacheKey).data);
    }

    const filters = { tags: [topicSlug] };
    if (search) filters.searchKeywords = search;
    if (difficulty && difficulty !== 'all') filters.difficulty = difficulty.toUpperCase();

    const query = `
      query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
        problemsetQuestionList: questionList(
          categorySlug: $categorySlug
          limit: $limit
          skip: $skip
          filters: $filters
        ) {
          total: totalNum
          questions: data {
            id: questionFrontendId
            title: questionTitle
            titleSlug
            difficulty
            topicTags { name slug }
            stats
          }
        }
      }
    `;

    const response = await axios.post(LEETCODE_API, {
      query,
      variables: {
        categorySlug: "",
        limit: parseInt(limit),
        skip: skip,
        filters: filters
      }
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Referer': 'https://leetcode.com/',
        'Origin': 'https://leetcode.com',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (response.data.errors) {
      return res.status(500).json({
        message: 'LeetCode API returned errors',
        errors: response.data.errors
      });
    }

    const data = response.data.data.problemsetQuestionList;
    const questions = data.questions;

    const result = {
      total: data.total,
      totalPages: Math.ceil(data.total / parseInt(limit)),
      questions: questions.map(q => ({
        id: q.id,
        title: q.title,
        titleSlug: q.titleSlug,
        difficulty: q.difficulty,
        tags: q.topicTags ? q.topicTags.map(t => t.name) : [],
        stats: q.stats ? (typeof q.stats === 'string' ? JSON.parse(q.stats) : q.stats) : null,
        source: 'LeetCode'
      }))
    };

    cache.leetcodeList.set(cacheKey, { data: result, time: now });
    res.json(result);
  } catch (err) {
    console.error('LeetCode Topic Fetch Error:', err.message);
    res.status(500).json({
      message: 'Failed to fetch from LeetCode',
      error: err.message
    });
  }
});

// Fetch LeetCode Problems with pagination
router.get('/leetcode', async (req, res) => {
  try {
    const { page = 1, limit = 50, search = '', difficulty = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const now = Date.now();
    const cacheKey = `main_${page}_${limit}_${search}_${difficulty}`;
    if (cache.leetcodeList.has(cacheKey) && (now - cache.leetcodeList.get(cacheKey).time < CACHE_TTL)) {
      return res.json(cache.leetcodeList.get(cacheKey).data);
    }

    const filters = {};
    if (search) filters.searchKeywords = search;
    if (difficulty && difficulty !== 'all') filters.difficulty = difficulty.toUpperCase();

    const query = `
      query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
        problemsetQuestionList: questionList(
          categorySlug: $categorySlug
          limit: $limit
          skip: $skip
          filters: $filters
        ) {
          total: totalNum
          questions: data {
            id: questionFrontendId
            title: questionTitle
            titleSlug
            difficulty
            topicTags { name slug }
            stats
          }
        }
      }
    `;

    const response = await axios.post(LEETCODE_API, {
      query,
      variables: {
        categorySlug: "",
        limit: parseInt(limit),
        skip: skip,
        filters: filters
      }
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Referer': 'https://leetcode.com/',
        'Origin': 'https://leetcode.com',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (response.data.errors) {
      console.error('LeetCode GraphQL Errors:', JSON.stringify(response.data.errors, null, 2));
      return res.status(500).json({
        message: 'LeetCode API returned errors',
        errors: response.data.errors
      });
    }

    const data = response.data.data.problemsetQuestionList;
    const result = {
      total: data.total,
      totalPages: Math.ceil(data.total / parseInt(limit)),
      questions: data.questions.map(q => ({
        id: q.id,
        title: q.title,
        titleSlug: q.titleSlug,
        difficulty: q.difficulty,
        tags: q.topicTags ? q.topicTags.map(t => t.name) : [],
        stats: q.stats ? (typeof q.stats === 'string' ? JSON.parse(q.stats) : q.stats) : null,
        source: 'LeetCode'
      }))
    };

    cache.leetcodeList.set(cacheKey, { data: result, time: now });
    res.json(result);
  } catch (err) {
    console.error('LeetCode main list error:', err.message);
    if (err.response) {
      console.error('LeetCode Response Error:', JSON.stringify(err.response.data, null, 2));
    }
    res.status(500).json({ message: 'Failed to fetch', error: err.message });
  }
});

// Fetch LeetCode Question Details
router.get('/leetcode/details/:titleSlug', async (req, res) => {
  try {
    const { titleSlug } = req.params;
    const LEETCODE_API = 'https://leetcode.com/graphql';

    const query = `
      query questionData($titleSlug: String!) {
        question(titleSlug: $titleSlug) {
          id: questionFrontendId
          title: questionTitle
          titleSlug
          content
          difficulty
          topicTags { name slug }
          codeSnippets { lang langSlug code }
          sampleTestCase
          exampleTestcases
          stats
          hints
        }
      }
    `;

    const response = await axios.post(LEETCODE_API, {
      query,
      variables: { titleSlug }
    }, {
      headers: { 'Content-Type': 'application/json' }
    });

    if (response.data.errors) {
      return res.status(500).json({ message: 'LeetCode API Error', errors: response.data.errors });
    }

    const q = response.data.data.question;
    res.json({
      ...q,
      tags: q.topicTags?.map(t => t.name) || [],
      stats: q.stats ? (typeof q.stats === 'string' ? JSON.parse(q.stats) : q.stats) : null,
      source: 'LeetCode'
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Fetch Daily Challenge from LeetCode
router.get('/leetcode/daily', async (req, res) => {
  try {
    const LEETCODE_API = 'https://leetcode.com/graphql';

    const query = `
      query questionOfToday {
        activeDailyCodingChallengeQuestion {
          date
          userStatus
          link
          question {
            id: questionFrontendId
            title: questionTitle
            titleSlug
            difficulty
            topicTags {
              name
              slug
            }
            content
            codeSnippets {
              lang
              langSlug
              code
            }
          }
        }
      }
    `;

    const response = await axios.post(LEETCODE_API, {
      query
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Referer': 'https://leetcode.com/',
        'Origin': 'https://leetcode.com',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const daily = response.data.data.activeDailyCodingChallengeQuestion;

    res.json({
      date: daily.date,
      link: daily.link,
      status: daily.userStatus,
      question: {
        id: daily.question.id,
        title: daily.question.title,
        difficulty: daily.question.difficulty,
        tags: daily.question.topicTags.map(t => t.name),
        content: daily.question.content,
        codeSnippets: daily.question.codeSnippets,
        source: 'LeetCode Daily',
        link: `https://leetcode.com${daily.link}`
      }
    });
  } catch (err) {
    console.error('Daily Challenge Error:', err.message);
    res.status(500).json({ message: 'Failed to fetch daily challenge' });
  }
});

// Fetch single question details by titleSlug
router.get('/leetcode/:titleSlug', async (req, res) => {
  try {
    const { titleSlug } = req.params;
    const LEETCODE_API = 'https://leetcode.com/graphql';

    const query = `
      query questionData($titleSlug: String!) {
        question(titleSlug: $titleSlug) {
          id: questionFrontendId
          title
          titleSlug
          difficulty
          content
          topicTags {
            name
            slug
          }
          codeSnippets {
            lang
            langSlug
            code
          }
          hints
          sampleTestCase
          exampleTestcases
          stats
          likes
          dislikes
          similarQuestions
          discussionPosts(count: 10) {
            edges {
              node {
                id
                content
                author {
                  username
                }
              }
            }
          }
        }
      }
    `;

    const response = await axios.post(LEETCODE_API, {
      query,
      variables: { titleSlug }
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Referer': `https://leetcode.com/problems/${titleSlug}/`,
        'Origin': 'https://leetcode.com',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const q = response.data.data.question;

    res.json({
      id: q.id,
      title: q.title,
      titleSlug: q.titleSlug,
      difficulty: q.difficulty,
      content: q.content,
      tags: q.topicTags.map(t => t.name),
      codeSnippets: q.codeSnippets,
      hints: q.hints,
      examples: q.exampleTestcases,
      stats: q.stats ? JSON.parse(q.stats) : null,
      likes: q.likes,
      dislikes: q.dislikes,
      similarQuestions: q.similarQuestions ? JSON.parse(q.similarQuestions) : [],
      discussions: q.discussionPosts ? q.discussionPosts.edges.map(e => e.node) : [],
      source: 'LeetCode',
      link: `https://leetcode.com/problems/${q.titleSlug}`
    });
  } catch (err) {
    console.error('Question Detail Error:', err.message);
    res.status(500).json({ message: 'Failed to fetch question details' });
  }
});

// Fetch CodeChef (Placeholder - CodeChef API requires complex OAuth)
router.get('/codechef', async (req, res) => {
  // CodeChef API is restricted. Sending mock data for UI demo.
  res.json([
    { id: '1', title: 'FLOW001', difficulty: 'Beginner', source: 'CodeChef', link: '#' },
    { id: '2', title: 'ATM', difficulty: 'Beginner', source: 'CodeChef', link: '#' },
    { id: '3', title: 'CHEFSTR1', difficulty: 'Easy', source: 'CodeChef', link: '#' },
  ]);
});

module.exports = router;

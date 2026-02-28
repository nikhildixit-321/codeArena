const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const Question = require('./models/Question');

// ======================================================
// COMPLETE LEETCODE QUESTIONS POOL — BATTLE GROUND
// Questions are picked randomly from this pool during matches.
// Rating determines which difficulty players face based on their ELO.
// ======================================================
const questions = [

    // ── EASY (Rating 600–900) ──────────────────────────

    {
        title: "Two Sum",
        description: "Given an array of integers <code>nums</code> and an integer <code>target</code>, return <em>indices</em> of the two numbers such that they add up to <code>target</code>.<br/><br/>You may assume that each input would have <strong>exactly one solution</strong>, and you may not use the same element twice.",
        difficulty: "Easy", rating: 800, source: "LeetCode",
        leetcodeSlug: "two-sum", leetcodeId: "1",
        functionName: "twoSum",
        examples: [
            { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "nums[0] + nums[1] == 9, so return [0, 1]." },
            { input: "nums = [3,2,4], target = 6", output: "[1,2]" },
        ],
        constraints: ["2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9", "Only one valid answer exists."],
        starterCode: {
            javascript: "function twoSum(nums, target) {\n\n}",
            python: "class Solution:\n    def twoSum(self, nums, target):\n        pass",
            cpp: "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        \n    }\n};",
            java: "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        \n    }\n}"
        },
        testCases: [
            { input: "[2,7,11,15], 9", output: "[0,1]" },
            { input: "[3,2,4], 6", output: "[1,2]" },
            { input: "[3,3], 6", output: "[0,1]" },
        ]
    },

    {
        title: "Palindrome Number",
        description: "Given an integer <code>x</code>, return <code>true</code> if <code>x</code> is a <strong>palindrome</strong>, and <code>false</code> otherwise.",
        difficulty: "Easy", rating: 700, source: "LeetCode",
        leetcodeSlug: "palindrome-number", leetcodeId: "9",
        functionName: "isPalindrome",
        examples: [
            { input: "x = 121", output: "true", explanation: "121 reads as 121 from left to right and from right to left." },
            { input: "x = -121", output: "false", explanation: "From left to right, it reads -121. From right to left, it reads 121-." },
        ],
        constraints: ["-2^31 <= x <= 2^31 - 1"],
        starterCode: {
            javascript: "function isPalindrome(x) {\n\n}",
            python: "class Solution:\n    def isPalindrome(self, x):\n        pass",
            cpp: "class Solution {\npublic:\n    bool isPalindrome(int x) {\n        \n    }\n};",
            java: "class Solution {\n    public boolean isPalindrome(int x) {\n        \n    }\n}"
        },
        testCases: [
            { input: "121", output: "true" },
            { input: "-121", output: "false" },
            { input: "10", output: "false" },
        ]
    },

    {
        title: "FizzBuzz",
        description: "Given an integer <code>n</code>, return a string array <code>answer</code> (<strong>1-indexed</strong>) where:<br/><ul><li><code>answer[i] == \"FizzBuzz\"</code> if i is divisible by 3 and 5.</li><li><code>answer[i] == \"Fizz\"</code> if i is divisible by 3.</li><li><code>answer[i] == \"Buzz\"</code> if i is divisible by 5.</li><li><code>answer[i] == i</code> (as a string) if none of the above conditions are true.</li></ul>",
        difficulty: "Easy", rating: 600, source: "LeetCode",
        leetcodeSlug: "fizz-buzz", leetcodeId: "412",
        functionName: "fizzBuzz",
        examples: [
            { input: "n = 3", output: '["1","2","Fizz"]' },
            { input: "n = 5", output: '["1","2","Fizz","4","Buzz"]' },
        ],
        constraints: ["1 <= n <= 10^4"],
        starterCode: {
            javascript: "function fizzBuzz(n) {\n\n}",
            python: "class Solution:\n    def fizzBuzz(self, n):\n        pass",
            cpp: "class Solution {\npublic:\n    vector<string> fizzBuzz(int n) {\n        \n    }\n};",
            java: "class Solution {\n    public List<String> fizzBuzz(int n) {\n        \n    }\n}"
        },
        testCases: [
            { input: "3", output: '["1","2","Fizz"]' },
            { input: "5", output: '["1","2","Fizz","4","Buzz"]' },
            { input: "15", output: '["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]' },
        ]
    },

    {
        title: "Running Sum of 1d Array",
        description: "Given an array <code>nums</code>, return the <strong>running sum</strong> of <code>nums</code>.<br/><br/>Running sum of an array is defined as: <code>runningSum[i] = sum(nums[0]…nums[i])</code>.",
        difficulty: "Easy", rating: 650, source: "LeetCode",
        leetcodeSlug: "running-sum-of-1d-array", leetcodeId: "1480",
        functionName: "runningSum",
        examples: [
            { input: "nums = [1,2,3,4]", output: "[1,3,6,10]", explanation: "Running sum is [1, 1+2, 1+2+3, 1+2+3+4]." },
            { input: "nums = [1,1,1,1,1]", output: "[1,2,3,4,5]" },
        ],
        constraints: ["1 <= nums.length <= 1000", "-10^6 <= nums[i] <= 10^6"],
        starterCode: {
            javascript: "function runningSum(nums) {\n\n}",
            python: "class Solution:\n    def runningSum(self, nums):\n        pass",
            cpp: "class Solution {\npublic:\n    vector<int> runningSum(vector<int>& nums) {\n        \n    }\n};",
            java: "class Solution {\n    public int[] runningSum(int[] nums) {\n        \n    }\n}"
        },
        testCases: [
            { input: "[1,2,3,4]", output: "[1,3,6,10]" },
            { input: "[1,1,1,1,1]", output: "[1,2,3,4,5]" },
            { input: "[3,1,2,10,1]", output: "[3,4,6,16,17]" },
        ]
    },

    {
        title: "Richest Customer Wealth",
        description: "You are given an <code>m x n</code> integer grid <code>accounts</code> where <code>accounts[i][j]</code> is the amount of money the <code>i​​​​​​​​​​​th​​​​</code> customer has in the <code>j​​​​​​​​​​​th</code> bank. Return the <strong>wealth</strong> that the richest customer has.",
        difficulty: "Easy", rating: 620, source: "LeetCode",
        leetcodeSlug: "richest-customer-wealth", leetcodeId: "1672",
        functionName: "maximumWealth",
        examples: [
            { input: "accounts = [[1,2,3],[3,2,1]]", output: "6", explanation: "1st customer has wealth = 1+2+3 = 6. 2nd customer has wealth = 3+2+1 = 6. Both are the richest." },
        ],
        constraints: ["m == accounts.length", "n == accounts[i].length", "1 <= m, n <= 50"],
        starterCode: {
            javascript: "function maximumWealth(accounts) {\n\n}",
            python: "class Solution:\n    def maximumWealth(self, accounts):\n        pass",
            cpp: "class Solution {\npublic:\n    int maximumWealth(vector<vector<int>>& accounts) {\n        \n    }\n};",
            java: "class Solution {\n    public int maximumWealth(int[][] accounts) {\n        \n    }\n}"
        },
        testCases: [
            { input: "[[1,2,3],[3,2,1]]", output: "6" },
            { input: "[[1,5],[7,3],[3,5]]", output: "10" },
            { input: "[[2,8,7],[7,1,3],[1,9,5]]", output: "17" },
        ]
    },

    {
        title: "Contains Duplicate",
        description: "Given an integer array <code>nums</code>, return <code>true</code> if any value appears <strong>at least twice</strong> in the array, and return <code>false</code> if every element is distinct.",
        difficulty: "Easy", rating: 750, source: "LeetCode",
        leetcodeSlug: "contains-duplicate", leetcodeId: "217",
        functionName: "containsDuplicate",
        examples: [
            { input: "nums = [1,2,3,1]", output: "true" },
            { input: "nums = [1,2,3,4]", output: "false" },
        ],
        constraints: ["1 <= nums.length <= 10^5", "-10^9 <= nums[i] <= 10^9"],
        starterCode: {
            javascript: "function containsDuplicate(nums) {\n\n}",
            python: "class Solution:\n    def containsDuplicate(self, nums):\n        pass",
            cpp: "class Solution {\npublic:\n    bool containsDuplicate(vector<int>& nums) {\n        \n    }\n};",
            java: "class Solution {\n    public boolean containsDuplicate(int[] nums) {\n        \n    }\n}"
        },
        testCases: [
            { input: "[1,2,3,1]", output: "true" },
            { input: "[1,2,3,4]", output: "false" },
            { input: "[1,1,1,3,3,4,3,2,4,2]", output: "true" },
        ]
    },

    {
        title: "Maximum Subarray",
        description: "Given an integer array <code>nums</code>, find the <strong>contiguous subarray</strong> (containing at least one number) which has the largest sum and return its sum (Kadane's Algorithm).",
        difficulty: "Easy", rating: 850, source: "LeetCode",
        leetcodeSlug: "maximum-subarray", leetcodeId: "53",
        functionName: "maxSubArray",
        examples: [
            { input: "nums = [-2,1,-3,4,-1,2,1,-5,4]", output: "6", explanation: "[4,-1,2,1] has the largest sum = 6." },
            { input: "nums = [1]", output: "1" },
        ],
        constraints: ["1 <= nums.length <= 10^5", "-10^4 <= nums[i] <= 10^4"],
        starterCode: {
            javascript: "function maxSubArray(nums) {\n\n}",
            python: "class Solution:\n    def maxSubArray(self, nums):\n        pass",
            cpp: "class Solution {\npublic:\n    int maxSubArray(vector<int>& nums) {\n        \n    }\n};",
            java: "class Solution {\n    public int maxSubArray(int[] nums) {\n        \n    }\n}"
        },
        testCases: [
            { input: "[-2,1,-3,4,-1,2,1,-5,4]", output: "6" },
            { input: "[1]", output: "1" },
            { input: "[5,4,-1,7,8]", output: "23" },
        ]
    },

    {
        title: "Merge Sorted Array",
        description: "You are given two integer arrays <code>nums1</code> and <code>nums2</code>, sorted in non-decreasing order, and two integers <code>m</code> and <code>n</code>. Merge <code>nums1</code> and <code>nums2</code> into a single array sorted in non-decreasing order. The final sorted array should be stored inside <code>nums1</code>.",
        difficulty: "Easy", rating: 780, source: "LeetCode",
        leetcodeSlug: "merge-sorted-array", leetcodeId: "88",
        functionName: "merge",
        examples: [
            { input: "nums1 = [1,2,3,0,0,0], m = 3, nums2 = [2,5,6], n = 3", output: "[1,2,2,3,5,6]" },
        ],
        constraints: ["nums1.length == m + n", "nums2.length == n", "0 <= m, n <= 200"],
        starterCode: {
            javascript: "function merge(nums1, m, nums2, n) {\n\n}",
            python: "class Solution:\n    def merge(self, nums1, m, nums2, n):\n        pass",
            cpp: "class Solution {\npublic:\n    void merge(vector<int>& nums1, int m, vector<int>& nums2, int n) {\n        \n    }\n};",
            java: "class Solution {\n    public void merge(int[] nums1, int m, int[] nums2, int n) {\n        \n    }\n}"
        },
        testCases: [
            { input: "[1,2,3,0,0,0], 3, [2,5,6], 3", output: "[1,2,2,3,5,6]" },
            { input: "[1], 1, [], 0", output: "[1]" },
            { input: "[0], 0, [1], 1", output: "[1]" },
        ]
    },

    // ── MEDIUM (Rating 1000–1400) ─────────────────────

    {
        title: "Longest Substring Without Repeating Characters",
        description: "Given a string <code>s</code>, find the length of the <strong>longest substring</strong> without repeating characters.",
        difficulty: "Medium", rating: 1200, source: "LeetCode",
        leetcodeSlug: "longest-substring-without-repeating-characters", leetcodeId: "3",
        functionName: "lengthOfLongestSubstring",
        examples: [
            { input: 's = "abcabcbb"', output: "3", explanation: 'The answer is "abc", with the length of 3.' },
            { input: 's = "bbbbb"', output: "1", explanation: 'The answer is "b", with the length of 1.' },
        ],
        constraints: ["0 <= s.length <= 5 * 10^4", "s consists of English letters, digits, symbols and spaces."],
        starterCode: {
            javascript: 'function lengthOfLongestSubstring(s) {\n\n}',
            python: "class Solution:\n    def lengthOfLongestSubstring(self, s):\n        pass",
            cpp: "class Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        \n    }\n};",
            java: "class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        \n    }\n}"
        },
        testCases: [
            { input: '"abcabcbb"', output: "3" },
            { input: '"bbbbb"', output: "1" },
            { input: '"pwwkew"', output: "3" },
        ]
    },

    {
        title: "Reverse Integer",
        description: "Given a signed 32-bit integer <code>x</code>, return <code>x</code> with its digits reversed. If reversing <code>x</code> causes the value to go outside the signed 32-bit integer range <code>[-2^31, 2^31 - 1]</code>, then return <code>0</code>.",
        difficulty: "Medium", rating: 1000, source: "LeetCode",
        leetcodeSlug: "reverse-integer", leetcodeId: "7",
        functionName: "reverse",
        examples: [
            { input: "x = 123", output: "321" },
            { input: "x = -123", output: "-321" },
            { input: "x = 120", output: "21" },
        ],
        constraints: ["-2^31 <= x <= 2^31 - 1"],
        starterCode: {
            javascript: "function reverse(x) {\n\n}",
            python: "class Solution:\n    def reverse(self, x):\n        pass",
            cpp: "class Solution {\npublic:\n    int reverse(int x) {\n        \n    }\n};",
            java: "class Solution {\n    public int reverse(int x) {\n        \n    }\n}"
        },
        testCases: [
            { input: "123", output: "321" },
            { input: "-123", output: "-321" },
            { input: "120", output: "21" },
        ]
    },

    {
        title: "Best Time to Buy and Sell Stock",
        description: "You are given an array <code>prices</code> where <code>prices[i]</code> is the price of a given stock on the <code>i<sup>th</sup></code> day. You want to maximize your profit by choosing a <strong>single day</strong> to buy one stock and choosing a <strong>different day in the future</strong> to sell that stock. Return the maximum profit. If you cannot achieve any profit, return <code>0</code>.",
        difficulty: "Easy", rating: 900, source: "LeetCode",
        leetcodeSlug: "best-time-to-buy-and-sell-stock", leetcodeId: "121",
        functionName: "maxProfit",
        examples: [
            { input: "prices = [7,1,5,3,6,4]", output: "5", explanation: "Buy on day 2 (price=1) and sell on day 5 (price=6), profit = 5." },
            { input: "prices = [7,6,4,3,1]", output: "0", explanation: "No profit possible." },
        ],
        constraints: ["1 <= prices.length <= 10^5", "0 <= prices[i] <= 10^4"],
        starterCode: {
            javascript: "function maxProfit(prices) {\n\n}",
            python: "class Solution:\n    def maxProfit(self, prices):\n        pass",
            cpp: "class Solution {\npublic:\n    int maxProfit(vector<int>& prices) {\n        \n    }\n};",
            java: "class Solution {\n    public int maxProfit(int[] prices) {\n        \n    }\n}"
        },
        testCases: [
            { input: "[7,1,5,3,6,4]", output: "5" },
            { input: "[7,6,4,3,1]", output: "0" },
            { input: "[1,2]", output: "1" },
        ]
    },

    {
        title: "Valid Parentheses",
        description: "Given a string <code>s</code> containing just the characters <code>'('</code>, <code>')'</code>, <code>'{'</code>, <code>'}'</code>, <code>'['</code> and <code>']'</code>, determine if the input string is valid.<br/><br/>An input string is valid if:<ul><li>Open brackets must be closed by the same type of brackets.</li><li>Open brackets must be closed in the correct order.</li><li>Every close bracket has a corresponding open bracket of the same type.</li></ul>",
        difficulty: "Easy", rating: 820, source: "LeetCode",
        leetcodeSlug: "valid-parentheses", leetcodeId: "20",
        functionName: "isValid",
        examples: [
            { input: 's = "()"', output: "true" },
            { input: 's = "()[]{}"', output: "true" },
            { input: 's = "(]"', output: "false" },
        ],
        constraints: ["1 <= s.length <= 10^4", "s consists of parentheses only '()[]{}'."],
        starterCode: {
            javascript: "function isValid(s) {\n\n}",
            python: "class Solution:\n    def isValid(self, s):\n        pass",
            cpp: "class Solution {\npublic:\n    bool isValid(string s) {\n        \n    }\n};",
            java: "class Solution {\n    public boolean isValid(String s) {\n        \n    }\n}"
        },
        testCases: [
            { input: '"()"', output: "true" },
            { input: '"()[]{}"', output: "true" },
            { input: '"(]"', output: "false" },
        ]
    },

    {
        title: "Climbing Stairs",
        description: "You are climbing a staircase. It takes <code>n</code> steps to reach the top. Each time you can either climb <code>1</code> or <code>2</code> steps. In how many distinct ways can you climb to the top?",
        difficulty: "Easy", rating: 860, source: "LeetCode",
        leetcodeSlug: "climbing-stairs", leetcodeId: "70",
        functionName: "climbStairs",
        examples: [
            { input: "n = 2", output: "2", explanation: "1 step + 1 step, or 2 steps." },
            { input: "n = 3", output: "3", explanation: "1+1+1, 1+2, 2+1." },
        ],
        constraints: ["1 <= n <= 45"],
        starterCode: {
            javascript: "function climbStairs(n) {\n\n}",
            python: "class Solution:\n    def climbStairs(self, n):\n        pass",
            cpp: "class Solution {\npublic:\n    int climbStairs(int n) {\n        \n    }\n};",
            java: "class Solution {\n    public int climbStairs(int n) {\n        \n    }\n}"
        },
        testCases: [
            { input: "2", output: "2" },
            { input: "3", output: "3" },
            { input: "5", output: "8" },
        ]
    },

    {
        title: "Binary Search",
        description: "Given an array of integers <code>nums</code> which is sorted in ascending order, and an integer <code>target</code>, write a function to search <code>target</code> in <code>nums</code>. If target exists, return its index. Otherwise, return <code>-1</code>.",
        difficulty: "Easy", rating: 760, source: "LeetCode",
        leetcodeSlug: "binary-search", leetcodeId: "704",
        functionName: "search",
        examples: [
            { input: "nums = [-1,0,3,5,9,12], target = 9", output: "4", explanation: "9 exists in nums and its index is 4." },
            { input: "nums = [-1,0,3,5,9,12], target = 2", output: "-1" },
        ],
        constraints: ["1 <= nums.length <= 10^4", "All elements in nums are unique.", "nums is sorted in ascending order."],
        starterCode: {
            javascript: "function search(nums, target) {\n\n}",
            python: "class Solution:\n    def search(self, nums, target):\n        pass",
            cpp: "class Solution {\npublic:\n    int search(vector<int>& nums, int target) {\n        \n    }\n};",
            java: "class Solution {\n    public int search(int[] nums, int target) {\n        \n    }\n}"
        },
        testCases: [
            { input: "[-1,0,3,5,9,12], 9", output: "4" },
            { input: "[-1,0,3,5,9,12], 2", output: "-1" },
            { input: "[5], 5", output: "0" },
        ]
    },

    // ── MEDIUM (Rating 1100–1400) ─────────────────────

    {
        title: "Add Two Numbers (Linked List)",
        description: "You are given two <strong>non-empty</strong> linked lists representing two non-negative integers. The digits are stored in <strong>reverse order</strong>, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list.",
        difficulty: "Medium", rating: 1300, source: "LeetCode",
        leetcodeSlug: "add-two-numbers", leetcodeId: "2",
        functionName: "addTwoNumbers",
        examples: [
            { input: "l1 = [2,4,3], l2 = [5,6,4]", output: "[7,0,8]", explanation: "342 + 465 = 807." },
        ],
        constraints: ["The number of nodes in each linked list is in the range [1, 100]."],
        starterCode: {
            javascript: "function addTwoNumbers(l1, l2) {\n\n}",
            python: "class Solution:\n    def addTwoNumbers(self, l1, l2):\n        pass",
            cpp: "class Solution {\npublic:\n    ListNode* addTwoNumbers(ListNode* l1, ListNode* l2) {\n        \n    }\n};",
            java: "class Solution {\n    public ListNode addTwoNumbers(ListNode l1, ListNode l2) {\n        \n    }\n}"
        },
        testCases: [
            { input: "[2,4,3], [5,6,4]", output: "[7,0,8]" },
            { input: "[0], [0]", output: "[0]" },
            { input: "[9,9,9,9,9,9,9], [9,9,9,9]", output: "[8,9,9,9,0,0,0,1]" },
        ]
    },

    {
        title: "3Sum",
        description: "Given an integer array nums, return all the triplets <code>[nums[i], nums[j], nums[k]]</code> such that <code>i != j</code>, <code>i != k</code>, <code>j != k</code>, and <code>nums[i] + nums[j] + nums[k] == 0</code>. The solution set must not contain duplicate triplets.",
        difficulty: "Medium", rating: 1350, source: "LeetCode",
        leetcodeSlug: "3sum", leetcodeId: "15",
        functionName: "threeSum",
        examples: [
            { input: "nums = [-1,0,1,2,-1,-4]", output: '[[-1,-1,2],[-1,0,1]]' },
            { input: "nums = [0,1,1]", output: "[]" },
        ],
        constraints: ["3 <= nums.length <= 3000", "-10^5 <= nums[i] <= 10^5"],
        starterCode: {
            javascript: "function threeSum(nums) {\n\n}",
            python: "class Solution:\n    def threeSum(self, nums):\n        pass",
            cpp: "class Solution {\npublic:\n    vector<vector<int>> threeSum(vector<int>& nums) {\n        \n    }\n};",
            java: "class Solution {\n    public List<List<Integer>> threeSum(int[] nums) {\n        \n    }\n}"
        },
        testCases: [
            { input: "[-1,0,1,2,-1,-4]", output: "[[-1,-1,2],[-1,0,1]]" },
            { input: "[0,1,1]", output: "[]" },
            { input: "[0,0,0]", output: "[[0,0,0]]" },
        ]
    },

    {
        title: "Product of Array Except Self",
        description: "Given an integer array <code>nums</code>, return an array <code>answer</code> such that <code>answer[i]</code> is equal to the product of all the elements of <code>nums</code> except <code>nums[i]</code>. You must write an algorithm that runs in <code>O(n)</code> time and <strong>without using the division operation</strong>.",
        difficulty: "Medium", rating: 1250, source: "LeetCode",
        leetcodeSlug: "product-of-array-except-self", leetcodeId: "238",
        functionName: "productExceptSelf",
        examples: [
            { input: "nums = [1,2,3,4]", output: "[24,12,8,6]" },
            { input: "nums = [-1,1,0,-3,3]", output: "[0,0,9,0,0]" },
        ],
        constraints: ["2 <= nums.length <= 10^5", "-30 <= nums[i] <= 30"],
        starterCode: {
            javascript: "function productExceptSelf(nums) {\n\n}",
            python: "class Solution:\n    def productExceptSelf(self, nums):\n        pass",
            cpp: "class Solution {\npublic:\n    vector<int> productExceptSelf(vector<int>& nums) {\n        \n    }\n};",
            java: "class Solution {\n    public int[] productExceptSelf(int[] nums) {\n        \n    }\n}"
        },
        testCases: [
            { input: "[1,2,3,4]", output: "[24,12,8,6]" },
            { input: "[-1,1,0,-3,3]", output: "[0,0,9,0,0]" },
        ]
    },

    {
        title: "Find Minimum in Rotated Sorted Array",
        description: "Suppose an array of length <code>n</code> sorted in ascending order is <strong>rotated</strong> between 1 and n times. Given the sorted rotated array <code>nums</code> of unique elements, return the minimum element of this array. You must write an algorithm that runs in <code>O(log n) time</code>.",
        difficulty: "Medium", rating: 1150, source: "LeetCode",
        leetcodeSlug: "find-minimum-in-rotated-sorted-array", leetcodeId: "153",
        functionName: "findMin",
        examples: [
            { input: "nums = [3,4,5,1,2]", output: "1", explanation: "Original array was [1,2,3,4,5] rotated 3 times." },
            { input: "nums = [4,5,6,7,0,1,2]", output: "0" },
        ],
        constraints: ["n == nums.length", "1 <= n <= 5000", "All the integers of nums are unique."],
        starterCode: {
            javascript: "function findMin(nums) {\n\n}",
            python: "class Solution:\n    def findMin(self, nums):\n        pass",
            cpp: "class Solution {\npublic:\n    int findMin(vector<int>& nums) {\n        \n    }\n};",
            java: "class Solution {\n    public int findMin(int[] nums) {\n        \n    }\n}"
        },
        testCases: [
            { input: "[3,4,5,1,2]", output: "1" },
            { input: "[4,5,6,7,0,1,2]", output: "0" },
            { input: "[11,13,15,17]", output: "11" },
        ]
    },

    // ── HARD (Rating 1600+) ──────────────────────────

    {
        title: "Median of Two Sorted Arrays",
        description: "Given two sorted arrays <code>nums1</code> and <code>nums2</code> of size <code>m</code> and <code>n</code> respectively, return the <strong>median</strong> of the two sorted arrays. The overall run time complexity should be <code>O(log (m+n))</code>.",
        difficulty: "Hard", rating: 1800, source: "LeetCode",
        leetcodeSlug: "median-of-two-sorted-arrays", leetcodeId: "4",
        functionName: "findMedianSortedArrays",
        examples: [
            { input: "nums1 = [1,3], nums2 = [2]", output: "2.00000", explanation: "Merged array = [1,2,3], median = 2." },
            { input: "nums1 = [1,2], nums2 = [3,4]", output: "2.50000" },
        ],
        constraints: ["nums1.length == m", "nums2.length == n", "0 <= m, n <= 1000"],
        starterCode: {
            javascript: "function findMedianSortedArrays(nums1, nums2) {\n\n}",
            python: "class Solution:\n    def findMedianSortedArrays(self, nums1, nums2):\n        pass",
            cpp: "class Solution {\npublic:\n    double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {\n        \n    }\n};",
            java: "class Solution {\n    public double findMedianSortedArrays(int[] nums1, int[] nums2) {\n        \n    }\n}"
        },
        testCases: [
            { input: "[1,3], [2]", output: "2.00000" },
            { input: "[1,2], [3,4]", output: "2.50000" },
        ]
    },

];

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");

        for (const q of questions) {
            const existing = await Question.findOne({ leetcodeId: q.leetcodeId });
            if (existing) {
                await Question.findByIdAndUpdate(existing._id, q, { new: true });
                console.log(`🔄 Updated: ${q.title}`);
            } else {
                await Question.create(q);
                console.log(`✨ Created: ${q.title}`);
            }
        }

        const total = await Question.countDocuments();
        console.log(`\n🎉 Done! Total questions in DB: ${total}`);
        process.exit();
    } catch (err) {
        console.error("❌ Error:", err.message);
        process.exit(1);
    }
};

seed();

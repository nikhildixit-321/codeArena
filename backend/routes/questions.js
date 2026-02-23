const express = require('express');
const axios = require('axios');
const router = express.Router();

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

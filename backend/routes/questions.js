const express = require('express');
const axios = require('axios');
const router = express.Router();

// Fetch Codeforces Problems
router.get('/codeforces', async (req, res) => {
  try {
    const response = await axios.get('https://codeforces.com/api/problemset.problems');
    if (response.data.status === 'OK') {
      const problems = response.data.result.problems.slice(0, 50).map(p => ({
        id: `${p.contestId}${p.index}`,
        title: p.name,
        difficulty: p.rating || 'Unrated',
        tags: p.tags,
        source: 'Codeforces',
        link: `https://codeforces.com/contest/${p.contestId}/problem/${p.index}`
      }));
      res.json(problems);
    } else {
      res.status(500).json({ message: 'Failed to fetch from Codeforces' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Fetch LeetCode Problems (Using official GraphQL API)
router.get('/leetcode', async (req, res) => {
  try {
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
            topicTags {
              name
            }
          }
        }
      }
    `;

    const variables = {
      categorySlug: "",
      limit: 50,
      skip: 0,
      filters: {}
    };

    const response = await axios.post('https://leetcode.com/graphql', {
      query,
      variables
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Referer': 'https://leetcode.com/',
      }
    });

    const data = response.data.data.problemsetQuestionList.questions;
    
    const problems = data.map(p => ({
      id: p.id,
      title: p.title,
      difficulty: p.difficulty,
      tags: p.topicTags ? p.topicTags.map(t => t.name) : [],
      source: 'LeetCode',
      link: `https://leetcode.com/problems/${p.titleSlug}`
    }));
    
    res.json(problems);
  } catch (err) {
    console.error('LeetCode GraphQL Error:', err.message);
    res.status(500).json({ message: 'Failed to fetch from LeetCode official servers.' });
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

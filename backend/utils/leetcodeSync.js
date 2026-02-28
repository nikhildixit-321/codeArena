const axios = require('axios');

const LEETCODE_API = 'https://leetcode.com/graphql';

const LC_HEADERS = {
    'Content-Type': 'application/json',
    'Referer': 'https://leetcode.com/',
    'Origin': 'https://leetcode.com',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
};

// ──────────────────────────────────────────────
// 1. Fetch all ~3300 LeetCode questions (basic info)
// ──────────────────────────────────────────────
const fetchAllLeetCodeQuestions = async (limit = 3500) => {
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
          isPaidOnly
          topicTags { name slug }
        }
      }
    }
  `;

    const response = await axios.post(LEETCODE_API, {
        query,
        variables: { categorySlug: "", limit, skip: 0, filters: {} }
    }, { headers: LC_HEADERS });

    const data = response.data?.data?.problemsetQuestionList;
    if (!data) throw new Error('Failed to fetch question list from LeetCode');
    return data.questions.filter(q => !q.isPaidOnly); // Exclude paid questions
};

// ──────────────────────────────────────────────
// 2. Fetch full details for one question (by slug)
//    including description, starter code, and sample test cases
// ──────────────────────────────────────────────
const fetchQuestionDetails = async (titleSlug) => {
    const query = `
    query questionData($titleSlug: String!) {
      question(titleSlug: $titleSlug) {
        questionFrontendId
        title
        titleSlug
        content
        difficulty
        topicTags { name slug }
        codeSnippets { lang langSlug code }
        sampleTestCase
        exampleTestcases
        hints
        metaData
      }
    }
  `;

    const response = await axios.post(LEETCODE_API, {
        query,
        variables: { titleSlug }
    }, { headers: { ...LC_HEADERS, 'Referer': `https://leetcode.com/problems/${titleSlug}/` } });

    const q = response.data?.data?.question;
    if (!q) throw new Error(`No data for ${titleSlug}`);
    return q;
};

// ──────────────────────────────────────────────
// 3. Parse sample test cases from LeetCode exampleTestcases
//    and metaData to build input/output pairs
// ──────────────────────────────────────────────
const parseTestCases = (q) => {
    try {
        const meta = JSON.parse(q.metaData || '{}');
        const functionName = meta.name || 'solution';
        const params = meta.params || [];

        // exampleTestcases has inputs line by line
        const exampleLines = (q.exampleTestcases || q.sampleTestCase || '').split('\n').filter(l => l.trim() !== '');
        const paramCount = params.length || 1;

        const testCases = [];
        for (let i = 0; i < exampleLines.length; i += paramCount) {
            const inputParts = exampleLines.slice(i, i + paramCount);
            const input = inputParts.join(', ');

            // We can't get expected output from LC API directly,
            // so we extract from description examples as a fallback
            testCases.push({ input, output: 'JUDGE_PENDING', isHidden: false });
        }

        return { functionName, params, testCases };
    } catch {
        return { functionName: 'solution', params: [], testCases: [] };
    }
};

// ──────────────────────────────────────────────
// 4. Extract expected outputs from HTML content
//    (LeetCode includes examples in the problem description)
// ──────────────────────────────────────────────
const extractExamplesFromContent = (content) => {
    if (!content) return [];
    const examples = [];

    // Match <strong>Output:</strong> ... patterns
    const outputRegex = /<strong[^>]*>Output:\s*<\/strong>\s*([^<\n]+)/gi;
    const inputRegex = /<strong[^>]*>Input:\s*<\/strong>\s*([^<\n]+)/gi;

    const inputs = [];
    const outputs = [];

    let match;
    while ((match = inputRegex.exec(content)) !== null) {
        inputs.push(match[1].trim().replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>'));
    }
    while ((match = outputRegex.exec(content)) !== null) {
        outputs.push(match[1].trim().replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>'));
    }

    for (let i = 0; i < Math.min(inputs.length, outputs.length); i++) {
        examples.push({ input: inputs[i], output: outputs[i] });
    }
    return examples;
};

// ──────────────────────────────────────────────
// 5. Build full question document for MongoDB
// ──────────────────────────────────────────────
const buildQuestionDoc = (basic, details) => {
    const { functionName, testCases } = parseTestCases(details);
    const examples = extractExamplesFromContent(details.content);

    // Try to match test cases with parsed outputs from HTML
    const resolvedTestCases = testCases.map((tc, i) => {
        if (examples[i]) {
            return { ...tc, output: examples[i].output };
        }
        return tc;
    }).filter(tc => tc.output && tc.output !== 'JUDGE_PENDING');

    // Extract starter code per language
    const starterCode = {};
    const langMap = { javascript: ['javascript'], python: ['python', 'python3'], cpp: ['c++', 'cpp'], java: ['java'] };
    for (const [ourLang, lcLangs] of Object.entries(langMap)) {
        const snippet = details.codeSnippets?.find(s => lcLangs.includes(s.lang.toLowerCase()) || lcLangs.includes(s.langSlug.toLowerCase()));
        if (snippet) starterCode[ourLang] = snippet.code;
    }

    // Rating estimate based on difficulty
    const ratingMap = { 'Easy': Math.floor(Math.random() * 300) + 600, 'Medium': Math.floor(Math.random() * 400) + 1000, 'Hard': Math.floor(Math.random() * 400) + 1500 };

    return {
        title: basic.title,
        description: details.content || '',
        difficulty: basic.difficulty,
        rating: ratingMap[basic.difficulty] || 1000,
        source: 'LeetCode',
        leetcodeSlug: basic.titleSlug,
        leetcodeId: basic.id,
        functionName,
        starterCode,
        examples: examples.slice(0, 3),
        testCases: resolvedTestCases.slice(0, 5),
        hints: details.hints || [],
        timeLimit: basic.difficulty === 'Hard' ? 2700 : basic.difficulty === 'Medium' ? 1500 : 900,
    };
};

module.exports = {
    fetchAllLeetCodeQuestions,
    fetchQuestionDetails,
    buildQuestionDoc,
    parseTestCases,
};

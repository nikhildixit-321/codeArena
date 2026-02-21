const axios = require('axios');

/**
 * Submits code to LeetCode
 * @param {string} session - LEETCODE_SESSION cookie value
 * @param {string} slug - Problem slug (e.g. 'two-sum')
 * @param {string} questionId - Numeric question ID
 * @param {string} lang - Language (javascript, python3, etc.)
 * @param {string} code - User's solution code
 */
const submitToLeetCode = async (session, slug, questionId, lang, code) => {
    // 1. We need a CSRF token. If the user doesn't provide it, we might try to extract it from the session cookie
    // but usually user should provide it or we can fetch a page to get it.
    // For simplicity, let's assume the user provides LEETCODE_SESSION which contains everything or we look for 'csrftoken' in it.

    const cookies = session;
    const csrfMatch = cookies.match(/csrftoken=([^;]+)/);
    const csrfToken = csrfMatch ? csrfMatch[1] : '';

    if (!csrfToken) {
        throw new Error("CSRF Token not found in session string. Make sure it includes 'csrftoken=...'");
    }

    try {
        const response = await axios.post(
            `https://leetcode.com/problems/${slug}/submit/`,
            {
                lang: lang === 'javascript' ? 'javascript' : lang, // Map languages if needed
                question_id: questionId,
                typed_code: code
            },
            {
                headers: {
                    'Cookie': cookies,
                    'x-csrftoken': csrfToken,
                    'Referer': `https://leetcode.com/problems/${slug}/`,
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            }
        );

        return response.data; // Usually returns { submission_id: 123 }
    } catch (err) {
        console.error("LeetCode submission error:", err.response?.data || err.message);
        throw new Error(err.response?.data?.error || "Failed to submit to LeetCode");
    }
};

module.exports = { submitToLeetCode };

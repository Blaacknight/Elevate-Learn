// controllers/liveCodingController.js
const axios = require('axios');

const JUDGE0_API = "https://judge0-ce.p.rapidapi.com";
const HEADERS = {
  "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
  "x-rapidapi-key": process.env.JUDGE0_API_KEY,
  "content-type": "application/json",
};

// POST /api/live-coding/run
const runCode = async (req, res) => {
  const { source_code, language_id, stdin } = req.body;

  if (!source_code || !language_id) {
    return res.status(400).json({ error: "Missing required parameters (source_code or language_id)" });
  }

  try {
    const response = await axios.post(
      `${JUDGE0_API}/submissions`,
      { source_code, language_id, stdin },
      { headers: HEADERS }
    );
    res.json({ token: response.data.token });
  } catch (error) {
    console.error("Error while running code:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to run code. Please try again later." });
  }
};

// GET /api/live-coding/result/:token
const getResult = async (req, res) => {
  const token = req.params.token;

  if (!token) {
    return res.status(400).json({ error: "Missing token parameter" });
  }

  try {
    const result = await axios.get(`${JUDGE0_API}/submissions/${token}`, {
      headers: HEADERS,
    });
    res.json(result.data);
  } catch (error) {
    console.error("Error while fetching result:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch result. Please try again later." });
  }
};

module.exports = {
  runCode,
  getResult,
};

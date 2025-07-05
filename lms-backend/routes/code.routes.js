const express = require('express');
const axios = require('axios');
const router = express.Router();
require('dotenv').config();

const protect = require('../middlewares/auth');
const { permit } = require('../middlewares/role');


// Judge0 API details
const JUDGE0_API = "https://judge0-ce.p.rapidapi.com";
const HEADERS = {
  "Content-Type": "application/json",
  "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
  "X-RapidAPI-Key": process.env.JUDGE0_API_KEY,
};

// Route to run code
router.post('/run', protect, permit('student', 'trainer'), async (req, res) => {
  const { source_code, language_id, stdin } = req.body;

  if (!source_code || !language_id) {
    return res.status(400).json({ error: "Missing required parameters (source_code or language_id)" });
  }

  try {
    const response = await axios.post(
      //`${JUDGE0_API}/submissions?base64_encoded=true&wait=true`,
      `${JUDGE0_API}/submissions?wait=true`,
      { source_code, language_id, stdin },
      { headers: HEADERS }
    );

    res.json({ token: response.data.token, result: response.data }); // Optional: return full result if wait=true
  } catch (error) {
    console.error("Error while running code:", error?.response?.data || error.message);
    res.status(500).json({ error: "Failed to run code. Please try again later." });
  }
});

// Route to get result of code execution
router.get('/result/:token', protect, permit('student', 'trainer'), async (req, res) => {
  const token = req.params.token;

  if (!token) {
    return res.status(400).json({ error: "Missing token parameter" });
  }

  try {
    const result = await axios.get(`${JUDGE0_API}/submissions/${token}?base64_encoded=true`, {
      headers: HEADERS,
    });

    res.json(result.data);
  } catch (error) {
    console.error("Error while fetching result:", error?.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch result. Please try again later." });
  }
});

module.exports = router;

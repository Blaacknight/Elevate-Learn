const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller'); // Adjust path as needed

// Route to get messages
router.get('/chat', chatController.getMessages);

// Route to post a new message (with optional image)
router.post('/chat', chatController.postMessage);

module.exports = router;

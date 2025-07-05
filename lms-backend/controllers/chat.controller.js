const multer = require('multer');
const path = require('path');
const ChatMessage = require('../models/ChatMessage');

// Configure multer to store files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Folder where images will be stored
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  }
});
const upload = multer({ storage: storage });

// Get all chat messages (latest 50)
exports.getMessages = async (req, res) => {
  try {
    const messages = await ChatMessage.find().sort({ timestamp: -1 }).limit(50);
    res.json(messages.reverse()); // send in chronological order
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

// Save a new chat message with optional image
exports.postMessage = async (req, res) => {
  upload.single('image')(req, res, async (err) => { // Fix: Use multer as middleware
    if (err) {
      return res.status(400).json({ error: 'Image upload failed' });
    }

    const { user, text } = req.body;
    if (!user || !text) {
      return res.status(400).json({ error: 'User and text are required' });
    }

    try {
      // Save the image URL if image exists
      const imageUrl = req.file ? '/uploads/' + req.file.filename : null;
      const newMessage = new ChatMessage({
        user,
        text,
        imageUrl,
        timestamp: Date.now()
      });

      await newMessage.save();
      res.status(201).json(newMessage);
    } catch (error) {
      res.status(500).json({ error: 'Failed to save message' });
    }
  });
};


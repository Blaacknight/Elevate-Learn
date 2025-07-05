const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  user: { type: String, required: true },
  text: { type: String, required: true },
  imageUrl: { type: String, default: null }, // Optional field to store image URL
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ChatMessage', chatMessageSchema);

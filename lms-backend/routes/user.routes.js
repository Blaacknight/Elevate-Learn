const express = require('express');
const router = express.Router();
const protect = require('../middlewares/auth');
const { permit } = require('../middlewares/role');
const User = require('../models/user.model');

// Get all students (admin only)
router.get('/students', protect, permit('admin'), async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('name email');
    res.status(200).json({ students });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching students', error: err.message });
  }
});

module.exports = router; 
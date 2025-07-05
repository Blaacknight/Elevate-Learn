const express = require('express');
const router = express.Router();
const protect = require('../middlewares/auth');
const { permit } = require('../middlewares/role');

const Course = require('../models/course.model'); // ✅ ADD THIS
const Classroom = require('../models/classroom.model');



const { getStudentDashboard, getAdminDashboard, getTutorDashboard } = require('../controllers/dashboard.controller');

// Student dashboard
router.get('/student', protect, getStudentDashboard);

// Admin dashboard
router.get('/admin',protect,permit('admin'),getAdminDashboard);

//Tutor dashboard
router.get('/tutor', protect, permit('tutor'), async (req, res) => {
    try {
      const courses = await Course.find({ tutor: req.user._id });
      res.json(courses);
    } catch (err) {
        console.error('❌ Error loading tutor dashboard:', err);
      res.status(500).json({ message: 'Failed to load tutor dashboard data' });
    }
  });
  

module.exports = router;

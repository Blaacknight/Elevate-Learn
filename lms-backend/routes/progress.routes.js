const express = require('express');
const router = express.Router();
const protect = require('../middlewares/auth');
const { permit } = require('../middlewares/role');


const {
  toggleCompletion,
  getMyProgress,
  getStudentProgress,
  getAllProgress,
  getCourseProgress,
  getCourseProgressSummary,
} = require('../controllers/progress.controller');

// Student toggles a material as done/undone
router.post(
  '/:courseId/materials/:materialId/toggle',
  protect,
  permit('student'),
  toggleCompletion
);



// Tutor/Admin views one student's progress
router.get('/:courseId/student/:studentId', protect, permit('tutor', 'admin'), getStudentProgress);

// Tutor/Admin views all student progress (raw progress docs)
router.get('/:courseId/all', protect, permit('tutor', 'admin'), getAllProgress);

// Tutor/Admin views summary + all students’ percentage completion
router.get('/course/:courseId', protect, permit('tutor', 'admin'), getCourseProgress);

// Tutor/Admin views progress chart summary (completed vs not)
router.get('/:id/progress-summary', protect, permit('tutor', 'admin'), getCourseProgressSummary);

// Student views their own progress
router.get('/:courseId', protect, permit('student'), getMyProgress);

module.exports = router;

const express = require('express');
const protect = require('../middlewares/auth');
const { permit } = require('../middlewares/role');

const {
  createSection,
  getSectionsByCourse,
  updateSection,
  deleteSection,
  getCourseStructure
} = require('../controllers/section.controller');

const router = express.Router();

// Tutors/Admin only
router.post('/', protect, permit('tutor','admin'), createSection);
router.put('/:id', protect, permit('tutor','admin'), updateSection);
router.delete('/:id', protect, permit('tutor','admin'), deleteSection);
router.get('/course/:id', protect, getCourseStructure);

// Anyone logged in can list
router.get('/course/:courseId', protect, getSectionsByCourse);

module.exports = router;

const express = require('express');
const multer = require('multer');
const {
  createCourse,
  getPublishedCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  getCourseStructure,
  enrollInCourse,
  getMyCourses,
  getEnrolledStudents,
  unenrollFromCourse,
  togglePublishStatus,
  getMyCreatedCourses
} = require('../controllers/course.controller');

const protect = require('../middlewares/auth');
const { permit } = require('../middlewares/role');


const router = express.Router();

// ✅ Multer setup for handling file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// ✅ Routes

// Create course (tutor only) with thumbnail upload
router.post(
  '/',
  protect,
  permit('tutor', 'admin'),
  upload.single('thumbnail'), // 🔥 This is the fix!
  createCourse
);

router.get('/', getPublishedCourses); // Public


router.get('/:id/structure', protect, getCourseStructure);

router.post('/:courseId/enroll', protect, permit('student'), enrollInCourse);
router.get('/my-courses', protect, permit('student'), getMyCourses);
router.get('/:courseId/students', protect, permit('tutor', 'admin'), getEnrolledStudents);
router.delete('/:courseId/unenroll', protect, permit('student'), unenrollFromCourse);
router.patch('/:id/toggle-publish', protect, permit('tutor', 'admin'), togglePublishStatus);
router.get('/mine', protect, permit('tutor', 'admin'), getMyCreatedCourses);
router.get('/:id', getCourseById);
router.put('/:id', protect, permit('tutor', 'admin'), updateCourse);
router.delete('/:id', protect, permit('tutor', 'admin'), deleteCourse);

module.exports = router;

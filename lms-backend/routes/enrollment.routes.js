// const express = require('express');
// const router = express.Router();
// const protect = require('../middlewares/auth');
// const permit = require('../middlewares/role');

// const {
//     enrollInCourse,
//     getMyCourses,
//     getEnrolledStudents,
//     unenrollFromCourse
//   } = require('../controllers/enrollment.controller');
  

// // Enroll in course (student)
// router.post('/:courseId/enroll', protect, permit('student'), enrollInCourse);

// // Get student's enrolled courses
// router.get('/my-courses', protect, permit('student'), getMyCourses);

// // Tutor views enrolled students
// router.get('/:courseId/students', protect, permit('tutor', 'admin'), getEnrolledStudents);

// // Unenroll from course
// router.delete('/:courseId/unenroll', protect, permit('student'), unenrollFromCourse);


// module.exports = router;

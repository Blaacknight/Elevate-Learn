// const Course = require('../models/course.model');
// const User = require('../models/user.model');

// // Enroll student in a course
// exports.enrollInCourse = async (req, res) => {
//   try {
//     const course = await Course.findById(req.params.courseId);

//     if (!course || !course.isPublished) {
//       return res.status(404).json({ message: 'Course not found or not published' });
//     }

//     if (course.enrolledStudents.includes(req.user._id)) {
//       return res.status(400).json({ message: 'Already enrolled in this course' });
//     }

//     course.enrolledStudents.push(req.user._id);
//     await course.save();

//     res.status(200).json({ message: 'Enrolled successfully' });
//   } catch (err) {
//     res.status(500).json({ message: 'Enrollment failed', error: err.message });
//   }
// };

// // View student’s enrolled courses
// exports.getMyCourses = async (req, res) => {
//   try {
//     const courses = await Course.find({ enrolledStudents: req.user._id });
//     res.status(200).json(courses);
//   } catch (err) {
//     res.status(500).json({ message: 'Failed to fetch courses', error: err.message });
//   }
// };

// // Tutor views enrolled students
// exports.getEnrolledStudents = async (req, res) => {
//   try {
//     const course = await Course.findById(req.params.courseId).populate('enrolledStudents', 'name email');

//     if (!course) return res.status(404).json({ message: 'Course not found' });

//     if (
//       course.tutor.toString() !== req.user._id.toString() &&
//       req.user.role !== 'admin'
//     ) {
//       return res.status(403).json({ message: 'Unauthorized to view enrolled students' });
//     }

//     res.status(200).json(course.enrolledStudents);
//   } catch (err) {
//     res.status(500).json({ message: 'Failed to fetch students', error: err.message });
//   }
// };

// // Unenroll from a course
// exports.unenrollFromCourse = async (req, res) => {
//     try {
//       const course = await Course.findById(req.params.courseId);
  
//       if (!course)
//         return res.status(404).json({ message: 'Course not found' });
  
//       const isEnrolled = course.enrolledStudents.includes(req.user._id);
  
//       if (!isEnrolled)
//         return res.status(400).json({ message: 'You are not enrolled in this course' });
  
//       course.enrolledStudents = course.enrolledStudents.filter(
//         (id) => id.toString() !== req.user._id.toString()
//       );
  
//       await course.save();
  
//       res.status(200).json({ message: 'Unenrolled successfully' });
//     } catch (err) {
//       res.status(500).json({ message: 'Unenrollment failed', error: err.message });
//     }
//   };
  

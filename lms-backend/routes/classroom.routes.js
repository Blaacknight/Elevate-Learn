const express = require('express');
const router = express.Router();
const classroomController = require('../controllers/classroom.controller');
const protect = require('../middlewares/auth');
//const permit = require('../middlewares/role');
const { permit, permitAll } = require('../middlewares/role');


 // Adjust the path accordingly

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure the upload/assignments directory exists and is a folder
const assignmentUploadPath = path.join(__dirname, '..', 'upload', 'assignments');

if (fs.existsSync(assignmentUploadPath)) {
  const stat = fs.statSync(assignmentUploadPath);
  if (!stat.isDirectory()) {
    // If it's a file, delete it
    fs.unlinkSync(assignmentUploadPath);
    fs.mkdirSync(assignmentUploadPath, { recursive: true });
  }
} else {
  fs.mkdirSync(assignmentUploadPath, { recursive: true });
}

// Configure multer for PDF uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'upload/assignments/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    if (ext !== '.pdf') {
      return cb(new Error('Only PDFs allowed'), false);
    }
    cb(null, true);
  }
});

// Specific routes first
router.get(
  '/tutor-classrooms',
  protect,
  permit('tutor'),
  classroomController.getTutorClassrooms
);

router.get(
  '/get-all-classrooms',
  protect,
  permit('admin','tutor','student'),
  classroomController.getAllClassrooms
);

router.get(
  '/my-assignments',
  protect,
  permit('student'),
  classroomController.getMyAssignments
);

router.get(
  '/tutor-assignments',
  protect,
  permit('tutor','student'),
  classroomController.getTutorAssignments
);

// Create and assignment routes
router.post(
  '/create-classroom',
  protect,
  permit('admin', 'tutor'),
  classroomController.createClassroom
);

router.post(
  '/assign-students',
  protect,
  permit('admin', 'tutor'),
  classroomController.assignStudentsToClassroom
);

router.post(
  '/assign-tutor',
  protect,
  permit('admin'),
  classroomController.assignTutorToClassroom
);

router.post(
  '/add-assignment',
  protect,
  permit('tutor', 'admin'),
  classroomController.addAssignment
);

router.post(
  '/add-section',
  protect,
  permit('tutor', 'admin'),
  classroomController.addSection
);

router.post(
  '/add-assessment',
  protect,
  permit('tutor', 'admin'),
  classroomController.addAssessment
);

router.post(
  '/submit-assignment/:assignmentId',
  protect,
  permit('student'),
  upload.single('pdf'),
  classroomController.submitAssignment
);

// Parameterized routes last
// router.get(
//   '/class/:id',
//   protect, 
//   permitAll,
//   classroomController.getClassroomById
// );

router.get(
  '/:id', // <-- Correct route
  protect, 
  permitAll,
  classroomController.getClassroomById
);


module.exports = router;

const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const protect = require('../middlewares/auth');
const { permit } = require('../middlewares/role');

const ctrl    = require('../controllers/assignment.controller');

// Multer storage for two folders
const fs = require('fs');
const path = require('path');

// Multer storage for two folders
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = req.originalUrl.includes('submit')
      ? 'uploads/submissions'
      : 'uploads/assignments';

    // Ensure the folder exists, or create it
    const folderPath = path.join(__dirname, dest);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    cb(null, folderPath);
  },
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname}`)
});

const upload = multer({ storage });


// Tutor creates an assignment (questions PDF)
router.post(
  '/',
  protect,
  permit('tutor'),
  upload.single('questionsPDF'),
  ctrl.createAssignment
);

// Students list assignments for a course
router.get(
  '/course/:courseId',
  protect,
  permit('student'),
  ctrl.getAssignmentsForCourse
);

// Student submits a PDF
router.post(
  '/:id/submit',
  protect,
  permit('student'),
  upload.single('answerPDF'),
  ctrl.submitAssignment
);

// Tutor views submissions
router.get(
  '/:id/submissions',
  protect,
  permit('tutor'),
  ctrl.getSubmissions
);

module.exports = router;

const express = require('express');
const router = express.Router();
const protect = require('../middlewares/auth');
const { permit } = require('../middlewares/role');

const upload = require('../middlewares/upload');
const Course = require('../models/course.model');
const Material = require('../models/material.model');


const {
    addMaterial,
    getMaterialsByCourse,
    deleteMaterial,
    downloadMaterial,
    updateMaterial
  } = require('../controllers/material.controller');
  

// Add material
// Update to accept multipart form data
router.post('/', protect, permit('tutor', 'admin'), upload.single('file'), addMaterial);


// Get materials for a course
router.get('/:courseId', protect, getMaterialsByCourse);

// Delete material
router.delete('/:id', protect, permit('tutor', 'admin'), deleteMaterial);

//update material
router.put('/:id', protect, permit('tutor', 'admin'), upload.single('file'), updateMaterial);


// Upload a file as material (type = 'file')
// router.post(
//     '/upload',
//     protect,
//     permit('tutor', 'admin'),
//     upload.single('file'),
//     async (req, res) => {
//       try {
//         const { courseId, title } = req.body;
//         if (!req.file) {
//           return res.status(400).json({ message: 'No file uploaded' });
//         }
  
//         const course = await Course.findById(courseId);
//         if (!course)
//           return res.status(404).json({ message: 'Course not found' });
  
//         if (
//           course.tutor.toString() !== req.user._id.toString() &&
//           req.user.role !== 'admin'
//         ) {
//           return res.status(403).json({ message: 'Unauthorized to add material' });
//         }
  
//         const fileUrl = `/uploads/${req.file.filename}`;
  
//         const material = await Material.create({
//           course: courseId,
//           title,
//           type: 'file',
//           content: fileUrl,
//           createdBy: req.user._id
//         });
  
//         res.status(201).json({ message: 'File uploaded and material saved', material });
//       } catch (err) {
//         res.status(500).json({ message: 'Upload failed', error: err.message });
//       }
//     }
//   );

  router.get(
    '/:id/download',
    protect,
    permit('student', 'tutor', 'admin'),
    downloadMaterial
  );

module.exports = router;

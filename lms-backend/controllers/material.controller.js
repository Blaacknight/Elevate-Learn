const Material = require('../models/material.model');
const Course = require('../models/course.model');
const path = require('path');
const fs = require('fs');
const Section = require('../models/section.model');


// Add material
// exports.addMaterial = async (req, res) => {
//   try {
//     const { courseId, sectionId, title, type, content } = req.body;

//     const course = await Course.findById(courseId);

//     if (!course) return res.status(404).json({ message: 'Course not found' });

//     if (
//       course.tutor.toString() !== req.user._id.toString() &&
//       req.user.role !== 'admin'
//     ) {
//       return res.status(403).json({ message: 'Unauthorized to add material' });
//     }
//     //create section
//     const section = await Section.findById(sectionId);
// if (!section || section.course.toString() !== courseId)
//   return res.status(400).json({ message: 'Invalid section' });

//     // create material
//     const material = await Material.create({
//         course: courseId,
//         section: sectionId,
//         title, type, content, 
//         createdBy: req.user._id
//       });

//     res.status(201).json(material);
//   } catch (err) {
//     res.status(500).json({ message: 'Failed to add material', error: err.message });
//   }
// };
exports.addMaterial = async (req, res) => {
  try {
    console.log('Body:', req.body);
console.log('File:', req.file);

    const { courseId, sectionId, title, type } = req.body;
    let content = req.body.content;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    if (
      course.tutor.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Unauthorized to add material' });
    }

    const section = await Section.findById(sectionId);
    if (!section || section.course.toString() !== courseId)
      return res.status(400).json({ message: 'Invalid section' });

    if ((type === 'pdf' || type === 'file') && req.file) {
      content = `/uploads/${req.file.filename}`;
    }

    const material = await Material.create({
      course: courseId,
      section: sectionId,
      title,
      type,
      content,
      createdBy: req.user._id
    });

    res.status(201).json(material);
  } catch (err) {
    res.status(500).json({ message: 'Failed to add material', error: err.message });
  }
};


// Get all materials for a course
exports.getMaterialsByCourse = async (req, res) => {
  try {
    const materials = await Material.find({ course: req.params.courseId });
    res.status(200).json(materials);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch materials', error: err.message });
  }
};

// Delete material
exports.deleteMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);

    if (!material) return res.status(404).json({ message: 'Material not found' });

    if (
      material.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Unauthorized to delete material' });
    }

    await material.deleteOne();
    res.status(200).json({ message: 'Material deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete material', error: err.message });
  }
};

// exports.downloadMaterial = async (req, res) => {
//     try {
//       const mat = await Material.findById(req.params.id);
//       if (!mat) {
//         return res.status(404).json({ message: 'Material not found' });
//       }
//       if (mat.type !== 'file') {
//         return res.status(400).json({ message: 'Material is not a downloadable file' });
//       }
  
//       // Fetch course to check enrollment / ownership
//       const course = await Course.findById(mat.course);
//       if (!course) {
//         return res.status(404).json({ message: 'Course not found' });
//       }
  
//       const isTutorOrAdmin =
//         course.tutor.toString() === req.user._id.toString() ||
//         req.user.role === 'admin';
//       const isEnrolled = course.enrolledStudents.includes(req.user._id);
  
//       if (!(isTutorOrAdmin || isEnrolled)) {
//         return res.status(403).json({ message: 'Forbidden: not enrolled or not owner' });
//       }
  
//       // Material.content holds the relative URL "/uploads/filename.ext"
//       const filePath = path.join(__dirname, '..', mat.content);
//       // Set header to expose 'Content-Disposition' to frontend
//     res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");

// return res.download(filePath, err => {
//   if (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Error sending file' });
//   }
// });

//     } catch (err) {
//       res.status(500).json({ message: 'Download failed', error: err.message });
//     }
    
//   };

//update material



exports.downloadMaterial = async (req, res) => {
  try {
    const mat = await Material.findById(req.params.id);
    if (!mat) return res.status(404).json({ message: 'Material not found' });

    if (mat.type !== 'file' && mat.type !== 'pdf') {
      return res.status(400).json({ message: 'Not a downloadable file type' });
    }

    const course = await Course.findById(mat.course);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const isAllowed =
      course.tutor.toString() === req.user._id.toString() ||
      course.enrolledStudents.includes(req.user._id) ||
      req.user.role === 'admin';

    if (!isAllowed) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const filePath = path.join(__dirname, '..', mat.content);
    const fileName = path.basename(mat.content); // for proper download name

    // ✅ Send download response
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
    res.download(filePath, fileName, err => {
      if (err) {
        console.error('Download error:', err);
        res.status(500).json({ message: 'Error sending file' });
      }
    });

  } catch (err) {
    res.status(500).json({ message: 'Download failed', error: err.message });
  }
};


exports.updateMaterial = async (req, res) => {
  try {
    const { title, type, content: rawContent } = req.body;
    const material = await Material.findById(req.params.id);

    if (!material) return res.status(404).json({ message: 'Material not found' });

    // Permission check
    if (
      material.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Handle content
    let content = rawContent;
    if (type === 'file' && req.file) {
      content = `/uploads/${req.file.filename}`;
    }

    // Basic validation
    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }

    // Update fields
    material.title = title;
    material.type = type;
    material.content = content;

    await material.save();
    res.status(200).json({ message: 'Material updated', material });
  } catch (err) {
    res.status(500).json({ message: 'Update failed', error: err.message });
  }
};

  

  
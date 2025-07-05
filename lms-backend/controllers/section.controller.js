const Section = require('../models/section.model');
const Course  = require('../models/course.model');
const Material = require('../models/material.model');

exports.getCourseStructure = async (req, res) => {
  try {
    const courseId = req.params.id;

    // Get all sections of the course
    const sections = await Section.find({ course: courseId }).sort({ order: 1 }).lean();

    // Get all materials of the course
    const materials = await Material.find({ course: courseId }).lean();

    // Group materials under each section
    const result = sections.map(sec => ({
      ...sec,
      materials: materials.filter(mat => mat.section?.toString() === sec._id.toString())
    }));

    res.status(200).json(result);
  } catch (err) {
    console.error('Failed to load course structure:', err);
    res.status(500).json({ message: 'Failed to load course structure', error: err.message });
  }
};

// Create a section
exports.createSection = async (req, res) => {
  const { courseId, title, description, order } = req.body;
  try {
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (course.tutor.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Forbidden' });

    const section = await Section.create({ course: courseId, title, description, order });
    res.status(201).json(section);
  } catch (err) {
    res.status(500).json({ message: 'Create failed', error: err.message });
  }
};

// Get all sections for a course
exports.getSectionsByCourse = async (req, res) => {
  try {
    const sections = await Section
      .find({ course: req.params.courseId })
      .sort('order');
    res.json(sections);
  } catch (err) {
    res.status(500).json({ message: 'Fetch failed', error: err.message });
  }
};

// Update a section
exports.updateSection = async (req, res) => {
  try {
    const section = await Section.findById(req.params.id);
    if (!section) return res.status(404).json({ message: 'Section not found' });

    // verify ownership
    const course = await Course.findById(section.course);
    if (course.tutor.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Forbidden' });

    Object.assign(section, req.body);
    await section.save();
    res.json(section);
  } catch (err) {
    res.status(500).json({ message: 'Update failed', error: err.message });
  }
};

// Delete a section
exports.deleteSection = async (req, res) => {
  try {
    const section = await Section.findById(req.params.id);
    if (!section) return res.status(404).json({ message: 'Section not found' });

    const course = await Course.findById(section.course);
    if (course.tutor.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Forbidden' });

    await section.deleteOne();
    res.json({ message: 'Section deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed', error: err.message });
  }
};

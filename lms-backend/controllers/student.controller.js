const Classroom = require('../models/classroom.model');

// Get My Classrooms (Student)
exports.getMyClassrooms = async (req, res) => {
  const studentId = req.user._id;

  try {
    const classrooms = await Classroom.find({ students: studentId })
      .populate('tutor', 'name email')
      .populate('sections', 'title');

    res.status(200).json({ classrooms });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching classrooms', error: err.message });
  }
};

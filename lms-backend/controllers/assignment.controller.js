// controllers/assignment.controller.js
const Assignment = require('../models/assignment.model');
const Course     = require('../models/course.model');

// Tutor creates an assignment
exports.createAssignment = async (req, res) => {
  try {
    const { courseId, title, description, dueDate } = req.body;
    // ensure course exists and user is its tutor
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (course.tutor.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    const questionsPDF = `/uploads/assignments/${req.file.filename}`;
    const assignment = await Assignment.create({
      course:       courseId,
      title,
      description,
      dueDate,
      questionsPDF
    });

    // link assignment in course
    course.assignments.push(assignment._id);
    await course.save();

    res.status(201).json(assignment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Students list assignments for a course
exports.getAssignmentsForCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (!course.enrolledStudents.includes(req.user._id))
      return res.status(403).json({ message: 'Not enrolled' });

    const assignments = await Assignment.find({ course: courseId })
      .select('-submissions')   // omit submissions detail
      .lean();

    res.json(assignments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Student submits an assignment
exports.submitAssignment = async (req, res) => {
  try {
    const assignmentId = req.params.id;
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

    // Check enrollment
    const course = await Course.findById(assignment.course);
    if (!course.enrolledStudents.includes(req.user._id))
      return res.status(403).json({ message: 'Not enrolled' });

    const answerPDF = `/uploads/submissions/${req.file.filename}`;
    assignment.submissions.push({
      student:   req.user._id,
      answerPDF
    });
    await assignment.save();

    res.json({ message: 'Submitted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// (Optional) Tutor views all submissions for an assignment
exports.getSubmissions = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('submissions.student', 'name email');
    if (!assignment) return res.status(404).json({ message: 'Not found' });

    // ensure tutor owns the course
    const course = await Course.findById(assignment.course);
    if (course.tutor.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    res.json(assignment.submissions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

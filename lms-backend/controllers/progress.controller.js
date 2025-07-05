const Progress = require('../models/progress.model');
const Material = require('../models/material.model');
const Course = require('../models/course.model');
const User = require('../models/user.model');

// Helper: compute percent
const calcPercent = (done, total) =>
  total === 0 ? 0 : Math.round((done / total) * 100);

// Toggle a material as completed/uncompleted
exports.toggleCompletion = async (req, res) => {
  const { courseId, materialId } = req.params;
  const studentId = req.user._id;

  try {
    // ensure material belongs to course
    const mat = await Material.findById(materialId);
    if (!mat || mat.course.toString() !== courseId)
      return res.status(404).json({ message: 'Material not in this course' });

    // find or create a Progress doc
    let prog = await Progress.findOne({ student: studentId, course: courseId });
    if (!prog) {
      prog = await Progress.create({ student: studentId, course: courseId });
    }

    const idx = prog.completedMaterials.findIndex(m => m.equals(materialId));
    if (idx > -1) {
      // already done → unmark
      prog.completedMaterials.splice(idx, 1);
    } else {
      // not done → mark
      prog.completedMaterials.push(materialId);
    }
    await prog.save();

    // compute %
    const totalMaterials = await Material.countDocuments({ course: courseId });
    const doneCount = prog.completedMaterials.length;
    const percent = calcPercent(doneCount, totalMaterials);

    res.json({ completedMaterials: prog.completedMaterials, percent });
  } catch (err) {
    res.status(500).json({ message: 'Toggle failed', error: err.message });
  }
};

// Student views their progress for a course
exports.getMyProgress = async (req, res) => {
  const { courseId } = req.params;
  const studentId = req.user._id;

  try {
    const prog = await Progress.findOne({ student: studentId, course: courseId })
      .populate('completedMaterials', 'title type');

    const total = await Material.countDocuments({ course: courseId });
    const done = prog?.completedMaterials.length || 0;
    const percent = calcPercent(done, total);

    res.json({
      completedMaterials: prog?.completedMaterials || [],
      totalMaterials: total,
      percent
    });
  } catch (err) {
    res.status(500).json({ message: 'Fetch failed', error: err.message });
  }
};

// Tutor/Admin views one student’s progress
exports.getStudentProgress = async (req, res) => {
  const { courseId, studentId } = req.params;
  // ensure only tutor of course or admin
  const course = await require('../models/course.model').findById(courseId);
  if (!course) return res.status(404).json({ message: 'Course not found' });
  if (
    course.tutor.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  try {
    const prog = await Progress.findOne({ student: studentId, course: courseId })
      .populate('completedMaterials', 'title type');
    const total = await Material.countDocuments({ course: courseId });
    const done = prog?.completedMaterials.length || 0;
    const percent = calcPercent(done, total);

    res.json({
      studentId,
      completedMaterials: prog?.completedMaterials || [],
      totalMaterials: total,
      percent
    });
  } catch (err) {
    res.status(500).json({ message: 'Fetch failed', error: err.message });
  }
};

// Tutor/Admin views everyone’s progress for a course
exports.getAllProgress = async (req, res) => {
  const { courseId } = req.params;
  const course = await require('../models/course.model').findById(courseId);
  if (!course) return res.status(404).json({ message: 'Course not found' });
  if (
    course.tutor.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  try {
    const all = await Progress.find({ course: courseId })
      .populate('student', 'name email')
      .populate('completedMaterials', 'title type');

    const total = await Material.countDocuments({ course: courseId });

    // attach percent for each
    const data = all.map(prog => ({
      student: prog.student,
      completedMaterials: prog.completedMaterials,
      percent: calcPercent(prog.completedMaterials.length, total)
    }));

    res.json({ totalMaterials: total, progress: data });
  } catch (err) {
    res.status(500).json({ message: 'Fetch failed', error: err.message });
  }
};


// Get progress of all students in a course
exports.getCourseProgress = async (req, res) => {
  try {
    const courseId = req.params.courseId;

    const course = await Course.findById(courseId).populate('enrolledStudents', 'name email');
    if (!course) return res.status(404).json({ message: 'Course not found' });

    if (course.tutor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const materials = await Material.find({ course: courseId });
    const totalMaterials = materials.length;

    const progressData = await Promise.all(
      course.enrolledStudents.map(async (student) => {
        const progress = await Progress.findOne({ student: student._id, course: courseId });
        const completedCount = progress?.completedMaterials.length || 0;
        const percentage = totalMaterials === 0 ? 0 : Math.round((completedCount / totalMaterials) * 100);

        return {
          student: {
            id: student._id,
            name: student.name,
            email: student.email
          },
          completed: completedCount,
          total: totalMaterials,
          percentage
        };
      })
    );

    res.status(200).json(progressData);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch course progress', error: err.message });
  }
};


// GET /api/courses/:id/students-progress
// exports.getStudentProgress = async (req, res) => {
//   try {
//     const courseId = req.params.id;

//     const course = await Course.findById(courseId).populate('enrolledStudents', 'name email');
//     if (!course) return res.status(404).json({ message: 'Course not found' });

//     if (
//       course.tutor.toString() !== req.user._id.toString() &&
//       req.user.role !== 'admin'
//     ) return res.status(403).json({ message: 'Unauthorized' });

//     const materials = await Material.find({ course: courseId });
//     const total = materials.length;

//     const progressList = await Promise.all(
//       course.enrolledStudents.map(async (student) => {
//         const progress = await Progress.findOne({ course: courseId, student: student._id });
//         const completed = progress?.completedMaterials?.length || 0;
//         const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
//         return {
//           studentId: student._id,
//           name: student.name,
//           email: student.email,
//           progress: percent
//         };
//       })
//     );

//     res.json({ totalMaterials: total, students: progressList });
//   } catch (err) {
//     res.status(500).json({ message: 'Failed to fetch student progress', error: err.message });
//   }
// };



// GET /api/courses/:id/progress-summary
exports.getCourseProgressSummary = async (req, res) => {
  try {
    const courseId = req.params.id;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    if (
      course.tutor.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) return res.status(403).json({ message: 'Unauthorized' });

    const totalMaterials = await Material.countDocuments({ course: courseId });
    const enrolled = course.enrolledStudents.length;

    let completedCount = 0;

    for (const studentId of course.enrolledStudents) {
      const progress = await Progress.findOne({ course: courseId, student: studentId });
      if (progress && progress.completedMaterials.length === totalMaterials) {
        completedCount++;
      }
    }

    const incompleteCount = enrolled - completedCount;

    res.json({
      enrolled,
      completed: completedCount,
      notCompleted: incompleteCount
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch course progress summary', error: err.message });
  }
};

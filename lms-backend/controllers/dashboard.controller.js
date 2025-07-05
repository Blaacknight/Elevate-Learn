const Course   = require('../models/course.model');
const Progress = require('../models/progress.model');
const Material = require('../models/material.model');
const User     = require('../models/user.model');
const Classroom = require('../models/classroom.model'); 


// Student
exports.getStudentDashboard = async (req, res) => {
  const studentId = req.user._id;

  try {
    // 1. Fetch enrolled courses
    const courses = await Course.find({ enrolledStudents: studentId })
      .select('title thumbnail tutor isPublished')
      .populate('tutor', 'name');

    // 2. Attach progress to each
    const dashboard = await Promise.all(courses.map(async (course) => {
      const prog = await Progress.findOne({ student: studentId, course: course._id });
      const total = await Material.countDocuments({ course: course._id });
      const done  = prog?.completedMaterials.length || 0;
      const percent = total === 0 ? 0 : Math.round((done / total) * 100);

      // 3. Get latest 3 materials added
      const recent = await Material.find({ course: course._id })
        .sort({ createdAt: -1 })
        .limit(3)
        .select('title type createdAt');

      return {
        courseId: course._id,
        title: course.title,
        tutor: course.tutor.name,
        thumbnail: course.thumbnail,
        progress: percent,
        recentMaterials: recent
      };
    }));

    res.json({ dashboard });
  } catch (err) {
    res.status(500).json({ message: 'Failed to build dashboard', error: err.message });
  }
};


//Admin
exports.getAdminDashboard = async (req, res) => {
  try {
    // 1. Users
    const totalUsers   = await User.countDocuments();
    const totalAdmins  = await User.countDocuments({ role: 'admin' });
    const totalTutors  = await User.countDocuments({ role: 'tutor' });
    const totalStudents= await User.countDocuments({ role: 'student' });

    // 2. Courses
    const totalCourses      = await Course.countDocuments();
    const publishedCourses  = await Course.countDocuments({ isPublished: true });
    const unpublishedCourses= totalCourses - publishedCourses;

    // 3. Enrollments (sum of enrolledStudents arrays)
    const courses = await Course.find().select('enrolledStudents').lean();
    const totalEnrollments = courses.reduce(
      (sum, c) => sum + (c.enrolledStudents?.length || 0),
      0
    );

    // 4. Materials
    const totalMaterials = await Material.countDocuments();

    // 5. Classroom count (new addition)
    const totalClassrooms = await Classroom.countDocuments(); // Count total classrooms

    return res.json({
      users: {
        total: totalUsers,
        admins: totalAdmins,
        tutors: totalTutors,
        students: totalStudents
      },
      courses: {
        total: totalCourses,
        published: publishedCourses,
        unpublished: unpublishedCourses
      },
      enrollments: {
        total: totalEnrollments
      },
      materials: {
        total: totalMaterials
      },
      classrooms: {
        total: totalClassrooms // Only include total classrooms count
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch admin dashboard', error: err.message });
  }
};

//Tutor
exports.getTutorDashboard = async (req, res) => {
  const tutorId = req.user._id;

  try {
    // 1. Fetch courses created by this tutor
    const courses = await Course.find({ tutor: tutorId }).lean();

    const totalCourses     = courses.length;
    const publishedCourses = courses.filter(c => c.isPublished).length;
    const unpublishedCourses = totalCourses - publishedCourses;

    // 2. Total enrollments across all their courses
    const totalEnrollments = courses.reduce(
      (sum, course) => sum + (course.enrolledStudents?.length || 0),
      0
    );

    // 3. Total materials they uploaded (across their courses)
    const courseIds = courses.map(c => c._id);
    const totalMaterials = await Material.countDocuments({ course: { $in: courseIds } });

    // 4. (Optional) Course-wise stats
    const courseStats = await Promise.all(
      courses.map(async (course) => {
        const materialCount = await Material.countDocuments({ course: course._id });
        return {
          courseId: course._id,
          title: course.title,
          isPublished: course.isPublished,
          enrollments: course.enrolledStudents?.length || 0,
          materials: materialCount
        };
      })
    );

    res.json({
      courses: {
        total: totalCourses,
        published: publishedCourses,
        unpublished: unpublishedCourses
      },
      enrollments: {
        total: totalEnrollments
      },
      materials: {
        total: totalMaterials
      },
      courseStats
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch tutor dashboard', error: err.message });
  }
};

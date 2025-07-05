const Classroom = require('../models/classroom.model');
const User = require('../models/user.model');
const Assignment = require('../models/assignment.model');

// Get Classrooms for Logged-in Tutor
exports.getTutorClassrooms = async (req, res) => {
  try {
    const tutorId = req.user._id;
    const classrooms = await Classroom.find({ tutor: tutorId })
      .populate('students', 'name email')
      .populate('assignments');

    res.status(200).json({ classrooms });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching tutor classrooms', error: err.message });
  }
};

// Create Classroom
exports.createClassroom = async (req, res) => {
  const { name, description, tutorId } = req.body;
  const adminId = req.user._id;
  const userRole = req.user.role;

  try {
    let tutorToAssign;
    
    // If admin is creating, validate the tutor
    if (userRole === 'admin') {
      const tutor = await User.findById(tutorId);
      if (!tutor || tutor.role !== 'tutor') {
        return res.status(400).json({ message: 'Invalid tutor' });
      }
      tutorToAssign = tutorId;
    } else {
      // If tutor is creating, assign themselves
      tutorToAssign = adminId;
    }

    // Create a new classroom
    const newClassroom = new Classroom({
      name,
      description,
      tutor: tutorToAssign,
      createdBy: adminId
    });

    await newClassroom.save();
    res.status(201).json({ message: 'Classroom created successfully', newClassroom });
  } catch (err) {
    res.status(500).json({ message: 'Error creating classroom', error: err.message });
  }
};

// Assign Students to Classroom
exports.assignStudentsToClassroom = async (req, res) => {
  const { classroomId, studentIds } = req.body;

  try {
    // Find the classroom
    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found' });
    }

    // Verify that the current user is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can assign students' });
    }

    // Find all students and verify they exist
    const students = await User.find({ 
      _id: { $in: studentIds },
      role: 'student'
    });

    if (students.length !== studentIds.length) {
      return res.status(400).json({ message: 'One or more invalid student IDs' });
    }

    // Replace the entire students array with the new selection
    classroom.students = studentIds;
    await classroom.save();

    // Populate the students before sending response
    await classroom.populate('students', 'name email');

    res.status(200).json({ 
      message: 'Students assigned successfully', 
      classroom 
    });
  } catch (err) {
    console.error('Error in assignStudentsToClassroom:', err);
    res.status(500).json({ message: 'Error assigning students', error: err.message });
  }
};

// Assign Tutor to Classroom
exports.assignTutorToClassroom = async (req, res) => {
  const { classroomId, tutorId } = req.body;

  try {
    // Find the classroom
    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found' });
    }

    // Find and validate tutor
    const tutor = await User.findById(tutorId);
    if (!tutor || tutor.role !== 'tutor') {
      return res.status(400).json({ message: 'Invalid tutor' });
    }

    // Assign tutor to the classroom
    classroom.tutor = tutorId;
    await classroom.save();

    res.status(200).json({ message: 'Tutor assigned to classroom', classroom });
  } catch (err) {
    res.status(500).json({ message: 'Error assigning tutor', error: err.message });
  }
};

// Get All Classrooms (Admin)
exports.getAllClassrooms = async (req, res) => {
  try {
    const classrooms = await Classroom.find()
      .populate('tutor', 'name email')
      .populate('students', 'name email');
      
    res.status(200).json({ classrooms });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching classrooms', error: err.message });
  }
};

// Get Classrooms for Logged-in Student
// Get single classroom by ID
exports.getClassroomById = async (req, res) => {
  try {
    const classroom = await Classroom.findById(req.params.id)
      .populate('tutor', 'name email')
      .populate('students', 'name email')
      .populate('assignments');

    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found' });
    }

    res.status(200).json({ classroom });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching classroom', error: err.message });
  }
};

// Student submits a PDF
exports.submitAssignment = async (req, res) => {
  const { assignmentId } = req.params;
  const studentId = req.user._id;

  try {
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if already submitted
    const alreadySubmitted = assignment.submissions.find(
      (sub) => sub.student.toString() === studentId.toString()
    );
    if (alreadySubmitted) {
      return res.status(400).json({ message: 'Already submitted' });
    }

    // Save submission
    assignment.submissions.push({
      student: studentId,
      answerPDF: req.file.path
    });

    await assignment.save();
    res.status(200).json({ message: 'Assignment submitted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error submitting assignment', error: err.message });
  }
};

// Add Assignment to Classroom
exports.addAssignment = async (req, res) => {
  const { classroomId, title, description, dueDate } = req.body;

  try {
    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found' });
    }

    // if (classroom.tutor.toString() !== req.user._id.toString()) {
    //   return res.status(403).json({ message: 'Not authorized' });
    // }

    const newAssignment = new Assignment({
      course: classroomId,
      title,
      description,
      dueDate,
      questionsPDF: 'dummy.pdf' // or set this from uploaded file if needed
    });

    await newAssignment.save();

    classroom.assignments.push(newAssignment._id);
    await classroom.save();

    res.status(201).json({ message: 'Assignment added', assignment: newAssignment });
  } catch (err) {
    res.status(500).json({ message: 'Error adding assignment', error: err.message });
  }
};

// Add Section to Classroom
exports.addSection = async (req, res) => {
  const { classroomId, title, description } = req.body;

  try {
    const classroom = await Classroom.findById(classroomId);

    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found' });
    }

    // Ensure tutor is the same as the current user
    if (classroom.tutor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to add section' });
    }

    classroom.sections.push({ title, description });
    await classroom.save();

    res.status(201).json({ message: 'Section added successfully', classroom });
  } catch (err) {
    res.status(500).json({ message: 'Error adding section', error: err.message });
  }
};

// Get Assignments for the Logged-in Student
exports.getMyAssignments = async (req, res) => {
    try {
      const studentId = req.user._id;
  
      // Find classrooms the student is assigned to
      const classrooms = await Classroom.find({ students: studentId })
        .populate('assignments'); // Populate assignments of the classrooms
  
      if (!classrooms.length) {
        return res.status(404).json({ message: 'No classrooms found for this student' });
      }
  
      // Collect all assignments from the classrooms
      const assignments = classrooms.reduce((acc, classroom) => {
        acc.push(...classroom.assignments);
        return acc;
      }, []);
  
      res.status(200).json({ assignments });
    } catch (err) {
      res.status(500).json({ message: 'Error fetching assignments', error: err.message });
    }
};

// Get Assignments for the Logged-in Tutor
exports.getTutorAssignments = async (req, res) => {
    try {
      const tutorId = req.user._id;
  
      // Find classrooms where the tutor is assigned
      const classrooms = await Classroom.find({ tutor: tutorId })
        .populate('assignments'); // Populate assignments of the classrooms
  
      if (!classrooms.length) {
        return res.status(404).json({ message: 'No classrooms found for this tutor' });
      }
  
      // Collect all assignments from the classrooms
      const assignments = classrooms.reduce((acc, classroom) => {
        acc.push(...classroom.assignments);
        return acc;
      }, []);
  
      res.status(200).json({ assignments });
    } catch (err) {
      res.status(500).json({ message: 'Error fetching assignments', error: err.message });
    }
};

// Add assessment to classroom
exports.addAssessment = async (req, res) => {
  try {
    const { classroomId, title, description, dueDate } = req.body;
    const tutorId = req.user._id;

    // Validate input
    if (!classroomId || !title || !description || !dueDate) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Find classroom and verify tutor ownership
    const classroom = await Classroom.findOne({ _id: classroomId, tutor: tutorId });
    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found or you are not authorized' });
    }

    // Create new assessment
    const assessment = {
      title,
      description,
      dueDate,
      submissions: []
    };

    // Add assessment to classroom
    classroom.assignments.push(assessment);
    await classroom.save();

    res.status(201).json({
      message: 'Assessment created successfully',
      assessment: classroom.assignments[classroom.assignments.length - 1]
    });
  } catch (error) {
    console.error('Error creating assessment:', error);
    res.status(500).json({ message: 'Error creating assessment', error: error.message });
  }
};

// Get Classrooms for Logged-in Student
exports.getStudentClassrooms = async (req, res) => {
  try {
    const studentId = req.user._id;
    const classrooms = await Classroom.find({ students: studentId })
      .populate('tutor', 'name email')
      .populate('assignments');
    res.status(200).json({ classrooms });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching student classrooms', error: err.message });
  }
};
  
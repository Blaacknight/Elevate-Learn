// models/assignment.model.js
const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  student:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  answerPDF:   { type: String, required: true },   // file path
  submittedAt: { type: Date, default: Date.now }
});

const assignmentSchema = new mongoose.Schema({
  course:       { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  title:        { type: String, required: true },
  description:  { type: String },
  questionsPDF: { type: String, required: true },  // file path
  dueDate:      { type: Date },
  submissions:  [submissionSchema]
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema);

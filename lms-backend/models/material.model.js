const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  section: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Section',
        required: true
      },
  title: { type: String, required: true },
  type: {
    type: String,
    enum: ['video', 'note', 'link', 'file','text','pdf','youtube'],
    required: true
  },
  content: { type: String, required: true }, // YouTube URL, text note, file URL
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Material', materialSchema);

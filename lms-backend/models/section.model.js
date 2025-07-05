const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  title: { type: String, required: true },
  description: { type: String },
  order: { type: Number, default: 0 }   // to order sections
}, { timestamps: true });

module.exports = mongoose.model('Section', sectionSchema);

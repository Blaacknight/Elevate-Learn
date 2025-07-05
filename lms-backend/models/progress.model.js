const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  completedMaterials: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'Material' }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Progress', progressSchema);

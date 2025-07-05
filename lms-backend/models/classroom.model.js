const mongoose = require('mongoose');

const classroomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: ''
    },
    tutor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    sections: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Section'
      }
    ],
    assignments: 
    [{ type: mongoose.Schema.Types.ObjectId,
         ref: 'Assignment' 
        }
    ],
   
         createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Classroom', classroomSchema);

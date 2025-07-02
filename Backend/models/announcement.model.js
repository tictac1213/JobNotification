import mongoose from 'mongoose';

const AnnouncementSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  course: {                       // Restrict by course
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  branches: [{ 
    type: String 
  }],
  years: [{ 
    type: Number 
  }]
}, { 
  timestamps: true 
});

export default mongoose.model('Announcement', AnnouncementSchema);
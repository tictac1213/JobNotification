import mongoose from 'mongoose';

const CourseSchema = new mongoose.Schema({
  name: { 
    type: String, 
    enum: ['BTech', 'MTech', 'MCA'], 
    unique: true, 
    required: true 
  },
  duration: {     // in years
    type: Number, 
    required: true 
  },
  allowedBranches: [{ 
    type: String, 
    required: true 
  }]
}, {
  timestamps: true,
  versionKey: false
});

export default mongoose.model('Course', CourseSchema);

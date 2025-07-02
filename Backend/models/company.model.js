import mongoose from 'mongoose';

const CompanySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    required: true 
  },
  description: {
    type: String,
    default: ''
  },
  status: { 
    type: String, 
    enum: ['Active', 'Completed'], 
    default: 'Active'  
  },
  compensation: { 
    type: String, 
    required: true 
  },
  eligibility: {
    course: {                  // Restrict eligibility by course
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    },
    branches: [{ 
      type: String 
    }],
    years: [{ 
      type: Number 
    }],
    minCgpa: { 
      type: Number 
    }
  },
  jobDescriptionDocs: [{
    name: String,
    url: String
  }],
  tasks: [{                 // Reference tasks
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  }]
}, { 
  timestamps: true 
});

export default mongoose.model('Company', CompanySchema);
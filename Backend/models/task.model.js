import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  deadline: {
    type: Date,
    required: true
  },
  pptLink: {
    type: String,
    trim: true
  },
  formLink: {
    type: String,
    trim: true
  },
  oneDayReminderSent: {
    type: Boolean,
    default: false
  },
  sixHourReminderSent: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['Active', 'Completed', 'Expired'],
    default: 'Active'
  }
}, {
  timestamps: true
});

// Index for efficient reminder queries
taskSchema.index({ deadline: 1, oneDayReminderSent: 1 });
taskSchema.index({ deadline: 1, sixHourReminderSent: 1 });

export default mongoose.model('Task', taskSchema); 
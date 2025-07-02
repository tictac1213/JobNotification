import mongoose from 'mongoose';
import Course from './course.model.js';

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Name is required'] },
  email: { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: [true, 'Password is required'] },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: [true, 'Course is required'] },
  branch: { type: String, required: [true, 'Branch is required'] },
  year: { type: Number, required: [true, 'Year is required'] },
  cgpa: { type: Number, required: [true, 'CGPA is required'], min: [0, 'CGPA cannot be negative'], max: [10, 'CGPA cannot exceed 10'] },
  scholarNo: { type: String, required: [true, 'Scholar number is required'], unique: true, trim: true },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  status: { type: String, enum: ['Pending', 'Active', 'Rejected'], default: 'Pending' },
  emailPreferences: {
    taskReminders: { type: Boolean, default: true },
    newCompanyNotifications: { type: Boolean, default: true },
    approvalNotifications: { type: Boolean, default: true }
  }
}, {
  timestamps: true,
  versionKey: false
});

// Validate course-specific rules
userSchema.pre('validate', async function(next) {
  if (!this.course) return next();
  try {
    const course = await Course.findById(this.course);
    if (!course) {
      this.invalidate('course', 'Invalid course selected');
      return next();
    }
    // Year constraint
    if (this.year < 1 || this.year > course.duration) {
      this.invalidate('year', `Year must be 1 to ${course.duration} for ${course.name}`);
    }
    // Branch constraint
    if (!course.allowedBranches.includes(this.branch)) {
      this.invalidate('branch', `${this.branch} is not valid for ${course.name}`);
    }
    next();
  } catch (err) {
    next(err);
  }
});

export default mongoose.model('User', userSchema);
import User from '../models/user.model.js';
import { APIResponse } from '../utils/response.js';

// Get all pending students for approval
export const getPendingStudents = async (req, res) => {
  try {
    const pendingStudents = await User.find({ 
      status: 'Pending',
      role: 'student'
    }).populate('course', 'name');

    return APIResponse(res, 200, true, 'Pending students fetched successfully', pendingStudents);
  } catch (error) {
    return APIResponse(res, 500, false, error.message);
  }
};

// Approve student
export const approveStudent = async (req, res) => {
  try {
    const student = await User.findByIdAndUpdate(
      req.params.id,
      { status: 'Active' },
      { new: true }
    ).populate('course', 'name');

    if (!student) {
      return APIResponse(res, 404, false, 'Student not found');
    }

    return APIResponse(res, 200, true, 'Student approved successfully', student);
  } catch (error) {
    return APIResponse(res, 500, false, error.message);
  }
};

// Reject student
export const rejectStudent = async (req, res) => {
  try {
    const student = await User.findByIdAndUpdate(
      req.params.id,
      { status: 'Rejected' },
      { new: true }
    ).populate('course', 'name');

    if (!student) {
      return APIResponse(res, 404, false, 'Student not found');
    }

    return APIResponse(res, 200, true, 'Student rejected successfully', student);
  } catch (error) {
    return APIResponse(res, 500, false, error.message);
  }
};

// Get all students (Admin only)
export const getAllStudents = async (req, res) => {
  try {
    const { status, branch, year, course } = req.query;
    const filter = { role: 'student' };

    if (status) filter.status = status;
    if (branch) filter.branch = branch;
    if (year) filter.year = parseInt(year);
    if (course) filter.course = course;

    const students = await User.find(filter)
      .populate('course', 'name')
      .select('-passwordHash')
      .sort({ createdAt: -1 });

    return APIResponse(res, 200, true, 'Students fetched successfully', students);
  } catch (error) {
    return APIResponse(res, 500, false, error.message);
  }
};

// Get dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const pendingStudents = await User.countDocuments({ 
      role: 'student', 
      status: 'Pending' 
    });
    const activeStudents = await User.countDocuments({ 
      role: 'student', 
      status: 'Active' 
    });
    const rejectedStudents = await User.countDocuments({ 
      role: 'student', 
      status: 'Rejected' 
    });

    const stats = {
      totalStudents,
      pendingStudents,
      activeStudents,
      rejectedStudents
    };

    return APIResponse(res, 200, true, 'Dashboard stats fetched successfully', stats);
  } catch (error) {
    return APIResponse(res, 500, false, error.message);
  }
}; 
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { APIResponse } from '../utils/response.js';

export const signup = async (req, res) => {
  try {
    const { name, email, password, branch, year, cgpa, course, scholarNo } = req.body;
    
    // Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return APIResponse(res, 400, false, 'User already exists');
    }

    // Check if scholar number already exists
    const existingScholar = await User.findOne({ scholarNo });
    if (existingScholar) {
      return APIResponse(res, 400, false, 'Scholar number already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const newUser = await User.create({
      name,
      email,
      passwordHash,
      branch,
      year,
      cgpa,
      course,
      scholarNo
    });

    return APIResponse(res, 201, true, 'Signup successful. Awaiting admin approval', {
      id: newUser._id,
      status: newUser.status
    });

  } catch (error) {
    return APIResponse(res, 500, false, error.message);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      return APIResponse(res, 404, false, 'User not found');
    }

    // Check approval status
    if (user.status !== 'Active') {
      return APIResponse(res, 403, false, 'Account pending admin approval');
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return APIResponse(res, 401, false, 'Invalid credentials');
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return APIResponse(res, 200, true, 'Login successful', {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        branch: user.branch,
        year: user.year,
        cgpa: user.cgpa,
        scholarNo: user.scholarNo,
        phone: user.phone,
        isApproved: user.status === 'Active'
      }
    });

  } catch (error) {
    return APIResponse(res, 500, false, error.message);
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, email, branch, year, cgpa, scholarNo, phone } = req.body;
    const userId = req.user.id;

    // Check if email is being changed and if it already exists
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return APIResponse(res, 400, false, 'Email already exists');
      }
    }

    // Check if scholar number is being changed and if it already exists
    if (scholarNo) {
      const existingScholar = await User.findOne({ scholarNo, _id: { $ne: userId } });
      if (existingScholar) {
        return APIResponse(res, 400, false, 'Scholar number already exists');
      }
    }

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        name,
        email,
        branch,
        year,
        cgpa,
        scholarNo,
        phone
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return APIResponse(res, 404, false, 'User not found');
    }

    return APIResponse(res, 200, true, 'Profile updated successfully', {
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      branch: updatedUser.branch,
      year: updatedUser.year,
      cgpa: updatedUser.cgpa,
      scholarNo: updatedUser.scholarNo,
      phone: updatedUser.phone,
      isApproved: updatedUser.status === 'Active'
    });

  } catch (error) {
    return APIResponse(res, 500, false, error.message);
  }
};

export const getMe = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId);
    if (!user) {
      return APIResponse(res, 404, false, 'User not found');
    }

    return APIResponse(res, 200, true, 'User data retrieved successfully', {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      branch: user.branch,
      year: user.year,
      cgpa: user.cgpa,
      scholarNo: user.scholarNo,
      phone: user.phone,
      isApproved: user.status === 'Active'
    });

  } catch (error) {
    return APIResponse(res, 500, false, error.message);
  }
};

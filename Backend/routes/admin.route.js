import express from 'express';
import { 
  getPendingStudents, 
  approveStudent, 
  rejectStudent, 
  getAllStudents,
  getDashboardStats
} from '../controllers/admin.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

// Student management
router.get('/pending-students', getPendingStudents);
router.get('/students', getAllStudents);
router.post('/approve-student/:id', approveStudent);
router.post('/reject-student/:id', rejectStudent);

// Dashboard
router.get('/dashboard-stats', getDashboardStats);

export default router; 
import express from 'express';
import { 
  updateTask, 
  deleteTask,
  markTaskCompleted
} from '../controllers/task.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Admin-only routes
router.put('/:id', authenticate, authorize('admin'), updateTask);
router.delete('/:id', authenticate, authorize('admin'), deleteTask);

// Student route to mark task as completed
router.patch('/:id/complete', authenticate, authorize('student'), markTaskCompleted);

export default router; 
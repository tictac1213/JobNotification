import express from 'express';
import { 
  createCompany, 
  getCompanies, 
  getCompanyById, 
  updateCompany, 
  deleteCompany,
  addTaskToCompany,
  getCompanyTasks
} from '../controllers/company.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes (for authenticated users)
router.get('/', authenticate, getCompanies);
router.get('/:id', authenticate, getCompanyById);
router.get('/:id/tasks', authenticate, getCompanyTasks);

// Admin-only routes
router.post('/', authenticate, authorize('admin'), createCompany);
router.put('/:id', authenticate, authorize('admin'), updateCompany);
router.delete('/:id', authenticate, authorize('admin'), deleteCompany);
router.post('/:id/tasks', authenticate, authorize('admin'), addTaskToCompany);

export default router; 
import express from 'express';
import { 
  createAnnouncement, 
  getAnnouncements, 
  getAnnouncementById, 
  updateAnnouncement, 
  deleteAnnouncement
} from '../controllers/announcement.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes (for authenticated users)
router.get('/', authenticate, getAnnouncements);
router.get('/:id', authenticate, getAnnouncementById);

// Admin-only routes
router.post('/', authenticate, authorize('admin'), createAnnouncement);
router.put('/:id', authenticate, authorize('admin'), updateAnnouncement);
router.delete('/:id', authenticate, authorize('admin'), deleteAnnouncement);

export default router; 
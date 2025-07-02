import express from 'express';
import { createCourse, getCourses, getCourseById } from '../controllers/course.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public: list courses (for signup page)
router.get('/', getCourses);

// Admin-only: manage courses
router.post('/', authenticate, authorize('admin'), createCourse);

// Authenticated: view specific course
router.get('/:id', authenticate, getCourseById);

export default router;
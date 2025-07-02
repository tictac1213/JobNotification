import express from 'express';
import { signup, login, updateProfile, getMe } from '../controllers/auth.controller.js';
import { 
  validateSignup, 
  validateLogin, 
  handleValidationErrors 
} from '../validators/auth.validator.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/signup', validateSignup, handleValidationErrors, signup);
router.post('/login', validateLogin, handleValidationErrors, login);
router.put('/profile', authenticate, updateProfile);
router.get('/me', authenticate, getMe);

export default router;

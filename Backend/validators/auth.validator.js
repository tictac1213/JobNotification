import { body, validationResult } from 'express-validator';

export const validateSignup = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 3 })
    .withMessage('Name must be at least 3 characters'),
  
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email address'),
  
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  
  body('branch')
    .trim()
    .notEmpty()
    .withMessage('Branch is required')
    .isIn(['CSE', 'ECE', 'ME', 'EE', 'CE', 'MDS', 'MCA', 'Other'])
    .withMessage('Invalid branch'),
  
  body('year')
    .isInt({ min: 1, max: 4 })
    .withMessage('Year must be between 1 and 4'),
  
  body('cgpa')
    .isFloat({ min: 0, max: 10 })
    .withMessage('CGPA must be between 0 and 10'),

  body('course')
    .notEmpty()
    .withMessage('Course is required')
    .isMongoId()
    .withMessage('Invalid course ID'),

  body('scholarNo')
    .trim()
    .notEmpty()
    .withMessage('Scholar number is required')
    .isLength({ min: 5 })
    .withMessage('Scholar number must be at least 5 characters')
];

export const validateLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email address'),
  
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required')
];

// Helper function to handle validation results
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

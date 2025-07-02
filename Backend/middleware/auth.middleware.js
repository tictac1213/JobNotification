import jwt from 'jsonwebtoken';
import { APIResponse } from '../utils/response.js';

export const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return APIResponse(res, 401, false, 'Authentication required');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return APIResponse(res, 401, false, 'Invalid or expired token');
  }
};

export const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return APIResponse(res, 403, false, 'Unauthorized access');
  }
  next();
};

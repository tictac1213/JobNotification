import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import reminderScheduler from './utils/reminderScheduler.js';

import authRoutes from './routes/auth.route.js';
import companyRoutes from './routes/company.route.js';
import courseRoutes from './routes/course.route.js';
import announcementRoutes from './routes/announcement.route.js';
import adminRoutes from './routes/admin.route.js';
import taskRoutes from './routes/task.route.js';

dotenv.config();
const app = express();
connectDB();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tasks', taskRoutes);

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log('=== NEW BACKEND DEPLOYED ===');
  // Start the reminder scheduler
  reminderScheduler.start();
  console.log('Email reminder scheduler started');
});
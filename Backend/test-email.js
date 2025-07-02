import dotenv from 'dotenv';
import connectDB from './config/db.js';
import emailService, { isFirst100 } from './utils/emailService.js';
import User from './models/user.model.js';

dotenv.config();

// Test the email system for first 100 registered students
async function testEmailSystem() {
  try {
    console.log('Testing Email System for First 100 Registered Students...\n');
    await connectDB();
    console.log('Database connected');

    // Fetch all students, sorted by registration date
    const students = await User.find({ role: { $in: ['student', 'admin'] } }).sort({ createdAt: 1 }).limit(100);
    if (students.length === 0) {
      console.log('No students found.');
      return;
    }

    // Send a test email to each of the first 100 students
    for (const student of students) {
      const result = await emailService.sendNewTaskNotification(
        student,
        students,
        'Test Task',
        'This is a test task email to check Mailjet integration.',
        new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        'Test Company'
      );
      console.log(`Email to ${student.email}: ${result ? 'SENT' : 'SKIPPED/FAILED'}`);
    }

    console.log('\nAll test emails processed!');
  } catch (error) {
    console.error(' Error testing email system:', error);
  } finally {
    process.exit(0);
  }
}

testEmailSystem(); 
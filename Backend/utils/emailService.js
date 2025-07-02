// Email Service for Task Reminders
// Note: Install nodemailer with: npm install nodemailer

import nodemailer from 'nodemailer';

const mailjetTransport = nodemailer.createTransport({
  host: 'in-v3.mailjet.com',
  port: 587,
  auth: {
    user: process.env.MAILJET_API_KEY,
    pass: process.env.MAILJET_SECRET_KEY
  }
});

// Helper to check if a student is in the first 100 registered
export function isFirst100(student, students) {
  const sorted = [...students].filter(u => u && u._id && u.createdAt)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  if (!student || !student._id) {
    console.warn('isFirst100: student or student._id is missing', student);
    return false;
  }
  return sorted
    .slice(0, 100)
    .some(s => s._id && s._id.toString() === student._id.toString());
}

class EmailService {
  // Only send email if student is in first 100
  async sendEmailToStudent(student, students, subject, html) {
    if (!isFirst100(student, students)) return false;
    return this.sendViaMailjet(student.email, subject, html);
  }

  async sendViaMailjet(to, subject, html) {
    try {
      await mailjetTransport.sendMail({
        from: process.env.MAILJET_FROM,
        to,
        subject,
        html
      });
      return true;
    } catch (error) {
      // Optionally log error
      return false;
    }
  }

  // Example: send new task notification
  async sendNewTaskNotification(student, students, taskTitle, taskDescription, deadline, companyName) {
    const subject = `New Task Available: ${taskTitle}`;
    const html = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">🎯 New Task Available!</h2>
      <p>Hello <strong>${student.name}</strong>,</p>
      <p>A new task has been added for <strong>${companyName}</strong> that matches your eligibility criteria.</p>
      <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #1e40af; margin-top: 0;">Task Details:</h3>
        <p><strong>Title:</strong> ${taskTitle}</p>
        <p><strong>Description:</strong> ${taskDescription}</p>
        <p><strong>Deadline:</strong> ${new Date(deadline).toLocaleDateString()} at ${new Date(deadline).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
        <p><strong>Company:</strong> ${companyName}</p>
      </div>
      <p>Please log in to your dashboard to view the complete task details and submit your work before the deadline.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/student" 
           style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          View Task
        </a>
      </div>
      <p style="color: #64748b; font-size: 14px;">
        Best regards,<br>
        College Job Notification Platform
      </p>
    </div>`;
    return this.sendEmailToStudent(student, students, subject, html);
  }

  // Send task reminder
  async sendTaskReminder(to, studentName, taskTitle, deadline, companyName, reminderType) {
    const timeText = reminderType === 'oneDay' ? '1 day' : '6 hours';
    const urgencyColor = reminderType === 'sixHour' ? '#dc2626' : '#ea580c';
    const urgencyText = reminderType === 'sixHour' ? 'URGENT' : 'Reminder';
    
    const subject = `${urgencyText}: Task Deadline Approaching - ${taskTitle}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${urgencyColor};">⏰ Task Deadline Reminder</h2>
        <p>Hello <strong>${studentName}</strong>,</p>
        <p>This is a reminder that you have <strong>${timeText}</strong> remaining to submit your task for <strong>${companyName}</strong>.</p>
        
        <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${urgencyColor};">
          <h3 style="color: ${urgencyColor}; margin-top: 0;">Task Details:</h3>
          <p><strong>Title:</strong> ${taskTitle}</p>
          <p><strong>Deadline:</strong> ${new Date(deadline).toLocaleDateString()} at ${new Date(deadline).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
          <p><strong>Company:</strong> ${companyName}</p>
          <p><strong>Time Remaining:</strong> ${timeText}</p>
        </div>
        
        ${reminderType === 'sixHour' ? `
        <div style="background-color: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 0; color: #92400e;"><strong>⚠️ Final Reminder:</strong> This is your last chance to submit before the deadline!</p>
        </div>
        ` : ''}
        
        <p>Please log in to your dashboard immediately to submit your work.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/student" 
             style="background-color: ${urgencyColor}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Submit Task Now
          </a>
        </div>
        
        <p style="color: #64748b; font-size: 14px;">
          Best regards,<br>
          College Job Notification Platform
        </p>
      </div>
    `;

    return this.sendViaMailjet(to, subject, html);
  }

  // Send new company notification
  async sendNewCompanyNotification(email, name, companyName, role, compensation) {
    const subject = `New Job Opportunity: ${companyName}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #28a745;"> New Job Opportunity!</h2>
        <p>Hello <strong>${name}</strong>,</p>
        <p>A new job opportunity has been posted that matches your profile:</p>
        
        <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1e40af; margin-top: 0;">Company Details:</h3>
          <p><strong>Company:</strong> ${companyName}</p>
          <p><strong>Role:</strong> ${role}</p>
          <p><strong>Compensation:</strong> ${compensation}</p>
        </div>
        
        <p>Log in to your dashboard to view the complete details and apply!</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/student" 
             style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View Opportunity
          </a>
        </div>
        
        <p style="color: #64748b; font-size: 14px;">
          Best regards,<br>
          College Job Notification Platform
        </p>
      </div>
    `;

    return this.sendViaMailjet(email, subject, html);
  }

  // Send account approval notification
  async sendApprovalNotification(to, studentName) {
    const subject = 'Account Approved - Welcome to Job Notifications!';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #28a745;">✅ Account Approved!</h2>
        <p>Hello <strong>${studentName}</strong>,</p>
        <p>Great news! Your account has been approved by the admin.</p>
        
        <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #166534; margin-top: 0;">You can now access:</h3>
          <ul style="color: #166534; margin: 10px 0;">
            <li>View available job opportunities</li>
            <li>Track application deadlines</li>
            <li>Receive task reminders</li>
            <li>Update your profile</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" 
             style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Login Now
          </a>
        </div>
        
        <p style="color: #64748b; font-size: 14px;">
          Best regards,<br>
          College Job Notification Platform
        </p>
      </div>
    `;

    return this.sendEmailToStudent(student, students, subject, html);
  }

  async sendCompanyUpdateNotification(email, name, companyName, role, compensation) {
    const subject = `Update: ${companyName} Job Opportunity Details Changed`;
    const html = `
      <div>
        <p>Hello <strong>${name}</strong>,</p>
        <p>The details for <strong>${companyName}</strong> have been updated. Please review the latest information and eligibility.</p>
        <!-- Add more details as needed -->
      </div>
    `;
    return this.sendViaMailjet(email, subject, html);
  }
}

export default new EmailService(); 
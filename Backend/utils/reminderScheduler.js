import Task from '../models/task.model.js';
import Company from '../models/company.model.js';
import User from '../models/user.model.js';
import emailService from './emailService.js';
import { isFirst100 } from './emailService.js';

class ReminderScheduler {
  constructor() {
    this.isRunning = false;
  }

  // Start the reminder scheduler
  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('Reminder scheduler started');
    
    // Check for reminders every 30 minutes
    setInterval(() => {
      this.checkTaskReminders();
    }, 30 * 60 * 1000); // 30 minutes
    
    // Also check immediately on startup
    this.checkTaskReminders();
  }

  // Stop the reminder scheduler
  stop() {
    this.isRunning = false;
    console.log('Reminder scheduler stopped');
  }

  // Check for tasks that need reminders
  async checkTaskReminders() {
    try {
      const now = new Date();
      
      // 1 day before deadline (24 hours)
      const oneDayFromNow = new Date(now.getTime() + (24 * 60 * 60 * 1000));
      
      // 6 hours before deadline
      const sixHoursFromNow = new Date(now.getTime() + (6 * 60 * 60 * 1000));

      // Find tasks with deadlines in the next 24 hours that need 1-day reminders
      const tasksNeedingOneDayReminder = await Task.find({
        deadline: {
          $gte: now,
          $lte: oneDayFromNow
        },
        oneDayReminderSent: { $ne: true }
      }).populate('companyId');

      // Find tasks with deadlines in the next 6 hours that need 6-hour reminders
      const tasksNeedingSixHourReminder = await Task.find({
        deadline: {
          $gte: now,
          $lte: sixHoursFromNow
        },
        sixHourReminderSent: { $ne: true }
      }).populate('companyId');

      console.log(`Found ${tasksNeedingOneDayReminder.length} tasks needing 1-day reminders`);
      console.log(`Found ${tasksNeedingSixHourReminder.length} tasks needing 6-hour reminders`);

      // Send 1-day reminders
      for (const task of tasksNeedingOneDayReminder) {
        await this.sendTaskReminder(task, 'oneDay');
      }

      // Send 6-hour reminders
      for (const task of tasksNeedingSixHourReminder) {
        await this.sendTaskReminder(task, 'sixHour');
      }
    } catch (error) {
      console.error('Error checking task reminders:', error);
    }
  }

  // Send reminder for a specific task
  async sendTaskReminder(task, reminderType) {
    try {
      const company = task.companyId;
      if (!company) return;

      console.log('Eligibility:', {
        branches: company.eligibility.branches,
        years: company.eligibility.years,
        minCgpa: company.eligibility.minCgpa
      });
      const eligibilityQuery = {
        status: 'Active',
        role: { $in: ['student', 'admin'] },
        branch: { $in: company.eligibility.branches },
        cgpa: { $gte: Number(company.eligibility.minCgpa) || 0 }
      };
      if (company.eligibility.years && company.eligibility.years.length > 0) {
        eligibilityQuery.year = { $in: company.eligibility.years.map(Number) };
      }
      const eligibleUsers = await User.find(eligibilityQuery);

      const timeText = reminderType === 'oneDay' ? '1 day' : '6 hours';
      console.log(`Sending ${timeText} reminders to ${eligibleUsers.length} eligible users for task: ${task.title}`);

      // Send reminders to eligible users who haven't opted out 
      for (const user of eligibleUsers) {
        // Check if user has opted out of task reminders
        if (user.emailPreferences?.taskReminders !== false) {
          if (isFirst100(user, eligibleUsers)) {
            const istDate = new Date(task.deadline).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });
            const istTime = new Date(task.deadline).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });

            const html = `
              <p><strong>Deadline:</strong> ${istDate} at ${istTime} (IST)</p>
            `;

            await emailService.sendTaskReminder(
              user.email,
              user.name,
              task.title,
              html,
              company.name,
              reminderType
            );
          } else {
            console.log(`Skipping reminder for ${user.email} - task reminders disabled`);
          }
        } else {
          console.log(`Skipping reminder for ${user.email} - task reminders disabled`);
        }
      }

      // Mark reminder as sent
      if (reminderType === 'oneDay') {
        task.oneDayReminderSent = true;
      } else {
        task.sixHourReminderSent = true;
      }
      await task.save();

      console.log(`${timeText} reminder sent for task: ${task.title}`);
    } catch (error) {
      console.error('Error sending task reminder:', error);
    }
  }

  // Send notifications for new company
  async sendNewCompanyNotifications(company) {
    try {
      // Find eligible users (students and admins) for this company
      const eligibleUsers = await User.find({
        status: 'Active',
        role: { $in: ['student', 'admin'] },
        branch: { $in: company.eligibility.branches },
        year: { $in: company.eligibility.years },
        cgpa: { $gte: Number(company.eligibility.minCgpa) || 0 }
      });

      console.log(`Sending new company notifications to ${eligibleUsers.length} eligible users (students and admins)`);

      // Send notifications to eligible users who haven't opted out
      for (const user of eligibleUsers) {
        // Check if user has opted out of new company notifications
        if (user.emailPreferences?.newCompanyNotifications !== false) {
          if (isFirst100(user, eligibleUsers)) {
            await emailService.sendNewCompanyNotification(
              user.email,
              user.name,
              company.name,
              company.role,
              company.compensation
            );
          } else {
            console.log(`Skipping new company notification for ${user.email} - notifications disabled`);
          }
        } else {
          console.log(`Skipping new company notification for ${user.email} - notifications disabled`);
        }
      }

      console.log(`New company notifications sent for: ${company.name}`);
    } catch (error) {
      console.error('Error sending new company notifications:', error);
    }
  }

  // Send notifications for new task
  async sendNewTaskNotifications(task) {
    try {
      const company = await Company.findById(task.companyId);
      if (!company) return;

      console.log('Eligibility:', {
        branches: company.eligibility.branches,
        years: company.eligibility.years,
        minCgpa: company.eligibility.minCgpa
      });
      const eligibleUsers = await User.find({
        status: 'Active',
        role: { $in: ['student', 'admin'] },
        branch: { $in: company.eligibility.branches },
        year: { $in: company.eligibility.years },
        cgpa: { $gte: Number(company.eligibility.minCgpa) || 0 }
      });

      console.log(`Sending new task notifications to ${eligibleUsers.length} eligible users`);

      // Send notifications to eligible users who haven't opted out
      for (const user of eligibleUsers) {
        // Check if user has opted out of task reminders
        if (user.emailPreferences?.taskReminders !== false) {
          if (isFirst100(user, eligibleUsers)) {
            // Format deadline in IST
            const istDeadline = `${new Date(task.deadline).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })} at ${new Date(task.deadline).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })} (IST)`;
            await emailService.sendNewTaskNotification(
              user.email,
              user.name,
              task.title,
              task.description,
              istDeadline,
              company.name
            );
          } else {
            console.log(`Skipping new task notification for ${user.email} - task reminders disabled`);
          }
        } else {
          console.log(`Skipping new task notification for ${user.email} - task reminders disabled`);
        }
      }

      console.log(`New task notifications sent for: ${task.title}`);
    } catch (error) {
      console.error('Error sending new task notifications:', error);
    }
  }

  // Send approval notification
  async sendApprovalNotification(student) {
    try {
      // Check if student has opted out of approval notifications
      if (student.emailPreferences?.approvalNotifications !== false) {
        if (isFirst100(student, [student])) {
          await emailService.sendApprovalNotification(student.email, student.name);
          console.log(`Approval notification sent to: ${student.email}`);
        } else {
          console.log(`Skipping approval notification for ${student.email} - approval notifications disabled`);
        }
      } else {
        console.log(`Skipping approval notification for ${student.email} - approval notifications disabled`);
      }
    } catch (error) {
      console.error('Error sending approval notification:', error);
    }
  }

  // Manual trigger for testing
  async triggerReminders() {
    console.log('Manually triggering reminder check...');
    await this.checkTaskReminders();
  }

  async sendCompanyUpdateNotifications(company) {
    try {
      const eligibleUsers = await User.find({
        status: 'Active',
        role: { $in: ['student', 'admin'] },
        branch: { $in: company.eligibility.branches },
        year: { $in: company.eligibility.years },
        cgpa: { $gte: Number(company.eligibility.minCgpa) || 0 }
      });

      for (const user of eligibleUsers) {
        if (user.emailPreferences?.newCompanyNotifications !== false) {
          if (isFirst100(user, eligibleUsers)) {
            await emailService.sendCompanyUpdateNotification(
              user.email,
              user.name,
              company.name,
              company.role,
              company.compensation
            );
          }
        }
      }
      console.log(`Company update notifications sent for: ${company.name}`);
    } catch (error) {
      console.error('Error sending company update notifications:', error);
    }
  }
}

export default new ReminderScheduler(); 
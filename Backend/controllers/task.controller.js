import Task from '../models/task.model.js';
import Company from '../models/company.model.js';
import { APIResponse } from '../utils/response.js';
import reminderScheduler from '../utils/reminderScheduler.js';

// Update task (Admin only)
export const updateTask = async (req, res) => {
  try {
    const { title, description, deadline, pptLink, formLink } = req.body;
    
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        deadline: new Date(deadline),
        pptLink,
        formLink
      },
      { new: true, runValidators: true }
    );

    if (!task) {
      return APIResponse(res, 404, false, 'Task not found');
    }

    return APIResponse(res, 200, true, 'Task updated successfully', task);
  } catch (error) {
    return APIResponse(res, 400, false, error.message);
  }
};

// Delete task (Admin only)
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return APIResponse(res, 404, false, 'Task not found');
    }

    // Remove task from company
    await Company.findByIdAndUpdate(
      task.companyId,
      { $pull: { tasks: task._id } }
    );

    // Delete the task
    await Task.findByIdAndDelete(req.params.id);

    return APIResponse(res, 200, true, 'Task deleted successfully');
  } catch (error) {
    return APIResponse(res, 500, false, error.message);
  }
};

// Create a new task
export const createTask = async (req, res) => {
  try {
    const { title, description, companyId, deadline, pptLink, formLink } = req.body;

    // Validate required fields
    if (!title || !description || !companyId || !deadline) {
      return APIResponse(res, 400, false, 'Missing required fields');
    }

    // Check if company exists
    const company = await Company.findById(companyId);
    if (!company) {
      return APIResponse(res, 404, false, 'Company not found');
    }

    // Create the task
    const task = new Task({
      title,
      description,
      companyId,
      deadline: new Date(deadline),
      pptLink: pptLink || '',
      formLink: formLink || ''
    });

    await task.save();

    // Send notifications to eligible students
    try {
      await reminderScheduler.sendNewTaskNotifications(task);
    } catch (emailError) {
      console.error('Error sending task notifications:', emailError);
      // Don't fail the request if email fails
    }

    return APIResponse(res, 201, true, 'Task created successfully', task);
  } catch (error) {
    console.error('Error creating task:', error);
    return APIResponse(res, 500, false, 'Internal server error');
  }
};

// Mark task as completed (Students and Admins)
export const markTaskCompleted = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return APIResponse(res, 404, false, 'Task not found');
    }

    // Check if task is already completed
    if (task.status === 'Completed') {
      return APIResponse(res, 400, false, 'Task is already completed');
    }

    // Update task status to completed
    task.status = 'Completed';
    await task.save();

    return APIResponse(res, 200, true, 'Task marked as completed', task);
  } catch (error) {
    return APIResponse(res, 500, false, error.message);
  }
}; 
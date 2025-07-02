import Company from '../models/company.model.js';
import Task from '../models/task.model.js';
import { APIResponse } from '../utils/response.js';
import reminderScheduler from '../utils/reminderScheduler.js';

// Create new company (Admin only)
export const createCompany = async (req, res) => {
  try {
    const company = new Company(req.body);
    await company.save();
    
    // Send notifications to eligible students
    await reminderScheduler.sendNewCompanyNotifications(company);
    
    return APIResponse(res, 201, true, 'Company created successfully', company);
  } catch (error) {
    return APIResponse(res, 400, false, error.message);
  }
};

// Get all companies with filters
export const getCompanies = async (req, res) => {
  try {
    const { branch, year, status, course } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (course) filter['eligibility.course'] = course;
    if (branch) filter['eligibility.branches'] = branch;
    if (year) filter['eligibility.years'] = parseInt(year);

    const companies = await Company.find(filter)
      .populate('eligibility.course', 'name')
      .populate('tasks', 'title deadline status');

    return APIResponse(res, 200, true, 'Companies fetched successfully', companies);
  } catch (error) {
    return APIResponse(res, 500, false, error.message);
  }
};

// Get company by ID with tasks
export const getCompanyById = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id)
      .populate('eligibility.course', 'name')
      .populate('tasks', 'title description deadline status');

    if (!company) {
      return APIResponse(res, 404, false, 'Company not found');
    }

    return APIResponse(res, 200, true, 'Company fetched successfully', company);
  } catch (error) {
    return APIResponse(res, 500, false, error.message);
  }
};

// Update company (Admin only)
export const updateCompany = async (req, res) => {
  try {
    // Fetch the old company for comparison
    const oldCompany = await Company.findById(req.params.id);
    if (!oldCompany) {
      return APIResponse(res, 404, false, 'Company not found');
    }

    // Prepare the update
    const company = await Company.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!company) {
      return APIResponse(res, 404, false, 'Company not found');
    }

    // Helper function to deep compare eligibility and jobDescriptionDocs
    function deepEqual(a, b) {
      return JSON.stringify(a) === JSON.stringify(b);
    }

    // Check if any relevant fields have changed
    const changed =
      oldCompany.name !== company.name ||
      oldCompany.role !== company.role ||
      oldCompany.description !== company.description ||
      oldCompany.status !== company.status ||
      oldCompany.compensation !== company.compensation ||
      !deepEqual(oldCompany.eligibility, company.eligibility) ||
      !deepEqual(oldCompany.jobDescriptionDocs, company.jobDescriptionDocs);

    // Only send notifications if something changed
    if (changed) {
      try {
        await reminderScheduler.sendCompanyUpdateNotifications(company);
      } catch (emailError) {
        console.error('Error sending company update notifications:', emailError);
        // Don't fail the request if email fails
      }
    }

    return APIResponse(res, 200, true, 'Company updated successfully', company);
  } catch (error) {
    return APIResponse(res, 400, false, error.message);
  }
};

// Delete company (Admin only)
export const deleteCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);
    
    if (!company) {
      return APIResponse(res, 404, false, 'Company not found');
    }

    // Delete associated tasks
    await Task.deleteMany({ companyId: req.params.id });

    return APIResponse(res, 200, true, 'Company deleted successfully');
  } catch (error) {
    return APIResponse(res, 500, false, error.message);
  }
};

// Add task to company (Admin only)
export const addTaskToCompany = async (req, res) => {
  try {
    const { title, description, deadline, pptLink, formLink } = req.body;
    const companyId = req.params.id;

    // Check if company exists
    const company = await Company.findById(companyId);
    if (!company) {
      return APIResponse(res, 404, false, 'Company not found');
    }

    // Create task
    const task = new Task({
      companyId,
      title,
      description,
      deadline: new Date(deadline),
      pptLink: pptLink || '',
      formLink: formLink || ''
    });

    await task.save();

    // Add task to company
    company.tasks.push(task._id);
    await company.save();

    // Send notifications to eligible students
    try {
      await reminderScheduler.sendNewTaskNotifications(task);
    } catch (emailError) {
      console.error('Error sending task notifications:', emailError);
      // Don't fail the request if email fails
    }

    return APIResponse(res, 201, true, 'Task added successfully', task);
  } catch (error) {
    return APIResponse(res, 400, false, error.message);
  }
};

// Get tasks for a company
export const getCompanyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ companyId: req.params.id })
      .sort({ deadline: 1 });

    return APIResponse(res, 200, true, 'Tasks fetched successfully', tasks);
  } catch (error) {
    return APIResponse(res, 500, false, error.message);
  }
}; 
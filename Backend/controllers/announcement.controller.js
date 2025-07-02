import Announcement from '../models/announcement.model.js';
import { APIResponse } from '../utils/response.js';

// Create new announcement (Admin only)
export const createAnnouncement = async (req, res) => {
  try {
    const announcement = new Announcement(req.body);
    await announcement.save();
    return APIResponse(res, 201, true, 'Announcement created successfully', announcement);
  } catch (error) {
    return APIResponse(res, 400, false, error.message);
  }
};

// Get all announcements with filters
export const getAnnouncements = async (req, res) => {
  try {
    const { branch, year, course } = req.query;
    const filter = {};

    if (course) filter.course = course;
    if (branch) filter.branches = branch;
    if (year) filter.years = parseInt(year);

    const announcements = await Announcement.find(filter)
      .populate('course', 'name')
      .sort({ createdAt: -1 });

    return APIResponse(res, 200, true, 'Announcements fetched successfully', announcements);
  } catch (error) {
    return APIResponse(res, 500, false, error.message);
  }
};

// Get announcement by ID
export const getAnnouncementById = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id)
      .populate('course', 'name');

    if (!announcement) {
      return APIResponse(res, 404, false, 'Announcement not found');
    }

    return APIResponse(res, 200, true, 'Announcement fetched successfully', announcement);
  } catch (error) {
    return APIResponse(res, 500, false, error.message);
  }
};

// Update announcement (Admin only)
export const updateAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!announcement) {
      return APIResponse(res, 404, false, 'Announcement not found');
    }

    return APIResponse(res, 200, true, 'Announcement updated successfully', announcement);
  } catch (error) {
    return APIResponse(res, 400, false, error.message);
  }
};

// Delete announcement (Admin only)
export const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    
    if (!announcement) {
      return APIResponse(res, 404, false, 'Announcement not found');
    }

    return APIResponse(res, 200, true, 'Announcement deleted successfully');
  } catch (error) {
    return APIResponse(res, 500, false, error.message);
  }
}; 
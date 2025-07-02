import React, { useState, useEffect } from 'react';
import { Bell, Plus, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const Announcements = () => {
  const { user, isAdmin } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/announcements');
      setAnnouncements(response.data.data);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      setError('Failed to load announcements');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAnnouncement = () => {
    setFormData({ title: '', description: '' });
    setShowAnnouncementForm(true);
  };

  const handleSubmitAnnouncement = async (e) => {
    e.preventDefault();
    try {
      await api.post('/announcements', formData);
      setShowAnnouncementForm(false);
      setFormData({ title: '', description: '' });
      fetchAnnouncements();
    } catch (error) {
      console.error('Error creating announcement:', error);
      alert('Failed to create announcement');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-4 sm:p-6 text-white">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Announcements</h1>
            <p className="text-primary-100 text-sm sm:text-base">Stay updated with the latest news and updates</p>
          </div>
          {isAdmin && (
            <button
              onClick={handleAddAnnouncement}
              className="px-4 py-2 bg-white text-primary-600 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2 mt-2 sm:mt-0"
            >
              <Plus className="h-4 w-4" />
              Add Announcement
            </button>
          )}
        </div>
      </div>

      {/* Announcements List */}
      <div className="card p-3 sm:p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Announcements</h3>
        <div className="space-y-4">
          {announcements.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No announcements</h3>
              <p className="mt-1 text-sm text-gray-500">Check back later for updates.</p>
            </div>
          ) : (
            announcements.map((announcement) => (
              <div key={announcement._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-2">{announcement.title}</h4>
                    <p className="text-sm text-gray-600 mb-3">{announcement.description}</p>
                    <div className="flex items-center text-xs text-gray-500">
                      <Bell className="h-3 w-3 mr-1" />
                      <span>Posted on {new Date(announcement.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center">
            <Bell className="h-5 w-5 text-blue-600 mr-2" />
            <span className="text-sm font-medium text-blue-800">Total Announcements</span>
          </div>
          <p className="text-2xl font-bold text-blue-900 mt-1">{announcements.length}</p>
          <p className="text-xs text-blue-700 mt-1">All time</p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center">
            <Bell className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-sm font-medium text-green-800">This Month</span>
          </div>
          <p className="text-2xl font-bold text-green-900 mt-1">
            {announcements.filter(a => {
              const announcementDate = new Date(a.createdAt);
              const now = new Date();
              return announcementDate.getMonth() === now.getMonth() && 
                     announcementDate.getFullYear() === now.getFullYear();
            }).length}
          </p>
          <p className="text-xs text-green-700 mt-1">New announcements</p>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center">
            <Bell className="h-5 w-5 text-purple-600 mr-2" />
            <span className="text-sm font-medium text-purple-800">Latest Update</span>
          </div>
          <p className="text-sm font-bold text-purple-900 mt-1">
            {announcements.length > 0 
              ? new Date(announcements[0].createdAt).toLocaleDateString()
              : 'No updates'
            }
          </p>
          <p className="text-xs text-purple-700 mt-1">Most recent</p>
        </div>
      </div>

      {/* Add Announcement Modal */}
      {showAnnouncementForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Add New Announcement</h3>
              <button
                onClick={() => setShowAnnouncementForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmitAnnouncement} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  description
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAnnouncementForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Create Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Announcements; 
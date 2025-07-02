import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Bell, 
  Calendar, 
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Modal from '../components/shared/Modal';
import CompanyForm from '../components/admin/CompanyForm';
import CompanyDetails from '../components/student/CompanyDetails';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
  const { user, isAdmin } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [showCompanyDetails, setShowCompanyDetails] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [editingCompany, setEditingCompany] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [companiesRes, announcementsRes] = await Promise.all([
        api.get('/companies'),
        api.get('/announcements')
      ]);
      setCompanies(companiesRes.data.data);
      setAnnouncements(announcementsRes.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewCompany = (company) => {
    setSelectedCompany(company);
    setShowCompanyDetails(true);
  };

  // Admin-specific handlers
  const handleAddCompany = () => {
    setEditingCompany(null);
    setShowCompanyForm(true);
  };

  const handleCompanySaved = () => {
    setShowCompanyForm(false);
    setEditingCompany(null);
    fetchData();
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
        <h1 className="text-xl sm:text-2xl font-bold">Home</h1>
        <p className="text-primary-100 text-sm sm:text-base">Welcome back, {user?.name}</p>
      </div>

      {/* Home Content */}
      <div className="space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Building2 className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-blue-800">Total Companies</span>
            </div>
            <p className="text-2xl font-bold text-blue-900 mt-1">{companies.length}</p>
            <p className="text-xs text-blue-700 mt-1">
              {isAdmin ? 'Available for students' : 'Available for you'}
            </p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-sm font-medium text-green-800">
                {isAdmin ? 'Active Companies' : 'Eligible Companies'}
              </span>
            </div>
            <p className="text-2xl font-bold text-green-900 mt-1">
              {isAdmin 
                ? companies.filter(c => c.status === 'Active').length
                : companies.filter(c => {
                    if (c.status !== 'Active') return false;
                    if (c.eligibility?.minCgpa && Number(user?.cgpa) < Number(c.eligibility.minCgpa)) return false;
                    if (c.eligibility?.branches && !c.eligibility.branches.includes(String(user?.branch))) return false;
                    if (c.eligibility?.years && !c.eligibility.years.map(String).includes(String(user?.year))) return false;
                    return true;
                  }).length
              }
            </p>
            <p className="text-xs text-green-700 mt-1">
              {isAdmin ? 'Currently accepting applications' : 'You can apply to'}
            </p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Bell className="h-5 w-5 text-purple-600 mr-2" />
              <span className="text-sm font-medium text-purple-800">Announcements</span>
            </div>
            <p className="text-2xl font-bold text-purple-900 mt-1">{announcements.length}</p>
            <p className="text-xs text-purple-700 mt-1">Recent updates</p>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-orange-600 mr-2" />
              <span className="text-sm font-medium text-orange-800">Total Tasks</span>
            </div>
            <p className="text-2xl font-bold text-orange-900 mt-1">
              {companies.reduce((total, company) => total + (company.tasks?.length || 0), 0)}
            </p>
            <p className="text-xs text-orange-700 mt-1">Across all companies</p>
          </div>
        </div>

        {/* Pending Tasks Section */}
        <div className="card p-3 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Pending Tasks</h3>
          <div className="space-y-3">
            {(() => {
              const allTasks = companies.reduce((tasks, company) => {
                if (company.tasks) {
                  const companyTasks = company.tasks.map(task => ({
                    ...task,
                    companyName: company.name,
                    companyId: company._id
                  }));
                  return [...tasks, ...companyTasks];
                }
                return tasks;
              }, []);

              const pendingTasks = allTasks.filter(task => 
                task.status !== 'Completed' && 
                new Date(task.deadline) > new Date()
              ).sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

              if (pendingTasks.length === 0) {
                return (
                  <div className="text-center py-6 text-gray-500">
                    <Calendar className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                    <p>No pending tasks</p>
                    <p className="text-sm mt-1">All caught up!</p>
                  </div>
                );
              }

              return pendingTasks.slice(0, 5).map((task) => (
                <div key={task._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900">{task.title}</h4>
                      <span className="text-xs text-gray-500">• {task.companyName}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>Deadline: {new Date(task.deadline).toLocaleDateString()} at {new Date(task.deadline).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/companies')}
                    className="px-3 py-1 text-xs bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
                  >
                    View Details
                  </button>
                </div>
              ));
            })()}
          </div>
        </div>

        {/* Upcoming Events Section */}
        <div className="card p-3 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Upcoming Events</h3>
          <div className="space-y-3">
            {(() => {
              const allTasks = companies.reduce((tasks, company) => {
                if (company.tasks) {
                  const companyTasks = company.tasks.map(task => ({
                    ...task,
                    companyName: company.name,
                    companyId: company._id
                  }));
                  return [...tasks, ...companyTasks];
                }
                return tasks;
              }, []);

              const upcomingEvents = allTasks
                .filter(task => new Date(task.deadline) > new Date())
                .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

              if (upcomingEvents.length === 0) {
                return (
                  <div className="text-center py-6 text-gray-500">
                    <Calendar className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                    <p>No upcoming events</p>
                    <p className="text-sm mt-1">Check back later for new opportunities</p>
                  </div>
                );
              }

              return upcomingEvents.slice(0, 3).map((task) => {
                const timeUntilDeadline = new Date(task.deadline) - new Date();
                const daysUntilDeadline = Math.floor(timeUntilDeadline / (1000 * 60 * 60 * 24));
                const hoursUntilDeadline = Math.floor((timeUntilDeadline % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

                let timeText = '';
                if (daysUntilDeadline > 0) {
                  timeText = `${daysUntilDeadline} day${daysUntilDeadline > 1 ? 's' : ''} left`;
                } else if (hoursUntilDeadline > 0) {
                  timeText = `${hoursUntilDeadline} hour${hoursUntilDeadline > 1 ? 's' : ''} left`;
                } else {
                  timeText = 'Less than 1 hour left';
                }

                return (
                  <div key={task._id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900">{task.title}</h4>
                        <span className="text-xs text-blue-600 font-medium">{timeText}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{task.companyName}</p>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>{new Date(task.deadline).toLocaleDateString()} at {new Date(task.deadline).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate('/companies')}
                      className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                );
              });
            })()}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card p-3 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center p-3 bg-blue-50 rounded-lg">
              <div className="p-2 bg-blue-100 rounded-full mr-3">
                <Building2 className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">New companies available</p>
                <p className="text-xs text-gray-600">
                  {isAdmin ? 'Students can check out the latest job opportunities' : 'Check out the latest job opportunities'}
                </p>
              </div>
              <span className="text-xs text-blue-600 font-medium">Just now</span>
            </div>
            
            <div className="flex items-center p-3 bg-green-50 rounded-lg">
              <div className="p-2 bg-green-100 rounded-full mr-3">
                <Bell className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Task reminders enabled</p>
                <p className="text-xs text-gray-600">
                  {isAdmin ? 'Students receive notifications for upcoming deadlines' : 'You\'ll receive notifications for upcoming deadlines'}
                </p>
              </div>
              <span className="text-xs text-green-600 font-medium">1 hour ago</span>
            </div>
            
            <div className="flex items-center p-3 bg-purple-50 rounded-lg">
              <div className="p-2 bg-purple-100 rounded-full mr-3">
                <Calendar className="h-4 w-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Profile updates</p>
                <p className="text-xs text-gray-600">
                  {isAdmin ? 'Students can update their information' : 'Your information has been updated'}
                </p>
              </div>
              <span className="text-xs text-purple-600 font-medium">2 hours ago</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showCompanyForm && (
        <Modal isOpen={showCompanyForm} onClose={() => setShowCompanyForm(false)}>
          <CompanyForm
            company={editingCompany}
            onSaved={handleCompanySaved}
            onCancel={() => setShowCompanyForm(false)}
          />
        </Modal>
      )}

      {showCompanyDetails && selectedCompany && (
        <Modal isOpen={showCompanyDetails} onClose={() => setShowCompanyDetails(false)}>
          <CompanyDetails
            company={selectedCompany}
            onClose={() => setShowCompanyDetails(false)}
          />
        </Modal>
      )}
    </div>
  );
};

export default StudentDashboard; 
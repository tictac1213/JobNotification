import { useState, useEffect } from 'react';
import { Building2, Calendar, Users, DollarSign, FileText, Clock, CheckCircle, AlertCircle, Link } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { isUserEligibleForCompany } from '../../utils/eligibility';

const CompanyDetails = ({ company, onClose }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (company?._id) {
      fetchCompanyTasks();
    }
  }, [company]);

  const fetchCompanyTasks = async () => {
    try {
      const response = await api.get(`/companies/${company._id}/tasks`);
      setTasks(response.data.data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getTaskStatusColor = (deadline) => {
    const now = new Date();
    const taskDeadline = new Date(deadline);
    const timeUntilDeadline = taskDeadline - now;
    const hoursUntilDeadline = timeUntilDeadline / (1000 * 60 * 60);
    
    if (timeUntilDeadline < 0) return 'text-red-600';
    if (hoursUntilDeadline <= 72) return 'text-yellow-600'; // 3 days = 72 hours
    return 'text-green-600';
  };

  const getTaskStatusIcon = (deadline) => {
    const now = new Date();
    const taskDeadline = new Date(deadline);
    const timeUntilDeadline = taskDeadline - now;
    const hoursUntilDeadline = timeUntilDeadline / (1000 * 60 * 60);
    
    if (timeUntilDeadline < 0) return <AlertCircle className="h-4 w-4 text-red-600" />;
    if (hoursUntilDeadline <= 72) return <Clock className="h-4 w-4 text-yellow-600" />; // 3 days = 72 hours
    return <CheckCircle className="h-4 w-4 text-green-600" />;
  };

  // Unified eligibility check using shared utility
  const isEligible = () => isUserEligibleForCompany(user, company);

  const formatTimeRemaining = (deadline) => {
    const now = new Date();
    const taskDeadline = new Date(deadline);
    const timeUntilDeadline = taskDeadline - now;
    
    if (timeUntilDeadline < 0) {
      return 'Ended';
    }
    
    const days = Math.floor(timeUntilDeadline / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeUntilDeadline % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeUntilDeadline % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
      return `${days}d ${hours}h remaining`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    } else {
      return `${minutes}m remaining`;
    }
  };

  const handleMarkCompleted = async (taskId) => {
    try {
      await api.patch(`/tasks/${taskId}/complete`);
      // Refresh tasks
      fetchCompanyTasks();
    } catch (error) {
      console.error('Error marking task as completed:', error);
      alert('Error marking task as completed');
    }
  };

  if (!company) return null;

  return (
    <div className="space-y-6">
      {/* Company Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
        <div className="flex items-center space-x-4">
          <div className="p-2 sm:p-3 bg-primary-100 rounded-lg">
            <Building2 className="h-7 w-7 sm:h-8 sm:w-8 text-primary-600" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{company.name}</h3>
            <p className="text-base sm:text-lg text-gray-600">{company.role}</p>
          </div>
        </div>
        <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(company.status)}`}>{company.status}</span>
      </div>

      {/* Company Description */}
      {company.description && (
        <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-2">About the Company & Role</h4>
          <p className="text-gray-700 whitespace-pre-wrap text-sm sm:text-base">{company.description}</p>
        </div>
      )}

      {/* Company Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-gray-600">Compensation</span>
          </div>
          <p className="text-lg font-semibold text-gray-900 mt-1">{company.compensation}</p>
        </div>
        <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-600">Eligible Branches</span>
          </div>
          <p className="text-sm text-gray-900 mt-1">{company.eligibility?.branches?.join(', ') || 'All branches'}</p>
        </div>
        <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <Calendar className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-gray-600">Eligible Years</span>
          </div>
          <p className="text-sm text-gray-900 mt-1">{company.eligibility?.years?.join(', ') || 'All years'}</p>
        </div>
      </div>

      {/* Eligibility Details */}
      <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">Eligibility Criteria</h4>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm">
          <div>
            <span className="font-medium text-blue-800">Minimum CGPA:</span>
            <span className="ml-2 text-blue-700">{company.eligibility?.minCgpa || 'Not specified'}</span>
          </div>
          <div>
            <span className="font-medium text-blue-800">Course:</span>
            <span className="ml-2 text-blue-700">{company.eligibility?.course?.name || 'All courses'}</span>
          </div>
        </div>
        
        {/* Eligibility Status */}
        <div className="mt-3 pt-3 border-t border-blue-200">
          <div className="flex items-center gap-2">
            {isEligible() ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-green-700 font-medium">You are eligible for this company</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span className="text-red-700 font-medium">
                  You are not eligible (Required CGPA: {company.eligibility.minCgpa}, Your CGPA: {user.cgpa})
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Documents */}
      {company.jobDescriptionDocs && company.jobDescriptionDocs.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Documents</h4>
          <div className="space-y-2">
            {company.jobDescriptionDocs.map((doc, index) => (
              <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-gray-50 rounded-lg gap-2 sm:gap-0">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-700">{doc.name}</span>
                </div>
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  Download
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tasks - Only show if eligible */}
      {isEligible() && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Tasks & Requirements</h4>
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : tasks.length > 0 ? (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div key={task._id} className="border border-gray-200 rounded-lg p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                    <div className="flex-1 w-full">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-1">
                        {getTaskStatusIcon(task.deadline)}
                        <h5 className="font-medium text-gray-900">{task.title}</h5>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                      
                      {/* Task Links */}
                      {(task.pptLink || task.formLink) && (
                        <div className="space-y-1 mb-2">
                          {task.pptLink && (
                            <div className="flex items-center text-sm">
                              <FileText className="h-4 w-4 text-blue-600 mr-1" />
                              <a 
                                href={task.pptLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 underline"
                              >
                                View PPT/Video
                              </a>
                            </div>
                          )}
                          {task.formLink && (
                            <div className="flex items-center text-sm">
                              <Link className="h-4 w-4 text-green-600 mr-1" />
                              <a 
                                href={task.formLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-green-600 hover:text-green-800 underline"
                              >
                                Fill Application Form
                              </a>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                        <span className={`font-medium ${getTaskStatusColor(task.deadline)}`}>
                          Deadline: {new Date(task.deadline).toLocaleDateString()} at {new Date(task.deadline).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-row sm:flex-col items-end gap-2 w-full sm:w-auto">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${new Date(task.deadline) < new Date() ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>{new Date(task.deadline) < new Date() ? 'Overdue' : 'Active'}</span>
                      {/* Mark Done button for students */}
                      {task.status !== 'Completed' && new Date(task.deadline) > new Date() && (
                        <button
                          onClick={() => handleMarkCompleted(task._id)}
                          className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors mt-2 w-full sm:w-auto"
                          title="Mark as completed"
                        >
                          Mark Done
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileText className="mx-auto h-12 w-12 text-gray-300 mb-2" />
              <p>No tasks available for this company</p>
              <p className="text-sm mt-1">Check back later for updates</p>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200">
        <button onClick={onClose} className="btn-secondary w-full sm:w-auto">Close</button>
      </div>
    </div>
  );
};

export default CompanyDetails; 
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { 
  Users, 
  Building, 
  Bell, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  UserCheck,
  UserX,
  Plus,
  Search,
  Filter
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    pendingApprovals: 0,
    totalCompanies: 0,
    totalAnnouncements: 0
  });
  const [pendingStudents, setPendingStudents] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [studentsRes, companiesRes, announcementsRes] = await Promise.all([
        api.get('/admin/pending-students'),
        api.get('/companies'),
        api.get('/announcements')
      ]);

      const pendingStudents = studentsRes.data.data;
      
      setPendingStudents(pendingStudents);
      setCompanies(companiesRes.data.data);
      setAnnouncements(announcementsRes.data.data);
      
      setStats({
        totalStudents: pendingStudents.length,
        pendingApprovals: pendingStudents.length,
        totalCompanies: companiesRes.data.data.length,
        totalAnnouncements: announcementsRes.data.data.length
      });
    } catch (error) {
      console.error('Error fetching admin data:', error);
      setError('Failed to load admin data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveStudent = async (studentId) => {
    try {
      await api.post(`/admin/approve-student/${studentId}`);
      fetchData();
    } catch (error) {
      console.error('Error approving student:', error);
      alert('Failed to approve student');
    }
  };

  const handleRejectStudent = async (studentId) => {
    try {
      await api.post(`/admin/reject-student/${studentId}`);
      fetchData();
    } catch (error) {
      console.error('Error rejecting student:', error);
      alert('Failed to reject student');
    }
  };

  const filteredPendingStudents = pendingStudents.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.scholarNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBranch = branchFilter === 'all' || student.branch === branchFilter;
    return matchesSearch && matchesBranch;
  });

  // Check for duplicate scholar numbers
  const duplicateScholarNumbers = pendingStudents
    .map(student => student.scholarNumber)
    .filter((scholarNumber, index, arr) => arr.indexOf(scholarNumber) !== index);

  const hasDuplicateScholarNumber = (scholarNumber) => {
    return duplicateScholarNumbers.includes(scholarNumber);
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
        <h1 className="text-xl sm:text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-primary-100 text-sm sm:text-base">Manage students, companies, and announcements</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 sm:gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingApprovals}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Building className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Companies</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCompanies}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Bell className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Announcements</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalAnnouncements}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b border-gray-200 overflow-x-auto">
          <nav className="flex flex-wrap gap-2 sm:gap-4 sm:flex-nowrap sm:space-x-8 px-2 sm:px-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'pending'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Pending Approvals ({stats.pendingApprovals})
            </button>
          </nav>
        </div>

        <div className="p-3 sm:p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {pendingStudents.slice(0, 5).map((student) => (
                    <div key={student._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{student.name}</p>
                        <p className="text-sm text-gray-600">{student.scholarNumber} • {student.branch}</p>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Pending Approval
                      </span>
                    </div>
                  ))}
                  {pendingStudents.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No pending approvals</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pending' && (
            <div className="space-y-6">
              {/* Search and Filters */}
              <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search by name or scholar number..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <select
                    value={branchFilter}
                    onChange={(e) => setBranchFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="all">All Branches</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Mechanical">Mechanical</option>
                    <option value="Civil">Civil</option>
                  </select>
                </div>
              </div>

              {/* Pending Students List */}
              <div className="space-y-4">
                {filteredPendingStudents.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No pending approvals</h3>
                    <p className="mt-1 text-sm text-gray-500">All students have been processed.</p>
                  </div>
                ) : (
                  filteredPendingStudents.map((student) => {
                    const isDuplicate = hasDuplicateScholarNumber(student.scholarNumber);
                    return (
                      <div key={student._id} className={`border rounded-lg p-4 sm:p-6 ${isDuplicate ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex-1 w-full">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 mb-2">
                              <h4 className="text-base sm:text-lg font-medium text-gray-900">{student.name}</h4>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>
                              {isDuplicate && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Duplicate Scholar Number</span>
                              )}
                            </div>
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-4 text-sm text-gray-600">
                              <div>
                                <span className="font-medium">Scholar Number:</span> 
                                <span className={isDuplicate ? 'text-red-600 font-bold' : ''}>
                                  {student.scholarNumber}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium">Branch:</span> {student.branch}
                              </div>
                              <div>
                                <span className="font-medium">Year:</span> {student.year}
                              </div>
                              <div>
                                <span className="font-medium">CGPA:</span> {student.cgpa}
                              </div>
                            </div>
                            <div className="mt-3 text-sm text-gray-500">
                              <span className="font-medium">Email:</span> {student.email}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 sm:flex-row sm:gap-2 ml-0 sm:ml-4 w-full sm:w-auto">
                            <button onClick={() => handleApproveStudent(student._id)} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 w-full sm:w-auto"><UserCheck className="h-4 w-4" />Approve</button>
                            <button onClick={() => handleRejectStudent(student._id)} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 w-full sm:w-auto"><UserX className="h-4 w-4" />Reject</button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 
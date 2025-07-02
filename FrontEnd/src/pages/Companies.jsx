import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Search, 
  Filter, 
  Bell, 
  Calendar, 
  CheckCircle,
  Clock,
  MapPin,
  DollarSign,
  Users,
  FileText,
  ExternalLink,
  Plus,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Modal from '../components/shared/Modal';
import CompanyForm from '../components/admin/CompanyForm';
import CompanyDetails from '../components/student/CompanyDetails';
import AdvancedSearch from '../components/student/AdvancedSearch';
import toast from 'react-hot-toast';
import TaskManager from '../components/admin/TaskManager';
import { isUserEligibleForCompany } from '../utils/eligibility';

export const BRANCHES = [
  { value: 'CSE', label: 'Computer Science Engineering' },
  { value: 'ECE', label: 'Electronics & Communication Engineering' },
  { value: 'ME', label: 'Mechanical Engineering' },
  { value: 'EE', label: 'Electrical Engineering' },
  { value: 'CE', label: 'Civil Engineering' },
  { value: 'MDS', label: 'Medical Data Science' }
  
];

const Companies = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [showCompanyDetails, setShowCompanyDetails] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [editingCompany, setEditingCompany] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState(null);

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
      setFilteredCompanies(companiesRes.data.data);
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

  const handleDeleteCompany = (company) => {
    setCompanyToDelete(company);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteCompany = async () => {
    try {
      await api.delete(`/companies/${companyToDelete._id}`);
      toast.success('Company deleted successfully');
      setShowDeleteConfirm(false);
      setCompanyToDelete(null);
      fetchData();
    } catch (error) {
      console.error('Error deleting company:', error);
      toast.error('Failed to delete company');
    }
  };

  const applyFilters = () => {
    let filtered = companies;

    if (searchTerm) {
      filtered = filtered.filter(company =>
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.role.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(company => company.status === statusFilter);
    }

    setFilteredCompanies(filtered);
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
        <h1 className="text-xl sm:text-2xl font-bold">Companies</h1>
        <p className="text-primary-100 text-sm sm:text-base">Browse available job opportunities</p>
      </div>

      {/* Search and Filters */}
      <div className="card p-3 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search companies or roles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
            </select>
            
            <button
              onClick={applyFilters}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filter
            </button>
            
            <button
              onClick={() => setShowAdvancedSearch(true)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Advanced
            </button>
            
            {isAdmin && (
              <button
                onClick={handleAddCompany}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Company
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCompanies.map((company) => {
          const isEligible = isUserEligibleForCompany(user, company);

          return (
            <div
              key={company._id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
              onClick={() => handleViewCompany(company)}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{company.name}</h3>
                    <p className="text-sm text-gray-600">{company.role}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(company.status)}`}>
                    {company.status}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{company.location}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="h-4 w-4 mr-2" />
                    <span>{company.compensation}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    <span>{company.positions} positions</span>
                  </div>
                </div>

                {company.tasks && company.tasks.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <FileText className="h-4 w-4 mr-2" />
                      <span>{company.tasks.length} task{company.tasks.length > 1 ? 's' : ''}</span>
                    </div>
                    <div className="space-y-1">
                      {company.tasks.slice(0, 2).map((task) => (
                        <div key={task._id} className="flex items-center justify-between text-xs">
                          <span className="text-gray-600 truncate">{task.title}</span>
                          <span className={`px-1 py-0.5 rounded text-xs ${
                            task.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {task.status}
                          </span>
                        </div>
                      ))}
                      {company.tasks.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{company.tasks.length - 2} more tasks
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewCompany(company);
                    }}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1"
                  >
                    <Eye className="h-4 w-4" />
                    View Details
                  </button>
                  
                  {isAdmin && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingCompany(company);
                          setShowCompanyForm(true);
                        }}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCompany(company);
                        }}
                        className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  )}
                  
                  {!isEligible && !isAdmin && (
                    <span className="text-xs text-red-600 font-medium">Not eligible</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCompanies.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No companies found</h3>
          <p className="text-gray-500">Try adjusting your search criteria or filters.</p>
        </div>
      )}

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
          {isAdmin && (
            <div className="mt-6">
              <TaskManager companyId={selectedCompany._id} />
            </div>
          )}
        </Modal>
      )}

      {showAdvancedSearch && (
        <Modal isOpen={showAdvancedSearch} onClose={() => setShowAdvancedSearch(false)}>
          <AdvancedSearch
            onSearch={(filters) => {
              // Apply advanced search filters
              setShowAdvancedSearch(false);
            }}
            onClose={() => setShowAdvancedSearch(false)}
          />
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && companyToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Delete Company</h3>
                <p className="text-sm text-gray-600">This action cannot be undone.</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700">
                Are you sure you want to delete <strong>{companyToDelete.name}</strong>?
              </p>
              <p className="text-sm text-gray-600 mt-2">
                This will permanently remove the company and all associated tasks.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setCompanyToDelete(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteCompany}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Company
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Companies; 
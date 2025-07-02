import { useState, useEffect } from 'react';
import { Building2, DollarSign, Users, Calendar, BookOpen, Save, X } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { BRANCHES } from '../../constants/branches';

const CompanyForm = ({ company, onSave = () => {}, onCancel }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: company?.name || '',
    role: company?.role || '',
    description: company?.description || '',
    compensation: company?.compensation || '',
    status: company?.status || 'Active',
    eligibility: {
      minCgpa: company?.eligibility?.minCgpa || '',
      course: company?.eligibility?.course || '',
      branches: company?.eligibility?.branches || [],
      years: company?.eligibility?.years || []
    },
    jobDescriptionDocs: company?.jobDescriptionDocs || []
  });

  const years = ['1', '2', '3', '4'];
  const compensationRanges = [
    '6-10 LPA',
    '10-20 LPA', 
    '20-40 LPA',
    '40+ LPA'
  ];

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await api.get('/courses');
      setCourses(response.data.data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    console.log('Form validation check:', e.target.checkValidity());
    
    // Check if form is valid
    if (!e.target.checkValidity()) {
      console.log('Form validation failed');
      e.target.reportValidity();
      return;
    }
    
    // Prepare data for submission
    const submitData = {
      ...formData,
      eligibility: {
        ...formData.eligibility,
        course: formData.eligibility.course || null,
        minCgpa: formData.eligibility.minCgpa || null
      }
    };
    
    console.log('Final submit data:', submitData);
    setLoading(true);
    
    try {
      if (company) {
        // Update existing company
        console.log('Updating company:', company._id);
        const response = await api.put(`/companies/${company._id}`, submitData);
        console.log('Update response:', response);
        toast.success('Company updated successfully!');
      } else {
        // Create new company
        console.log('Creating new company');
        const response = await api.post('/companies', submitData);
        console.log('Create response:', response);
        toast.success('Company added successfully!');
      }
      onSave();
    } catch (error) {
      console.error(' Error saving company:', error);
      console.error(' Error details:', error.response?.data);
      alert('Error saving company: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleBranchToggle = (branch) => {
    setFormData(prev => ({
      ...prev,
      eligibility: {
        ...prev.eligibility,
        branches: prev.eligibility.branches.includes(branch)
          ? prev.eligibility.branches.filter(b => b !== branch)
          : [...prev.eligibility.branches, branch]
      }
    }));
  };

  const handleYearToggle = (year) => {
    setFormData(prev => ({
      ...prev,
      eligibility: {
        ...prev.eligibility,
        years: prev.eligibility.years.includes(parseInt(year))
          ? prev.eligibility.years.filter(y => y !== parseInt(year))
          : [...prev.eligibility.years, parseInt(year)]
      }
    }));
  };

  const isEligible = () => {
    if (!company.eligibility?.minCgpa) return true;
    return Number(user.cgpa) >= Number(company.eligibility.minCgpa);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          {company ? 'Edit Company' : 'Add New Company'}
        </h3>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Building2 className="h-4 w-4 inline mr-1" />
              Company Name *
            </label>
            <input
              type="text"
              required
              className="input-field"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter company name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Role *
            </label>
            <input
              type="text"
              required
              className="input-field"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              placeholder="e.g., Software Engineer, Data Analyst"
            />
          </div>
        </div>

        {/* Company Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company Description
          </label>
          <textarea
            className="input-field min-h-[100px] resize-y"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Enter detailed company description, job details, requirements, benefits, etc."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="h-4 w-4 inline mr-1" />
              Compensation *
            </label>
            <select
              required
              className="input-field"
              value={formData.compensation}
              onChange={(e) => setFormData({ ...formData, compensation: e.target.value })}
            >
              <option value="">Select compensation range</option>
              {compensationRanges.map((range) => (
                <option key={range} value={range}>
                  {range}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              className="input-field"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Eligibility Criteria */}
        <div className="border-t border-gray-200 pt-6">
          <h4 className="font-medium text-gray-900 mb-4">Eligibility Criteria</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <BookOpen className="h-4 w-4 inline mr-1" />
                Minimum CGPA
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                className="input-field"
                value={formData.eligibility.minCgpa}
                onChange={(e) => setFormData({
                  ...formData,
                  eligibility: { ...formData.eligibility, minCgpa: parseFloat(e.target.value) || '' }
                })}
                placeholder="e.g., 7.5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course
              </label>
              <select
                className="input-field"
                value={formData.eligibility.course}
                onChange={(e) => setFormData({
                  ...formData,
                  eligibility: { ...formData.eligibility, course: e.target.value }
                })}
              >
                <option value="">All Courses</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="h-4 w-4 inline mr-1" />
              Eligible Branches
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {BRANCHES.map((branch) => (
                <label key={branch.value} className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    checked={formData.eligibility.branches.includes(branch.value)}
                    onChange={() => handleBranchToggle(branch.value)}
                  />
                  <span className="ml-2 text-sm text-gray-700">{branch.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="h-4 w-4 inline mr-1" />
              Eligible Years
            </label>
            <div className="flex gap-4">
              {years.map((year) => (
                <label key={year} className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    checked={formData.eligibility.years.includes(parseInt(year))}
                    onChange={() => handleYearToggle(year)}
                  />
                  <span className="ml-2 text-sm text-gray-700">Year {year}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary flex items-center gap-2"
            disabled={loading}
            onClick={() => console.log('Submit button clicked')}
          >
            <Save className="h-4 w-4" />
            {loading ? 'Saving...' : (company ? 'Update Company' : 'Add Company')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CompanyForm; 
import { useState, useEffect } from 'react';
import { Search, Filter, X, Building2, DollarSign, Users, Calendar } from 'lucide-react';
import api from '../../utils/api';

const AdvancedSearch = ({ onSearch, onClear }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [courses, setCourses] = useState([]);
  const [filters, setFilters] = useState({
    searchTerm: '',
    status: 'all',
    minCgpa: '',
    course: '',
    compensation: '',
    branches: [],
    years: []
  });

  const branches = [
    'CSE',
    'ECE',
    'ME',
    'CE',
    'EE',
    'MDS',
    'Other'
  ];

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

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleBranchToggle = (branch) => {
    setFilters(prev => ({
      ...prev,
      branches: prev.branches.includes(branch)
        ? prev.branches.filter(b => b !== branch)
        : [...prev.branches, branch]
    }));
  };

  const handleYearToggle = (year) => {
    setFilters(prev => ({
      ...prev,
      years: prev.years.includes(year)
        ? prev.years.filter(y => y !== year)
        : [...prev.years, year]
    }));
  };

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleClear = () => {
    const clearedFilters = {
      searchTerm: '',
      status: 'all',
      minCgpa: '',
      course: '',
      compensation: '',
      branches: [],
      years: []
    };
    setFilters(clearedFilters);
    onClear();
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.status !== 'all') count++;
    if (filters.minCgpa) count++;
    if (filters.course) count++;
    if (filters.compensation) count++;
    if (filters.branches.length > 0) count++;
    if (filters.years.length > 0) count++;
    return count;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-6">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search companies, roles, or keywords..."
            className="input-field pl-10"
            value={filters.searchTerm}
            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`btn-secondary flex items-center gap-2 ${
            getActiveFiltersCount() > 0 ? 'bg-primary-100 text-primary-700' : ''
          }`}
        >
          <Filter className="h-4 w-4" />
          Filters
          {getActiveFiltersCount() > 0 && (
            <span className="bg-primary-600 text-white text-xs rounded-full px-2 py-1">
              {getActiveFiltersCount()}
            </span>
          )}
        </button>
        <button onClick={handleSearch} className="btn-primary">
          Search
        </button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="border-t border-gray-200 pt-4 space-y-6">
          {/* Status and Course */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Status
              </label>
              <select
                className="input-field"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course
              </label>
              <select
                className="input-field"
                value={filters.course}
                onChange={(e) => handleFilterChange('course', e.target.value)}
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

          {/* CGPA Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum CGPA
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="10"
              className="input-field"
              placeholder="0.00"
              value={filters.minCgpa}
              onChange={(e) => handleFilterChange('minCgpa', e.target.value)}
            />
          </div>

          {/* Compensation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="h-4 w-4 inline mr-1" />
              Compensation Range
            </label>
            <select
              className="input-field"
              value={filters.compensation}
              onChange={(e) => handleFilterChange('compensation', e.target.value)}
            >
              <option value="">All Ranges</option>
              {compensationRanges.map((range) => (
                <option key={range} value={range}>
                  {range}
                </option>
              ))}
            </select>
          </div>

          {/* Branches */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Building2 className="h-4 w-4 inline mr-1" />
              Eligible Branches
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {branches.map((branch) => (
                <label key={branch} className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    checked={filters.branches.includes(branch)}
                    onChange={() => handleBranchToggle(branch)}
                  />
                  <span className="ml-2 text-sm text-gray-700">{branch}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Years */}
          <div>
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
                    checked={filters.years.includes(year)}
                    onChange={() => handleYearToggle(year)}
                  />
                  <span className="ml-2 text-sm text-gray-700">Year {year}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <button
              onClick={handleClear}
              className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
            >
              <X className="h-4 w-4" />
              Clear All Filters
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(false)}
                className="btn-secondary"
              >
                Close
              </button>
              <button
                onClick={handleSearch}
                className="btn-primary"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch; 
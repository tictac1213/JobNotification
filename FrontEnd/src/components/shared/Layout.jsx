import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  LogOut,
  User
} from 'lucide-react';
import ProfileModal from './ProfileModal';

const Layout = ({ children }) => {
  const { user, logout, isAdmin, updateUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showProfileModal, setShowProfileModal] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const handleProfileUpdated = (updatedUser) => {
    if (updateUser) {
      updateUser(updatedUser);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Job Notification Platform</h1>
            </div>

            {/* User menu */}
            <div className="flex items-center gap-x-4">
              <div className="flex items-center gap-x-3">
                <div className="hidden lg:block">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  {user?.role !== 'Admin' && (
                    <p className="text-sm text-gray-600">{user?.role}</p>
                  )}
                  {user?.role === 'Admin' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Admin
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setShowProfileModal(true)}
                  className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center hover:bg-primary-700 transition-colors"
                >
                  <User className="h-5 w-5 text-white" />
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-x-2 text-sm text-gray-600 hover:text-gray-900"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden lg:block">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => navigate('/home')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                isActive('/home')
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => navigate('/companies')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                isActive('/companies')
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Companies
            </button>
            <button
              onClick={() => navigate('/announcements')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                isActive('/announcements')
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Announcements
            </button>
            {isAdmin && (
              <button
                onClick={() => navigate('/admin-dashboard')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  isActive('/admin-dashboard')
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Admin Dashboard
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>

      {/* Profile Modal */}
      {showProfileModal && (
        <ProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          user={user}
          onProfileUpdated={handleProfileUpdated}
        />
      )}
    </div>
  );
};

export default Layout; 
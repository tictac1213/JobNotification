import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/auth/PrivateRoute';
import AdminRoute from './components/auth/AdminRoute';
import Layout from './components/shared/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import StudentDashboard from './pages/StudentDashboard';
import Companies from './pages/Companies';
import Announcements from './pages/Announcements';
import CompanyDetails from './components/student/CompanyDetails';
import AdminDashboard from './pages/AdminDashboard';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Toaster position="top-center" />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/" element={<Navigate to="/home" replace />} />
            
            {/* Protected Routes */}
            <Route path="/home" element={
              <PrivateRoute>
                <Layout>
                  <StudentDashboard />
                </Layout>
              </PrivateRoute>
            } />
            
            <Route path="/companies" element={
              <PrivateRoute>
                <Layout>
                  <Companies />
                </Layout>
              </PrivateRoute>
            } />
            
            <Route path="/announcements" element={
              <PrivateRoute>
                <Layout>
                  <Announcements />
                </Layout>
              </PrivateRoute>
            } />
            
            <Route path="/admin-dashboard" element={
              <AdminRoute>
                <Layout>
                  <AdminDashboard />
                </Layout>
              </AdminRoute>
            } />
            
            <Route path="/company/:id" element={
              <PrivateRoute>
                <Layout>
                  <CompanyDetails />
                </Layout>
              </PrivateRoute>
            } />
          </Routes>
      </div>
      </AuthProvider>
    </Router>
  );
}

export default App;

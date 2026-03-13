import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import PregnancyTracker from './pages/PregnancyTracker';
import Nutrition from './pages/Nutrition';
import Immunization from './pages/Immunization';
import Emergency from './pages/Emergency';
import ProviderDashboard from './pages/ProviderDashboard';
import AdminDashboard from './pages/AdminDashboard';
import MoodTracker from './pages/MoodTracker';
import Appointments from './pages/Appointments';
import Chat from './pages/Chat';
import Exercise from './pages/Exercise';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route path="/app" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/app/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="pregnancy" element={<PregnancyTracker />} />
        <Route path="nutrition" element={<Nutrition />} />
        <Route path="immunization" element={<Immunization />} />
        <Route path="emergency" element={<Emergency />} />
        <Route path="mood" element={<MoodTracker />} />
        <Route path="appointments" element={<Appointments />} />
        <Route path="chat" element={<Chat />} />
        <Route path="exercise" element={<Exercise />} />
        <Route path="provider" element={
          <ProtectedRoute roles={['provider', 'admin']}>
            <ProviderDashboard />
          </ProtectedRoute>
        } />
        <Route path="admin" element={
          <ProtectedRoute roles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;


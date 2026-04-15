import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Loading from './components/Loading';

// Lazy loaded pages
const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const PregnancyTracker = lazy(() => import('./pages/PregnancyTracker'));
const Nutrition = lazy(() => import('./pages/Nutrition'));
const Immunization = lazy(() => import('./pages/Immunization'));
const Emergency = lazy(() => import('./pages/Emergency'));
const ProviderDashboard = lazy(() => import('./pages/ProviderDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const MoodTracker = lazy(() => import('./pages/MoodTracker'));
const Appointments = lazy(() => import('./pages/Appointments'));
const Chat = lazy(() => import('./pages/Chat'));
const Exercise = lazy(() => import('./pages/Exercise'));

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  // Instantly render children, skip loading animation
  if (loading) {
    return null;
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
    <Suspense fallback={null}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route 
          path="/app/*" 
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
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
    </Suspense>
  );
}

export default App;

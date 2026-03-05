import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import Landing from './pages/Landing/Landing';
import Login from './pages/Login/Login';
import Signup from './pages/Signup/Signup';
import Dashboard from './pages/Dashboard/Dashboard';
import './index.css';

function AppLayout() {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');
  const isAuthPage = ['/login', '/signup'].includes(location.pathname);

  return (
    <>
      {/* Show navbar everywhere except auth pages */}
      {!isAuthPage && <Navbar />}

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>

      {/* Show footer only on public pages (not dashboard, not auth) */}
      {!isDashboard && !isAuthPage && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </Router>
  );
}

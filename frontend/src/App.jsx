import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedLayout from './components/layout/ProtectedLayout';

// Pages
import Home from './pages/Home/Home';
import Scanner from './pages/Scanner/Scanner';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import StudentDashboard from './pages/Dashboard/StudentDashboard';
import CommunityReports from './pages/Community/CommunityReports';
import ReportDetails from './pages/Community/ReportDetails';
import SafetyGuidelines from './pages/Guidelines/SafetyGuidelines';
import AdminDashboard from './pages/Admin/AdminDashboard';

// Shared Components & Global Styles
import './components/components.css';
import './App.css';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-shell" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Navbar />
          
          <div style={{ flex: 1 }}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/scanner" element={<Scanner />} />
              <Route path="/community" element={<CommunityReports />} />
              <Route path="/community/:id" element={<ReportDetails />} />
              <Route path="/guidelines" element={<SafetyGuidelines />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Student Routes */}
              <Route element={<ProtectedLayout />}>
                <Route path="/dashboard" element={<StudentDashboard />} />
              </Route>

              {/* Protected Admin Routes */}
              <Route element={<ProtectedLayout requiredRole="admin" />}>
                <Route path="/admin" element={<AdminDashboard />} />
              </Route>

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>

          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

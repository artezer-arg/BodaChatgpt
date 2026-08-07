import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { InvitationPage } from './pages/InvitationPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Main Wedding Invitation Page */}
        <Route path="/" element={<InvitationPage />} />

        {/* Administration Panel Routes */}
        <Route path="/admin" element={<AdminLoginPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />

        {/* Catch-all fallback redirecting to main page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

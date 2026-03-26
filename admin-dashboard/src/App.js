import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminCompanyPage from './components/AdminManagement/admin_company_page';
import AdminLogin from './components/AdminManagement/admin_login';
import AdminPortalHome from './components/AdminManagement/admin_portal_home';
import AdminCreatePage from './components/AdminManagement/admin_create_page';
import AdminDashboard from './components/AdminManagement/admin_dashboard';
import AdminInternshipPage from './components/AdminManagement/admin_internship_page';
import AdminPaymentPage from './components/AdminManagement/admin_payment_page';
import AdminRegistryPage from './components/AdminManagement/admin_registry_page';
import AdminReviewPage from './components/AdminManagement/admin_review_page';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<AdminPortalHome />} />
          <Route path="/login" element={<AdminLogin />} />
          <Route path="/dashboard" element={<AdminDashboard />} />
          <Route path="/create" element={<AdminCreatePage />} />
          <Route path="/registry" element={<AdminRegistryPage />} />
          <Route path="/companies" element={<AdminCompanyPage />} />
          <Route path="/internships" element={<AdminInternshipPage />} />
          <Route path="/payments" element={<AdminPaymentPage />} />
          <Route path="/reviews" element={<AdminReviewPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

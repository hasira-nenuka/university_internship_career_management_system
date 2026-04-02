import React, { useEffect } from 'react';
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
import AdminStudentPage from './components/AdminManagement/admin_student_page';
import AdminTopPartnersPage from './components/AdminManagement/admin_top_partners_page';
import './App.css';

function App() {
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const shouldUseDark = savedTheme === 'dark';
    document.documentElement.classList.toggle('dark', shouldUseDark);
  }, []);

  return (
    <Router>
      <div className="App min-h-screen bg-white dark:bg-[#0b1f43]">
        <Routes>
          <Route path="/" element={<AdminPortalHome />} />
          <Route path="/login" element={<AdminLogin />} />
          <Route path="/dashboard" element={<AdminDashboard />} />
          <Route path="/create" element={<AdminCreatePage />} />
          <Route path="/registry" element={<AdminRegistryPage />} />
          <Route path="/companies" element={<AdminCompanyPage />} />
          <Route path="/students" element={<AdminStudentPage />} />
          <Route path="/internships" element={<AdminInternshipPage />} />
          <Route path="/payments" element={<AdminPaymentPage />} />
          <Route path="/payments/top-partners" element={<AdminTopPartnersPage />} />
          <Route path="/reviews" element={<AdminReviewPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

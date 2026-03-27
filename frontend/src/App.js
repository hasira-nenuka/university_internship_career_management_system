import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/HomePage/Home';
import CompanyRegister from './components/CompanyManagement/C_CompanyRegister';
import CompanyLogin from './components/CompanyManagement/C_CompanyLogin';
import CompanyDashboard from './components/CompanyManagement/C_CompanyDashboard';
import PaymentUpload from './components/PaymentManagement/p_PaymentUpload';
import PaymentSummary from './components/PaymentManagement/p_PaymentSummary';
import PaymentSuccess from './components/PaymentManagement/p_PaymentSuccess';
import ProAccountUpgrade from './components/PaymentManagement/p_ProAccountUpgrade';
import AdminPaymentManagement from './components/AdminManagement/A_PaymentManagement';
import StudentLogin from './components/StudentManagement/student_login';
import StudentRegister from './components/StudentManagement/student_register';
import StudentDashboard from './components/StudentManagement/S_Dashboard';
import StudentJobs from './components/StudentManagement/S_Jobs';
import StudentApplications from './components/StudentManagement/S_Applications';
import StudentSearchJobs from './components/StudentManagement/S_SearchJobs';
import StudentApplyJobs from './components/StudentManagement/S_ApplyJobs';
import StudentProfile from './components/StudentManagement/S_Profile';
import StudentProfileView from './components/StudentManagement/S_ProfileView';
import StudentProfileViewCompany from './components/StudentManagement/S_PviewCompany';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import News from './pages/News';
import Login from './pages/Login';
import './App.css';

function App() {
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const shouldUseDark = savedTheme === 'dark';
    document.documentElement.classList.toggle('dark', shouldUseDark);
  }, []);

  return (
    <Router>
      <div className="App min-h-screen bg-white dark:bg-slate-900">
        <Header />
        <Routes>
          {/* Home Route */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/news" element={<News />} />
          <Route path="/login" element={<Login />} />
          
          {/* Company Routes */}
          <Route path="/register/company" element={<CompanyRegister />} />
          <Route path="/login/company" element={<CompanyLogin />} />
          <Route path="/company/dashboard" element={<CompanyDashboard />} />

          {/* Payment Routes */}
          <Route path="/payments/upload" element={<PaymentUpload />} />
          <Route path="/payments/summary" element={<PaymentSummary />} />
          <Route path="/payments/success" element={<PaymentSuccess />} />
          <Route path="/payments/pro-upgrade" element={<ProAccountUpgrade />} />
          <Route path="/admin/payments" element={<AdminPaymentManagement />} />
          
          {/* Student Routes */}
          <Route path="/login/student" element={<StudentLogin />} />
          <Route path="/register/student" element={<StudentRegister />} />
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/jobs" element={<StudentJobs />} />
          <Route path="/student/search-jobs" element={<StudentSearchJobs />} />
          <Route path="/student/applications" element={<StudentApplications />} />
          <Route path="/student/apply-jobs" element={<StudentApplyJobs />} />
          <Route path="/student/search-jobs" element={<StudentSearchJobs />} />
          <Route path="/student/applications" element={<StudentApplications />} />
          <Route path="/student/apply-jobs" element={<StudentApplyJobs />} />
          <Route path="/student/profile" element={<StudentProfile />} />
          <Route path="/student/profile/view/:id" element={<StudentProfileView />} />
          <Route path="/student/profile/company-view" element={<StudentProfileViewCompany />} />

          <Route path="*" element={
            <div className="min-h-[60vh] flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
              <div className="text-center">
                <h1 className="text-3xl font-bold mb-3 text-gray-900 dark:text-white">Page not found</h1>
                <p className="text-gray-600 dark:text-slate-300">The page you requested does not exist.</p>
              </div>
            </div>
          } />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;

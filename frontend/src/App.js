import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/HomePage/Home';
import CompanyRegister from './components/CompanyManagement/C_CompanyRegister';
import CompanyLogin from './components/CompanyManagement/C_CompanyLogin';
import CompanyDashboard from './components/CompanyManagement/C_CompanyDashboard';
import P_PaymentUpload from './components/PaymentManagement/p_PaymentUpload';
import P_PaymentSummary from './components/PaymentManagement/p_PaymentSummary';
import P_PaymentSuccess from './components/PaymentManagement/p_PaymentSuccess';
import P_ProAccountUpgrade from './components/PaymentManagement/p_ProAccountUpgrade';
import A_PaymentManagement from './components/AdminManagement/A_PaymentManagement';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import News from './pages/News';
import Login from './pages/Login';
import './App.css';

function App() {
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
          <Route path="/payments/upload" element={<P_PaymentUpload />} />
          <Route path="/payments/summary" element={<P_PaymentSummary />} />
          <Route path="/payments/success" element={<P_PaymentSuccess />} />
          <Route path="/payments/pro-upgrade" element={<P_ProAccountUpgrade />} />
          <Route path="/admin/payments" element={<A_PaymentManagement />} />
          
          {/* Student Routes - Placeholder */}
          <Route path="/login/student" element={
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
              <div className="text-center">
                <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Student Login</h1>
                <p className="text-gray-600 dark:text-slate-300">Student login page coming soon...</p>
              </div>
            </div>
          } />
          
          <Route path="/register/student" element={
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
              <div className="text-center">
                <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Student Registration</h1>
                <p className="text-gray-600 dark:text-slate-300">Student registration page coming soon...</p>
              </div>
            </div>
          } />

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
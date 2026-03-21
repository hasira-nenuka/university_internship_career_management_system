import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/HomePage/Home.jsx';  // Note the .jsx extension
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Home Route */}
          <Route path="/" element={<Home />} />
          
          {/* Auth Routes - Placeholder pages */}
          <Route path="/login/student" element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-3xl font-bold mb-4">Student Login</h1>
                <p className="text-gray-600">Login page coming soon...</p>
              </div>
            </div>
          } />
          
          <Route path="/login/company" element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-3xl font-bold mb-4">Company Login</h1>
                <p className="text-gray-600">Login page coming soon...</p>
              </div>
            </div>
          } />
          
          <Route path="/register/student" element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-3xl font-bold mb-4">Student Registration</h1>
                <p className="text-gray-600">Registration page coming soon...</p>
              </div>
            </div>
          } />
          
          <Route path="/register/company" element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-3xl font-bold mb-4">Company Registration</h1>
                <p className="text-gray-600">Registration page coming soon...</p>
              </div>
            </div>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
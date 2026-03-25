import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pt-20 pb-12">
      {/* Hero Section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-16">
          {/* Logo and Brand Section */}
          <div className="flex flex-col items-center md:items-start justify-center">
            <div className="mb-6">
              <img 
                src={logo} 
                alt="INTERNIX Logo" 
                className="h-32 w-32 object-contain drop-shadow-lg hover:scale-110 transition-transform duration-300"
              />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4 text-center md:text-left">
              INTERNIX
            </h1>
            <p className="text-xl text-gray-600 dark:text-slate-300 mb-8 text-center md:text-left">
              Your Gateway to Excellence in Internships
            </p>
            <p className="text-gray-600 dark:text-slate-400 mb-8 max-w-md text-center md:text-left">
              Connect top talent with leading companies. INTERNIX is the premier platform where students discover career opportunities and companies find the next generation of innovators.
            </p>
            
            <div className="flex gap-4 flex-col sm:flex-row">
              <Link
                to="/login"
                className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
              >
                Get Started
              </Link>
              <Link
                to="/about"
                className="px-8 py-3 border-2 border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-300 rounded-lg font-semibold hover:bg-indigo-50 dark:hover:bg-slate-800 transition-all duration-300"
              >
                Learn More
              </Link>
            </div>
          </div>

          {/* Features/Stats Section */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm dark:shadow-lg border dark:border-slate-700 hover:shadow-md dark:hover:shadow-xl transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                    <svg className="h-6 w-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Fast Matching</h3>
                  <p className="text-gray-600 dark:text-slate-400 text-sm mt-1">
                    AI-powered matching technology to connect you with perfect opportunities in minutes.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm dark:shadow-lg border dark:border-slate-700 hover:shadow-md dark:hover:shadow-xl transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                    <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Easy Management</h3>
                  <p className="text-gray-600 dark:text-slate-400 text-sm mt-1">
                    Simple tools to manage applications, interviews, and career progress all in one place.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm dark:shadow-lg border dark:border-slate-700 hover:shadow-md dark:hover:shadow-xl transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                    <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Verified Opportunities</h3>
                  <p className="text-gray-600 dark:text-slate-400 text-sm mt-1">
                    All internship positions are verified by our team to ensure quality and authenticity.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-8 shadow-sm dark:shadow-lg border dark:border-slate-700 text-center hover:shadow-md dark:hover:shadow-xl transition-all duration-300">
            <p className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">500+</p>
            <p className="text-gray-600 dark:text-slate-400">Active Companies</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-8 shadow-sm dark:shadow-lg border dark:border-slate-700 text-center hover:shadow-md dark:hover:shadow-xl transition-all duration-300">
            <p className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">2000+</p>
            <p className="text-gray-600 dark:text-slate-400">Internship Positions</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-8 shadow-sm dark:shadow-lg border dark:border-slate-700 text-center hover:shadow-md dark:hover:shadow-xl transition-all duration-300">
            <p className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">5000+</p>
            <p className="text-gray-600 dark:text-slate-400">Successful Placements</p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-700 dark:to-purple-700 rounded-2xl p-12 text-center shadow-lg dark:shadow-2xl">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Launch Your Career?</h2>
          <p className="text-indigo-100 mb-8 text-lg max-w-2xl mx-auto">
            Join thousands of students who have found their dream internship through INTERNIX. Start exploring opportunities today!
          </p>
          <Link
            to="/login"
            className="inline-block px-8 py-3 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-gray-100 transform hover:scale-105 transition-all duration-300"
          >
            Explore Internships
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;

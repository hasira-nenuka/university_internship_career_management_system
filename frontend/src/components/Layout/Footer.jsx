import React from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'About Us', to: '/about' },
  { label: 'Contact Us', to: '/contact' },
  { label: 'News', to: '/news' },
  { label: 'Login', to: '/login' },
];

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-indigo-700 to-purple-700 text-white">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div>
          <h3 className="mb-3 text-2xl font-bold">StepIn</h3>
          <p className="text-indigo-100">
            Building a stronger internship ecosystem for students and employers with one smart platform.
          </p>
        </div>

        <div>
          <h4 className="mb-3 text-lg font-semibold">Quick Links</h4>
          <div className="flex flex-wrap gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-md px-3 py-2 text-sm transition ${
                    isActive ? 'bg-white text-indigo-700' : 'bg-white/10 hover:bg-white/20'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>

        <div>
          <h4 className="mb-3 text-lg font-semibold">Contact</h4>
          <p className="text-sm text-indigo-100">Email: support@stepin.edu</p>
          <p className="text-sm text-indigo-100">Phone: +94 11 234 5678</p>
          <p className="text-sm text-indigo-100">Address: Colombo, Sri Lanka</p>
        </div>
      </div>

      <div className="border-t border-white/20 px-4 py-4 text-center text-sm text-indigo-100">
        © {new Date().getFullYear()} StepIn Internship Management System. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;

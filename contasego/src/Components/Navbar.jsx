import React, { useState } from 'react';

const Navbar = () => {
  const [activeLink, setActiveLink] = useState('home');

  const handleLinkClick = (link) => {
    setActiveLink(link);
    // Add your navigation logic here, e.g. navigate to the corresponding page
  };

  return (
    <nav className="bg-gray-800 py-4 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center">
          <a href="/" className="text-white font-bold text-xl">
            ContaseGO
          </a>
        </div>
        <div>
          <ul className="flex space-x-4">
            <li>
              <a
                href="/about"
                className={`text-gray-400 hover:text-white ${
                  activeLink === 'about' ? 'text-white' : ''
                }`}
                onClick={() => handleLinkClick('about')}
              >
                About
              </a>
            </li>
            <li>
              <a
                href="/contact"
                className={`text-gray-400 hover:text-white ${
                  activeLink === 'contact' ? 'text-white' : ''
                }`}
                onClick={() => handleLinkClick('contact')}
              >
                Contact
              </a>
            </li>
            <li>
              <a
                href="/login"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                onClick={() => handleLinkClick('login')}
              >
                Login
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
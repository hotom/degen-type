import React from 'react';

// Updated modal structure with Guest option
export default function AuthModal({ isOpen, onClose, children, onContinueAsGuest }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl relative max-w-md w-full mx-4">
        <button 
          onClick={onClose} 
          className="absolute top-2 right-3 text-gray-500 hover:text-gray-800 text-2xl font-bold"
          aria-label="Close"
        >
          &times; {/* Multiplication sign as close icon */}
        </button>
        
        {/* Login/Register Form */} 
        <div className="mb-6">
            {children}
        </div>
        
        {/* Divider */} 
        <div className="relative flex items-center mb-4">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="flex-shrink mx-4 text-gray-500 text-sm">OR</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        {/* Continue as Guest Button */} 
        <button 
          onClick={onContinueAsGuest} 
          className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Continue as Guest
        </button>
      </div>
    </div>
  );
} 
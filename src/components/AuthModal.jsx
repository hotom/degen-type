import React from 'react';

// Updated modal structure with Guest option
export default function AuthModal({ isOpen, onClose, children, onContinueAsGuest }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-slate-800 p-8 rounded-lg shadow-xl relative max-w-md w-full mx-4 border border-slate-700">
        <button 
          onClick={onClose} 
          className="absolute top-2 right-3 text-slate-400 hover:text-slate-200 text-2xl font-bold"
          aria-label="Close"
        >
          &times;
        </button>
        
        {/* Login/Register Form */} 
        <div className="mb-6">
            {children}
        </div>
        
        {/* Divider */} 
        <div className="relative flex items-center mb-4">
          <div className="flex-grow border-t border-slate-600"></div>
          <span className="flex-shrink mx-4 text-slate-400 text-sm">OR</span>
          <div className="flex-grow border-t border-slate-600"></div>
        </div>

        {/* Continue as Guest Button */} 
        <button 
          onClick={onContinueAsGuest} 
          className="w-full py-2 px-4 border border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-200 bg-slate-700 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-500"
        >
          Continue as Guest
        </button>
      </div>
    </div>
  );
} 
import React from 'react';

// Updated modal structure without Guest option
export default function AuthModal({ isOpen, onClose, children }) {
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
      </div>
    </div>
  );
} 
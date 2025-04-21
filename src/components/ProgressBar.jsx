import React from 'react';

const ProgressBar = ({ current, total }) => {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="w-full bg-slate-700 rounded-full h-2.5 dark:bg-slate-700/50 overflow-hidden border border-slate-600/50">
      <div 
        className="bg-gradient-to-r from-teal-400 to-cyan-500 h-full rounded-full transition-all duration-300 ease-in-out"
        style={{ width: `${percentage}%` }}
      >
        {/* Optional: Add text inside or as a label outside */}
        {/* <span className="text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded-full">{percentage}%</span> */}
      </div>
      {/* Fallback label if needed outside */}
      {/* <span className="text-sm text-slate-400 mt-1 block">{current} / {total} questions answered</span> */}
    </div>
  );
};

export default ProgressBar; 
import React from 'react';

const ProgressBar = ({ current, total }) => {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="flex items-center w-full gap-3">
      <span className="text-sm font-medium text-cyan-300 w-10 text-right">{percentage}%</span>

      <div className="flex-grow bg-slate-700 rounded-full h-2.5 dark:bg-slate-700/50 overflow-hidden border border-slate-600/50">
        <div 
          className="bg-gradient-to-r from-teal-400 to-cyan-500 h-full rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${percentage}%` }}
        >
        </div>
      </div>
    </div>
  );
};

export default ProgressBar; 
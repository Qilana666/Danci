import React from 'react';

export const Loading: React.FC<{ message?: string }> = ({ message = "Thinking..." }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      <p className="text-gray-500 font-semibold animate-pulse">{message}</p>
    </div>
  );
};

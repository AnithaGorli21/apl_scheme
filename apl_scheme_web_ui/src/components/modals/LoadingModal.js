import React from 'react';

/**
 * LoadingModal Component
 * Displays a loading spinner with a message while API operations are in progress
 * 
 * @param {boolean} isOpen - Controls visibility of the modal
 * @param {string} title - Main title text (default: "Processing...")
 * @param {string} subtitle - Subtitle text (default: "Please wait while we complete your request.")
 */
const LoadingModal = ({ 
  isOpen = false, 
  title = "Processing...", 
  subtitle = "Please wait while we complete your request." 
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
      role="status" 
      aria-live="polite" 
      aria-busy="true"
    >
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 animate-fadeIn">
        {/* Spinner */}
        <div className="flex justify-center mb-6">
          <div 
            className="w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"
            style={{ borderTopColor: '#002B70' }}
          />
        </div>
        
        {/* Title */}
        <h3 className="text-xl font-bold text-gray-800 text-center mb-2">
          {title}
        </h3>
        
        {/* Subtitle */}
        <p className="text-sm text-gray-600 text-center">
          {subtitle}
        </p>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default LoadingModal;

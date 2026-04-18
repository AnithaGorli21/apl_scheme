import React from 'react';

/**
 * SuccessModal Component
 * Displays a success message with a checkmark icon
 * 
 * @param {boolean} isOpen - Controls visibility of the modal
 * @param {string} title - Main title text (default: "Success!")
 * @param {string} message - Success message text
 * @param {Function} onClose - Callback function when OK button is clicked
 * @param {string} buttonText - Text for the action button (default: "OK")
 */
const SuccessModal = ({ 
  isOpen = false, 
  title = "Success!", 
  message = "Operation completed successfully.",
  onClose,
  buttonText = "OK"
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
      role="dialog" 
      aria-modal="true"
      aria-labelledby="success-modal-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 animate-fadeIn">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center animate-scaleIn">
            <svg 
              className="w-12 h-12 text-green-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 13l4 4L19 7" 
              />
            </svg>
          </div>
        </div>
        
        {/* Title */}
        <h3 
          id="success-modal-title"
          className="text-2xl font-bold text-gray-800 text-center mb-3"
        >
          {title}
        </h3>
        
        {/* Message */}
        <p className="text-base text-gray-600 text-center mb-6">
          {message}
        </p>
        
        {/* Action Button */}
        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="text-white font-semibold px-8 py-3 rounded-lg transition shadow-md hover:shadow-lg hover:opacity-90 min-w-[120px]"
            style={{ backgroundColor: '#002B70' }}
          >
            {buttonText}
          </button>
        </div>
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
        @keyframes scaleIn {
          from {
            transform: scale(0);
          }
          to {
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
      `}</style>
    </div>
  );
};

export default SuccessModal;

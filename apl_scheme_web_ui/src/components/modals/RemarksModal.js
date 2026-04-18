import React, { useState } from 'react';

/**
 * RemarksModal Component
 * Displays a modal to collect remarks/comments from the user
 * 
 * @param {boolean} isOpen - Controls visibility of the modal
 * @param {string} title - Main title text (default: "Enter Remarks")
 * @param {string} placeholder - Placeholder text for textarea
 * @param {Function} onSubmit - Callback with remarks when Submit is clicked
 * @param {Function} onCancel - Callback when Cancel button is clicked
 * @param {string} submitButtonText - Text for submit button (default: "Submit")
 * @param {string} cancelButtonText - Text for cancel button (default: "Cancel")
 */
const RemarksModal = ({ 
  isOpen = false, 
  title = "Enter Remarks", 
  placeholder = "Enter your remarks here...",
  onSubmit,
  onCancel,
  submitButtonText = "Submit",
  cancelButtonText = "Cancel"
}) => {
  const [remarks, setRemarks] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    // Validate remarks
    if (!remarks.trim()) {
      setError('Remarks are required');
      return;
    }

    // Clear error and call onSubmit
    setError('');
    onSubmit(remarks.trim());
    setRemarks(''); // Reset for next use
  };

  const handleCancel = () => {
    setRemarks('');
    setError('');
    onCancel();
  };

  const handleRemarksChange = (e) => {
    setRemarks(e.target.value);
    if (error) setError(''); // Clear error when user starts typing
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
      role="dialog" 
      aria-modal="true"
      aria-labelledby="remarks-modal-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 animate-fadeIn">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center animate-scaleIn">
            <svg 
              className="w-12 h-12 text-orange-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" 
              />
            </svg>
          </div>
        </div>
        
        {/* Title */}
        <h3 
          id="remarks-modal-title"
          className="text-2xl font-bold text-gray-800 text-center mb-6"
        >
          {title}
        </h3>
        
        {/* Textarea */}
        <div className="mb-2">
          <textarea
            value={remarks}
            onChange={handleRemarksChange}
            placeholder={placeholder}
            rows={4}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-none ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
          />
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-sm text-red-600 mb-4">
            {error}
          </p>
        )}
        
        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={handleCancel}
            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-6 py-2 rounded-lg transition shadow-md hover:shadow-lg min-w-[100px]"
          >
            {cancelButtonText}
          </button>
          <button
            onClick={handleSubmit}
            className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-2 rounded-lg transition shadow-md hover:shadow-lg min-w-[100px]"
          >
            {submitButtonText}
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

export default RemarksModal;

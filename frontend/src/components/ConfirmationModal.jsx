
import React from 'react';
import { MdClose } from 'react-icons/md';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', variant = 'danger' }) => {
  if (!isOpen) return null;

  const variantClasses = {
    danger: 'bg-red-600 hover:bg-red-700',
    primary: 'bg-primary-600 hover:bg-primary-700',
    warning: 'bg-amber-500 hover:bg-amber-600'
  };

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" 
        onClick={onClose}
        aria-hidden="true"
      ></div>

      {/* Modal */}
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 z-10 relative overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-500 transition-colors"
            aria-label="Close"
          >
            <MdClose className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6">
          <p className="text-gray-600">{message}</p>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-4 py-3 flex flex-row-reverse sm:px-6 gap-2">
          <button
            type="button"
            className={`px-4 py-2 rounded-md text-white font-medium text-sm ${variantClasses[variant]}`}
            onClick={handleConfirm}
          >
            {confirmText}
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded-md bg-white text-gray-700 font-medium text-sm border border-gray-300 hover:bg-gray-50"
            onClick={onClose}
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;

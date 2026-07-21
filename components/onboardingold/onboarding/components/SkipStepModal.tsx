
import React from 'react';

interface SkipStepModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  stepName: string;
}

const SkipStepModal: React.FC<SkipStepModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  stepName,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-sm mx-auto">
        <h3 className="text-lg font-bold mb-4">Skip Step: {stepName}?</h3>
        <p className="mb-6 text-gray-700">
          Are you sure you want to skip this step? You might miss important
          setup if you do.
        </p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
};

export default SkipStepModal;



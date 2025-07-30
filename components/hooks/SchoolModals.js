import React from 'react';
import LoginModal from '../LoginModal';
import RequestAccessFormSchool from '../Schoolpage/RequestAccessFormSchool';

export const SchoolModals = ({
  selectedSchool,
  showModal,
  showPendingModal,
  showRequestAccessModal,
  school,
  closeModal,
  closePendingModal,
  closeRequestAccessModal,
  handleSuccess,
  loggedInUserEmail
}) => {
  return (
    <>
      {showModal && (
        <LoginModal
          isOpen={showModal}
          onClose={closeModal}
        />
      )}

      {showPendingModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <p className="text-yellow-500">Your request is pending approval.</p>
            <button
              onClick={closePendingModal}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showRequestAccessModal && (
        <RequestAccessFormSchool
        selectedSchool={ selectedSchool}
          schoolName={selectedSchool}
          loggedInUserEmail={loggedInUserEmail}
          onRequestClose={closeRequestAccessModal}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
};

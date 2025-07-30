// components/Modal.js
const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg shadow-lg w-11/12 p-4">
          <button className="text-right text-red-500 text-2xl" onClick={onClose}>
            &times;
          </button>
          <div className="mt-4">{children}</div>
        </div>
      </div>
    );
  };
  
  export default Modal;
  
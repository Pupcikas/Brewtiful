// src/components/Modal.js
import React, { useEffect } from "react";
import { FaTimes } from "react-icons/fa";

function Modal({ isOpen, onClose, title, children }) {
  // Close modal on Escape key press
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      aria-modal="true"
      role="dialog"
      aria-labelledby="modal-title"
    >
      <div className="bg-white rounded-lg shadow-lg w-11/12 md:w-1/2 lg:w-1/3 p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 transition-colors duration-300"
          aria-label="Close Modal"
        >
          <FaTimes size={20} />
        </button>

        {/* Modal Title */}
        {title && (
          <h2
            id="modal-title"
            className="text-xl font-semibold mb-4 text-primary"
          >
            {title}
          </h2>
        )}

        {/* Modal Content */}
        <div>{children}</div>
      </div>
    </div>
  );
}

export default Modal;

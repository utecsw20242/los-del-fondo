import React from 'react';
import '../styles/pages/confirm-modal.scss';

const ConfirmModal = ({ message, onConfirm, onCancel, children }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>{message}</h3>
        {children}
        <div className="modal-buttons">
          <button onClick={onConfirm}>Confirm</button>
          <button onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;


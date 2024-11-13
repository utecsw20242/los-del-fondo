import React from 'react';
import '../styles/pages/file-view.scss';

const FileView = ({file}) => {
  return (
    <div className="file-view">
      {file ? (
      <>
        <img src={file.url} alt={file.name} />
        <div className="image">
          <p>Name: {file.name}</p>
          <p>Type: {file.type}</p>
          <p>Size: {(file.size / 1024).toFixed(2)} KB</p>
        </div>
        <div className="action-buttons">
        <div className="info">
          <button>Check File</button>
          <button>Check Project</button>
        </div>
        <div className="crud-buttons">
          <button>Help</button>
          <button>Delete</button>
        </div>
      </div>
      <div className="ai-content">
        <p>AI Content</p>
        <button>Download</button>
      </div>
      </>
      ): (
        <p>No file selected</p>
      )}
    </div>
  );
};

export default FileView;

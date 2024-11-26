import React from 'react';
import '../styles/pages/file-view.scss';

const FileView = ({file}) => {
  let score =0;
  if (file){
    const maxVal = Math.max(file.doorNumber, file.windowNumber, file.textNumber);
    score = ((file.doorNumber * 5 + file.windowNumber * 4 + file.textNumber)/(5*maxVal + 4*maxVal + maxVal))*100;
  }
  return (
    <div className="file-view">
      {file ? (
      <>
        <img src={`http://localhost:4000${file.image}`} alt={file.surname} />
        <div className="image">
          <p>File Name: {file.surname}</p>
          <p>This image has {file.doorNumber} doors, {file.windowNumber} windows and {file.textNumber} texts.</p>
          <p> The scores are 5,4 and 1 respectively. So the current score is: {score} %</p>
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
        <p>Please, press one click in a file</p>
      )}
    </div>

  );
};

export default FileView;
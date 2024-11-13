import React from 'react';
import FolderItem from './FolderItem';

const FolderList = ({ folders }) => {
  return (
    <div className="folder-list">
      {folders.map((folder) => (
        <FolderItem key={folder.id} folder={folder} />
      ))}
    </div>
  );
};

export default FolderList;

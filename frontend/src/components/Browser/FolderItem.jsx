import React , {useState} from 'react';

const FolderItem = ({ folder, level = 0, onEditSurname, onAddNestedProject, onDeleteProject, handleFileImport }) => {
    const [isOpen, setIsOpen] = useState(true);
    const [isEditingSurname, setIsEditingSurname] = useState(false);
    const [surname, setSurname] = useState(folder.surname || folder.name);
    const nestedProjects = folder.nestedProjects || [];
    const files = folder.files || [];
  
    const toggleOpen = () => setIsOpen(!isOpen);
    const handleDoubleClick = () => setIsEditingSurname(true);
    const handleBlur = () => {
        setIsEditingSurname(false);
        onEditSurname(folder._id, surname);
    };
    const handleDeleteFile = (fileId) => {};

    return (
      <div style={{ marginLeft: `${level * 20}px` }} className="folder-item">
        <div>
            <span onClick={toggleOpen} >
                {isOpen ? " ▼ " : " ► "} {""}
            </span>
            <span onDoubleClick={() => {handleDoubleClick()}}>
                {isEditingSurname ? (
                    <input
                        type="text"
                        value={surname}
                        onChange={(e) => setSurname(e.target.value)}
                        onBlur={handleBlur}
                        autoFocus
                    />
                ) : (
                    surname
                )}
            </span>
            <button onClick={() => onAddNestedProject(folder._id)}> + </button>
            <button onClick={() => onDeleteProject(folder._id)}> - </button>
            <button onClick={() => handleFileImport(folder._id)}> ↥ </button>
        </div>
        {isOpen && (
          <>
            {files.length > 0 && (
              <div className="file-list">
                {files.map((file, idx) => (
                  <div key={file._id || idx} className="file-item">
                    <span>File: {file.name || "Untitled"}</span>
                    <button onClick={() => handleDeleteFile(file._id)}>Delete</button>
                  </div>
                ))}
              </div>
            )}
            {nestedProjects.length > 0 && (
              <div className="nested-projects">
                {nestedProjects.map((nestedFolder) => (
                  <FolderItem 
                    key={nestedFolder._id}
                    folder={nestedFolder} 
                    level={level + 1} 
                    onEditSurname={onEditSurname}
                    onAddNestedProject={onAddNestedProject}
                    onDeleteProject={onDeleteProject}
                    handleFileImport={handleFileImport}
                    handleDeleteFile={handleDeleteFile}
                    />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    );
  };  

export default FolderItem;
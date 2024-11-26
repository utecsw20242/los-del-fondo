import React , {useState, useEffect} from 'react';

const FolderItem = ({ 
  folder, 
  level = 0,
  onEditSurname, 
  onAddNestedProject, 
  onDeleteProject, 
  handleFileImport,
  onDeleteFile,
  fetchFileById,
  onEditFileSurname,
  onFileSelect
}) => {
    const [isOpen, setIsOpen] = useState(true);
    const [isEditingSurname, setIsEditingSurname] = useState(false);
    const [surname, setSurname] = useState(folder.surname || folder.name);
    const [fileDetails, setFileDetails] = useState({});
    const [editingFile, setEditingFile] = useState(null);

    const nestedProjects = folder.nestedProjects || [];
    const files = folder.files || [];
  
    const toggleOpen = () => setIsOpen(!isOpen);
    const handleDoubleClick = () => setIsEditingSurname(true);
    const handleBlur = () => {
        setIsEditingSurname(false);
        onEditSurname(folder._id, surname);
    };
    const fetchAndSetFileDetails = async (fileId) => {
      if (!fileDetails[fileId]) {
        const fileData = await fetchFileById(fileId);
        setFileDetails((prevDetails) => ({
          ...prevDetails,
          [fileId]: fileData.file?.surname || fileId,
        }));
      }
    };
    const handleFileClick = async (fileId) => {
      const fileData = await fetchFileById(fileId);
      onFileSelect(fileData.file);
    };

    useEffect(() => {
      files.forEach((file) => {
        const fileId = typeof file === 'string' ? file : file._id;
        fetchAndSetFileDetails(fileId);
      });
    },[files]);

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
            <div className="files">
              {files.length > 0 && (
                <ul style={{ marginLeft: `${level * 30}px` }}  className = "file-list">
                  {files.map((file, index) => {
                    const fileId = typeof file === 'string' ? file : file._id;
                    return (
                      <li key={fileId} className="file-item">
                      {editingFile === fileId ? (
                        <input
                          type="text"
                          value={fileDetails[fileId] || ''}
                          onChange={(e) =>
                            setFileDetails((prev) => ({
                              ...prev,
                              [fileId]: e.target.value,
                            }))
                          }
                          onBlur={() => {
                            setEditingFile(null);
                            onEditFileSurname(fileId, fileDetails[fileId]);
                          }}
                          autoFocus
                        />
                      ) : (
                        <span
                          onDoubleClick={() => setEditingFile(fileId)}
                          onClick={() => handleFileClick(fileId)}
                        >
                          {fileDetails[fileId] || 'Loading...'}
                        </span>
                      )}
                      <button onClick={() => onDeleteFile(fileId)}>-</button>
                    </li>
                    );
                  })}
                  </ul>
              )}
            </div>
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
                    onDeleteFile={onDeleteFile}
                    fetchFileById={fetchFileById}
                    onEditFileSurname={onEditFileSurname}
                    onFileSelect={onFileSelect}
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
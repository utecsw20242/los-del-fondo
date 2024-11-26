import React, {useState, useEffect} from 'react';
import {useParams} from 'react-router-dom';
import Sidebar from './Sidebar';
import Browser from '../components/Browser/Browser';
import FileView from './FileView';
import '../styles/pages/room.scss';
import { useUser } from '../UserContext';

const token = localStorage.getItem('token');

const Room = ({handleLogout}) => {
  const [token, setToken] = useState(null);
  const {username} = useParams();
  const {userProfile} = useUser();
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileSelect = (file) => {
    setSelectedFile(file);
  }

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    setToken(storedToken);  
  },[]);

  useEffect(() => {
    if(!userProfile || userProfile?.username !== username) {
      alert('You are not authorized to view this page');
    }
  }, [userProfile, username]);

  if (!userProfile || userProfile?.username !== username || !token) {
    return null;
  }
  
  return (
    <div className="room">
      <Sidebar handleLogout={handleLogout}/>
      <Browser onFileSelect={handleFileSelect} userId={userProfile.id} token={token}/>
      <FileView file={selectedFile} />
    </div>
  );
};

export default Room;
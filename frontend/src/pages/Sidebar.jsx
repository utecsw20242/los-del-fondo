import React from 'react';
import { useNavigate } from 'react-router-dom'; 
import profileIcon from '../assets/profile-user.svg';
import archiveIcon from '../assets/box.svg';
import markdownIcon from '../assets/bookmark.svg';
import trashIcon from '../assets/trash-bin.svg';
import configIcon from '../assets/setting.svg';
import modeIcon from '../assets/day.svg';
import logoutIcon from '../assets/log-out.svg';
import '../styles/pages/sidebar.scss';

const Sidebar = ({ handleLogout }) => {
  const navigate = useNavigate(); 

  const signOut = () => {
    handleLogout(); 
    navigate('/'); 
  };

  return (
    <div className="sidebar">
      <div className="user">
        <img src={profileIcon} alt="Profile" />
        <img src={archiveIcon} alt="Archive" />
        <img src={markdownIcon} alt="Markdown" />
        <img src={trashIcon} alt="Trash" />
      </div>
      <div className="settings">
        <img src={configIcon} alt="Configuration" />
        <img src={modeIcon} alt="Dark/White Mode" />
        <img 
          src={logoutIcon} 
          alt="Logout" 
          onClick={signOut}
        />
      </div>
    </div>
  );
};

export default Sidebar;


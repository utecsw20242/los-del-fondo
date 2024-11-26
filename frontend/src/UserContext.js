import React, { createContext, useContext, useState, useEffect } from 'react';
const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userProfile, setUserProfile] = useState(() => {
    const savedProfile = localStorage.getItem('userProfile');
    try {
      return savedProfile ? JSON.parse(savedProfile) : null;
    } catch (err){
      console.error(err);
      return null;
    }
  });

  useEffect(() => {
    if (userProfile) {
      localStorage.setItem('userProfile', JSON.stringify(userProfile));
    } else {
      localStorage.removeItem('userProfile');
    }
  }, [userProfile]);

  const login = (profileData) => setUserProfile(profileData);
  const logout = () => setUserProfile(null);

  return (
    <UserContext.Provider value={{ userProfile, setUserProfile, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
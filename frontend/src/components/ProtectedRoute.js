import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useUser } from '../UserContext';

const ProtectedRoute = ({ children }) => {
  const { userProfile } = useUser();
  const { username } = useParams();
  if (!userProfile || userProfile.username !== username) {
    return <Navigate to="/" />;
  }
  return children;
};

export default ProtectedRoute;
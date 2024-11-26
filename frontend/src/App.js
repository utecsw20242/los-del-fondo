import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate} from 'react-router-dom';
import {UserProvider, useUser} from './UserContext';
import Home from './pages/Home';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Room from './pages/Room';
import Admin from './pages/Admin';
import ForgotPassword from './pages/ForgotPassword';
import ProtectedRoute from '../src/components/ProtectedRoute';
import './styles/main.scss';

function App() {
  return (
    <UserProvider>
      <Router>
        <AppRoutes />
      </Router>
    </UserProvider>
  );
}

const AppRoutes = () => { 
  const {userProfile,logout}=useUser();
  return (
    <div className='app'>
      <Routes>
        <Route path="/" element={userProfile ? <Navigate to={`/room/${userProfile?.username}`} /> : <Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/room/:username" element={<ProtectedRoute><Room handleLogout={logout} /></ProtectedRoute>} />
        <Route path="/admin/:username" element={<ProtectedRoute><Admin handleLogout={logout} /></ProtectedRoute>} />
      </Routes>
    </div>
  );
}
export default App;
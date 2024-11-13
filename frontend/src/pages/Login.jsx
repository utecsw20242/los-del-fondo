import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../UserContext';
import '../styles/pages/login.scss';

function Login() {
  const { login } = useUser();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const navigate = useNavigate();

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.message || 'User login failed');
      } 
      const data = await response.json();
      if(data){
        login(data.body.user);
        localStorage.setItem('token',data.body.token);
        localStorage.setItem('user',JSON.stringify(data.body.user));
        navigate(`/room/${data.body.user.username}`, { state: data.body.user });
      } else {
        alert('User data is missing');
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div className="login-page">
      <div className="form-content">
        <h2>Login</h2>
        <label>Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter your email"
        />
        <label>Password</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter your password"
        />
        <button className="login-button" onClick={handleSubmit}>Log In</button>
        <p className="forgot-password" onClick={handleForgotPassword}>Forgot your password?</p>
      </div>
    </div>
  );
}

export default Login;
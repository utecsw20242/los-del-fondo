import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/pages/forgotpassword.scss';

function ForgotPassword() {
  const  navigate = useNavigate();
  const [email, setEmail] = useState('');

  const handleSubmit = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/users/verify-email', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (response.ok) {
        navigate('/login');
        alert('Your password reset link has been sent to your email.');
      } else {
        alert('There is no account associated with this email.'); 
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again later.');
    }
  };

  return (
    <div className="forgot-password-page">
      <div className="form-content">
        <h1>Reset Your Password</h1>
        <input type="email" placeholder='email@example.com' value={email} onChange={(e) => setEmail(e.target.value)} />
        <button className="reset-button" onClick={handleSubmit}>Reset Password</button>
      </div>
    </div>
  );
}

export default ForgotPassword;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../UserContext';
import '../styles/pages/signup.scss';

const initialFields = [
  { name: 'firstName', placeholder: 'First Name', type: 'text' },
  { name: 'lastName', placeholder: 'Last Name', type: 'text' },
  { name: 'username', placeholder: 'Username', type: 'text' },
  { name: 'age', placeholder: 'Age', type: 'number' },
  { name: 'email', placeholder: 'Email', type: 'email' },
  { name: 'password', placeholder: 'Password', type: 'password' },
  { name: 'confirmPassword', placeholder: 'Confirm Password', type: 'password' },
  { name: 'phone', placeholder: 'Phone Number', type: 'tel' }
];

function SignUp({ onSignUp }) {
  const { login } = useUser();
  const [formData, setFormData] = useState({});
  const [fields] = useState(initialFields);
  const navigate = useNavigate();

  const fillData = () => {
    for (const field of fields) {
      if (!formData[field.name]) {
        alert('Please, complete all the information');
        return false;
      }
    }
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async () => {
    if (fillData()) {
      const profileData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        username: formData.username,
        age: formData.age,
        email: formData.email,
        password: formData.password,
        phone_number: formData.phone,
      };

      try {
        const response = await fetch('http://localhost:4000/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(profileData),
        });
  
        if (!response.ok) {
          const errorResponse = await response.json();
          throw new Error(errorResponse.message || 'User registration failed');
        }
        const data = await response.json();
        if(data) {
          console.log('API response:',data);
          login(data.body.user);
          localStorage.setItem('token', data.body.token); 
          localStorage.setItem('user', JSON.stringify(data.body.user));
          navigate(`/room/${data.body.user.username}`, { state: data.body.user });
        } else {
          alert('User data is missing');
        }
      } catch (error) {
        alert(`Error: ${error.message}`);
      }
    }
  };
  
  return (
    <div className="signup-page">
      <div className="form-content">
        {fields.map((field) => (
          <div key={field.name} className="input-group">
            <input
              type={field.type}
              name={field.name}
              placeholder={field.placeholder}
              value={formData[field.name] || ''}
              onChange={handleChange} />
          </div>
        ))}
      </div>
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}

export default SignUp;
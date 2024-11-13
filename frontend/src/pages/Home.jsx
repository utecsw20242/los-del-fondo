import React from 'react';
import { useNavigate} from 'react-router-dom';
import '../styles/pages/home.scss';
const Home = () => {
  const navigate = useNavigate();

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  return (
    <div className="home">
      <div className="home__content">
        <h2>Welcome to,</h2>
        <h1>
          <span>Los Del Fondo</span>
        </h1>

        <div className="button-group">
          <button className="btn btn--sign-up" onClick={() => navigate('/signup')}>Sign Up</button>
          <button className="btn btn--gray" onClick={() => navigate('/login')}>Log in</button>
          <button className="btn btn--google">Log in with Google</button>
          <button className="btn btn--facebook">Log in with Facebook</button>
          <button className="btn btn--apple">Log in with Apple</button>
        </div>

        <p className="forgot-password" onClick={handleForgotPassword}>Don't remember your password?</p>
      </div>
    </div>
  );
};

export default Home;


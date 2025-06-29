import React, { useState, useContext } from 'react';
import { AuthContext } from '../AuthContext';
import user_icon from '../Assets/person.png';
import password_icon from '../Assets/password.png';

const Login = ({ onSwitch, onBack }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const { login, error } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    
    try {
      await login({ username, password });
      // Redirect to home after successful login
      onBack('dashboard');
    } catch (err) {
      setMessage('Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="container">
      <div className="header">
        <div className="text">Login</div>
        <div className="underline"></div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="inputs">
          <div className="input">
            <img src={user_icon} alt="user" />
            <input 
              type="text" 
              placeholder="Username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="input">
            <img src={password_icon} alt="password" />
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        {message && <div className="error-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}

        <div className="submit-container">
          <button type="submit" className="submit">Login</button>
          <p>Don't have an account? <span className="link" onClick={onSwitch}>Register</span></p>
          <button type="button" className="home-button" onClick={onBack}>← Back to Home</button>
        </div>
      </form>
    </div>
  );
};

export default Login;
import React, { useState, useContext } from 'react';
import { AuthContext } from '../AuthContext';
import user_icon from '../Assets/person.png';
import email_icon from '../Assets/email.png';
import password_icon from '../Assets/password.png'

const Register = ({ onSwitch, onBack }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const { register, error } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setSuccess(false);
    
    try {
      await register({ username, email, password });
      setSuccess(true);
      setMessage('Registration successful! You can now log in.');
      // Clear the form
      setUsername('');
      setEmail('');
      setPassword('');
      
      // Optional: Redirect to login after a short delay
      setTimeout(() => {
        onSwitch();
      }, 2000);
    } catch (err) {
      setMessage('Registration failed. Please try again.');
    }
  };

  return (
    <div className="container">
      <div className="header">
        <div className="text">Register</div>
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
            <img src={email_icon} alt="email" />
            <input 
              type="email" 
              placeholder="Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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

        {message && <div className={success ? "success-message" : "error-message"}>{message}</div>}
        {error && <div className="error-message">{error}</div>}

        <div className="submit-container">
          <button type="submit" className="submit">Register</button>
          <p>Already have an account? <span className="link" onClick={onSwitch}>Login</span></p>
          <button type="button" className="home-button" onClick={onBack}>← Back to Home</button>
        </div>
      </form>
    </div>
  );
};

export default Register;
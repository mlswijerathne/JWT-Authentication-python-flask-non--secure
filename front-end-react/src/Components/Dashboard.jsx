import React, { useContext, useState } from 'react';
import { AuthContext } from './AuthContext';
import './Dashboard.css';

const Dashboard = ({ onLogout }) => {
  const { currentUser, accessToken } = useContext(AuthContext);
  const [showToken, setShowToken] = useState(false);

  // Function to decode JWT without verification (insecure, for display purposes only)
  const decodeJWT = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      return { error: "Invalid token format" };
    }
  };

  // Get token from localStorage to demonstrate it's stored there (vulnerable to XSS)
  const storedToken = localStorage.getItem('accessToken');
  const decodedToken = storedToken ? decodeJWT(storedToken) : null;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">Welcome to Your Dashboard</div>
      <div className="dashboard-details">
        <p><strong>Username:</strong> {currentUser?.username}</p>
        <p><strong>Email:</strong> {currentUser?.email}</p>
        
        <div className="token-section">
          <h3>Authentication Details (Non-Secure Implementation)</h3>
          <p className="warning">⚠️ This demonstrates an insecure authentication implementation</p>
          <p><strong>Token Storage:</strong> localStorage (vulnerable to XSS attacks)</p>
          <p><strong>CSRF Protection:</strong> None (vulnerable to CSRF attacks)</p>
          <p><strong>Token Rotation:</strong> None (vulnerable to token replay attacks)</p>
          
          <button 
            onClick={() => setShowToken(!showToken)}
            className="token-toggle-btn"
          >
            {showToken ? 'Hide Token' : 'Show Token'}
          </button>
          
          {showToken && (
            <div className="token-data">
              <div className="token-raw">
                <h4>Raw JWT Token:</h4>
                <div className="token-container">
                  {storedToken || "No token found"}
                </div>
              </div>
              
              {decodedToken && (
                <div className="token-payload">
                  <h4>Decoded Payload:</h4>
                  <pre>{JSON.stringify(decodedToken, null, 2)}</pre>
                  {decodedToken.exp && (
                    <p><strong>Expires at:</strong> {new Date(decodedToken.exp * 1000).toLocaleString()}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="dashboard-buttons">
        <button onClick={onLogout}>Logout</button>
      </div>
    </div>
  );
};

export default Dashboard;
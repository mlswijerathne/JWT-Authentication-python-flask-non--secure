import React, { useContext, useState } from 'react';
import { AuthContext } from './AuthContext';

const Home = ({ onNavigate }) => {
  const { currentUser, logout } = useContext(AuthContext);
  const [xssResult, setXssResult] = useState(null);

  const handleLogout = async () => {
    await logout();
  };

  // Function to demonstrate JWT token theft via XSS
  const runXssDemonstration = () => {
    // Find if any JWT tokens exist in localStorage
    const stolenTokens = {};
    const possibleKeys = [
      'accessToken', 'access_token', 'jwt', 'token', 'authToken', 
      'auth_token', 'refreshToken', 'refresh_token', 'refresh'
    ];
    
    // Check each potential token key
    for (const key of possibleKeys) {
      const value = localStorage.getItem(key);
      if (value) stolenTokens[key] = value;
    }
    
    // If no specific token keys found, scan all localStorage
    if (Object.keys(stolenTokens).length === 0) {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        stolenTokens[key] = value;
      }
    }
    
    // Set results to display
    if (Object.keys(stolenTokens).length > 0) {
      setXssResult({
        found: true,
        tokens: stolenTokens
      });
    } else {
      setXssResult({
        found: false
      });
    }
  };

  const clearResults = () => {
    setXssResult(null);
  };

  return (
    <div className="home-background">
      <div className="home-content">
        <h1>JWT Security Research Portal</h1>
        <p>Welcome to the research interface.</p>
        
        {currentUser ? (
          <div>
            <p>Welcome back, {currentUser.username}!</p>
            <div className="home-buttons">
              <button onClick={handleLogout}>Logout</button>
              <button 
                onClick={runXssDemonstration} 
                style={{ backgroundColor: '#FF5722', marginLeft: '10px' }}
              >
                Run XSS Demo
              </button>
              {xssResult && (
                <button 
                  onClick={clearResults}
                  style={{ backgroundColor: '#607D8B', marginLeft: '10px' }}
                >
                  Clear Results
                </button>
              )}
            </div>
            
            {/* XSS Demonstration Results Area */}
            {xssResult && (
              <div className="xss-results" style={{
                marginTop: '20px',
                padding: '15px',
                backgroundColor: xssResult.found ? '#FFF0F0' : '#F0F0F0',
                border: `2px solid ${xssResult.found ? '#FF5722' : '#607D8B'}`,
                borderRadius: '5px'
              }}>
                {xssResult.found ? (
                  <>
                    <h3 style={{ color: '#D32F2F' }}>⚠️ XSS VULNERABILITY DEMONSTRATION</h3>
                    <p>Tokens that could be stolen via XSS:</p>
                    <pre style={{
                      backgroundColor: '#F5F5F5',
                      padding: '10px',
                      overflowX: 'auto',
                      borderRadius: '4px',
                      border: '1px solid #E0E0E0'
                    }}>
                      {JSON.stringify(xssResult.tokens, null, 2)}
                    </pre>
                    <p style={{ fontWeight: 'bold' }}>
                      In a real attack, these tokens would be sent to an attacker's server without user knowledge.
                    </p>
          
                  </>
                ) : (
                  <>
                    <h3>No JWT tokens found</h3>
                    <p>
                      Either you are not logged in, or your authentication tokens are stored securely 
                      (not in localStorage).
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="home-buttons">
            <button onClick={() => onNavigate('login')}>Login</button>
            <button onClick={() => onNavigate('register')}>Register</button>
          </div>
        )}
        
        <div className="security-notice" style={{
          marginTop: '30px',
          padding: '10px',
          backgroundColor: '#E8F5E9',
          borderLeft: '4px solid #4CAF50',
          fontSize: '14px'
        }}>
          <p><strong>Security Research Notice:</strong> This portal demonstrates JWT security 
          concepts for educational purposes only. The XSS demonstration shows how tokens 
          stored in localStorage can be vulnerable to Cross-Site Scripting attacks.</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
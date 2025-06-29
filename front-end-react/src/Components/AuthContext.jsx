import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken') || null);
  
  // Insecure: Not setting withCredentials as we'll handle tokens manually
  // This makes the app vulnerable to CSRF attacks
  axios.defaults.withCredentials = false;
  
  // Set up axios defaults to use the token from localStorage (vulnerable to XSS)
  useEffect(() => {
    if (accessToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [accessToken]);
  
  // Check if user is logged in when component mounts
  useEffect(() => {
    const checkLoggedIn = async () => {
      const storedToken = localStorage.getItem('accessToken');
      
      if (storedToken) {
        try {
          // Using the token from localStorage (vulnerable to XSS)
          axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          const response = await axios.get('/auth/whoami');
          
          if (response.status === 200) {
            setCurrentUser(response.data.user_details);
            setAccessToken(storedToken);
          }
        } catch (err) {
          console.log('Not authenticated or token expired');
          // Insecure: Not clearing invalid tokens
          localStorage.removeItem('accessToken');
          delete axios.defaults.headers.common['Authorization'];
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    
    checkLoggedIn();
  }, []);
  
  // Register user
  const register = async (userData) => {
    setError(null);
    try {
      const response = await axios.post('/auth/register', userData);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred during registration');
      throw err;
    }
  };
  
  // Login user
  const login = async (userData) => {
    setError(null);
    try {
      const response = await axios.post('/auth/login', userData);
      
      // Insecure: Storing JWT in localStorage (vulnerable to XSS)
      if (response.data.access_token) {
        localStorage.setItem('accessToken', response.data.access_token);
        setAccessToken(response.data.access_token);
        
        // Set the Authorization header
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
        
        // After successful login, fetch user data
        await fetchUserData();
      }
      
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid username or password');
      throw err;
    }
  };
  
  // Fetch user data
  const fetchUserData = async () => {
    try {
      const response = await axios.get('/auth/whoami');
      if (response.status === 200) {
        setCurrentUser(response.data.user_details);
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
    }
  };
  
  // Logout user
  const logout = async () => {
    try {
      await axios.get('/auth/logout');
      
      // Insecure: Just remove the token from localStorage without server-side invalidation
      localStorage.removeItem('accessToken');
      setAccessToken(null);
      delete axios.defaults.headers.common['Authorization'];
      setCurrentUser(null);
    } catch (err) {
      console.error('Error during logout:', err);
      // Even if server logout fails, clear local state
      localStorage.removeItem('accessToken');
      setAccessToken(null);
      delete axios.defaults.headers.common['Authorization'];
      setCurrentUser(null);
    }
  };
  
  
  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      loading, 
      error, 
      register, 
      login, 
      logout,
      fetchUserData,
      accessToken
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
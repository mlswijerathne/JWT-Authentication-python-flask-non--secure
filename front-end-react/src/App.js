import React, { useState } from 'react';
import './App.css';
import Home from './Components/Home';
import Login from './Components/LoginSingup/Login';
import Register from './Components/LoginSingup/Register';
import { AuthProvider } from './Components/AuthContext';

function App() {
  const [page, setPage] = useState('home');

  const renderPage = () => {
    switch (page) {
      case 'login':
        return <Login onSwitch={() => setPage('register')} onBack={() => setPage('home')} />;
      case 'register':
        return <Register onSwitch={() => setPage('login')} onBack={() => setPage('home')} />;
      default:
        return <Home onNavigate={setPage} />;
    }
  };

  return (
    <AuthProvider>
      <div className="App">{renderPage()}</div>
    </AuthProvider>
  );
}

export default App;
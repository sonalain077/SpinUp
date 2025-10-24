import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();

  const handleUserChoice = (userType) => {
    if (userType === 'user') {
      navigate('/parking-reservation');
    } else if (userType === 'agent') {
      navigate('/agent-dashboard');
    }
  };

  return (
    <div className="home-page">
      <div className="home-container">
        <header className="home-header">
          <h1>Park & See 🚗</h1>
          <p className="subtitle">Système de gestion de stationnement urbain</p>
        </header>
        
        <div className="user-selection">
          <h2>Choisissez votre profil</h2>
          
          <div className="user-buttons">
            <div className="user-card" onClick={() => handleUserChoice('user')}>
              <div className="card-icon">
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" stroke="#4F46E5" strokeWidth="2"/>
                  <path d="M20.5899 22C20.5899 18.13 16.7399 15 11.9999 15C7.25991 15 3.40991 18.13 3.40991 22" stroke="#4F46E5" strokeWidth="2"/>
                </svg>
              </div>
              <h3>Usager</h3>
              <p>Réserver et payer votre place de parking</p>
              <button className="card-button user-button">
                Accéder
              </button>
            </div>

            <div className="user-card" onClick={() => handleUserChoice('agent')}>
              <div className="card-icon">
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#059669" strokeWidth="2"/>
                </svg>
              </div>
              <h3>Agent / Contrôleur</h3>
              <p>Contrôler et gérer les places de parking</p>
              <button className="card-button agent-button">
                Accéder
              </button>
            </div>
          </div>
        </div>

        <footer className="home-footer">
          <p>&copy; 2025 Park & See - Solution de stationnement urbain</p>
        </footer>
      </div>
    </div>
  );
};

export default HomePage;

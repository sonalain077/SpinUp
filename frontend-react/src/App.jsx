import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './components/HomePage';
import ParkingReservation from './components/ParkingReservation';
import Payment from './components/Payment';
import Confirmation from './components/Confirmation';
import MesPlaces from './components/MesPlaces';
import RallongerStationnement from './components/RallongerStationnement';
import ExtensionConfirmation from './components/ExtensionConfirmation';
import AgentDashboard from './components/AgentDashboard';
import './App.css';

function App() {
  const [backendStatus, setBackendStatus] = useState('checking');

  // Vérification du statut du backend au chargement
  useEffect(() => {
    checkBackendConnection();
  }, []);

  const checkBackendConnection = async () => {
    try {
      console.log('🔍 Vérification de la connexion backend...');
      const response = await fetch('http://localhost:8081/health');
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Backend connecté:', data);
        if (data.status === 'UP') {
          setBackendStatus('connected');
        } else {
          setBackendStatus('error');
        }
      } else {
        console.warn('⚠️ Backend répond mais avec erreur:', response.status);
        setBackendStatus('error');
      }
    } catch (error) {
      console.error('❌ Erreur de connexion backend:', error);
      setBackendStatus('disconnected');
    }
  };

  const getStatusInfo = () => {
    switch (backendStatus) {
      case 'connected':
        return { text: '✅ Serveur connecté', className: 'connected' };
      case 'disconnected':
        return { text: '❌ Serveur déconnecté', className: 'disconnected' };
      case 'error':
        return { text: '⚠️ Erreur serveur', className: 'disconnected' };
      default:
        return { text: '🔍 Vérification...', className: 'disconnected' };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <Router>
      <div className="app">
        <div className="status-bar">
          <div className={`connection-status ${statusInfo.className}`}>
            {statusInfo.text}
          </div>
        </div>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/parking-reservation" element={<ParkingReservation />} />
          <Route path="/reservation" element={<Navigate to="/parking-reservation" replace />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/confirmation" element={<Confirmation />} />
          <Route path="/mes-places" element={<MesPlaces />} />
          <Route path="/rallonger-stationnement" element={<RallongerStationnement />} />
          <Route path="/extension-confirmation" element={<ExtensionConfirmation />} />
          <Route path="/agent-dashboard" element={<AgentDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import ParkingReservation from './components/ParkingReservation';
import AgentDashboard from './components/agent/AgentDashboard';
import AgentOverdueControl from './components/AgentOverdueControl';
import Payment from './components/Payment';
import Confirmation from './components/Confirmation';
import Login from './components/Login';
import PrivateRoute from './components/PrivateRoute';
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
      const response = await fetch('http://localhost:8081/api/parking/status');
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Backend connecté:', data);
        setBackendStatus('connected');
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
          <Route path="/reservation" element={<ParkingReservation />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/confirmation" element={<Confirmation />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/agent-dashboard"
            element={
              <PrivateRoute roleRequired={'agent'}>
                <AgentDashboard />
              </PrivateRoute>
            }
          />
          <Route path="/agent/overdue" element={<AgentOverdueControl />} />
          <Route path="/agent" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!username || !password) {
      setError("Veuillez saisir le nom d'utilisateur et le mot de passe.");
      return;
    }

    try {
      const resp = await fetch('http://localhost:8081/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!resp.ok) {
        if (resp.status === 401) setError('Identifiants invalides.');
        else setError('Erreur serveur lors de la connexion.');
        return;
      }

      const data = await resp.json();
      // Save token and role
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userRole', data.role || 'agent');
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('username', username);

      navigate('/agent-dashboard');
    } catch (err) {
      console.error(err);
      setError('Impossible de joindre le serveur.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>Connexion Agent</h2>
        <form onSubmit={handleSubmit} className="login-form">
          <label>
            Nom d'utilisateur
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="agent"
              autoFocus
            />
          </label>

          <label>
            Mot de passe
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="agentpass"
            />
          </label>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="login-submit">Se connecter</button>

          <div className="login-hint">
            Pour démonstration, utilisez <strong>agent / agentpass</strong>.
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;

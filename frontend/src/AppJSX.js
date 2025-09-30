// Application principale Park & See avec JSX
const { useState, useEffect } = React;

const App = () => {
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
        <div className="app">
            <div className="container">
                {/* En-tête de l'application */}
                <header className="app-header">
                    <div className="header-content">
                        <h1>🅿️ Park & See</h1>
                        <p>Gestion intelligente du stationnement urbain</p>
                        <div className={`connection-status ${statusInfo.className}`}>
                            {statusInfo.text}
                        </div>
                    </div>
                </header>

                {/* Contenu principal */}
                <main className="app-main">
                    <ParkingReservation />
                </main>

                {/* Pied de page */}
                <footer className="app-footer">
                    <p>&copy; 2025 Park & See - Phase 1: Parkings publics</p>
                    <div className="tech-info">
                        <small>React 18 + Spring Boot + PostgreSQL</small>
                    </div>
                </footer>
            </div>
        </div>
    );
};

// Export global pour utilisation via CDN
window.App = App;
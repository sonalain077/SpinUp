// App principale React pour Park & See
const { useState, useEffect } = React;

const App = () => {
    const [backendConnected, setBackendConnected] = useState(null);

    // Test de connectivité au démarrage
    useEffect(() => {
        const testConnection = async () => {
            const isConnected = await ParkingAPI.testBackend();
            setBackendConnected(isConnected);
            
            if (!isConnected) {
                console.warn('Backend non accessible sur localhost:8081');
            }
        };

        testConnection();
    }, []);

    return React.createElement('div', { className: 'app' },
        React.createElement('div', { className: 'container' },
            React.createElement('header', { className: 'app-header' },
                React.createElement('div', { className: 'header-content' },
                    React.createElement('h1', null, '🚗 Park & See'),
                    React.createElement('p', null, 'Réservation de parking en temps réel'),
                    
                    // Indicateur de connectivité backend
                    backendConnected !== null && React.createElement('div', {
                        className: `connection-status ${backendConnected ? 'connected' : 'disconnected'}`
                    }, 
                        backendConnected 
                            ? '🟢 Backend connecté' 
                            : '🔴 Backend déconnecté - Vérifiez que le serveur Spring Boot est démarré sur le port 8081'
                    )
                )
            ),

            React.createElement('main', { className: 'app-main' },
                React.createElement(ParkingReservation)
            ),

            React.createElement('footer', { className: 'app-footer' },
                React.createElement('p', null, 'Park & See - Phase 1 : Stationnement en parkings publics'),
                React.createElement('p', { className: 'tech-info' }, 
                    'Frontend: React • Backend: Spring Boot • Développé avec ❤️'
                )
            )
        )
    );
};

// Rendu de l'application
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App));
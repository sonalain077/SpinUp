// Index.js - Point d'entrée principal pour notre application React
const { StrictMode } = React;
const { createRoot } = ReactDOM;

// Fonction principale pour initialiser l'application
function initializeApp() {
    console.log('🚀 Initialisation de l\'application Park & See React');
    
    // Sélection de l'élément root
    const rootElement = document.getElementById('root');
    
    if (!rootElement) {
        console.error('❌ Élément #root non trouvé dans le DOM');
        return;
    }
    
    // Création du root React 18
    const root = createRoot(rootElement);
    
    try {
        // Rendu de l'application avec StrictMode
        root.render(
            React.createElement(StrictMode, null,
                React.createElement(App)
            )
        );
        console.log('✅ Application React initialisée avec succès');
    } catch (error) {
        console.error('❌ Erreur lors du rendu de l\'application:', error);
        
        // Fallback en cas d'erreur
        rootElement.innerHTML = `
            <div style="
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                padding: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            ">
                <h1>❌ Erreur de chargement</h1>
                <p>Impossible de charger l'application React.</p>
                <p>Veuillez vérifier la console pour plus de détails.</p>
                <button onclick="location.reload()" style="
                    margin-top: 20px;
                    padding: 10px 20px;
                    background: white;
                    color: #667eea;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-weight: bold;
                ">Recharger la page</button>
            </div>
        `;
    }
}

// Attendre que tous les scripts soient chargés
window.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM chargé, vérification des dépendances...');
    
    // Vérifier que toutes les dépendances sont chargées
    const checkDependencies = () => {
        const dependencies = {
            'React': typeof React !== 'undefined',
            'ReactDOM': typeof ReactDOM !== 'undefined',
            'App': typeof App !== 'undefined',
            'ParkingReservation': typeof ParkingReservation !== 'undefined',
            'ParkingAPI': typeof ParkingAPI !== 'undefined'
        };
        
        const missing = Object.entries(dependencies)
            .filter(([name, loaded]) => !loaded)
            .map(([name]) => name);
        
        if (missing.length === 0) {
            console.log('✅ Toutes les dépendances sont chargées');
            initializeApp();
        } else {
            console.warn('⏳ Dépendances manquantes:', missing);
            setTimeout(checkDependencies, 100);
        }
    };
    
    checkDependencies();
});

// Export pour utilisation globale
window.ParkAndSeeApp = {
    init: initializeApp
};
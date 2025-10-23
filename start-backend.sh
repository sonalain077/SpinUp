#!/bin/bash
# Script pour lancer le backend Spring Boot avec Maven
# Usage: ./start-backend.sh

echo "=========================================="
echo "  DÉMARRAGE BACKEND PARK & SEE"
echo "=========================================="
echo ""

# Configuration des chemins Windows dans Git Bash
export JAVA_HOME="/c/Users/kerie/tools/jdk-17.0.12+7"
export PATH="$JAVA_HOME/bin:$PATH"
export MAVEN_HOME="/c/Users/kerie/tools/apache-maven-3.9.9"
export PATH="$MAVEN_HOME/bin:$PATH"

# Vérifier que Java 17 est disponible
if ! command -v java &> /dev/null; then
    echo "❌ Java non trouvé !"
    echo "   Vérifiez que Java 17 JDK est installé dans : C:/Users/kerie/tools/jdk-17.0.12+7"
    exit 1
fi

JAVA_VERSION=$(java -version 2>&1 | head -n 1)
echo "✅ Java détecté : $JAVA_VERSION"

# Vérifier la version Java (doit être 17+)
if [[ ! "$JAVA_VERSION" =~ "17" ]]; then
    echo "⚠️  Attention : Le projet nécessite Java 17, mais une autre version est détectée"
    echo "   Configuré pour utiliser : $JAVA_HOME"
fi

# Vérifier que Maven est disponible
if ! command -v mvn &> /dev/null; then
    echo "❌ Maven non trouvé !"
    echo "   Vérifiez que Maven est installé dans : C:/Users/kerie/tools/apache-maven-3.9.9"
    exit 1
fi

echo "✅ Maven détecté : $(mvn -version 2>&1 | head -n 1)"
echo ""

# Aller dans le dossier backend
cd backend

echo "🚀 Lancement du backend sur http://localhost:8081"
echo "   Appuyez sur Ctrl+C pour arrêter"
echo ""

# Lancer Spring Boot
mvn spring-boot:run -Dmaven.test.skip=true

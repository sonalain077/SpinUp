#!/bin/bash
# Script pour lancer le backend Spring Boot avec Maven
# Usage: ./start-backend.sh

echo "=========================================="
echo "  DÉMARRAGE BACKEND PARK & SEE"
echo "=========================================="
echo ""

# Configuration Java 17
export JAVA_HOME="C:/Users/kerie/tools/jdk-17.0.12+7"
export PATH="$JAVA_HOME/bin:$PATH"

# Aller dans le dossier backend
cd backend

echo "✅ Java configuré : $(java -version 2>&1 | head -n 1)"
echo ""
echo "🚀 Lancement du backend sur http://localhost:8081"
echo "   Appuyez sur Ctrl+C pour arrêter"
echo ""

# Lancer Spring Boot
mvn spring-boot:run -Dmaven.test.skip=true

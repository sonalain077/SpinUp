#!/usr/bin/env bash
# ==========================================
# start-backend-once.sh
# Démarre le backend Spring Boot UNE SEULE FOIS
# Si déjà lancé (port 8081 occupé), ne fait rien
# ==========================================

PORT=8081
PROFILE="dev"

echo "========================================"
echo "  BACKEND SPRING BOOT - MODE DEV"
echo "========================================"
echo ""

# Vérifier si le port 8081 est déjà occupé
if command -v lsof >/dev/null 2>&1; then
    # macOS / Linux avec lsof
    PID=$(lsof -ti :$PORT 2>/dev/null | head -n 1)
elif command -v netstat >/dev/null 2>&1; then
    # Linux avec netstat
    PID=$(netstat -tlnp 2>/dev/null | grep ":$PORT " | awk '{print $7}' | cut -d'/' -f1 | head -n 1)
else
    # WSL ou autre - on suppose que le port n'est pas occupé
    PID=""
fi

if [ -n "$PID" ]; then
    echo "✅ Backend already running on port $PORT (PID $PID)"
    echo "   No need to start again."
    echo ""
    echo "   To stop it: kill $PID"
    echo ""
    exit 0
fi

echo "🚀 Starting backend on port $PORT with profile '$PROFILE'..."
echo ""

# Se déplacer dans le dossier backend
cd "$(dirname "$0")/../backend" || exit 1

# Utiliser Maven wrapper si disponible, sinon Maven global
if [ -f "./mvnw" ]; then
    echo "   Using Maven Wrapper..."
    ./mvnw -Dspring-boot.run.profiles=$PROFILE -DskipTests spring-boot:run
elif [ -f "./mvnw.cmd" ]; then
    echo "   Using Maven Wrapper (Windows)..."
    ./mvnw.cmd -Dspring-boot.run.profiles=$PROFILE -DskipTests spring-boot:run
else
    echo "   Using system Maven..."
    mvn -Dspring-boot.run.profiles=$PROFILE -DskipTests spring-boot:run
fi

# Installation de Docker Desktop pour Windows

## 📥 Téléchargement

**Lien officiel** : https://www.docker.com/products/docker-desktop/

Ou téléchargement direct : https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe

---

## 🔧 Installation (5 minutes)

### Étape 1 : Exécuter l'installeur

1. Double-cliquer sur **Docker Desktop Installer.exe**
2. Accepter les conditions d'utilisation
3. **Options recommandées** :
   - ✅ Use WSL 2 instead of Hyper-V (recommandé pour Windows 10/11)
   - ✅ Add shortcut to desktop

### Étape 2 : Redémarrage

- L'installation peut nécessiter un **redémarrage de Windows**
- Redémarrer si demandé

### Étape 3 : Premier lancement

1. Ouvrir **Docker Desktop** depuis le menu Démarrer
2. Accepter le Docker Subscription Service Agreement
3. Optionnel : Se connecter avec un compte Docker (gratuit)
4. Attendre que Docker démarre complètement
5. **Vérifier l'icône Docker** dans la barre des tâches :
   - 🟢 Vert = Docker prêt
   - 🟡 Jaune = Docker en cours de démarrage
   - 🔴 Rouge = Erreur

---

## ✅ Vérification de l'installation

Ouvrir **PowerShell** et exécuter :

```powershell
docker --version
```

**Résultat attendu** :
```
Docker version 24.0.x, build xxxxxxx
```

Vérifier Docker Compose :

```powershell
docker compose version
```

**Résultat attendu** :
```
Docker Compose version v2.x.x
```

---

## 🚀 Test Rapide

Tester Docker avec un conteneur Hello World :

```powershell
docker run hello-world
```

**Résultat attendu** :
```
Hello from Docker!
This message shows that your installation appears to be working correctly.
```

---

## 🎯 Lancer Park & See

Maintenant que Docker est installé, retourner au projet :

```powershell
cd C:\Users\kerie\Documents\Capgemini2\SpinUp
docker compose up -d --build
```

**Première fois** : Docker va télécharger les images (PostgreSQL, Maven, Java). Cela peut prendre 5-10 minutes.

**Vérifier que le backend fonctionne** :
```powershell
docker compose logs -f backend
```

Attendre le message :
```
Started BackendApplication in X seconds
Tomcat started on port(s): 8081 (http)
```

**Tester l'API** :
```powershell
curl http://localhost:8081/api/agent/overdue/stats
```

---

## 🐛 Problèmes Courants

### "WSL 2 installation is incomplete"

**Solution** :
1. Installer WSL 2 manuellement :
   ```powershell
   wsl --install
   ```
2. Redémarrer Windows
3. Relancer Docker Desktop

### "Docker Engine stopped"

**Solution** :
1. Fermer Docker Desktop complètement
2. Redémarrer Docker Desktop
3. Attendre que l'icône devienne verte

### "Hyper-V not available"

**Solution** :
- Utiliser WSL 2 à la place (recommandé)
- Ou activer Hyper-V dans les fonctionnalités Windows (Windows Pro/Enterprise uniquement)

---

## 📚 Ressources

- Documentation officielle : https://docs.docker.com/desktop/
- Tutoriels Docker : https://docs.docker.com/get-started/
- Support communautaire : https://forums.docker.com/

---

**Prêt à démarrer** ? Retourner au [README.md](./README.md) pour lancer Park & See !

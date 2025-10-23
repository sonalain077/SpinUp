@echo off
echo Configuration des outils Java et Maven...

set JAVA_HOME=C:\Users\kerie\tools\jdk-17.0.12+7
set MAVEN_HOME=C:\Users\kerie\tools\apache-maven-3.9.9
set PATH=%JAVA_HOME%\bin;%MAVEN_HOME%\bin;%PATH%

echo JAVA_HOME: %JAVA_HOME%
echo MAVEN_HOME: %MAVEN_HOME%
echo.

echo Verification de Java:
java -version
echo.

echo Verification de Maven:
mvn -version
echo.

echo Lancement du backend Spring Boot...
echo Le serveur sera disponible sur: http://localhost:8081
echo Base de donnees: H2 en memoire (mode developpement)
echo.
echo Appuyez sur Ctrl+C pour arreter le serveur
echo.

mvn spring-boot:run
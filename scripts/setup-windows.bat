@echo off
setlocal EnableExtensions

set "ROOT=%~dp0.."
pushd "%ROOT%" >nul || (
    echo [ERREUR] Impossible d'acceder a la racine du projet.
    exit /b 1
)

echo.
echo ==========================================
echo   DataShare - Installation locale Windows
echo ==========================================
echo.

echo [1/6] Verification des prerequis...

where java >nul 2>&1 || (
    echo [ERREUR] Java est introuvable.
    goto :error
)

where mvn >nul 2>&1 || (
    echo [ERREUR] Maven est introuvable.
    goto :error
)

where node >nul 2>&1 || (
    echo [ERREUR] Node.js est introuvable.
    goto :error
)

where npm >nul 2>&1 || (
    echo [ERREUR] npm est introuvable.
    goto :error
)

where docker >nul 2>&1 || (
    echo [ERREUR] Docker est introuvable.
    goto :error
)

docker compose version >nul 2>&1 || (
    echo [ERREUR] Docker Compose est introuvable.
    goto :error
)

echo [OK] Prerequis detectes.
echo.

echo [2/6] Verification de la configuration...

if not exist ".env" (
    if not exist ".env.example" (
        echo [ERREUR] .env.example est introuvable.
        goto :error
    )

    copy /Y ".env.example" ".env" >nul

    echo.
    echo [ACTION REQUISE]
    echo Le fichier .env vient d'etre cree a partir de .env.example.
    echo Modifiez POSTGRES_PASSWORD et JWT_SECRET avec de vraies valeurs locales,
    echo puis relancez ce script.
    echo.
    popd >nul
    exit /b 2
)

for /f "usebackq eol=# tokens=1,* delims==" %%A in (".env") do (
    set "%%A=%%B"
)

for %%V in (POSTGRES_DB POSTGRES_USER POSTGRES_PASSWORD JWT_SECRET) do (
    if not defined %%V (
        echo [ERREUR] La variable %%V est absente du fichier .env.
        goto :error
    )
)

if /I "%POSTGRES_PASSWORD%"=="change_me" (
    echo [ERREUR] POSTGRES_PASSWORD utilise encore la valeur d'exemple.
    echo Modifiez le fichier .env puis relancez le script.
    goto :error
)

findstr /X /C:"JWT_SECRET=MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=" ".env" >nul

if not errorlevel 1 (
    echo [ERREUR] JWT_SECRET utilise encore la valeur d'exemple publique.
    echo Modifiez le fichier .env puis relancez le script.
    goto :error
)

docker compose config >nul 2>&1 || (
    echo [ERREUR] La configuration Docker Compose est invalide.
    goto :error
)

echo [OK] Configuration locale valide.
echo.

echo [3/6] Demarrage de PostgreSQL...

docker compose up -d postgres

if errorlevel 1 (
    echo [ERREUR] PostgreSQL n'a pas pu etre demarre.
    goto :error
)

echo [OK] Conteneur PostgreSQL demarre.
echo.

echo [4/6] Installation des dependances front-end...

pushd "frontend" >nul || goto :error

cmd /d /c "npm ci"
set "NPM_EXIT=%ERRORLEVEL%"

if not "%NPM_EXIT%"=="0" (
    popd >nul
    echo.
    echo [ERREUR] npm ci a echoue avec le code %NPM_EXIT%.
    echo Fermez tout serveur Angular, test Vitest ou autre processus Node
    echo utilisant le dossier frontend, puis relancez le script.
    goto :error
)

popd >nul

echo [OK] Dependances front-end installees.
echo.

echo [5/6] Preparation du back-end...

pushd "backend" >nul || goto :error

call mvn -DskipTests package

if errorlevel 1 (
    popd >nul
    echo [ERREUR] La preparation Maven a echoue.
    goto :error
)

popd >nul

echo [OK] Back-end compile.
echo.

echo [6/6] Installation terminee.
echo.
echo Pour lancer DataShare :
echo.
echo Consultez d'abord README.md, section Configuration,
echo afin de charger les variables du fichier .env dans le terminal back-end.
echo.
echo Ensuite :
echo.
echo   Terminal back-end :
echo   cd backend
echo   mvn spring-boot:run
echo.
echo   Terminal front-end :
echo   cd frontend
echo   npm start
echo.
echo Application : http://localhost:4200
echo API         : http://localhost:8080
echo.
echo Le schema PostgreSQL sera synchronise au demarrage du back-end
echo via la configuration Hibernate de l'application.
echo.

popd >nul
exit /b 0

:error
echo.
echo Installation interrompue.
popd >nul
exit /b 1

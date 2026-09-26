@echo off
setlocal EnableExtensions

set "ROOT=%~dp0.."
pushd "%ROOT%" >nul || (
    echo [ERREUR] Impossible d'acceder a la racine du projet.
    exit /b 1
)

echo.
echo ==========================================
echo   DataShare - PostgreSQL local
echo ==========================================
echo.

if not exist ".env" (
    echo [ERREUR] Le fichier .env est introuvable.
    echo Copiez .env.example vers .env et renseignez vos valeurs locales.
    goto :error
)

for /f "usebackq eol=# tokens=1,* delims==" %%A in (".env") do (
    set "%%A=%%B"
)

for %%V in (POSTGRES_DB POSTGRES_USER POSTGRES_PASSWORD) do (
    if not defined %%V (
        echo [ERREUR] La variable %%V est absente du fichier .env.
        goto :error
    )
)

if /I "%POSTGRES_PASSWORD%"=="change_me" (
    echo [ERREUR] POSTGRES_PASSWORD utilise encore la valeur d'exemple.
    goto :error
)

echo Demarrage de PostgreSQL...

docker compose up -d postgres

if errorlevel 1 (
    echo [ERREUR] Docker Compose n'a pas pu demarrer PostgreSQL.
    goto :error
)

echo Attente de PostgreSQL...

for /L %%I in (1,1,20) do (
    docker exec datashare-postgres pg_isready -U "%POSTGRES_USER%" -d "%POSTGRES_DB%" >nul 2>&1

    if not errorlevel 1 goto :database_ready

    timeout /t 1 /nobreak >nul
)

echo [ERREUR] PostgreSQL n'est pas devenu disponible dans le delai attendu.
goto :error

:database_ready
echo.
echo [OK] PostgreSQL est disponible.
echo.

docker compose ps postgres

echo.
echo Le back-end DataShare peut maintenant etre lance.
echo Le schema applicatif sera synchronise par Hibernate au demarrage.
echo.

popd >nul
exit /b 0

:error
echo.
echo Verification de la base interrompue.
popd >nul
exit /b 1

# DataShare

DataShare est une application web de partage temporaire de fichiers réalisée dans le cadre du projet 4 OpenClassrooms « Pilotez le développement d'une application full-stack complète ».

L'application permet à un utilisateur de créer un compte, se connecter, téléverser des fichiers, consulter son historique, supprimer ses propres fichiers et partager un lien public de téléchargement.

## Fonctionnalités principales

- création de compte et authentification ;
- authentification stateless par JWT ;
- téléversement de fichiers jusqu'à 1 Go ;
- génération d'un lien public de téléchargement ;
- expiration configurable, avec une durée maximale de 7 jours ;
- consultation de l'historique des fichiers d'un utilisateur ;
- suppression d'un fichier par son propriétaire ;
- suppression automatique des fichiers expirés et de leurs métadonnées ;
- gestion des états actif / expiré ;
- interface responsive ;
- gestion des principales erreurs côté utilisateur.

Les fonctionnalités avancées optionnelles telles que l'upload anonyme, les tags et le mot de passe associé à un fichier ne font pas partie du MVP retenu.

## Stack technique

### Front-end

- Angular 21
- TypeScript 5.9
- Angular Router
- RxJS
- Vitest
- Playwright

### Back-end

- Java 21
- Spring Boot 4.1.1
- Spring Web
- Spring Security
- Spring Data JPA
- Hibernate
- JJWT 0.13.0
- Tomcat 11.0.26

### Données et infrastructure locale

- PostgreSQL 17
- Docker Compose
- stockage physique des fichiers sur le système de fichiers local
- Git / GitHub

## Architecture générale

```text
Navigateur
    |
    v
Angular / TypeScript
    |
    | REST / JSON
    | Authorization: Bearer <JWT>
    v
Spring Boot / Java
    |
    +------> PostgreSQL
    |        utilisateurs
    |        métadonnées des fichiers
    |
    +------> stockage local
             fichiers téléversés
```

Le front-end appelle l'API Spring Boot via `/api`.

En environnement de développement, le serveur Angular utilise `proxy.conf.json` pour rediriger ces appels vers :

```text
http://localhost:8080
```

## Structure du projet

```text
DataShare/
├── backend/               application Spring Boot
├── frontend/              application Angular
├── scripts/               scripts d'installation et de configuration Windows
├── uploads/               fichiers téléversés localement
├── docker-compose.yml     PostgreSQL local
├── .env                   variables locales non versionnées
├── .env.example           exemple de configuration sans secret réel
├── TESTING.md             stratégie et résultats de tests
├── SECURITY.md            contrôles et scans de sécurité
├── PERF.md                mesures de performance
├── MAINTENANCE.md         procédures de maintenance
├── AI_CODE_REVIEW.md      revue technique du code écrit avec assistance IA
└── README.md              documentation de prise en main
```

Le dossier `uploads/` et le fichier `.env` ne doivent pas être versionnés.

## Prérequis

Pour lancer DataShare localement :

- Java 21 ;
- Maven ;
- Node.js 22 ;
- npm 10 ;
- Docker ;
- Docker Compose ;
- Git.

Angular CLI 21 peut également être installé pour les commandes Angular directes, mais le projet utilise ses dépendances locales via npm.

## Installation assistée sous Windows

Deux scripts sont fournis dans le dossier `scripts/`.

### Préparer et vérifier PostgreSQL

Depuis la racine du projet :

```bat
scripts\database-windows.bat
```

Ce script :

- vérifie la présence du fichier `.env` ;
- charge les variables PostgreSQL ;
- démarre le conteneur PostgreSQL ;
- attend que PostgreSQL soit réellement disponible avec `pg_isready` ;
- affiche l'état du service.

### Préparer l'environnement complet

Depuis la racine du projet :

```bat
scripts\setup-windows.bat
```

Ce script :

- vérifie Java, Maven, Node.js, npm, Docker et Docker Compose ;
- crée `.env` à partir de `.env.example` s'il n'existe pas encore ;
- refuse les valeurs d'exemple pour les secrets ;
- vérifie la configuration Docker Compose ;
- démarre PostgreSQL ;
- installe les dépendances front-end avec `npm ci` ;
- prépare le back-end avec Maven.

Si `.env` vient d'être créé, le script s'arrête volontairement afin de laisser l'utilisateur remplacer les valeurs d'exemple avant de le relancer.

Sous Windows, `npm ci` remplace le contenu de `node_modules`. Il est donc recommandé de fermer tout serveur Angular, test Vitest ou autre processus Node utilisant le dossier `frontend` avant d'exécuter le script.

Lors d'une première installation, `npm ci` peut prendre plusieurs minutes selon la machine et la connexion réseau.

Le script d'installation ne lance pas automatiquement l'application. Après une installation réussie, utiliser les commandes de démarrage du back-end et du front-end décrites ci-dessous.

## Configuration

### 1. Récupérer le projet

```bash
git clone https://github.com/rbhira/DataShare.git
cd DataShare
```

### 2. Créer le fichier `.env`

À la racine du projet, copier :

```text
.env.example
```

vers :

```text
.env
```

Le fichier `.env.example` contient uniquement des valeurs fictives :

```text
POSTGRES_DB=datashare
POSTGRES_USER=datashare
POSTGRES_PASSWORD=change_me
JWT_SECRET=MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=
```

Les valeurs présentes dans `.env.example` sont des exemples publics et ne doivent pas être utilisées comme secrets réels en production.

Le secret JWT doit être une valeur Base64 suffisamment longue. Le back-end décode cette valeur avant de construire la clé de signature JWT.

Ne jamais versionner le fichier `.env` ni un secret réel.

## Démarrage de PostgreSQL

Depuis la racine du projet :

```bash
docker compose up -d
```

Docker Compose démarre PostgreSQL 17 sur le port :

```text
5432
```

La base, l'utilisateur et le mot de passe PostgreSQL sont lus depuis les variables :

```text
POSTGRES_DB
POSTGRES_USER
POSTGRES_PASSWORD
```

Les données PostgreSQL sont conservées dans un volume Docker persistant.

## Chargement des variables d'environnement

Docker Compose lit automatiquement le fichier `.env` situé à la racine.

Le back-end Java doit également recevoir les variables dans son propre environnement d'exécution.

### Windows - Invite de commandes

Depuis la racine du projet :

```bat
for /f "usebackq eol=# tokens=1,* delims==" %A in (".env") do @set "%A=%B"
```

Les variables sont alors disponibles pour les commandes lancées dans cette même fenêtre CMD.

### Windows - PowerShell

Exemple :

```powershell
$env:POSTGRES_DB="datashare"
$env:POSTGRES_USER="datashare"
$env:POSTGRES_PASSWORD="VOTRE_MOT_DE_PASSE_LOCAL"
$env:JWT_SECRET="VOTRE_SECRET_BASE64_LOCAL"
```

Ne pas recopier de secret réel dans Git ou dans la documentation.

## Démarrage du back-end

Après avoir chargé les variables d'environnement :

```bash
cd backend
mvn spring-boot:run
```

Le serveur Spring Boot est accessible par défaut sur :

```text
http://localhost:8080
```

La configuration de développement utilise :

```text
jdbc:postgresql://localhost:5432/${POSTGRES_DB}
```

Hibernate utilise actuellement :

```text
spring.jpa.hibernate.ddl-auto=update
```

Les tables nécessaires sont donc synchronisées avec les entités lors du démarrage du back-end.

## Démarrage du front-end

Dans un autre terminal :

```bash
cd frontend
npm install
npm start
```

L'application Angular est ensuite accessible sur :

```text
http://localhost:4200
```

Le script `npm start` utilise :

```text
ng serve --proxy-config proxy.conf.json
```

## Utilisation

Une fois PostgreSQL, le back-end et le front-end démarrés :

1. ouvrir `http://localhost:4200` ;
2. créer un compte ;
3. se connecter ;
4. téléverser un fichier ;
5. récupérer le lien public généré ;
6. ouvrir ce lien pour consulter et télécharger le fichier ;
7. accéder à « Mon espace » pour consulter ses fichiers ;
8. supprimer un fichier dont on est propriétaire si nécessaire.

Un fichier arrivé à expiration n'est plus téléchargeable.

Un traitement planifié côté back-end supprime également automatiquement les fichiers expirés et leurs métadonnées.

## Commandes utiles

### Tests back-end

Depuis `backend/` :

```bash
mvn test
```

### Tests front-end

Depuis `frontend/` :

```bash
npm test -- --no-watch --no-progress
```

### Couverture front-end

```bash
npx ng test --coverage --no-watch --no-progress --runner-config=vitest.config.ts
```

### Tests end-to-end

```bash
npm run e2e
```

### Build Angular de production

```bash
npm run build
```

## État de validation du projet

Dernière campagne complète validée :

| Contrôle | Résultat |
| --- | --- |
| Tests back-end | 55 / 55 réussis |
| Tests front-end | 55 / 55 réussis |
| Tests E2E | 3 / 3 réussis |
| Couverture lignes back-end | 92,64 % |
| Couverture statements front-end | 76,49 % |
| Couverture branches front-end | 73,82 % |
| Couverture functions front-end | 75,22 % |
| Couverture lines front-end | 76,93 % |
| Build Angular | réussi |

Les détails et procédures sont disponibles dans `TESTING.md`.

## Sécurité

Le projet applique notamment :

- hachage des mots de passe utilisateurs avec BCrypt ;
- authentification JWT ;
- API privée protégée par Spring Security ;
- contrôle du propriétaire pour l'accès et la suppression des fichiers ;
- secrets exclus de Git ;
- restrictions sur certaines extensions considérées dangereuses ;
- limite de taille des fichiers ;
- analyse des dépendances et vulnérabilités.

Les audits et décisions de sécurité sont décrits dans :

```text
SECURITY.md
```

## Performance

Des tests de performance ont été réalisés sur les opérations critiques d'upload et de téléchargement.

Les résultats, métriques, logs et pistes d'amélioration sont documentés dans :

```text
PERF.md
```

## Maintenance

Les procédures concernant :

- la mise à jour des dépendances ;
- les tests après mise à jour ;
- les risques techniques ;
- PostgreSQL ;
- le stockage des fichiers ;
- les logs ;
- les sauvegardes et contrôles ;

sont documentées dans :

```text
MAINTENANCE.md
```

## Utilisation de l'IA

L'US06, consacrée à la suppression d'un fichier, a été retenue pour la traçabilité spécifique de l'utilisation de l'IA.

Les propositions produites avec assistance IA ont été soumises à une supervision humaine comprenant la relecture du code, les tests, le build, les vérifications visuelles, le contrôle réel du stockage local et de PostgreSQL ainsi que la revue Git.

Le rapport détaillé est disponible dans :

```text
AI_CODE_REVIEW.md
```

## Documentation qualité

Les principaux documents présents dans le repository sont :

```text
TESTING.md
SECURITY.md
PERF.md
MAINTENANCE.md
AI_CODE_REVIEW.md
```

Ils regroupent les procédures, résultats, décisions techniques, risques et éléments nécessaires à la maintenance du projet.

## Arrêt de l'environnement local

Pour arrêter PostgreSQL sans supprimer les données :

```bash
docker compose stop
```

Pour supprimer les conteneurs tout en conservant le volume :

```bash
docker compose down
```

La suppression volontaire du volume PostgreSQL efface les données de la base et ne doit être réalisée qu'en connaissance de cause.

## Repository

Projet DataShare :

```text
https://github.com/rbhira/DataShare
```

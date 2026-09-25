# MAINTENANCE.md - DataShare

## 1. Objectif

Ce document décrit les procédures courantes permettant de démarrer, arrêter, contrôler, tester et maintenir l'application DataShare.

Il complète les documents de qualité du projet en donnant les informations nécessaires à une reprise technique de l'application.

Date de dernière mise à jour : 25 septembre 2026.

---

## 2. Composants de l'application

DataShare repose sur les composants suivants :

- frontend Angular ;
- backend Spring Boot / Java 21 ;
- base de données PostgreSQL 17 ;
- stockage local des fichiers dans le dossier `uploads/` ;
- Docker pour PostgreSQL ;
- Maven pour le backend ;
- npm pour le frontend.

Architecture simplifiée :

```text
Navigateur
    |
    v
Angular
    |
 REST / JSON + JWT
    |
    v
Spring Boot
   /     \
  v       v
PostgreSQL   stockage local
             uploads/
```

---

## 3. Variables d'environnement

Les variables nécessaires sont définies dans un fichier `.env` placé à la racine du projet.

Variables utilisées :

```text
POSTGRES_DB
POSTGRES_USER
POSTGRES_PASSWORD
JWT_SECRET
```

Un modèle est fourni dans :

```text
.env.example
```

Exemple :

```text
POSTGRES_DB=datashare
POSTGRES_USER=datashare
POSTGRES_PASSWORD=change_me
JWT_SECRET=replace_with_a_long_random_secret
```

Le fichier `.env` contenant les vraies valeurs est exclu de Git.

Il ne doit jamais être ajouté au dépôt.

---

## 4. Démarrage de PostgreSQL

Le fichier utilisé est :

```text
docker-compose.yml
```

Le service PostgreSQL utilise :

```text
postgres:17
```

Le conteneur est nommé :

```text
datashare-postgres
```

Depuis la racine du projet :

```bash
docker compose up -d
```

Vérifier son état :

```bash
docker ps
```

Le conteneur doit apparaître avec un état `Up`.

Si le conteneur existe mais est arrêté :

```bash
docker start datashare-postgres
```

Pour afficher également les conteneurs arrêtés :

```bash
docker ps -a
```

---

## 5. Chargement des variables d'environnement sous Windows CMD

Avant de démarrer le backend depuis une nouvelle fenêtre CMD, charger les variables du fichier `.env`.

Depuis la racine de DataShare :

```bat
for /f "usebackq eol=# tokens=1,* delims==" %A in (".env") do @set "%A=%B"
```

Cette commande charge les variables uniquement dans la fenêtre CMD courante.

Pour vérifier leur présence sans afficher leurs valeurs :

```bat
if defined JWT_SECRET (echo JWT_SECRET = OK) else (echo JWT_SECRET = MANQUANT)
if defined POSTGRES_DB (echo POSTGRES_DB = OK) else (echo POSTGRES_DB = MANQUANT)
if defined POSTGRES_USER (echo POSTGRES_USER = OK) else (echo POSTGRES_USER = MANQUANT)
if defined POSTGRES_PASSWORD (echo POSTGRES_PASSWORD = OK) else (echo POSTGRES_PASSWORD = MANQUANT)
```

Les valeurs sensibles ne doivent pas être affichées ou copiées dans les logs du projet.

---

## 6. Démarrage du backend

Depuis la racine :

```bat
cd backend
```

Puis :

```bat
mvn spring-boot:run
```

Le backend utilise :

```text
http://localhost:8080
```

Lorsque le démarrage est réussi, Spring Boot affiche notamment :

```text
Tomcat started on port 8080
Started DataShareApplication
```

La fenêtre CMD exécutant le backend doit rester ouverte pendant l'utilisation de l'application.

---

## 7. Démarrage du frontend

Dans une autre fenêtre CMD :

```bat
cd frontend
```

Si les dépendances ne sont pas installées :

```bat
npm install
```

Puis :

```bat
npm start
```

Le script `npm start` utilise :

```text
ng serve --proxy-config proxy.conf.json
```

Le frontend est disponible sur :

```text
http://localhost:4200
```

Le proxy Angular redirige les appels :

```text
/api
```

vers :

```text
http://localhost:8080
```

---

## 8. Arrêt de l'environnement

Le frontend et le backend peuvent être arrêtés avec :

```text
Ctrl + C
```

dans leurs fenêtres CMD respectives.

PostgreSQL peut être arrêté avec :

```bash
docker compose stop
```

Pour supprimer le conteneur tout en conservant le volume de données :

```bash
docker compose down
```

Attention :

```bash
docker compose down -v
```

supprime également le volume PostgreSQL.

Cette commande ne doit pas être utilisée sauf si la suppression de la base est volontaire.

---

## 9. Stockage des données

### PostgreSQL

Les données PostgreSQL sont conservées dans le volume Docker :

```text
datashare_postgres_data
```

Le volume permet de conserver les données même après l'arrêt ou la recréation du conteneur.

### Fichiers téléversés

Les fichiers sont stockés localement dans :

```text
uploads/
```

Le backend utilise la configuration :

```text
storage.upload-dir=../uploads
```

Le dossier `uploads/` est exclu du dépôt Git.

Il ne doit pas être utilisé comme stockage versionné.

---

## 10. Sauvegarde de PostgreSQL

Avant une opération importante sur la base, il est recommandé de créer une sauvegarde.

Après chargement des variables du `.env` dans CMD :

```bat
docker exec datashare-postgres pg_dump -U %POSTGRES_USER% -d %POSTGRES_DB% > datashare-backup.sql
```

Le fichier SQL obtenu doit être conservé en dehors du dépôt Git s'il contient des données réelles.

Pour restaurer une sauvegarde dans une base déjà créée :

```bat
type datashare-backup.sql | docker exec -i datashare-postgres psql -U %POSTGRES_USER% -d %POSTGRES_DB%
```

Une restauration doit être réalisée avec prudence afin de ne pas écraser involontairement des données existantes.

---

## 11. Sauvegarde des fichiers téléversés

Les fichiers stockés dans :

```text
uploads/
```

doivent être sauvegardés en même temps que PostgreSQL si une sauvegarde complète de DataShare est nécessaire.

Les métadonnées présentes en base et les fichiers physiques doivent rester cohérents.

Il ne faut donc pas supprimer manuellement un fichier dans `uploads/` sans tenir compte de son enregistrement en base.

---

## 12. Expiration et nettoyage automatique

Les fichiers possèdent une date d'expiration.

Un service de nettoyage automatique recherche les fichiers expirés et supprime :

- le fichier physique ;
- les métadonnées correspondantes en base.

Le nettoyage planifié est exécuté quotidiennement par défaut à :

```text
03:00
```

Le service de nettoyage écrit également des logs permettant de suivre :

- les suppressions réussies ;
- les erreurs de suppression.

En cas d'échec de suppression physique, les métadonnées ne sont pas supprimées afin d'éviter une incohérence silencieuse.

---

## 13. Logs des opérations critiques

Le backend utilise SLF4J pour les logs métier importants.

### Upload

Un upload réussi génère un événement :

```text
event=file_upload_success
```

avec notamment :

```text
sizeBytes
mimeType
durationMs
```

### Téléchargement

Lorsqu'un fichier est prêt à être retourné au client :

```text
event=file_download_ready
```

avec :

```text
sizeBytes
mimeType
durationMs
```

Le backend ne journalise pas dans ces événements :

- le JWT ;
- le mot de passe ;
- le `JWT_SECRET` ;
- le token public de téléchargement ;
- l'adresse email ;
- le nom du fichier.

La durée `file_download_ready` mesure la préparation backend de la réponse, et non la durée complète du transfert réseau.

Les performances de bout en bout sont mesurées avec k6.

---

## 14. Tests backend

Depuis :

```text
backend/
```

lancer :

```bash
mvn test
```

État de référence actuel :

```text
Tests run: 55
Failures: 0
Errors: 0
Skipped: 0
```

Une modification backend ne doit pas être intégrée si elle provoque une régression de cette suite sans justification.

---

## 15. Tests frontend

Depuis :

```text
frontend/
```

les tests Angular peuvent être lancés avec :

```bash
npx ng test --no-watch --no-progress --runner-config=vitest.config.ts
```

Pour produire également la couverture :

```bash
npx ng test --coverage --no-watch --no-progress --runner-config=vitest.config.ts
```

État de référence :

```text
49 tests réussis
```

Couverture actuelle :

```text
Statements : 75.55 %
Branches   : 74.20 %
Functions  : 71.15 %
Lines      : 75.98 %
```

Les quatre indicateurs globaux restent supérieurs à 70 %.

---

## 16. Tests E2E

Les tests end-to-end utilisent Playwright.

Depuis :

```text
frontend/
```

lancer :

```bash
npm run e2e
```

Les scénarios critiques actuellement couverts sont :

1. création d'un compte puis connexion ;
2. téléversement d'un fichier et création d'un lien ;
3. accès public au lien et téléchargement réel du fichier.

État de référence :

```text
3 tests réussis
```

Les tests E2E nécessitent :

- PostgreSQL actif ;
- backend actif ;
- configuration locale fonctionnelle.

Playwright peut démarrer ou réutiliser le serveur frontend selon sa configuration.

---

## 17. Build frontend

Après une modification importante du frontend :

```bat
cd frontend
npm run build
```

Le build doit se terminer sans erreur.

Le résultat est généré dans :

```text
frontend/dist/
```

Ce dossier est exclu de Git.

---

## 18. Audit npm

Depuis :

```text
frontend/
```

lancer :

```bash
npm audit
```

Puis :

```bash
npm audit --omit=dev
```

État de référence après les corrections de sécurité :

```text
0 vulnérabilité
```

Les dépendances de sécurité ne doivent pas être corrigées automatiquement avec `npm audit fix` sans examiner les changements proposés et vérifier les tests après mise à jour.

---

## 19. Audit Trivy

Trivy est utilisé via Docker.

Le dernier audit a été réalisé avec :

```text
Trivy 0.74.0
```

Commande de référence :

```bat
docker run --rm -v "%cd%:/workspace" -v "%USERPROFILE%\.m2\repository:/root/.m2/repository:ro" -v trivy-cache:/root/.cache/trivy aquasec/trivy:latest fs --timeout 15m --offline-scan --scanners vuln,secret,misconfig --skip-dirs /workspace/.git --skip-dirs /workspace/frontend/node_modules --skip-dirs /workspace/frontend/dist --skip-dirs /workspace/backend/target --skip-dirs /workspace/uploads --skip-files /workspace/.env /workspace
```

État de référence :

```text
backend/pom.xml            : 0 vulnérabilité
frontend/package-lock.json : 0 vulnérabilité
```

Le fichier `.env` est explicitement exclu afin que ses valeurs sensibles ne puissent pas apparaître dans la sortie du scan.

---

## 20. Tests de performance

Le script k6 est disponible dans :

```text
performance/k6-upload-download.js
```

Test de charge de référence :

```bat
docker run --rm -i -v "%cd%:/workspace" grafana/k6 run -e VUS=5 -e ITERATIONS=20 -e FILE_SIZE_KB=1024 /workspace/performance/k6-upload-download.js
```

Référence actuelle :

```text
5 utilisateurs virtuels
20 cycles
Fichier de 1 Mo
80 / 80 checks réussis
0 % échec upload
0 % échec téléchargement

Upload p95   : 1.06 s
Download p95 : 956.11 ms
```

Les résultats détaillés sont disponibles dans :

```text
PERF.md
```

---

## 21. Mise à jour des dépendances

Une mise à jour de dépendance doit être réalisée de manière ciblée.

Après une mise à jour frontend :

```text
1. npm audit
2. tests frontend
3. couverture
4. npm run build
5. tests E2E si la modification peut affecter un parcours utilisateur
```

Après une mise à jour backend :

```text
1. mvn test
2. contrôle de l'arbre des dépendances si nécessaire
3. audit Trivy
4. tests E2E si l'API est affectée
```

Une mise à jour de sécurité doit être accompagnée d'une vérification de non-régression.

---

## 22. Diagnostic des problèmes courants

### Port 8080 déjà utilisé

Vérifier le processus utilisant le port :

```bat
netstat -ano | findstr :8080
```

Un deuxième lancement de Spring Boot sur un port déjà utilisé provoque un échec de démarrage.

### Port 4200 déjà utilisé

Cela signifie généralement qu'une instance Angular est déjà active.

Avant d'en lancer une autre, vérifier si le frontend existant est toujours accessible.

### Docker Desktop ne montre pas sa fenêtre

La fenêtre graphique Docker Desktop n'est pas indispensable si le moteur Docker fonctionne.

Vérifier :

```bat
docker version
```

puis :

```bat
docker ps
```

et :

```bat
docker ps -a
```

### PostgreSQL arrêté

Si le conteneur existe :

```bat
docker start datashare-postgres
```

### Variables d'environnement manquantes

Une erreur du type :

```text
Could not resolve placeholder 'JWT_SECRET'
```

signifie que les variables du `.env` ne sont pas chargées dans la fenêtre CMD qui démarre Spring Boot.

Recharger le `.env` avant de lancer le backend.

---

## 23. Contrôles avant intégration d'une modification

Avant de fusionner une modification importante dans `main` :

```text
1. vérifier les fichiers modifiés avec git status ;
2. lancer les tests concernés ;
3. exécuter git diff --check ;
4. vérifier le build si le frontend est affecté ;
5. exécuter les contrôles de sécurité si des dépendances changent ;
6. exécuter les E2E si un parcours critique est affecté ;
7. relire les fichiers préparés avec git diff --cached ;
8. utiliser un commit clair et cohérent ;
9. passer par une Pull Request avant fusion.
```

---

## 24. Documents associés

Les documents suivants complètent cette procédure :

```text
SECURITY.md
PERF.md
```

Les documents suivants sont également prévus dans le cadre de la finalisation du projet :

```text
TESTING.md
README.md
```

---

## 25. Bilan de maintenance

État de référence de DataShare au 25 septembre 2026 :

```text
Backend tests         : 55 / 55 réussis
Frontend tests        : 49 / 49 réussis
E2E                   : 3 / 3 réussis
Couverture frontend   : > 70 % sur les 4 indicateurs
Couverture backend    : > 90 % sur les lignes
npm audit             : 0 vulnérabilité
Trivy backend         : 0 vulnérabilité
Trivy frontend        : 0 vulnérabilité
Performance upload    : 0 % d'échec
Performance download  : 0 % d'échec
```

Toute évolution significative doit être accompagnée des contrôles adaptés afin de conserver cet état de référence.
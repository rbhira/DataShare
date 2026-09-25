# SECURITY.md - DataShare

## 1. Objectif

Ce document décrit les contrôles de sécurité réalisés sur DataShare, les vulnérabilités identifiées pendant l'audit, les corrections appliquées et les points de vigilance restant à suivre.

Date du dernier audit : 25 septembre 2026.

---

## 2. Mesures de sécurité présentes dans l'application

### Authentification et autorisation

- Les mots de passe utilisateurs sont stockés sous forme de hash BCrypt.
- L'authentification repose sur des jetons JWT.
- Les routes sensibles sont protégées côté backend.
- L'API fonctionne en mode stateless.
- La protection CSRF est désactivée dans ce contexte d'API REST utilisant des jetons JWT.
- Les opérations sur les fichiers appartenant à un utilisateur vérifient leur propriétaire côté backend.

### Fichiers

- La taille maximale des fichiers est limitée à 1 Go.
- Certaines extensions considérées comme dangereuses sont refusées.
- Les liens de téléchargement utilisent un token non prédictible.
- Les fichiers expirés sont automatiquement supprimés.
- La suppression manuelle retire le fichier physique et ses métadonnées.

### Base de données

- L'accès à PostgreSQL utilise Spring Data JPA.
- Aucun SQL brut n'est utilisé dans les fonctionnalités actuelles.

### Secrets

Les informations sensibles sont fournies par variables d'environnement :

- POSTGRES_DB
- POSTGRES_USER
- POSTGRES_PASSWORD
- JWT_SECRET

Le fichier `.env` local est exclu du dépôt Git.

Un fichier `.env.example` est fourni sans valeur sensible.

---

## 3. Audit npm

### Audit initial

Commande :

```bash
npm audit
```

Résultat initial :

- 3 vulnérabilités détectées dans les dépendances de développement liées à Vitest.
- 1 vulnérabilité modérée.
- 2 vulnérabilités critiques.

Commande :

```bash
npm audit --omit=dev
```

Résultat :

```text
found 0 vulnerabilities
```

Les dépendances utilisées en production ne présentaient donc aucune vulnérabilité connue lors de cet audit.

### Correction appliquée

Versions initiales :

```text
vitest 4.0.8
@vitest/coverage-v8 4.0.8
@vitest/mocker 4.0.8
```

Versions corrigées :

```text
vitest 4.1.11
@vitest/coverage-v8 4.1.11
@vitest/mocker 4.1.11
```

### Résultat après correction

```text
npm audit
found 0 vulnerabilities
```

```text
npm audit --omit=dev
found 0 vulnerabilities
```

Les 49 tests frontend ont ensuite été exécutés avec succès.

La couverture obtenue après la mise à jour reste :

```text
Statements : 75.55 %
Branches   : 74.20 %
Functions  : 71.15 %
Lines      : 75.98 %
```

Le build Angular de production a également été validé.

---

## 4. Audit Trivy

Trivy 0.74.0 a été exécuté via son image Docker officielle afin d'analyser les dépendances backend et frontend.

Le fichier `.env`, les fichiers téléversés et les dossiers générés ont été exclus du scan.

### Premier scan exploitable

Le scan a détecté trois vulnérabilités critiques dans :

```text
org.apache.tomcat.embed:tomcat-embed-core 11.0.24
```

Vulnérabilités détectées :

```text
CVE-2026-65182
CVE-2026-65905
CVE-2026-68525
```

### Correction appliquée

La version de Tomcat embarquée a été forcée à 11.0.26 dans le `pom.xml` :

```xml
<tomcat.version>11.0.26</tomcat.version>
```

La résolution Maven a confirmé :

```text
tomcat-embed-core       11.0.26
tomcat-embed-websocket  11.0.26
tomcat-embed-el         11.0.26
```

Les tests backend ont ensuite été exécutés :

```text
Tests run: 55
Failures: 0
Errors: 0
Skipped: 0
BUILD SUCCESS
```

### Scan final Trivy

Résultat final :

```text
backend/pom.xml            : 0 vulnérabilité
frontend/package-lock.json : 0 vulnérabilité
```

Aucun secret n'a été signalé dans la sortie du scan.

Le fichier `.env` contenant les valeurs sensibles a été explicitement exclu.

Trivy n'a détecté aucun fichier de configuration applicable à son scanner de mauvaises configurations :

```text
Detected config files: 0
```

---

## 5. Points de vigilance

### Protection contre les attaques XSS

Angular échappe par défaut les valeurs affichées dans les templates.

La revue du frontend n'a identifié aucun usage de `innerHTML`, `bypassSecurityTrust*` ou `eval` dans le code actuel.

Le jeton JWT est cependant stocké dans le `localStorage` du navigateur. Une éventuelle vulnérabilité XSS future pourrait donc permettre l'accès à ce jeton.

Une évolution possible consisterait à utiliser un cookie `HttpOnly`, mais cette modification impliquerait une évolution plus large du mécanisme d'authentification et de la stratégie CSRF. Elle n'a pas été retenue dans le périmètre actuel afin de ne pas introduire de régression dans une authentification déjà fonctionnelle et testée.

### Limitation des requêtes

Aucun mécanisme spécifique de rate limiting n'est actuellement appliqué aux endpoints d'authentification.

Une limitation du nombre de requêtes, notamment sur `/api/auth/login` et `/api/auth/register`, constituerait une amélioration complémentaire contre les tentatives automatisées et le brute force.

Cette protection n'est pas requise dans le périmètre fonctionnel actuel et est conservée comme piste d'amélioration future.

### Autorisations

Le frontend ne constitue pas la frontière principale de sécurité.

Les contrôles d'autorisation, notamment la vérification du propriétaire d'un fichier, restent appliqués côté backend.

---

## 6. État de l'audit

Au terme de l'audit du 25 septembre 2026 :

```text
npm audit                    : 0 vulnérabilité
npm audit --omit=dev         : 0 vulnérabilité
Trivy backend                : 0 vulnérabilité
Trivy frontend               : 0 vulnérabilité
Tests frontend               : 49 / 49 réussis
Tests backend                : 55 / 55 réussis
Build Angular                : réussi
```

Les vulnérabilités identifiées pendant l'audit ont été corrigées sans régression détectée par les suites de tests existantes.
# PERF.md - DataShare

## 1. Objectif

Ce document présente les contrôles de performance réalisés sur DataShare, en particulier sur les deux opérations critiques liées aux fichiers :

- téléversement d'un fichier ;
- téléchargement d'un fichier.

Les tests ont été réalisés avec k6 afin de mesurer les temps de réponse et le taux d'échec de l'API.

Date du dernier test : 27 septembre 2026.

---

## 2. Environnement de test

Les tests ont été réalisés dans l'environnement local de développement de DataShare.

Composants utilisés :

- backend Spring Boot ;
- PostgreSQL exécuté dans Docker ;
- stockage local des fichiers ;
- k6 exécuté dans son image Docker officielle ;
- API accessible directement sur le port 8080.

Version de k6 utilisée :

```text
k6 v2.3.0
```

Les mesures présentées dans ce document correspondent donc à un environnement local.

Elles permettent de détecter des anomalies ou régressions de performance, mais ne constituent pas une garantie de performance en environnement de production.

---

## 3. Scénario de test

Le script utilisé est :

```text
performance/k6-upload-download.js
```

Pour chaque cycle, k6 :

1. utilise un compte authentifié ;
2. téléverse un fichier via `POST /api/files` ;
3. récupère le token de téléchargement créé par l'API ;
4. télécharge le fichier via `GET /api/download/{token}/file` ;
5. vérifie que l'upload a réussi ;
6. vérifie que le token est présent ;
7. vérifie que le téléchargement retourne HTTP 200 ;
8. vérifie que le fichier téléchargé n'est pas vide.

Les mesures spécifiques suivantes sont enregistrées :

```text
datashare_upload_duration
datashare_download_duration
datashare_upload_failed
datashare_download_failed
```

---

## 4. Test fumée

Un premier test a été réalisé avec :

```text
Utilisateurs virtuels : 1
Itérations            : 1
Taille du fichier     : 100 Ko
```

Commande :

```bash
docker run --rm -i -v "%cd%:/workspace" grafana/k6 run -e VUS=1 -e ITERATIONS=1 -e FILE_SIZE_KB=100 /workspace/performance/k6-upload-download.js
```

### Résultats

```text
Checks réussis       : 4 / 4
Échec upload         : 0 %
Échec téléchargement : 0 %

Upload :
  moyenne : 171 ms
  p95     : 171 ms

Téléchargement :
  moyenne : 46.83 ms
  p95     : 46.83 ms
```

Le scénario complet a été exécuté sans erreur.

---

## 5. Test de charge

Un test plus représentatif a ensuite été exécuté avec plusieurs utilisateurs virtuels.

Configuration :

```text
Utilisateurs virtuels : 5
Itérations            : 20
Taille du fichier     : 1 Mo
```

Commande :

```bash
docker run --rm -i -v "%cd%:/workspace" grafana/k6 run -e VUS=5 -e ITERATIONS=20 -e FILE_SIZE_KB=1024 /workspace/performance/k6-upload-download.js
```

### Résultats globaux

```text
Itérations terminées   : 20 / 20
Itérations interrompues: 0

Checks réussis : 80 / 80
Checks échoués : 0 / 80

Échecs HTTP : 0 %

Données envoyées : environ 21 Mo
Données reçues   : environ 21 Mo

Durée totale du scénario : environ 6.2 secondes
```

### Téléversement

```text
Moyenne : 792.17 ms
Minimum : 510.91 ms
Médiane : 850.95 ms
Maximum : 1.15 s
p90     : 1.01 s
p95     : 1.06 s

Taux d'échec : 0 %
```

### Téléchargement

```text
Moyenne : 648.99 ms
Minimum : 409.22 ms
Médiane : 595.94 ms
Maximum : 1.14 s
p90     : 909.79 ms
p95     : 956.11 ms

Taux d'échec : 0 %
```

---

## 6. Interprétation

Sur le scénario local testé :

- les 20 téléversements ont réussi ;
- les 20 téléchargements ont réussi ;
- aucun échec HTTP n'a été observé ;
- le temps p95 d'un upload de 1 Mo reste proche d'une seconde ;
- le temps p95 d'un téléchargement de 1 Mo reste inférieur à une seconde.

Aucun problème de performance bloquant n'a été observé pendant ce scénario.

Ces valeurs servent de référence pour détecter de futures régressions.

Elles ne doivent pas être interprétées comme un engagement de performance en production, car elles dépendent notamment :

- de la machine hôte ;
- des performances du disque ;
- de PostgreSQL ;
- du réseau ;
- du nombre d'utilisateurs simultanés ;
- de la taille des fichiers ;
- de l'environnement de déploiement.

---

## 7. Logs des opérations critiques

Des logs structurés ont été ajoutés aux opérations critiques du backend.

### Upload

Lorsqu'un upload réussit, le backend journalise :

```text
event=file_upload_success
sizeBytes=<taille>
mimeType=<type MIME>
durationMs=<durée>
```

La durée correspond au traitement backend de l'upload jusqu'à la création de la réponse HTTP.

### Téléchargement

Lorsqu'un fichier est prêt à être retourné au client, le backend journalise :

```text
event=file_download_ready
sizeBytes=<taille>
mimeType=<type MIME>
durationMs=<durée>
```

Cette durée correspond à la préparation backend de la réponse.

Elle ne représente pas la durée complète du transfert réseau du fichier.

La durée réelle du téléchargement de bout en bout est mesurée par k6 avec :

```text
datashare_download_duration
```

### Données sensibles

Les logs ajoutés ne contiennent pas :

- de JWT ;
- de mot de passe ;
- de secret d'environnement ;
- de token public de téléchargement ;
- d'adresse email utilisateur ;
- de nom de fichier.

---

## 8. Validation après modification

Après l'ajout des logs de performance, la suite de tests backend a été exécutée.

Résultat :

```text
Tests run: 55
Failures: 0
Errors: 0
Skipped: 0
BUILD SUCCESS
```

Aucune régression n'a été détectée par les tests existants.

---

## 9. Budget de performance frontend

Un budget de performance frontend a été défini avant la mesure finale Lighthouse.

### Budget du bundle

Le projet Angular contient déjà les seuils suivants pour le bundle initial :

```text
Avertissement : 500 kB
Erreur        : 1 MB
```

### Budget navigateur

Les objectifs retenus pour le contrôle Lighthouse sont :

```text
Performance : >= 90 / 100
FCP         : <= 1.8 s
LCP         : <= 2.5 s
TBT         : <= 200 ms
CLS         : <= 0.1
```

Ces valeurs constituent des objectifs internes au projet afin de détecter les régressions. Elles ne correspondent pas à un seuil de validation imposé par le cahier des charges.

---

## 10. Poids du bundle frontend

### Mesure initiale

Avant optimisation des routes, le build de production donnait :

```text
Bundle initial total         : 350.93 kB
Transfert estimé par Angular :  88.78 kB
```

Le bundle respectait déjà le seuil d'avertissement Angular fixé à 500 kB.

### Optimisation mise en place

L'analyse Lighthouse signalait notamment une quantité de JavaScript inutilisé. Les composants associés aux routes étaient alors tous importés directement dans `app.routes.ts`, ce qui les intégrait au chargement initial de l'application.

Une optimisation par chargement différé a donc été mise en place avec `loadComponent` pour les pages secondaires :

- connexion ;
- création de compte ;
- upload ;
- téléchargement ;
- espace utilisateur.

La page d'accueil `Welcome` reste chargée immédiatement afin de ne pas ajouter de requête asynchrone inutile sur le premier écran affiché.

Après optimisation :

```text
Bundle initial total         : 271.20 kB
Transfert estimé par Angular :  75.60 kB
```

Comparaison :

```text
Bundle initial : 350.93 kB -> 271.20 kB
Gain           : 79.73 kB, soit environ 22.7 %

Transfert      : 88.78 kB -> 75.60 kB
Gain           : 13.18 kB, soit environ 14.8 %
```

Angular génère désormais des chunks différés distincts pour les fonctionnalités secondaires.

Le budget de taille reste respecté et le volume de JavaScript nécessaire au chargement initial a été réduit de manière mesurable.

Les 55 tests frontend ont été rejoués après cette modification : 55/55 réussis.

---

## 11. Performance navigateur avec Lighthouse

### Méthode

Les mesures ont été réalisées sur le build Angular de production servi comme contenu statique depuis :

```text
frontend/dist/datashare-frontend/browser
```

Configuration :

```text
Form factor : mobile
Throttling  : simulation Lighthouse
Serveur     : build statique local
```

Les mesures réalisées précédemment sur le serveur de développement Angular ne sont pas retenues.

### Mesure avant optimisation

Résultat de référence :

```text
Performance : 70 / 100
FCP         : 3.30 s
LCP         : 3.30 s
TBT         : 600 ms
CLS         : 0
Speed Index : 3.30 s
```

### Première expérimentation

Une première version a appliqué le lazy loading à toutes les routes, y compris la page d'accueil.

Cette variante a réduit fortement le bundle et le TBT, mais le LCP s'est dégradé. Elle n'a donc pas été conservée telle quelle.

Résultat observé :

```text
Performance : 78 / 100
FCP         : 3.31 s
LCP         : 3.67 s
TBT         : 244 ms
CLS         : 0
Speed Index : 3.31 s
```

Cette mesure a conduit à conserver la page `Welcome` dans le chargement initial et à appliquer le lazy loading uniquement aux pages secondaires.

### Mesure finale après optimisation

Résultat final :

```text
Performance : 82 / 100
FCP         : 2.93 s
LCP         : 3.01 s
TBT         : 315 ms
CLS         : 0.001
Speed Index : 2.93 s
```

Comparaison avec la référence initiale :

```text
Performance : 70 -> 82
FCP         : 3.30 s -> 2.93 s
LCP         : 3.30 s -> 3.01 s
TBT         : 600 ms -> 315 ms
CLS         : 0 -> 0.001
Speed Index : 3.30 s -> 2.93 s
```

La modification apporte donc une amélioration globale mesurable, notamment sur le score Lighthouse, le temps de blocage du thread principal et le poids JavaScript chargé au démarrage.

### Comparaison avec le budget interne

```text
Bundle initial < 500 kB : respecté
Performance >= 90       : non atteint
FCP <= 1.8 s            : non atteint
LCP <= 2.5 s            : non atteint
TBT <= 200 ms           : non atteint
CLS <= 0.1              : respecté
```

Le budget navigateur reste partiellement atteint.

Les objectifs Lighthouse définis dans ce document servent de repères internes et ne correspondent pas à des seuils de validation imposés par le cahier des charges.

### Analyse et suites possibles

L'optimisation retenue réduit le JavaScript chargé au démarrage sans modifier le comportement fonctionnel de l'application.

Les pistes qui restent pertinentes pour une évolution ultérieure sont notamment :

- activer gzip ou Brotli sur le serveur de production ;
- configurer une politique de cache adaptée aux ressources statiques ;
- surveiller l'évolution du bundle Angular ;
- poursuivre le découpage du JavaScript si de nouvelles fonctionnalités sont ajoutées ;
- effectuer les mesures finales dans un environnement réellement déployé.

Le score Lighthouse n'est pas présenté comme un objectif absolu. Les mesures servent avant tout à comparer les versions, identifier les régressions et justifier les décisions d'optimisation.

---

## 12. Bilan

État du contrôle de performance au 27 septembre 2026 :

```text
Backend
-------
Test fumée upload/download        : réussi
Test de charge 5 VUs / 20 cycles : réussi
Checks k6                         : 80 / 80
Échecs upload                     : 0 %
Échecs téléchargement             : 0 %
Upload 1 Mo p95                   : 1.06 s
Download 1 Mo p95                 : 956.11 ms
Logs structurés                   : ajoutés
Tests backend                     : 55 / 55 réussis

Frontend
--------
Tests                             : 55 / 55 réussis
Build de production               : réussi
Bundle initial avant              : 350.93 kB
Bundle initial après              : 271.20 kB
Réduction du bundle initial       : environ 22.7 %
Transfert estimé avant            : 88.78 kB
Transfert estimé après            : 75.60 kB
Lighthouse avant                  : 70 / 100
Lighthouse après                  : 82 / 100
FCP final                         : 2.93 s
LCP final                         : 3.01 s
TBT final                         : 315 ms
CLS final                         : 0.001
Speed Index final                 : 2.93 s
Budget bundle < 500 kB            : respecté
Budget navigateur                 : partiellement atteint
```

Les opérations critiques d'upload et de téléchargement ont été testées sous charge locale sans erreur bloquante.

Le frontend a fait l'objet d'une optimisation réelle par chargement différé des routes secondaires. Cette évolution réduit le bundle initial et améliore plusieurs métriques Lighthouse tout en conservant les 55 tests frontend au vert.

Les résultats constituent une référence mesurée pour le suivi des performances et des futures régressions de DataShare.

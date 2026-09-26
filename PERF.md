# PERF.md - DataShare

## 1. Objectif

Ce document présente les contrôles de performance réalisés sur DataShare, en particulier sur les deux opérations critiques liées aux fichiers :

- téléversement d'un fichier ;
- téléchargement d'un fichier.

Les tests ont été réalisés avec k6 afin de mesurer les temps de réponse et le taux d'échec de l'API.

Date du dernier test : 26 septembre 2026.

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

Le build de production a été généré avec :

```bash
npm run build
```

Résultat :

```text
main JavaScript             : 349.91 kB
styles CSS                  :   1.01 kB
bundle initial total        : 350.93 kB
transfert estimé par Angular:  88.78 kB
```

Le bundle initial de 350.93 kB reste inférieur au seuil d'avertissement Angular fixé à 500 kB.

Le budget de poids du bundle est donc respecté.

---

## 11. Performance navigateur avec Lighthouse

### Méthode

Le build Angular de production situé dans :

```text
frontend/dist/datashare-frontend/browser
```

a été servi comme contenu statique local.

La mesure finale a été réalisée avec Lighthouse sur le build compilé et non sur le serveur de développement Angular.

Configuration Lighthouse :

```text
Form factor       : mobile
Throttling        : simulation Lighthouse
Serveur testé     : build statique local
```

Des mesures préliminaires réalisées sur le serveur Angular de développement ont été écartées après détection de ressources propres à Vite telles que `@vite/client` et `/@fs/`.

Seule la mesure obtenue sur le build statique est retenue ci-dessous.

### Résultats

```text
Performance : 70 / 100
FCP         : 3.3 s
LCP         : 3.3 s
TBT         : 600 ms
CLS         : 0
Speed Index : 3.3 s
```

Diagnostics complémentaires :

```text
Requêtes réseau       : 5
Scripts               : 1
Poids réseau total    : 402.3 kB
Travail main thread   : 467 ms
```

### Comparaison avec le budget

```text
Bundle initial < 500 kB : respecté
Performance >= 90       : non atteint
FCP <= 1.8 s            : non atteint
LCP <= 2.5 s            : non atteint
TBT <= 200 ms           : non atteint
CLS <= 0.1              : respecté
```

Le budget navigateur n'est donc que partiellement atteint sur cette mesure locale mobile simulée.

Le résultat doit cependant être interprété dans le contexte de l'environnement de test.

Lighthouse identifie notamment les pistes suivantes :

```text
Compression des ressources texte : gain potentiel estimé à environ 1200 ms
JavaScript inutilisé              : gain potentiel estimé à environ 750 ms
```

Le serveur statique local utilisé pour le test ne reproduit pas nécessairement la compression gzip ou Brotli d'un serveur de production. Une partie du gain estimé sur la compression dépend donc de la future configuration de déploiement.

La quantité de JavaScript inutilisé constitue une piste d'optimisation réelle. Elle pourrait être réduite en poursuivant le découpage du code et le chargement différé des fonctionnalités lorsque cela est pertinent.

Le CLS de 0 montre qu'aucun déplacement de mise en page significatif n'a été observé pendant le chargement.

### Actions d'optimisation possibles

Les optimisations suivantes pourront être étudiées lors d'une évolution du projet :

- activer gzip ou Brotli sur le serveur ou reverse proxy de production ;
- poursuivre le lazy loading et le découpage du JavaScript si la taille fonctionnelle de l'application augmente ;
- surveiller régulièrement le poids du bundle Angular ;
- relancer Lighthouse dans un environnement proche de la production après configuration du serveur ;
- comparer les nouvelles mesures avec ce budget afin de détecter les régressions.

Aucune modification fonctionnelle supplémentaire n'a été introduite uniquement pour augmenter artificiellement le score Lighthouse. La mesure actuelle sert de référence documentée pour les futures optimisations.

---

## 12. Bilan

État du contrôle de performance au 26 septembre 2026 :

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
Build de production               : réussi
Bundle initial                    : 350.93 kB
Transfert estimé Angular          : 88.78 kB
Budget bundle < 500 kB            : respecté
Lighthouse Performance            : 70 / 100
FCP                               : 3.3 s
LCP                               : 3.3 s
TBT                               : 600 ms
CLS                               : 0
Budget navigateur                 : partiellement atteint
```

Les opérations critiques d'upload et de téléchargement ont été testées sous charge locale sans erreur bloquante.

Le frontend respecte son budget de taille de bundle. La mesure Lighthouse met en évidence des possibilités d'amélioration, principalement sur la compression des ressources et la quantité de JavaScript inutilisé.

Ces résultats fournissent une référence mesurée et documentée permettant de suivre les futures régressions et optimisations de DataShare.

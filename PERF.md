# PERF.md - DataShare

## 1. Objectif

Ce document présente les contrôles de performance réalisés sur DataShare, en particulier sur les deux opérations critiques liées aux fichiers :

- téléversement d'un fichier ;
- téléchargement d'un fichier.

Les tests ont été réalisés avec k6 afin de mesurer les temps de réponse et le taux d'échec de l'API.

Date du dernier test : 25 septembre 2026.

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

## 9. Bilan

État du contrôle de performance au 25 septembre 2026 :

```text
Test fumée upload/download       : réussi
Test de charge 5 VUs / 20 cycles: réussi
Checks k6                        : 80 / 80
Échecs upload                    : 0 %
Échecs téléchargement            : 0 %
Upload 1 Mo p95                  : 1.06 s
Download 1 Mo p95                : 956.11 ms
Logs structurés                  : ajoutés
Tests backend                    : 55 / 55 réussis
```

Le scénario critique d'upload et de téléchargement a donc été testé sous charge locale sans erreur ni anomalie bloquante observée.
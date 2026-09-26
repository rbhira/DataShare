# TESTING.md - DataShare

## 1. Objectif

Ce document décrit la stratégie de test appliquée au projet DataShare et rassemble les résultats obtenus lors de la validation de l'application.

Les objectifs sont :

- vérifier les fonctionnalités critiques ;
- prévenir les régressions ;
- contrôler les comportements backend et frontend ;
- tester les principaux parcours utilisateur de bout en bout ;
- mesurer la couverture automatisée ;
- conserver des commandes reproductibles pour la maintenance du projet.

Date de référence : 25 septembre 2026.

---

## 2. Périmètre de test

Les tests couvrent les fonctionnalités principales du MVP DataShare :

- création de compte ;
- authentification ;
- génération et utilisation du JWT ;
- upload d'un fichier ;
- création d'un lien public de téléchargement ;
- consultation des métadonnées d'un fichier partagé ;
- téléchargement d'un fichier ;
- consultation des fichiers appartenant à l'utilisateur ;
- suppression manuelle d'un fichier ;
- contrôle du propriétaire lors de la suppression ;
- suppression physique du fichier ;
- expiration des fichiers ;
- nettoyage automatique des fichiers expirés ;
- gestion des erreurs principales côté frontend.

Les fonctionnalités optionnelles non implémentées ne font pas partie du périmètre de validation du MVP.

---

## 3. Stratégie de test

La validation repose sur plusieurs niveaux complémentaires.

| Niveau | Objectif | Outil principal | État |
|---|---|---|---|
| Backend | Tester la logique métier, les contrôleurs et les services | JUnit / Spring Boot | ✅ |
| Frontend | Tester composants et services Angular | Vitest / Angular Test | ✅ |
| Couverture backend | Mesurer la couverture Java | JaCoCo | ✅ |
| Couverture frontend | Mesurer la couverture Angular | Vitest Coverage V8 | ✅ |
| E2E | Vérifier les parcours critiques réels | Playwright | ✅ |
| Validation fonctionnelle | Vérifier l'application complète | Tests manuels + E2E | ✅ |

---

## 4. Tests backend

Les tests backend sont exécutés depuis :

```text
backend/
```

Commande :

```bash
mvn test
```

Résultat de référence :

```text
Tests run: 55
Failures: 0
Errors: 0
Skipped: 0
BUILD SUCCESS
```

État :

```text
55 / 55 tests réussis
```

Les tests couvrent notamment :

- authentification ;
- utilisateurs ;
- upload ;
- téléchargement ;
- récupération des fichiers de l'utilisateur ;
- suppression manuelle ;
- contrôle de propriété ;
- suppression physique ;
- gestion des erreurs ;
- expiration ;
- nettoyage automatique des fichiers expirés.

---

## 5. Tests du nettoyage automatique

Le mécanisme de suppression des fichiers expirés possède des tests dédiés.

Les comportements vérifiés incluent :

- suppression d'un fichier expiré ;
- suppression des métadonnées après suppression physique ;
- conservation des métadonnées si la suppression physique échoue ;
- poursuite du traitement des autres fichiers malgré une erreur ;
- déclenchement du service planifié.

Le backend supprime d'abord le fichier physique puis les métadonnées correspondantes.

Cette stratégie évite de supprimer l'enregistrement en base alors que le fichier physique existe encore à la suite d'une erreur.

---

## 6. Couverture backend

La couverture backend a été mesurée avec JaCoCo.

Depuis :

```text
backend/
```

commande reproductible :

```bash
mvn org.jacoco:jacoco-maven-plugin:0.8.15:prepare-agent test org.jacoco:jacoco-maven-plugin:0.8.15:report
```

Résultats :

```text
Instructions : 90 %
Branches     : 82 %
Lines        : 466 / 503 = 92.64 %
Methods      : 89.4 %
Classes      : 94.9 %
```

La mesure principale retenue pour le projet est :

```text
Couverture des lignes backend : 92.6 %
```

Le seuil demandé de 70 % est donc dépassé.

Le rapport HTML JaCoCo est généré dans :

```text
backend/target/site/jacoco/
```

---

## 7. Tests frontend

Les tests frontend sont exécutés depuis :

```text
frontend/
```

Commande utilisée :

```bash
npx ng test --no-watch --no-progress --runner-config=vitest.config.ts
```

Résultat de référence :

```text
55 tests réussis
```

État :

```text
55 / 55 tests réussis
```

Les tests couvrent notamment :

- services d'authentification ;
- services de fichiers ;
- composants de connexion et d'inscription ;
- upload ;
- affichage des fichiers de l'utilisateur ;
- suppression ;
- gestion des états et erreurs principaux.

---

## 8. Couverture frontend

La couverture frontend est produite avec Vitest et `@vitest/coverage-v8`.

Commande :

```bash
npx ng test --coverage --no-watch --no-progress --runner-config=vitest.config.ts
```

Résultats :

```text
Statements : 76.49 %
Branches   : 73.82 %
Functions  : 75.22 %
Lines      : 76.93 %
```

Les quatre indicateurs globaux sont supérieurs à :

```text
70 %
```

Le seuil demandé est donc atteint.

Le rapport de couverture est généré dans le dossier de couverture produit par le runner Vitest.

---

## 9. Tests E2E

Les tests de bout en bout utilisent Playwright.

Le script npm disponible est :

```text
npm run e2e
```

Il exécute :

```text
playwright test
```

Configuration :

```text
frontend/playwright.config.ts
```

Répertoire des scénarios :

```text
frontend/e2e/
```

Résultat de référence :

```text
3 tests réussis
```

Les trois parcours critiques sont détaillés ci-dessous.

---

## 10. E2E 1 - Inscription et connexion

Scénario :

```text
1. Générer une adresse email unique.
2. Créer un compte.
3. Vérifier la réponse HTTP 201.
4. Vérifier la redirection vers la page de connexion.
5. Se connecter avec le compte créé.
6. Vérifier la redirection vers l'espace d'upload.
7. Vérifier que la page attendue est affichée.
```

Résultat :

```text
✅ Réussi
```

Ce test valide le parcours principal :

```text
inscription -> connexion -> accès à l'application
```

---

## 11. E2E 2 - Upload d'un fichier

Scénario :

```text
1. Créer un utilisateur.
2. Se connecter.
3. Préparer un fichier de test.
4. Sélectionner le fichier dans l'interface.
5. Définir une expiration.
6. Lancer l'upload.
7. Vérifier qu'un lien public est généré.
8. Vérifier que le nom du fichier est affiché.
```

Résultat :

```text
✅ Réussi
```

Ce test valide :

```text
authentification -> upload -> génération du lien public
```

---

## 12. E2E 3 - Téléchargement public

Scénario :

```text
1. Créer un utilisateur.
2. Se connecter.
3. Uploader un fichier.
4. Récupérer le lien public.
5. Ouvrir un nouveau contexte navigateur non authentifié.
6. Accéder au lien public.
7. Vérifier les informations du fichier.
8. Déclencher le téléchargement.
9. Vérifier le nom du fichier téléchargé.
10. Vérifier que le téléchargement se termine sans erreur.
```

Résultat :

```text
✅ Réussi
```

Ce scénario vérifie qu'un utilisateur non authentifié peut réellement télécharger un fichier à partir d'un lien de partage valide.

---

## 13. Résultat global des E2E

Dernière exécution complète de référence :

```text
3 passed
0 failed
```

Tous les parcours critiques testés passent.

Les E2E nécessitent :

- PostgreSQL actif ;
- backend Spring Boot actif ;
- variables d'environnement chargées ;
- frontend disponible ou démarrable par Playwright.

---

## 14. Validation de la suppression manuelle

La suppression d'un fichier a été validée à plusieurs niveaux.

### Backend

Les tests vérifient notamment :

- suppression autorisée pour le propriétaire ;
- impossibilité pour un autre utilisateur de supprimer le fichier ;
- suppression du fichier physique ;
- suppression des métadonnées ;
- conservation de la base si la suppression physique échoue.

### Frontend

L'interface vérifie notamment :

- demande de confirmation avant suppression ;
- désactivation temporaire permettant d'éviter un double clic ;
- gestion des principales erreurs HTTP ;
- actualisation de l'affichage après suppression.

### Validation réelle

Un fichier réel a également été uploadé puis supprimé pendant la validation fonctionnelle.

Après suppression :

```text
fichier absent de l'interface
fichier physique absent du stockage
enregistrement absent de la base
```

Résultat :

```text
✅ Validé
```

---

## 15. Validation de l'expiration automatique

Le mécanisme d'expiration a également été testé dans l'environnement réel.

Un déclenchement temporairement accéléré du scheduler a permis de vérifier le nettoyage.

Résultat observé :

```text
13 fichiers expirés supprimés
fichiers encore actifs conservés
```

Après validation, la planification normale a été restaurée.

Configuration par défaut :

```text
03:00 chaque jour
```

Résultat :

```text
✅ Validé
```

---

## 16. Tests d'acceptation du MVP

Les principaux critères d'acceptation fonctionnels ont été vérifiés.

| Fonction | Résultat |
|---|---|
| Inscription | ✅ |
| Connexion | ✅ |
| JWT | ✅ |
| Upload authentifié | ✅ |
| Stockage physique | ✅ |
| Métadonnées en base | ✅ |
| Lien public non prédictible | ✅ |
| Consultation publique | ✅ |
| Téléchargement public | ✅ |
| Historique utilisateur | ✅ |
| Contrôle du propriétaire | ✅ |
| Suppression manuelle | ✅ |
| Suppression physique | ✅ |
| Expiration | ✅ |
| Nettoyage automatique | ✅ |

---

## 17. Build frontend

Après les modifications liées aux tests et à la couverture, le frontend a également été compilé.

Commande :

```bash
npm run build
```

Résultat de référence :

```text
Build réussi
```

Cette vérification permet de s'assurer que les tests ajoutés ou les modifications de dépendances n'ont pas rendu l'application non compilable.

---

## 18. Tests après corrections de sécurité

Après la mise à jour des dépendances frontend liées à Vitest :

```text
vitest 4.1.11
@vitest/coverage-v8 4.1.11
@vitest/mocker 4.1.11
```

la suite frontend a été rejouée.

Résultat :

```text
55 / 55 tests réussis
```

La couverture est restée :

```text
Statements : 76.49 %
Branches   : 73.82 %
Functions  : 75.22 %
Lines      : 76.93 %
```

Le build Angular est également resté valide.

Après la mise à jour de Tomcat vers :

```text
11.0.26
```

la suite backend a été rejouée.

Résultat :

```text
55 / 55 tests réussis
BUILD SUCCESS
```

Ces résultats confirment l'absence de régression détectée après les corrections de sécurité.

---

## 19. Performance et stabilité des opérations critiques

Les performances d'upload et de téléchargement sont traitées plus précisément dans :

```text
PERF.md
```

Le test de charge de référence a utilisé :

```text
5 utilisateurs virtuels
20 cycles
fichiers de 1 Mo
```

Résultat :

```text
80 / 80 checks réussis
0 % échec upload
0 % échec téléchargement
```

Cette validation complète les tests fonctionnels en vérifiant que les opérations critiques restent stables sous une petite charge locale contrôlée.

---

## 20. Sécurité et tests de non-régression

Les contrôles de sécurité sont détaillés dans :

```text
SECURITY.md
```

Résultat de référence après corrections :

```text
npm audit : 0 vulnérabilité
Trivy backend : 0 vulnérabilité
Trivy frontend : 0 vulnérabilité
```

Après les corrections de dépendances, les suites automatisées backend et frontend ont toutes été rejouées avec succès.

---

## 21. Procédure recommandée après modification backend

Pour une modification backend classique :

```text
1. lancer mvn test ;
2. vérifier 0 failure et 0 error ;
3. lancer la couverture si la logique métier ou les tests changent ;
4. exécuter les E2E si un endpoint ou un parcours critique est affecté ;
5. lancer Trivy si une dépendance change.
```

Commande minimale :

```bash
mvn test
```

---

## 22. Procédure recommandée après modification frontend

Pour une modification frontend classique :

```text
1. lancer les tests frontend ;
2. vérifier la couverture si les composants ou services changent ;
3. lancer le build ;
4. exécuter les E2E si le parcours utilisateur est affecté ;
5. lancer npm audit si une dépendance change.
```

Commandes principales :

```bash
npx ng test --no-watch --no-progress --runner-config=vitest.config.ts
```

```bash
npm run build
```

---

## 23. Procédure recommandée avant une Pull Request importante

Avant d'intégrer une modification importante :

```text
1. git status
2. tests concernés
3. git diff --check
4. couverture si nécessaire
5. build frontend si concerné
6. E2E si un parcours critique est affecté
7. audit sécurité si une dépendance change
8. git diff --cached --check
9. revue des fichiers préparés
10. Pull Request vers main
```

Cette procédure vise à limiter les régressions avant intégration.

---

## 24. Limites actuelles

Les résultats décrits dans ce document correspondent à l'environnement local de développement.

Ils ne constituent pas :

- une certification de sécurité ;
- une garantie de fonctionnement dans tous les environnements ;
- une campagne de charge de production ;
- une preuve d'absence totale de bug.

Les tests automatisés couvrent les fonctionnalités critiques du MVP mais ne peuvent pas couvrir tous les comportements possibles.

Toute nouvelle fonctionnalité importante doit être accompagnée de tests adaptés.

---

## 25. Synthèse

État de référence au 25 septembre 2026 :

```text
Tests backend              : 55 / 55 réussis
Couverture lignes backend  : 92.64 %

Tests frontend             : 55 / 55 réussis
Statements frontend        : 76.49 %
Branches frontend          : 73.82 %
Functions frontend         : 75.22 %
Lines frontend             : 76.93 %

Tests E2E                  : 3 / 3 réussis

Build Angular              : réussi

Parcours critiques :
Inscription                : ✅
Connexion                  : ✅
Upload                     : ✅
Lien public                : ✅
Téléchargement             : ✅
Suppression                : ✅
Expiration automatique     : ✅
```

Les objectifs de validation du MVP sont atteints et la couverture globale des parties testées dépasse le seuil de 70 % demandé.
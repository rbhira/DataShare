# Rapport de revue technique du code écrit par l'IA

## 1. Objet du rapport

Ce document présente la revue technique de la User Story US06 « Suppression d’un fichier », retenue dans le projet DataShare pour la traçabilité spécifique de l’utilisation de l’intelligence artificielle.

L’objectif n’est pas de considérer le code proposé par l’IA comme automatiquement valide, mais de documenter :

- les tâches confiées à l’IA ;
- la supervision humaine réalisée ;
- les décisions et corrections techniques apportées ;
- les tests et validations exécutés ;
- les limites identifiées ;
- la traçabilité Git associée.

La validation finale de la fonctionnalité reste sous responsabilité humaine.

---

## 2. Périmètre revu

La revue porte sur l’US06, qui permet à un utilisateur authentifié de supprimer l’un de ses propres fichiers.

La fonctionnalité comprend :

- la suppression côté back-end ;
- le contrôle du propriétaire ;
- la suppression du fichier physique ;
- la suppression des métadonnées en base ;
- l’appel HTTP DELETE côté Angular ;
- la confirmation utilisateur ;
- la protection contre les clics répétés ;
- la gestion des erreurs ;
- la mise à jour immédiate de l’interface ;
- les tests associés.

---

## 3. Tâches confiées à l’IA

### 3.1 Back-end

L’assistance IA a été utilisée pour :

- analyser l’implémentation existante ;
- proposer le service de suppression ;
- intégrer le contrôle du propriétaire ;
- identifier les cas d’erreur ;
- proposer des tests ciblés ;
- analyser le comportement entre le stockage physique et la base de données.

### 3.2 Front-end

L’assistance IA a été utilisée pour :

- intégrer l’appel DELETE ;
- ajouter une confirmation avant suppression ;
- afficher les fichiers actifs par défaut ;
- empêcher les suppressions répétées pendant une requête en cours ;
- gérer les erreurs 401, réseau et 404 ;
- mettre à jour immédiatement la liste après suppression ;
- adapter le comportement et l’affichage au responsive.

### 3.3 Méthode de validation

Les propositions de l’IA n’ont pas été considérées comme validées uniquement parce qu’elles compilaient ou semblaient cohérentes.

Chaque modification a été appliquée, relue et vérifiée avant intégration.

---

## 4. Supervision humaine

La supervision humaine a porté sur :

- la lecture et l’application des changements dans le projet ;
- la vérification du fonctionnement du code ;
- l’exécution des tests automatiques ;
- la vérification des erreurs HTTP ;
- le contrôle de la conformité avec la maquette « Mon espace » ;
- les contrôles desktop, tablette et mobile ;
- la validation réelle du fichier sur le disque ;
- la validation des métadonnées dans PostgreSQL ;
- le contrôle de l’état Git ;
- la création des commits ;
- le push des branches ;
- la création et la vérification des Pull Requests ;
- la fusion dans `main`.

Les résultats proposés par l’IA ont donc fait l’objet d’une validation humaine avant leur intégration définitive.

---

## 5. Revue technique du back-end

### 5.1 Contrôle du propriétaire

La suppression doit être limitée au propriétaire du fichier.

La recherche du fichier s’appuie sur son identifiant et l’identité de l’utilisateur authentifié afin qu’un utilisateur ne puisse pas supprimer le fichier d’un autre utilisateur.

Cette règle a été conservée lors de la revue.

### 5.2 Ordre de suppression

Une limite technique importante a été identifiée : une transaction de base de données ne peut pas restaurer automatiquement un fichier physique déjà supprimé du disque.

La décision retenue est donc :

1. supprimer le fichier physique ;
2. supprimer ensuite ses métadonnées en base de données.

Si la suppression physique échoue, les métadonnées sont conservées.

Cette stratégie évite de supprimer l’enregistrement PostgreSQL alors que le fichier serait encore présent sur le disque.

Cette limite est également conservée dans la documentation de maintenance.

### 5.3 Cas d’erreur

Les comportements suivants ont été contrôlés :

- suppression autorisée pour le propriétaire ;
- refus d’une suppression non autorisée ;
- fichier déjà absent ;
- erreur pendant la suppression physique ;
- conservation des métadonnées si le fichier physique ne peut pas être supprimé.

---

## 6. Revue technique du front-end

Le front-end a été complété et revu afin d’éviter plusieurs comportements indésirables.

### Confirmation

Une confirmation utilisateur est demandée avant la suppression définitive.

### Protection contre les clics répétés

Lorsqu’une suppression est déjà en cours, une deuxième demande sur le même fichier est ignorée.

### Gestion des erreurs

L’interface traite notamment :

- l’expiration ou l’absence d’authentification ;
- les réponses HTTP 401 ;
- les erreurs réseau ;
- les réponses HTTP 404.

### Mise à jour de l’interface

Après une suppression réussie, le fichier disparaît immédiatement de la liste sans nécessiter de rechargement complet de la page.

### Ergonomie

Les fichiers actifs sont affichés par défaut.

Le bouton de suppression a également été vérifié sur plusieurs largeurs d’écran afin de conserver un fonctionnement adapté au responsive.

---

## 7. Validation fonctionnelle réelle

Une validation réelle a été effectuée sur l’ensemble de la chaîne :

1. téléversement d’un fichier de test ;
2. présence du fichier dans l’interface ;
3. présence du fichier physique dans le stockage local ;
4. présence des métadonnées dans PostgreSQL ;
5. suppression depuis l’interface ;
6. vérification de sa disparition de l’interface ;
7. vérification de sa disparition du stockage local ;
8. vérification de sa disparition de PostgreSQL.

Le test a confirmé la suppression du fichier physique et de ses métadonnées.

---

## 8. Tests et contrôles

Lors de la validation de l’US06 :

- les tests back-end ont été exécutés ;
- les tests front-end ont été exécutés ;
- le build Angular de production a été exécuté ;
- le comportement responsive a été contrôlé ;
- une suppression réelle sur le disque et dans PostgreSQL a été vérifiée.

La campagne qualité finale de l’étape 5 a ensuite confirmé l’absence de régression majeure avec :

- 55 / 55 tests back-end réussis ;
- 55 / 55 tests front-end réussis ;
- 3 / 3 scénarios E2E réussis ;
- couverture globale supérieure à 70 % ;
- build Angular de production réussi.

Les résultats détaillés sont disponibles dans `TESTING.md`.

---

## 9. Traçabilité Git

La fonctionnalité peut être retracée dans l’historique Git.

Principales références :

- back-end suppression : commit `2dd0304` ;
- front-end US06 : commit `0e1b48d` ;
- Pull Request front-end : PR #15 ;
- merge de la PR #15 : `6771461`.

Les branches, commits, push, Pull Requests et fusions ont été exécutés et contrôlés humainement.

---

## 10. Limites et risques résiduels

La principale limite identifiée concerne l’absence de transaction unique entre PostgreSQL et le système de fichiers.

Le système applique une stratégie volontaire :

- le fichier physique est supprimé en premier ;
- les métadonnées ne sont supprimées qu’après réussite de cette opération.

Cette stratégie réduit le risque de conserver un fichier physique sans référence en base, mais ne constitue pas une transaction distribuée entre la base de données et le système de fichiers.

Pour un système de production à plus grande échelle, une stratégie plus avancée pourrait être étudiée.

---

## 11. Conclusion de la revue

La contribution réalisée avec assistance IA sur l’US06 a fait l’objet d’une supervision humaine systématique.

Le code n’a pas été accepté sur la seule base des propositions de l’IA.

La validation a reposé sur :

- la relecture du code ;
- l’analyse des choix techniques ;
- les tests automatiques ;
- le build ;
- les validations visuelles ;
- la vérification responsive ;
- les tests réels sur le stockage local et PostgreSQL ;
- la revue Git et les Pull Requests.

Les ajustements effectués pendant cette supervision ont notamment porté sur la sécurité propriétaire, l’ordre de suppression disque / base de données, la gestion des erreurs, la prévention des doubles actions et l’ergonomie du front-end.

La revue permet donc de considérer l’US06 comme techniquement validée sous supervision humaine, tout en conservant explicitement la limite liée à l’absence de transaction atomique entre le stockage physique et PostgreSQL.
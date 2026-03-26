# 🏭 Guide d'Industrialisation Git - MyPersonalTasks

## 📊 Structure des Branches (Git Flow)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         GIT FLOW - MYPERSONALTASKS                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  main (production)                                                          │
│    │                                                                         │
│    │ ←───── Merge (via PR) ─────┐                                           │
│    │                            │                                           │
│    ●────────────────────────────●─────●─────●                               │
│    │                            ↑     ↑     ↑                               │
│    │                            │     │     │                               │
│    │    release/v1.0.0 ─────────┘     │     │                               │
│    │                                  │     │                               │
│    │                                  │     │                               │
│  develop ────────────────────────────●─────●─────●─────●─────●              │
│    │                                  ↑     ↑     ↑     ↑     ↑              │
│    │                                  │     │     │     │     │              │
│    │    feature/add-labels ───────────┘     │     │     │     │              │
│    │                                        │     │     │     │              │
│    │    feature/task-comments ──────────────┘     │     │     │              │
│    │                                              │     │     │              │
│    │    bugfix/auth-redirect ─────────────────────┘     │     │              │
│    │                                                    │     │              │
│    │    feature/calendar-view ──────────────────────────┘     │              │
│    │                                                          │              │
│    │    hotfix/security-jwt ──────────────────────────────────┘              │
│    │                                                                         │
└────┴─────────────────────────────────────────────────────────────────────────┘

LÉGENDE:
────────  Merge / Fusion
●         Commit
←         Pull Request
```

---

## 🌿 Types de Branches

| Type | Depuis | Vers | Nom | Exemple |
|------|--------|------|-----|---------|
| `main` | - | - | Production | `main` |
| `develop` | main | main | Développement | `develop` |
| `feature` | develop | develop | Nouvelle fonctionnalité | `feature/add-user-dashboard` |
| `bugfix` | develop | develop | Correction de bug | `bugfix/fix-login-redirect` |
| `hotfix` | main | main + develop | Correction urgente prod | `hotfix/security-jwt-secret` |
| `release` | develop | main | Préparation release | `release/v1.1.0` |

---

## 📝 Convention de Commits (Conventional Commits)

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types autorisés

| Type | Description | Exemple |
|------|-------------|---------|
| `feat` | Nouvelle fonctionnalité | `feat(auth): add OAuth2 login` |
| `fix` | Correction de bug | `fix(task): resolve status update issue` |
| `docs` | Documentation | `docs(readme): update installation guide` |
| `style` | Formatage (pas de code) | `style(button): fix hover animation` |
| `refactor` | Refactoring | `refactor(user-service): extract validation logic` |
| `test` | Tests | `test(auth): add unit tests for JWT service` |
| `chore` | Maintenance | `chore(deps): update dependencies` |
| `perf` | Performance | `perf(task-list): optimize query performance` |
| `ci` | CI/CD | `ci(github): add workflow for tests` |
| `revert` | Annuler un commit | `revert: feat(auth): add OAuth2 login` |

### Scopes suggérés

| Scope | Description |
|-------|-------------|
| `auth` | Authentification, JWT, login |
| `user` | Gestion utilisateurs |
| `project` | Gestion projets |
| `task` | Gestion tâches |
| `api` | API endpoints |
| `ui` | Interface utilisateur |
| `db` | Base de données |
| `i18n` | Internationalisation |
| `deps` | Dépendances |

---

## 🔄 Workflow Quotidien

### 1. Démarrer une nouvelle fonctionnalité

```bash
# Se positionner sur develop
git checkout develop
git pull origin develop

# Créer une branche feature
git checkout -b feature/ma-fonctionnalite

# Exemple : ajouter un dashboard
git checkout -b feature/user-dashboard
```

### 2. Développer et committer

```bash
# ... développement ...

# Voir les changements
git status
git diff

# Ajouter les fichiers
git add .

# Commiter avec un message conventionnel
git commit -m "feat(dashboard): add user statistics widget"

# Pousser la branche
git push -u origin feature/user-dashboard
```

### 3. Créer une Pull Request

1. Allez sur GitHub : https://github.com/SaadBelmahfoud/my-personal-tasks
2. Cliquez sur "Compare & pull request"
3. Base: `develop` ← Compare: `feature/user-dashboard`
4. Titre: `feat(dashboard): add user statistics widget`
5. Description:
   ```markdown
   ## 🎯 Objectif
   Ajouter un widget de statistiques utilisateur sur le dashboard.

   ## 📝 Changements
   - [x] Création du composant DashboardStats
   - [x] Ajout de l'endpoint API /api/users/me/stats
   - [x] Tests unitaires

   ## 🧪 Tests
   - [x] Tests unitaires passés
   - [x] Tests manuels OK

   ## 📸 Screenshots
   ![Dashboard](url-image)

   Closes #12
   ```
6. Créer la PR

### 4. Merger la Pull Request

```bash
# Après validation de la PR sur GitHub

# Supprimer la branche locale
git checkout develop
git pull origin develop
git branch -d feature/user-dashboard

# Supprimer la branche distante (si pas fait automatiquement)
git push origin --delete feature/user-dashboard
```

---

## 🚀 Workflow de Release

### Créer une release

```bash
# 1. Créer la branche release depuis develop
git checkout develop
git pull origin develop
git checkout -b release/v1.1.0

# 2. Mettre à jour la version
# - pom.xml (Back)
# - package.json (Front)
# - Changelog

git add .
git commit -m "chore(release): prepare version 1.1.0"

# 3. Pousser et créer PR vers main
git push -u origin release/v1.1.0

# 4. Sur GitHub : créer PR release/v1.1.0 → main

# 5. Après merge, créer le tag
git checkout main
git pull origin main
git tag -a v1.1.0 -m "Release version 1.1.0

Features:
- User dashboard with statistics
- Task filtering improvements
- Performance optimizations

Bug fixes:
- Fix login redirect issue
- Fix task status update

Breaking changes: None"

git push origin v1.1.0

# 6. Merger également dans develop
git checkout develop
git merge main
git push origin develop
```

---

## 🔥 Workflow Hotfix (Correction urgente)

```bash
# 1. Créer la branche hotfix depuis main
git checkout main
git pull origin main
git checkout -b hotfix/security-jwt-secret

# 2. Corriger le problème
git add .
git commit -m "fix(security): use environment variable for JWT secret"

# 3. Pousser et créer PR vers main ET develop
git push -u origin hotfix/security-jwt-secret

# 4. Sur GitHub : créer PR hotfix → main

# 5. Après merge, merger également dans develop
git checkout develop
git merge main
git push origin develop

# 6. Créer le tag
git checkout main
git tag -a v1.0.1 -m "Hotfix: JWT secret configuration"
git push origin v1.0.1
```

---

## 📋 Exemples de Commits par Fonctionnalité

### Authentification

```bash
# Nouvelle fonctionnalité
git commit -m "feat(auth): add OAuth2 Google login"
git commit -m "feat(auth): implement password reset via email"
git commit -m "feat(auth): add two-factor authentication"

# Bug fix
git commit -m "fix(auth): resolve JWT token expiration issue"
git commit -m "fix(auth): fix login redirect after registration"

# Refactoring
git commit -m "refactor(auth): extract token validation to separate service"
```

### Gestion des Projets

```bash
# Nouvelle fonctionnalité
git commit -m "feat(project): add project archiving feature"
git commit -m "feat(project): implement project templates"
git commit -m "feat(project): add project export to PDF"

# Bug fix
git commit -m "fix(project): resolve member invitation for non-existent users"

# Performance
git commit -m "perf(project): optimize project listing query"
```

### Gestion des Tâches

```bash
# Nouvelle fonctionnalité
git commit -m "feat(task): add task due date reminders"
git commit -m "feat(task): implement task dependencies"
git commit -m "feat(task): add bulk status update"

# Bug fix
git commit -m "fix(task): resolve checklist item ordering"
git commit -m "fix(task): fix task assignment notification"

# UI
git commit -m "feat(ui): add drag-and-drop for task reordering"
git commit -m "style(task): improve task card design"
```

### Interface & UX

```bash
# Nouvelle fonctionnalité
git commit -m "feat(ui): add dark mode toggle animation"
git commit -m "feat(i18n): add Spanish language support"

# Style
git commit -m "style(button): add loading state animation"
git commit -m "style(sidebar): improve mobile responsiveness"

# Accessibilité
git commit -m "feat(a11y): add keyboard navigation for task list"
```

### Base de données

```bash
# Migration
git commit -m "feat(db): add indexes for task queries"
git commit -m "feat(db): add audit logging table"

# Refactoring
git commit -m "refactor(db): optimize entity relationships"
```

### Tests

```bash
git commit -m "test(auth): add unit tests for JWT service"
git commit -m "test(project): add integration tests for project API"
git commit -m "test(task): add e2e tests for task creation"
```

### CI/CD

```bash
git commit -m "ci(github): add automated testing workflow"
git commit -m "ci(docker): add Dockerfile for backend"
git commit -m "ci(k8s): add Kubernetes deployment manifests"
```

---

## ✅ Checklist avant chaque Commit

```bash
# 1. Vérifier les changements
git status
git diff

# 2. Linter
cd Back && mvn checkstyle:check
cd Front && npm run lint

# 3. Tests (si disponibles)
cd Back && mvn test
cd Front && npm test

# 4. Vérifier le message de commit
# Format: type(scope): description
# Exemple: feat(task): add due date reminder

# 5. Commit
git add .
git commit -m "feat(scope): description"

# 6. Push
git push
```

---

## 🔧 Alias Git Recommandés

Ajoutez ces alias à votre `~/.gitconfig` :

```bash
# Ajouter les alias
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.st status
git config --global alias.lg "log --oneline --graph --all"
git config --global alias.undo "reset HEAD~1"
git config --global alias.wip "!git add . && git commit -m 'wip: work in progress'"
git config --global alias.unstage "reset HEAD --"

# Utilisation
git co develop          # = git checkout develop
git br feature/new      # = git branch feature/new
git st                  # = git status
git lg                  # = joli log
git wip                 # = commit work in progress
git unstage fichier.txt # = unstage un fichier
```

---

## 📊 Tableau de Bord Git

### Commandes utiles

```bash
# Voir l'historique
git log --oneline --graph --all -20

# Voir les branches fusionnées
git branch --merged develop

# Voir les branches non fusionnées
git branch --no-merged develop

# Nettoyer les branches distantes supprimées
git fetch --prune

# Voir qui a modifié un fichier
git blame src/file.tsx

# Chercher dans l'historique
git log --grep="keyword"

# Voir les changements d'un commit
git show <commit-hash>
```

---

## 🚨 Problèmes Courants et Solutions

### Annuler le dernier commit (pas encore push)

```bash
git reset HEAD~1           # Garder les changements
git reset --hard HEAD~1    # Perdre les changements
```

### Modifier le dernier commit

```bash
git add <files>
git commit --amend -m "nouveau message"
```

### Résoudre un conflit de merge

```bash
# 1. Identifier les conflits
git status

# 2. Éditer les fichiers en conflit
# Les conflits sont marqués avec <<<<<<< HEAD

# 3. Marquer comme résolu
git add <file>

# 4. Continuer le merge
git commit
```

### Récupérer une branche supprimée

```bash
# Trouver le commit
git reflog

# Recréer la branche
git checkout -b <branch-name> <commit-hash>
```

---

## 📈 Workflow Résumé

```
┌─────────────────────────────────────────────────────────────┐
│                    WORKFLOW QUOTIDIEN                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. 🔄 git checkout develop && git pull                      │
│  2. 🌿 git checkout -b feature/ma-feature                    │
│  3. 💻 ... développement ...                                  │
│  4. ✅ git add . && git commit -m "feat: ..."                │
│  5. 📤 git push -u origin feature/ma-feature                 │
│  6. 🔗 Créer Pull Request sur GitHub                         │
│  7. 👥 Review et validation                                  │
│  8. ✅ Merge PR                                              │
│  9. 🧹 git checkout develop && git pull && git branch -d     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

**Dernière mise à jour** : Mars 2025
**Auteur** : Saad Belmahfoud

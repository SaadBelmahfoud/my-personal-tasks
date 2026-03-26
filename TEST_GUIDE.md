# 🧪 Guide de Test - MyPersonalTasks

## 📋 Table des Matières

1. [Démarrage de l'Application](#1-démarrage-de-lapplication)
2. [Test de l'Authentification](#2-test-de-lauthentification)
3. [Test du Dashboard](#3-test-du-dashboard)
4. [Test de la Navigation](#4-test-de-la-navigation)
5. [Test des Traductions (i18n)](#5-test-des-traductions-i18n)
6. [Test du Thème (Dark/Light Mode)](#6-test-du-thème-darklight-mode)
7. [Test de l'Intégration API](#7-test-de-lintégration-api)
8. [Scénarios de Test Complets](#8-scénarios-de-test-complets)

---

## 1. Démarrage de l'Application

### Backend (Spring Boot)

```bash
cd Back
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

**Vérifications :**
- [ ] Serveur démarre sur `http://localhost:8080/api`
- [ ] Swagger UI accessible : `http://localhost:8080/api/swagger-ui.html`
- [ ] Console H2 accessible : `http://localhost:8080/api/h2-console`
  - JDBC URL: `jdbc:h2:mem:mypersonaltasks`
  - User: `sa`
  - Password: (vide)

### Frontend (Next.js)

```bash
cd Front
npm install  # Si pas encore fait
npm run dev
```

**Vérifications :**
- [ ] Application accessible sur `http://localhost:3000`
- [ ] Pas d'erreurs dans la console navigateur

---

## 2. Test de l'Authentification

### 2.1 Inscription (Register)

**Via Swagger UI :**
1. Ouvrir `http://localhost:8080/api/swagger-ui.html`
2. Aller à `POST /auth/register`
3. Cliquer "Try it out"
4. Entrer le JSON suivant :
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123",
  "firstName": "Test",
  "lastName": "User"
}
```
5. Cliquer "Execute"
6. **Résultat attendu :** Code 200 avec `accessToken` et `refreshToken`

**Via cURL :**
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### 2.2 Connexion (Login)

**Via Swagger UI :**
1. Aller à `POST /auth/login`
2. Entrer :
```json
{
  "login": "testuser",
  "password": "password123"
}
```
3. **Résultat attendu :** Code 200 avec tokens JWT

**Via cURL :**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "login": "testuser",
    "password": "password123"
  }'
```

### 2.3 Récupérer l'Utilisateur Courant

**Avec le token reçu :**
```bash
curl -X GET http://localhost:8080/api/users/me \
  -H "Authorization: Bearer VOTRE_ACCESS_TOKEN"
```

**Résultat attendu :**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "username": "testuser",
    "email": "test@example.com",
    "firstName": "Test",
    "lastName": "User",
    "fullName": "Test User",
    "role": "USER"
  }
}
```

---

## 3. Test du Dashboard

### Vérifications Dashboard

1. **Accéder au Dashboard** (`http://localhost:3000/`)

**Éléments à vérifier :**
- [ ] Message de bienvenue affiché
- [ ] 4 cartes statistiques visibles (Projets, Tâches, Terminées, En retard)
- [ ] Section "Tâches à venir" avec les mock tasks
- [ ] Section "Mes projets" avec les mock projects
- [ ] Section "Actions rapides" avec boutons
- [ ] Badges de priorité affichés correctement
- [ ] Badges de statut affichés correctement

**Vérifier les traductions :**
- [ ] Les statuts sont traduits (To Do, In Progress, etc.)
- [ ] Les priorités sont traduites (Low, Medium, High, Urgent)
- [ ] Tous les labels sont en anglais par défaut

---

## 4. Test de la Navigation

### 4.1 Sidebar

**Vérifications :**
- [ ] Logo "MyPersonalTasks" visible
- [ ] Liens de navigation :
  - [ ] Dashboard (`/`)
  - [ ] Projects (`/projects`)
  - [ ] Tasks (`/tasks`)
  - [ ] Calendar (`/calendar`)
- [ ] Avatar utilisateur visible
- [ ] Nom d'utilisateur affiché
- [ ] Bouton Settings visible
- [ ] Bouton Logout visible
- [ ] Toggle de langue (EN/FR)
- [ ] Toggle de thème (Dark/Light)

### 4.2 Header

**Vérifications :**
- [ ] Titre de la page affiché
- [ ] Barre de recherche visible
- [ ] Icône de notifications visible
- [ ] Avatar utilisateur visible

### 4.3 Responsive Design

**Tester les tailles d'écran :**
1. **Desktop (> 1024px)**
   - [ ] Sidebar toujours visible
   - [ ] Layout complet

2. **Tablet (768px - 1024px)**
   - [ ] Sidebar peut être masquée
   - [ ] Bouton hamburger visible

3. **Mobile (< 768px)**
   - [ ] Sidebar cachée par défaut
   - [ ] Bouton hamburger fonctionnel
   - [ ] Sidebar s'ouvre/ferme correctement

---

## 5. Test des Traductions (i18n)

### 5.1 Basculer vers Français

1. Cliquer sur l'icône 🌐 dans la sidebar
2. **Vérifier les traductions :**

| Élément | Anglais | Français |
|---------|---------|----------|
| Dashboard | Dashboard | Tableau de bord |
| Projects | Projects | Projets |
| Tasks | Tasks | Tâches |
| Calendar | Calendar | Calendrier |
| Settings | Settings | Paramètres |
| Logout | Logout | Déconnexion |
| Status: To Do | To Do | À faire |
| Status: In Progress | In Progress | En cours |
| Priority: High | High | Haute |
| Priority: Urgent | Urgent | Urgente |

### 5.2 Vérifier les Fichiers de Traduction

**Anglais :** `src/locales/en/common.json`
**Français :** `src/locales/fr/common.json`

---

## 6. Test du Thème (Dark/Light Mode)

### 6.1 Basculer vers Dark Mode

1. Cliquer sur l'icône 🌙/☀️ dans la sidebar
2. **Vérifications :**
   - [ ] Fond sombre appliqué
   - [ ] Texte clair visible
   - [ ] Cartes en fond sombre
   - [ ] Sidebar en fond sombre
   - [ ] Tous les composants s'adaptent

### 6.2 Vérifier les Classes CSS

```css
/* Dark mode classes should be applied to <html> */
<html class="dark">
```

---

## 7. Test de l'Intégration API

### 7.1 Créer un Projet

```bash
curl -X POST http://localhost:8080/api/projects \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mon Premier Projet",
    "description": "Description du projet",
    "color": "#3B82F6",
    "isPublic": false
  }'
```

### 7.2 Lister les Projets

```bash
curl -X GET "http://localhost:8080/api/projects?page=0&size=10" \
  -H "Authorization: Bearer VOTRE_TOKEN"
```

### 7.3 Créer une Tâche

```bash
curl -X POST http://localhost:8080/api/tasks \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Ma première tâche",
    "description": "Description de la tâche",
    "projectId": "ID_DU_PROJET",
    "status": "TODO",
    "priority": "HIGH"
  }'
```

### 7.4 Lister les Tâches d'un Projet

```bash
curl -X GET "http://localhost:8080/api/tasks/project/ID_PROJET" \
  -H "Authorization: Bearer VOTRE_TOKEN"
```

---

## 8. Scénarios de Test Complets

### Scénario 1 : Flux d'Inscription et Connexion

```
1. Ouvrir http://localhost:3000/register
2. Remplir le formulaire :
   - Username: "newuser"
   - Email: "newuser@test.com"
   - Password: "securepass123"
   - Confirm Password: "securepass123"
   - First Name: "New"
   - Last Name: "User"
3. Cliquer "Sign Up"
4. Vérifier redirection vers Dashboard
5. Vérifier que l'utilisateur est connecté (avatar visible)
6. Cliquer "Logout"
7. Aller sur /login
8. Se connecter avec les credentials
9. Vérifier connexion réussie
```

### Scénario 2 : Création de Projet et Tâches

```
1. Se connecter
2. Aller sur Dashboard
3. Cliquer "New Project"
4. Créer un projet "Test Project"
5. Vérifier le projet dans la liste
6. Cliquer "New Task"
7. Créer une tâche assignée au projet
8. Vérifier la tâche dans la liste
9. Marquer la tâche comme complétée
10. Vérifier le statut mis à jour
```

### Scénario 3 : Collaboration

```
1. Créer un projet
2. Aller dans les paramètres du projet
3. Ajouter un membre par email
4. Vérifier que le membre reçoit une invitation
5. Le membre accepte et rejoint
6. Vérifier les permissions (Owner, Admin, Member, Viewer)
```

---

## 📊 Checklist de Validation Finale

### Frontend
- [ ] Application charge sans erreur
- [ ] Navigation fonctionne (tous les liens)
- [ ] Traductions EN/FR fonctionnent
- [ ] Thème Dark/Light fonctionne
- [ ] Responsive design correct
- [ ] Pas d'erreurs dans la console

### Backend
- [ ] Serveur démarre correctement
- [ ] Swagger UI accessible
- [ ] API d'authentification fonctionne
- [ ] CRUD Projets fonctionne
- [ ] CRUD Tâches fonctionne
- [ ] Base de données H2 accessible

### Intégration
- [ ] Frontend communique avec Backend
- [ ] Tokens JWT gérés correctement
- [ ] Déconnexion fonctionne
- [ ] Rafraîchissement de token fonctionne

---

## 🐛 Problèmes Connus et Solutions

### Problème 1 : Erreur "Cannot resolve message"
**Solution :** Vérifier que les clés de traduction existent dans les fichiers JSON

### Problème 2 : Erreur asChild prop
**Solution :** Utiliser le composant Slot de Radix UI dans Button

### Problème 3 : Token expiré
**Solution :** Utiliser le refresh token ou se reconnecter

---

## 📝 Logs Utiles

### Backend
```bash
# Voir les logs en temps réel
tail -f logs/spring.log
```

### Frontend
- Console Navigateur (F12)
- Network Tab pour les requêtes API

---

**Bonne chance avec vos tests !** 🚀

# MyPersonalTasks - Application de Gestion de Tâches

Une application complète de gestion de tâches et projets avec un backend Spring Boot et un frontend Next.js.

## Structure du Projet

```
MyPersonalTasks/
├── Back/          # Backend Spring Boot (Java 21)
│   ├── src/
│   ├── pom.xml
│   └── ...
└── Front/         # Frontend Next.js 15
    ├── src/
    ├── package.json
    └── ...
```

## Prérequis

- **Java 21** ou supérieur
- **Node.js 18+** ou **Bun**
- **Maven** (ou utilisez le wrapper mvnw)
- **PostgreSQL** (optionnel, H2 est utilisé en développement)

## Démarrage Rapide

### 1. Backend (Spring Boot)

```bash
cd Back

# Avec Maven
mvn spring-boot:run

# Ou avec le wrapper
./mvnw spring-boot:run
```

Le backend démarre sur `http://localhost:8080/api`

- **Swagger UI**: http://localhost:8080/api/swagger-ui.html
- **H2 Console** (dev): http://localhost:8080/api/h2-console

### 2. Frontend (Next.js)

```bash
cd Front

# Installation des dépendances
npm install
# ou
bun install

# Démarrage en développement
npm run dev
# ou
bun run dev
```

Le frontend démarre sur `http://localhost:3000`

## Configuration

### Backend (application.yml)

#### Développement (H2 Database)
Le profil `dev` utilise H2 en mémoire:
- URL: `jdbc:h2:mem:my_personal_tasks`
- User: `sa`
- Password: (vide)

#### Production (PostgreSQL)
Configurez vos paramètres PostgreSQL dans `application.yml`:
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/my_personal_tasks
    username: postgres
    password: postgres
```

### Frontend (.env.local)

Créez un fichier `.env.local` dans le dossier `Front/`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

## Fonctionnalités

### Authentification
- Inscription / Connexion
- JWT Tokens (Access + Refresh)
- Rôles utilisateur (USER, ADMIN)

### Projets
- Création, modification, suppression
- Membres et rôles (Owner, Admin, Member, Viewer)
- Statuts (Planning, Active, On Hold, Completed, Archived)

### Tâches
- CRUD complet
- Priorités (Low, Medium, High, Urgent)
- Statuts (To Do, In Progress, In Review, Completed, Cancelled, On Hold)
- Assignation, labels, checklist
- Sous-tâches et commentaires

### Interface
- Mode sombre / clair
- Multilingue (Anglais, Français)
- Responsive design
- Tableau de bord avec statistiques

## API Endpoints

### Auth
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/refresh` - Rafraîchir le token
- `POST /api/auth/logout` - Déconnexion

### Users
- `GET /api/users/me` - Profil utilisateur
- `PUT /api/users/me` - Modifier le profil

### Projects
- `GET /api/projects` - Liste des projets
- `POST /api/projects` - Créer un projet
- `GET /api/projects/{id}` - Détails d'un projet
- `PUT /api/projects/{id}` - Modifier un projet
- `DELETE /api/projects/{id}` - Supprimer un projet

### Tasks
- `GET /api/tasks/my-tasks` - Mes tâches
- `GET /api/tasks/project/{projectId}` - Tâches d'un projet
- `POST /api/tasks` - Créer une tâche
- `PATCH /api/tasks/{id}/status` - Modifier le statut

## Technologies

### Backend
- Spring Boot 3.2.1
- Spring Security + JWT
- Spring Data JPA
- H2 / PostgreSQL
- SpringDoc OpenAPI

### Frontend
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui
- Zustand (State Management)
- TanStack Query
- Axios

## Dépannage

### Le frontend ne se charge pas
1. Vérifiez que le backend est démarré sur le port 8080
2. Vérifiez les paramètres CORS dans le backend
3. Effacez le cache du navigateur et les localStorage

### Erreur d'authentification
1. Vérifiez que les tokens sont valides
2. Déconnectez-vous et reconnectez-vous
3. Vérifiez les logs du backend

## Licence

MIT License

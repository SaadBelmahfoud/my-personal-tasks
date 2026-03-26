# MyPersonalTasks - Application de Gestion de Tâches

Une application complète de gestion de tâches et projets avec un backend Spring Boot et un frontend Next.js.

## Structure du Projet

```
my-personal-tasks/
├── Back/                          # Backend Spring Boot (Java 21)
│   ├── src/
│   │   └── main/
│   │       ├── java/com/mypersonaltasks/
│   │       └── resources/
│   │           ├── application.yml
│   │           └── application-dev.yml
│   ├── pom.xml
│   └── start.sh
├── Front/                         # Frontend Next.js 15
│   ├── src/
│   │   ├── app/                   # Pages Next.js App Router
│   │   ├── components/            # Composants React
│   │   ├── hooks/                 # Hooks personnalisés
│   │   ├── lib/                   # Utilitaires
│   │   ├── locales/               # Traductions (FR/EN)
│   │   ├── services/              # Services API
│   │   └── stores/                # État global (Zustand)
│   ├── package.json
│   └── tailwind.config.ts
├── DATABASE_DOCUMENTATION.md      # Documentation base de données
├── DOCUMENTATION_TECHNIQUE.md     # Documentation technique complète
├── FORMATION_SPRING_ARCHITECTURE.md # Guide de formation Spring Boot
├── GIT_SETUP_GUIDE.md             # Guide d'industrialisation Git
└── TEST_GUIDE.md                  # Guide des tests
```

## Prérequis

| Outil | Version | Obligatoire |
|-------|---------|-------------|
| Java JDK | 21+ | ✅ Oui |
| Maven | 3.9+ | ✅ Oui |
| Node.js | 18+ | ⚪ Ou Bun |
| Bun | 1.0+ | ⚪ Ou Node.js |
| Git | 2.40+ | ✅ Oui |

## Démarrage Rapide

### 1. Cloner le projet

```bash
git clone https://github.com/SaadBelmahfoud/my-personal-tasks.git
cd my-personal-tasks
```

### 2. Backend (Spring Boot)

```bash
cd Back

# Compilation
mvn clean install -DskipTests

# Démarrage (profil dev par défaut)
mvn spring-boot:run

# Ou avec le script
./start.sh
```

Le backend démarre sur `http://localhost:8080/api`

- **Swagger UI**: http://localhost:8080/api/swagger-ui.html
- **H2 Console**: http://localhost:8080/api/h2-console

### 3. Frontend (Next.js)

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

### 4. Accès à l'application

1. Ouvrez `http://localhost:3000` dans votre navigateur
2. Créez un compte via "Register"
3. Connectez-vous avec vos identifiants

## Configuration

### Backend (application.yml)

#### Développement (H2 Database - Fichier)
Le profil par défaut utilise H2 en mode fichier pour persister les données :

```yaml
spring:
  datasource:
    url: jdbc:h2:file:./data/my_personal_tasks;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE;AUTO_RECONNECT=TRUE
    username: sa
    password:
    driver-class-name: org.h2.Driver
```

**Avantages** :
- ✅ Données persistées entre les redémarrages
- ✅ Pas d'installation de base de données requise
- ✅ Fichier stocké dans `Back/data/`

**H2 Console** :
- URL: `http://localhost:8080/api/h2-console`
- JDBC URL: `jdbc:h2:file:./data/my_personal_tasks`
- User: `sa`
- Password: (vide)

#### Production (PostgreSQL)

Créez un fichier `application-prod.yml` :

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/my_personal_tasks
    username: postgres
    password: ${DB_PASSWORD}
    driver-class-name: org.postgresql.Driver
  jpa:
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect

jwt:
  secret: ${JWT_SECRET}
```

Démarrez avec : `mvn spring-boot:run -Dspring.profiles.active=prod`

### Frontend (.env.local)

Créez un fichier `.env.local` dans le dossier `Front/` :

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

## Fonctionnalités

### Authentification
- ✅ Inscription / Connexion
- ✅ JWT Tokens (Access + Refresh)
- ✅ Rôles utilisateur (USER, ADMIN)
- ✅ Déconnexion avec invalidation du refresh token

### Projets
- ✅ Création, modification, suppression
- ✅ Membres et rôles (Owner, Admin, Member, Viewer)
- ✅ Statuts (Planning, Active, On Hold, Completed, Archived)
- ✅ Tableau de bord avec statistiques

### Tâches
- ✅ CRUD complet
- ✅ Priorités (Low, Medium, High, Urgent)
- ✅ Statuts (To Do, In Progress, In Review, Completed, Cancelled, On Hold)
- ✅ Assignation aux membres
- ✅ Dates d'échéance
- ⚠️ Labels (partiellement implémenté)
- ⚠️ Checklist (partiellement implémenté)
- ⚠️ Commentaires (partiellement implémenté)

### Interface
- ✅ Mode sombre / clair
- ✅ Multilingue (Anglais, Français)
- ✅ Responsive design (mobile-first)
- ✅ Vue calendrier des tâches
- ✅ Sidebar de navigation

## API Endpoints

### Authentification
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/auth/register` | Inscription |
| POST | `/api/auth/login` | Connexion |
| POST | `/api/auth/refresh` | Rafraîchir le token |
| POST | `/api/auth/logout` | Déconnexion |

### Utilisateurs
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/users/me` | Profil utilisateur |
| PUT | `/api/users/me` | Modifier le profil |
| PUT | `/api/users/me/password` | Changer le mot de passe |

### Projets
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/projects` | Liste des projets |
| POST | `/api/projects` | Créer un projet |
| GET | `/api/projects/{id}` | Détails d'un projet |
| PUT | `/api/projects/{id}` | Modifier un projet |
| DELETE | `/api/projects/{id}` | Supprimer un projet |
| POST | `/api/projects/{id}/members` | Ajouter un membre |
| DELETE | `/api/projects/{id}/members/{userId}` | Retirer un membre |

### Tâches
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/tasks/my-tasks` | Mes tâches |
| GET | `/api/tasks/project/{projectId}` | Tâches d'un projet |
| POST | `/api/tasks` | Créer une tâche |
| GET | `/api/tasks/{id}` | Détails d'une tâche |
| PUT | `/api/tasks/{id}` | Modifier une tâche |
| DELETE | `/api/tasks/{id}` | Supprimer une tâche |
| PATCH | `/api/tasks/{id}/status` | Modifier le statut |
| PATCH | `/api/tasks/{id}/assign` | Assigner la tâche |

## Technologies

### Backend
| Technologie | Version | Usage |
|-------------|---------|-------|
| Spring Boot | 3.2.1 | Framework principal |
| Spring Security | 6.x | Authentification/Authorization |
| Spring Data JPA | 3.2.x | Accès aux données |
| H2 Database | 2.x | Base de données dev |
| PostgreSQL | 42.x | Base de données prod |
| SpringDoc OpenAPI | 2.x | Documentation API |
| JJWT | 0.12.x | JWT Tokens |

### Frontend
| Technologie | Version | Usage |
|-------------|---------|-------|
| Next.js | 15.x | Framework React |
| React | 19.x | UI Library |
| TypeScript | 5.x | Typage statique |
| Tailwind CSS | 4.x | Styling |
| shadcn/ui | latest | Composants UI |
| Zustand | 5.x | State Management |
| TanStack Query | 5.x | Server State |
| Axios | 1.x | HTTP Client |
| Lucide React | 0.460.x | Icons |
| date-fns | 4.x | Manipulation dates |

## Sécurité

### ⚠️ Avertissement - Environnement de Développement

**Le fichier `application.yml` contient des secrets codés en dur :**
- JWT Secret
- Configuration de base de données

**Pour la production :**
1. Utilisez des variables d'environnement
2. Ne commitez jamais `application-prod.yml` avec des secrets
3. Utilisez un gestionnaire de secrets (Vault, AWS Secrets Manager, etc.)

### Configuration sécurisée (production)

```bash
# Variables d'environnement
export JWT_SECRET="votre-secret-tres-long-et-securise"
export DB_PASSWORD="votre-mot-de-passe-postgres"

# Démarrage
mvn spring-boot:run -Dspring.profiles.active=prod
```

## Dépannage

### Le frontend ne se charge pas
1. Vérifiez que le backend est démarré sur le port 8080
2. Vérifiez les paramètres CORS dans le backend
3. Effacez le cache du navigateur et les localStorage
4. Vérifiez la console du navigateur pour les erreurs

### Erreur d'authentification
1. Vérifiez que les tokens sont valides
2. Déconnectez-vous et reconnectez-vous
3. Vérifiez les logs du backend
4. Effacez le localStorage : `localStorage.clear()`

### Base de données H2 non trouvée
1. Vérifiez que le dossier `Back/data/` existe
2. L'application crée automatiquement la base au premier démarrage
3. Pour réinitialiser : supprimez le dossier `Back/data/`

### Port déjà utilisé
```bash
# Trouver le processus utilisant le port 8080
lsof -i :8080

# Tuer le processus
kill -9 <PID>
```

## Évolutions Futures

### Court terme
- [ ] Finaliser les labels sur les tâches
- [ ] Finaliser les commentaires
- [ ] Finaliser les checklists
- [ ] Pièces jointes sur les tâches

### Moyen terme
- [ ] Pagination côté serveur
- [ ] Cache Redis
- [ ] Tests unitaires et d'intégration
- [ ] CI/CD GitHub Actions

### Long terme
- [ ] Notifications en temps réel (WebSocket)
- [ ] Application mobile
- [ ] Intégration calendrier externe (Google, Outlook)
- [ ] Tableau Kanban

## Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/ma-fonctionnalite`)
3. Commit les changements (`git commit -m 'feat: ajouter ma fonctionnalité'`)
4. Push la branche (`git push origin feature/ma-fonctionnalite`)
5. Ouvrir une Pull Request

### Convention de commits

| Type | Description |
|------|-------------|
| `feat` | Nouvelle fonctionnalité |
| `fix` | Correction de bug |
| `docs` | Documentation |
| `style` | Formatage |
| `refactor` | Refactoring |
| `test` | Tests |
| `chore` | Maintenance |

## Auteur

**Saad Belmahfoud**
- GitHub: [@SaadBelmahfoud](https://github.com/SaadBelmahfoud)

## Licence

MIT License

---

*Documentation mise à jour le : Mars 2025*
*Version du projet : 1.0.0*

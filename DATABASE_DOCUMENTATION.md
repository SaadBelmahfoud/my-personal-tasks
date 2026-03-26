# 📊 MyPersonalTasks - Documentation Base de Données

## 🗄️ Vue d'Ensemble

MyPersonalTasks utilise une architecture de base de données relationnelle conçue pour gérer efficacement les projets, les tâches et la collaboration utilisateur.

### Technologies
- **Développement**: H2 Database (file-based)
- **Production**: PostgreSQL (recommandé) ou MySQL
- **ORM**: Spring Data JPA / Hibernate
- **Migrations**: Hibernate DDL Auto (dev) / Flyway ou Liquibase (prod recommandé)

---

## 📐 Modèle Entité-Association (ERD)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              MODÈLE DE DONNÉES                                       │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  ┌──────────────────┐          ┌──────────────────┐          ┌──────────────────┐   │
│  │      users       │          │ project_members  │          │    projects      │   │
│  ├──────────────────┤          ├──────────────────┤          ├──────────────────┤   │
│  │ id (UUID) PK     │◄─────────│ id (UUID) PK     │─────────►│ id (UUID) PK     │   │
│  │ username UNIQUE  │   1..*   │ user_id FK       │   1..*   │ name             │   │
│  │ email UNIQUE     │          │ project_id FK    │          │ description      │   │
│  │ password         │          │ role ENUM        │          │ color            │   │
│  │ first_name       │          │ is_favorite      │          │ icon             │   │
│  │ last_name        │          │ notification_    │          │ status ENUM      │   │
│  │ bio              │          │   enabled        │          │ is_public        │   │
│  │ avatar_url       │          │ joined_at        │          │ start_date       │   │
│  │ role ENUM        │          └──────────────────┘          │ end_date         │   │
│  │ is_enabled       │                                        │ created_at       │   │
│  │ is_verified      │                                        │ updated_at       │   │
│  │ created_at       │                                        └────────┬─────────┘   │
│  │ last_login_at    │                                                 │             │
│  └────────┬─────────┘                                                 │             │
│           │                                                           │             │
│           │         ┌──────────────────┐                             │             │
│           │         │ refresh_tokens   │                             │             │
│           │         ├──────────────────┤                             │             │
│           └────────►│ id (UUID) PK     │                             │             │
│                     │ token UNIQUE     │                             │             │
│                     │ user_id FK       │                             │             │
│                     │ expires_at       │                             │             │
│                     │ is_revoked       │                             │             │
│                     │ created_at       │                             │             │
│                     └──────────────────┘                             │             │
│                                                                      │             │
│           ┌──────────────────┐                                       │             │
│           │      tasks       │◄──────────────────────────────────────┘             │
│           ├──────────────────┤                                                     │
│           │ id (UUID) PK     │                                                     │
│           │ title            │                                                     │
│           │ description      │                                                     │
│           │ status ENUM      │                                                     │
│           │ priority ENUM    │                                                     │
│           │ due_date         │──────────────┐                                      │
│           │ start_date       │              │                                      │
│           │ estimated_hours  │              │    ┌──────────────────┐              │
│           │ actual_hours     │              │    │  task_labels     │              │
│           │ position         │              │    │ (table de liaison)│              │
│           │ is_completed     │              │    ├──────────────────┤              │
│           │ completed_at     │              │    │ task_id FK       │              │
│           │ created_at       │              │    │ label_id FK      │              │
│           │ updated_at       │              │    └────────┬─────────┘              │
│           │ project_id FK    │◄─────────────┼─────────────┘                        │
│           │ assignee_id FK   │──────────────┼───────────────┐                      │
│           └────────┬─────────┘              │               │                      │
│                    │                        │               │                      │
│     ┌──────────────┼──────────────┐         │               │                      │
│     │              │              │         │               │                      │
│     ▼              ▼              ▼         ▼               │                      │
│ ┌──────────┐ ┌──────────┐ ┌──────────────┐ ┌──────────┐    │                      │
│ │  labels  │ │ comments │ │checklist_item│ │   tasks  │◄───┘                      │
│ ├──────────┤ ├──────────┤ ├──────────────┤ └──────────┘                           │
│ │id (UUID) │ │id (UUID) │ │ id (UUID) PK │                                        │
│ │name      │ │content   │ │ content      │                                        │
│ │color     │ │task_id FK│ │ is_completed │                                        │
│ │descriptio│ │user_id FK│ │ position     │                                        │
│ │project_id│ │created_at│ │ task_id FK   │                                        │
│ └────┬─────┘ └──────────┘ │ created_at   │                                        │
│      │                    │ completed_at │                                        │
│      │                    └──────────────┘                                        │
│      │                                                                            │
│      │    ┌──────────────────┐                                                    │
│      └───►│ task_labels      │                                                    │
│           ├──────────────────┤                                                    │
│           │ task_id FK       │                                                    │
│           │ label_id FK      │                                                    │
│           └──────────────────┘                                                    │
│                                                                                   │
│  ┌──────────────────┐                                                            │
│  │ task_attachments │                                                            │
│  ├──────────────────┤                                                            │
│  │ id (UUID) PK     │                                                            │
│  │ name             │                                                            │
│  │ file_path        │                                                            │
│  │ file_size        │                                                            │
│  │ content_type     │                                                            │
│  │ task_id FK       │                                                            │
│  │ uploaded_by FK   │                                                            │
│  │ uploaded_at      │                                                            │
│  └──────────────────┘                                                            │
│                                                                                   │
└───────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📋 Détail des Tables

### 1. `users` - Utilisateurs

**Description fonctionnelle**: Stocke les informations des utilisateurs inscrits sur la plateforme.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | UUID | PK, NOT NULL | Identifiant unique |
| `username` | VARCHAR(50) | UNIQUE, NOT NULL | Nom d'utilisateur pour connexion |
| `email` | VARCHAR(100) | UNIQUE, NOT NULL | Adresse email |
| `password` | VARCHAR(255) | NOT NULL | Mot de passe hashé (BCrypt) |
| `first_name` | VARCHAR(50) | NULLABLE | Prénom |
| `last_name` | VARCHAR(50) | NULLABLE | Nom de famille |
| `bio` | VARCHAR(500) | NULLABLE | Biographie |
| `avatar_url` | VARCHAR(500) | NULLABLE | URL de l'avatar |
| `role` | ENUM | NOT NULL, DEFAULT 'USER' | Rôle (USER, ADMIN) |
| `is_enabled` | BOOLEAN | NOT NULL, DEFAULT TRUE | Compte actif |
| `is_verified` | BOOLEAN | NOT NULL, DEFAULT FALSE | Email vérifié |
| `created_at` | TIMESTAMP | NOT NULL | Date de création |
| `last_login_at` | TIMESTAMP | NULLABLE | Dernière connexion |

**Index recommandés**:
- `idx_users_username` sur `username`
- `idx_users_email` sur `email`

**Améliorations possibles**:
- Ajouter `password_changed_at` pour politique de rotation
- Ajouter `failed_login_attempts` pour sécurisation
- Ajouter `locked_until` pour verrouillage temporaire
- Ajouter table `user_preferences` pour paramètres utilisateur

---

### 2. `projects` - Projets

**Description fonctionnelle**: Représente un projet qui peut contenir plusieurs tâches et membres.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | UUID | PK, NOT NULL | Identifiant unique |
| `name` | VARCHAR(100) | NOT NULL | Nom du projet |
| `description` | TEXT | NULLABLE | Description détaillée |
| `color` | VARCHAR(7) | NULLABLE | Couleur hexadécimale |
| `icon` | VARCHAR(50) | NULLABLE | Nom de l'icône |
| `status` | ENUM | NOT NULL, DEFAULT 'PLANNING' | Statut (PLANNING, ACTIVE, ON_HOLD, COMPLETED, ARCHIVED) |
| `is_public` | BOOLEAN | NOT NULL, DEFAULT FALSE | Visibilité publique |
| `start_date` | DATE | NULLABLE | Date de début prévue |
| `end_date` | DATE | NULLABLE | Date de fin prévue |
| `created_at` | TIMESTAMP | NOT NULL | Date de création |
| `updated_at` | TIMESTAMP | NULLABLE | Date de modification |

**Index recommandés**:
- `idx_projects_status` sur `status`
- `idx_projects_created_at` sur `created_at`

**Améliorations possibles**:
- Ajouter `budget` pour suivi financier
- Ajouter `priority` pour priorisation
- Ajouter `template_id` pour projets basés sur templates
- Ajouter table `project_tags` pour catégorisation

---

### 3. `project_members` - Membres de Projet

**Description fonctionnelle**: Table d'association entre utilisateurs et projets avec gestion des rôles.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | UUID | PK, NOT NULL | Identifiant unique |
| `user_id` | UUID | FK → users.id, NOT NULL | Référence utilisateur |
| `project_id` | UUID | FK → projects.id, NOT NULL | Référence projet |
| `role` | ENUM | NOT NULL, DEFAULT 'MEMBER' | Rôle (OWNER, ADMIN, MEMBER, VIEWER) |
| `is_favorite` | BOOLEAN | NOT NULL, DEFAULT FALSE | Projet favori |
| `notification_enabled` | BOOLEAN | NOT NULL, DEFAULT TRUE | Notifications actives |
| `joined_at` | TIMESTAMP | NOT NULL | Date d'adhésion |

**Contraintes uniques**:
- `UNIQUE(user_id, project_id)` - Un utilisateur ne peut être membre qu'une fois par projet

**Index recommandés**:
- `idx_project_members_user_id` sur `user_id`
- `idx_project_members_project_id` sur `project_id`

**Améliorations possibles**:
- Ajouter `permissions` JSON pour permissions granulaires
- Ajouter `invited_by` pour traçabilité des invitations
- Ajouter `invitation_status` (PENDING, ACCEPTED, DECLINED)

---

### 4. `tasks` - Tâches

**Description fonctionnelle**: Représente une tâche au sein d'un projet, assignée à un utilisateur.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | UUID | PK, NOT NULL | Identifiant unique |
| `title` | VARCHAR(200) | NOT NULL | Titre de la tâche |
| `description` | TEXT | NULLABLE | Description détaillée |
| `status` | ENUM | NOT NULL, DEFAULT 'TODO' | Statut (TODO, IN_PROGRESS, IN_REVIEW, COMPLETED, CANCELLED, ON_HOLD) |
| `priority` | ENUM | NULLABLE, DEFAULT 'MEDIUM' | Priorité (LOW, MEDIUM, HIGH, URGENT) |
| `due_date` | DATE | NULLABLE | Date d'échéance |
| `start_date` | DATE | NULLABLE | Date de début |
| `estimated_hours` | INTEGER | NULLABLE | Temps estimé |
| `actual_hours` | INTEGER | NULLABLE | Temps réel |
| `position` | INTEGER | NULLABLE, DEFAULT 0 | Position pour ordonnancement |
| `is_completed` | BOOLEAN | NOT NULL, DEFAULT FALSE | Tâche terminée |
| `completed_at` | TIMESTAMP | NULLABLE | Date de complétion |
| `created_at` | TIMESTAMP | NOT NULL | Date de création |
| `updated_at` | TIMESTAMP | NULLABLE | Date de modification |
| `project_id` | UUID | FK → projects.id, NOT NULL | Projet parent |
| `assignee_id` | UUID | FK → users.id, NULLABLE | Utilisateur assigné |

**Index recommandés**:
- `idx_tasks_project_id` sur `project_id`
- `idx_tasks_assignee_id` sur `assignee_id`
- `idx_tasks_status` sur `status`
- `idx_tasks_due_date` sur `due_date`
- `idx_tasks_priority` sur `priority`

**Améliorations possibles**:
- Ajouter `parent_task_id` pour sous-tâches
- Ajouter `story_points` pour méthodologie Agile
- Ajouter `time_logged` pour suivi temps
- Ajouter `recurrence` pour tâches récurrentes

---

### 5. `labels` - Étiquettes

**Description fonctionnelle**: Étiquettes personnalisables pour catégoriser les tâches par projet.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | UUID | PK, NOT NULL | Identifiant unique |
| `name` | VARCHAR(50) | NOT NULL | Nom de l'étiquette |
| `color` | VARCHAR(7) | NULLABLE | Couleur hexadécimale |
| `description` | VARCHAR(200) | NULLABLE | Description |
| `project_id` | UUID | FK → projects.id, NOT NULL | Projet parent |

**Index recommandés**:
- `idx_labels_project_id` sur `project_id`

**Améliorations possibles**:
- Ajouter `is_system` pour étiquettes système
- Ajouter `sort_order` pour ordre d'affichage

---

### 6. `task_labels` - Association Tâches-Étiquettes

**Description fonctionnelle**: Table de liaison many-to-many entre tâches et étiquettes.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `task_id` | UUID | FK → tasks.id, NOT NULL | Référence tâche |
| `label_id` | UUID | FK → labels.id, NOT NULL | Référence étiquette |

**Contraintes**:
- PK: `(task_id, label_id)`

---

### 7. `checklist_items` - Éléments de Checklist

**Description fonctionnelle**: Sous-tâches ou éléments de checklist pour une tâche.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | UUID | PK, NOT NULL | Identifiant unique |
| `content` | VARCHAR(500) | NOT NULL | Contenu de l'élément |
| `is_completed` | BOOLEAN | NOT NULL, DEFAULT FALSE | Élément coché |
| `position` | INTEGER | NOT NULL, DEFAULT 0 | Position dans la liste |
| `created_at` | TIMESTAMP | NOT NULL | Date de création |
| `completed_at` | TIMESTAMP | NULLABLE | Date de complétion |
| `task_id` | UUID | FK → tasks.id, NOT NULL | Tâche parente |

**Index recommandés**:
- `idx_checklist_items_task_id` sur `task_id`

---

### 8. `comments` - Commentaires

**Description fonctionnelle**: Commentaires sur les tâches pour la collaboration.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | UUID | PK, NOT NULL | Identifiant unique |
| `content` | TEXT | NOT NULL | Contenu du commentaire |
| `task_id` | UUID | FK → tasks.id, NOT NULL | Tâche commentée |
| `user_id` | UUID | FK → users.id, NOT NULL | Auteur du commentaire |
| `created_at` | TIMESTAMP | NOT NULL | Date de création |
| `updated_at` | TIMESTAMP | NULLABLE | Date de modification |

**Index recommandés**:
- `idx_comments_task_id` sur `task_id`
- `idx_comments_user_id` sur `user_id`

**Améliorations possibles**:
- Ajouter `parent_id` pour réponses threadées
- Ajouter `mentions` JSON pour @mentions

---

### 9. `task_attachments` - Pièces Jointes

**Description fonctionnelle**: Fichiers attachés aux tâches.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | UUID | PK, NOT NULL | Identifiant unique |
| `name` | VARCHAR(255) | NOT NULL | Nom du fichier |
| `file_path` | VARCHAR(500) | NOT NULL | Chemin de stockage |
| `file_size` | BIGINT | NULLABLE | Taille en octets |
| `content_type` | VARCHAR(100) | NULLABLE | Type MIME |
| `task_id` | UUID | FK → tasks.id, NOT NULL | Tâche parente |
| `uploaded_by` | UUID | FK → users.id, NOT NULL | Uploadé par |
| `uploaded_at` | TIMESTAMP | NOT NULL | Date d'upload |

**Index recommandés**:
- `idx_task_attachments_task_id` sur `task_id`

---

### 10. `refresh_tokens` - Tokens de Rafraîchissement

**Description fonctionnelle**: Tokens JWT de longue durée pour le renouvellement des sessions.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | UUID | PK, NOT NULL | Identifiant unique |
| `token` | VARCHAR(500) | UNIQUE, NOT NULL | Token JWT |
| `user_id` | UUID | FK → users.id, NOT NULL | Utilisateur propriétaire |
| `expires_at` | TIMESTAMP | NOT NULL | Date d'expiration |
| `is_revoked` | BOOLEAN | NOT NULL, DEFAULT FALSE | Token révoqué |
| `created_at` | TIMESTAMP | NOT NULL | Date de création |

**Index recommandés**:
- `idx_refresh_tokens_token` sur `token`
- `idx_refresh_tokens_user_id` sur `user_id`

**Améliorations possibles**:
- Ajouter `device_info` pour traçabilité
- Ajouter `ip_address` pour sécurité

---

## 🔗 Relations et Cardinalités

| Table Source | Table Cible | Relation | Cardinalité |
|-------------|-------------|----------|-------------|
| users | projects | Owner | 1:N |
| users | tasks | Assignee | 1:N |
| users | comments | Author | 1:N |
| users | project_members | Member | 1:N |
| users | refresh_tokens | Token | 1:N |
| projects | tasks | Contains | 1:N |
| projects | project_members | Has | 1:N |
| projects | labels | Has | 1:N |
| tasks | comments | Has | 1:N |
| tasks | checklist_items | Has | 1:N |
| tasks | task_attachments | Has | 1:N |
| tasks | labels | Tagged | N:M (via task_labels) |

---

## 🔍 Vues Recommandées

### `v_project_stats` - Statistiques des Projets

```sql
CREATE VIEW v_project_stats AS
SELECT 
    p.id,
    p.name,
    p.status,
    COUNT(DISTINCT t.id) as total_tasks,
    COUNT(DISTINCT CASE WHEN t.is_completed THEN t.id END) as completed_tasks,
    COUNT(DISTINCT CASE WHEN t.due_date < CURRENT_DATE AND NOT t.is_completed THEN t.id END) as overdue_tasks,
    ROUND(
        COUNT(DISTINCT CASE WHEN t.is_completed THEN t.id END) * 100.0 / 
        NULLIF(COUNT(DISTINCT t.id), 0), 2
    ) as completion_percentage
FROM projects p
LEFT JOIN tasks t ON t.project_id = p.id
GROUP BY p.id, p.name, p.status;
```

### `v_user_dashboard` - Dashboard Utilisateur

```sql
CREATE VIEW v_user_dashboard AS
SELECT 
    u.id as user_id,
    COUNT(DISTINCT pm.project_id) as projects_count,
    COUNT(DISTINCT t.id) as tasks_count,
    COUNT(DISTINCT CASE WHEN t.is_completed THEN t.id END) as completed_tasks_count,
    COUNT(DISTINCT CASE WHEN t.due_date < CURRENT_DATE AND NOT t.is_completed THEN t.id END) as overdue_tasks_count
FROM users u
LEFT JOIN project_members pm ON pm.user_id = u.id
LEFT JOIN tasks t ON t.assignee_id = u.id
GROUP BY u.id;
```

---

## 📈 Évolutions Futures Recommandées

### Court Terme

1. **Table `notifications`**
   ```sql
   CREATE TABLE notifications (
       id UUID PRIMARY KEY,
       user_id UUID REFERENCES users(id),
       type VARCHAR(50) NOT NULL,
       title VARCHAR(200) NOT NULL,
       content TEXT,
       is_read BOOLEAN DEFAULT FALSE,
       created_at TIMESTAMP NOT NULL
   );
   ```

2. **Table `activities`** (Audit trail)
   ```sql
   CREATE TABLE activities (
       id UUID PRIMARY KEY,
       user_id UUID REFERENCES users(id),
       entity_type VARCHAR(50) NOT NULL,
       entity_id UUID NOT NULL,
       action VARCHAR(50) NOT NULL,
       changes JSON,
       created_at TIMESTAMP NOT NULL
   );
   ```

### Moyen Terme

3. **Table `project_templates`**
   ```sql
   CREATE TABLE project_templates (
       id UUID PRIMARY KEY,
       name VARCHAR(100) NOT NULL,
       description TEXT,
       default_tasks JSON,
       created_by UUID REFERENCES users(id),
       is_public BOOLEAN DEFAULT FALSE
   );
   ```

4. **Tables pour temps de travail**
   ```sql
   CREATE TABLE time_entries (
       id UUID PRIMARY KEY,
       task_id UUID REFERENCES tasks(id),
       user_id UUID REFERENCES users(id),
       start_time TIMESTAMP NOT NULL,
       end_time TIMESTAMP,
       duration_minutes INTEGER,
       description TEXT
   );
   ```

### Long Terme

5. **Support multi-tenant**
   - Ajouter `tenant_id` à toutes les tables
   - Isolation des données par organisation

6. **Chiffrement des données sensibles**
   - Chiffrer le contenu des tâches confidentielles
   - Clés de chiffrement par projet

---

## 🛡️ Sécurité et Conformité

### Recommandations

1. **Chiffrement**:
   - Mot de passe: BCrypt (déjà implémenté)
   - Données sensibles: AES-256 pour les champs confidentiels

2. **Audit**:
   - Logging des accès aux données sensibles
   - Historique des modifications

3. **RGPD**:
   - Ajouter table `data_deletion_requests`
   - Soft delete avec `deleted_at` sur les tables principales
   - Procédure d'anonymisation des utilisateurs supprimés

4. **Backup**:
   - Backups quotidiens automatisés
   - Rétention de 30 jours minimum
   - Tests de restauration réguliers

---

## 📝 Scripts de Migration

### Création des Index de Performance

```sql
-- Performance indexes
CREATE INDEX CONCURRENTLY idx_tasks_project_status ON tasks(project_id, status);
CREATE INDEX CONCURRENTLY idx_tasks_assignee_status ON tasks(assignee_id, status);
CREATE INDEX CONCURRENTLY idx_tasks_due_date_not_completed ON tasks(due_date) 
    WHERE NOT is_completed;

-- Full-text search
CREATE INDEX CONCURRENTLY idx_tasks_title_search ON tasks USING gin(to_tsvector('french', title));
CREATE INDEX CONCURRENTLY idx_projects_name_search ON projects USING gin(to_tsvector('french', name));
```

---

*Document mis à jour: $(date)*
*Version: 1.1.0*
*Auteur: Architecture Team*

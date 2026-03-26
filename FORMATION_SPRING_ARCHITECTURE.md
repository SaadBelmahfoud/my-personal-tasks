# 📚 Formation Complète : Java Spring, Architecture & Design Patterns

## À travers le projet MyPersonalTasks

---

# Table des Matières

1. [Introduction et Philosophie](#1-introduction-et-philosophie)
2. [Architecture Générale d'une Application](#2-architecture-générale-dune-application)
3. [Backend avec Spring Boot](#3-backend-avec-spring-boot)
4. [Design Patterns Implémentés](#4-design-patterns-implémentés)
5. [Sécurité avec Spring Security](#5-sécurité-avec-spring-security)
6. [Base de Données et JPA](#6-base-de-données-et-jpa)
7. [Frontend avec Next.js](#7-frontend-avec-nextjs)
8. [Communication Front-Back](#8-communication-front-back)
9. [Bonnes Pratiques et Convention](#9-bonnes-pratiques-et-conventions)
10. [Exercices Pratiques](#10-exercices-pratiques)

---

# 1. Introduction et Philosophie

## 1.1 Qu'est-ce que Spring Boot ?

**Spring Boot** est un framework Java qui simplifie le développement d'applications en éliminant la configuration boilerplate.

### Pourquoi Spring Boot ?

```
Sans Spring Boot:
┌─────────────────────────────────────────────────────────────┐
│  - Configuration XML complexe                                │
│  - Gestion manuelle des dépendances                         │
│  - Serveur d'application à configurer                       │
│  - Beaucoup de code répétitif                               │
└─────────────────────────────────────────────────────────────┘

Avec Spring Boot:
┌─────────────────────────────────────────────────────────────┐
│  ✅ Configuration automatique (Auto-configuration)          │
│  ✅ Serveur Tomcat embarqué                                 │
│  ✅ Dépendances "starter" préconfigurées                    │
│  ✅ Prêt à produire en quelques minutes                     │
└─────────────────────────────────────────────────────────────┘
```

### Notre projet MyPersonalTasks

```java
// Back/src/main/java/com/mypersonaltasks/MyPersonalTasksApplication.java
@SpringBootApplication  // ← Annotation magique
public class MyPersonalTasksApplication {
    public static void main(String[] args) {
        SpringApplication.run(MyPersonalTasksApplication.class, args);
    }
}
```

#### Décomposition de `@SpringBootApplication`

```java
@SpringBootApplication est équivalent à:
┌─────────────────────────────────────────────────────────────┐
│  @SpringBootConfiguration                                   │
│  → Permet la configuration par beans                        │
│                                                             │
│  @EnableAutoConfiguration                                   │
│  → Configure automatiquement Spring selon les dépendances   │
│                                                             │
│  @ComponentScan                                             │
│  → Scanne automatiquement les composants du package         │
└─────────────────────────────────────────────────────────────┘
```

## 1.2 Architecture Trois Tiers

Notre application suit l'architecture **trois tiers** (Three-Tier Architecture):

```
┌─────────────────────────────────────────────────────────────┐
│                    COUCHE PRÉSENTATION                       │
│                         (Frontend)                           │
│                    Next.js + React + TypeScript              │
│                          Port 3000                           │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTP/REST API
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    COUCHE MÉTIER                             │
│                         (Backend)                            │
│                    Spring Boot + Java 21                     │
│                          Port 8080                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ Controllers │  │  Services   │  │ Repositories│         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────┬───────────────────────────────────┘
                          │ JDBC/Hibernate
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    COUCHE DONNÉES                            │
│                       (Database)                             │
│                      H2 / PostgreSQL                         │
└─────────────────────────────────────────────────────────────┘
```

### Pourquoi cette architecture ?

| Avantage | Explication |
|----------|-------------|
| **Séparation des responsabilités** | Chaque couche a un rôle précis |
| **Maintenabilité** | Modification d'une couche sans impacter les autres |
| **Testabilité** | Tests unitaires par couche |
| **Scalabilité** | Chaque couche peut scaler indépendamment |
| **Évolutivité** | Remplacement possible d'une technologie |

---

# 2. Architecture Générale d'une Application

## 2.1 Architecture Backend Détaillée

```
com.mypersonaltasks/
├── controller/          ← Point d'entrée HTTP (REST API)
│   ├── AuthController.java
│   ├── ProjectController.java
│   ├── TaskController.java
│   └── UserController.java
│
├── service/             ← Logique métier
│   ├── UserService.java
│   ├── ProjectService.java
│   └── TaskService.java
│
├── repository/          ← Accès aux données
│   ├── UserRepository.java
│   ├── ProjectRepository.java
│   └── TaskRepository.java
│
├── entity/              ← Modèles de données (tables DB)
│   ├── User.java
│   ├── Project.java
│   └── Task.java
│
├── dto/                 ← Objets de transfert
│   ├── UserDTO.java
│   ├── ProjectDTO.java
│   └── TaskDTO.java
│
├── security/            ← Configuration sécurité
│   ├── SecurityConfig.java
│   ├── JwtService.java
│   └── JwtAuthenticationFilter.java
│
├── exception/           ← Gestion des erreurs
│   ├── GlobalExceptionHandler.java
│   └── ResourceNotFoundException.java
│
├── enums/               ← Énumérations
│   ├── TaskStatus.java
│   └── TaskPriority.java
│
└── config/              ← Configuration Spring
    └── OpenApiConfig.java
```

## 2.2 Flux de Requête Complet

Exemple : Création d'une tâche

```
┌──────────────────────────────────────────────────────────────────────────┐
│  1. REQUÊTE HTTP                                                          │
│     POST /api/tasks                                                       │
│     Body: { "title": "Nouvelle tâche", "projectId": "uuid" }             │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  2. FILTRE SÉCURITÉ (JwtAuthenticationFilter)                            │
│     - Extraction du token JWT de l'en-tête Authorization                  │
│     - Validation du token                                                 │
│     - Chargement de l'utilisateur authentifié                             │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  3. CONTRÔLEUR (TaskController)                                          │
│     @PostMapping("/tasks")                                                │
│     public ResponseEntity<TaskDTO.Response> createTask(                  │
│         @Valid @RequestBody TaskDTO.CreateRequest request                │
│     )                                                                     │
│     - Réception de la requête                                            │
│     - Validation automatique des données (@Valid)                        │
│     - Appel au service                                                   │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  4. SERVICE (TaskService)                                                │
│     public Task createTask(TaskDTO.CreateRequest request) {              │
│         - Vérification des règles métier                                 │
│         - Vérification que le projet existe                              │
│         - Création de l'entité Task                                      │
│         - Appel au repository pour sauvegarder                           │
│     }                                                                     │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  5. REPOSITORY (TaskRepository extends JpaRepository<Task, UUID>)        │
│     - Hérite de CRUD automatique                                         │
│     - taskRepository.save(task) → INSERT INTO tasks ...                  │
│     - Génération SQL automatique par Hibernate                           │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  6. BASE DE DONNÉES                                                       │
│     INSERT INTO tasks (id, title, project_id, ...) VALUES (?, ?, ?, ...) │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼ (retour)
┌──────────────────────────────────────────────────────────────────────────┐
│  7. RÉPONSE HTTP                                                          │
│     Status: 201 Created                                                   │
│     Body: { "success": true, "data": { "id": "...", "title": "..." } }   │
└──────────────────────────────────────────────────────────────────────────┘
```

---

# 3. Backend avec Spring Boot

## 3.1 Les Entités (Entities)

### Qu'est-ce qu'une Entité ?

Une **entité** est une classe Java qui représente une table dans la base de données.

### Exemple : Entité User

```java
// Back/src/main/java/com/mypersonaltasks/entity/User.java

package com.mypersonaltasks.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    
    // ===== CLÉ PRIMAIRE =====
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;
    
    // ===== COLONNES SIMPLES =====
    @Column(name = "username", nullable = false, unique = true, length = 50)
    private String username;
    
    @Column(name = "email", nullable = false, unique = true, length = 100)
    private String email;
    
    @Column(name = "password", nullable = false, length = 255)
    private String password;
    
    @Column(name = "first_name", length = 50)
    private String firstName;
    
    @Column(name = "last_name", length = 50)
    private String lastName;
    
    // ===== ÉNUMÉRATION =====
    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 20)
    private UserRole role = UserRole.USER;
    
    // ===== DATES =====
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    // ===== RELATIONS =====
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<RefreshToken> refreshTokens = new HashSet<>();
    
    // ===== CYCLE DE VIE =====
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
```

### Annotations JPA Expliquées

| Annotation | Rôle | Exemple |
|------------|------|---------|
| `@Entity` | Déclare la classe comme entité JPA | `@Entity` |
| `@Table` | Configure la table SQL | `@Table(name = "users")` |
| `@Id` | Déclare la clé primaire | `@Id` |
| `@GeneratedValue` | Génère automatiquement la valeur | `@GeneratedValue(strategy = GenerationType.UUID)` |
| `@Column` | Configure la colonne SQL | `@Column(name = "email", unique = true)` |
| `@Enumerated` | Définit comment stocker un enum | `@Enumerated(EnumType.STRING)` |
| `@OneToMany` | Relation 1 vers plusieurs | `@OneToMany(mappedBy = "user")` |
| `@ManyToOne` | Relation plusieurs vers 1 | `@ManyToOne(fetch = FetchType.LAZY)` |
| `@ManyToMany` | Relation plusieurs vers plusieurs | `@ManyToMany` |
| `@PrePersist` | Exécuté avant l'insertion | `@PrePersist` |

### Lombok : Réduire le Boilerplate

```java
// Sans Lombok (environ 100 lignes)
public class User {
    private UUID id;
    private String username;
    
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    
    public User() {}
    
    public User(UUID id, String username) {
        this.id = id;
        this.username = username;
    }
    
    @Override
    public boolean equals(Object o) { ... }
    
    @Override
    public int hashCode() { ... }
    
    @Override
    public String toString() { ... }
}

// Avec Lombok (1 ligne par annotation)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class User {
    private UUID id;
    private String username;
}
```

### Les Relations JPA

#### Relation One-to-Many (1:N)

```
Un Projet a plusieurs Tâches
Une Tâche appartient à un Projet
```

```java
// Côté "One" (Project)
@Entity
public class Project {
    @Id
    private UUID id;
    
    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL)
    private List<Task> tasks = new ArrayList<>();
}

// Côté "Many" (Task)
@Entity
public class Task {
    @Id
    private UUID id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;
}
```

#### Relation Many-to-Many (N:M)

```
Une Tâche peut avoir plusieurs Labels
Un Label peut être sur plusieurs Tâches
```

```java
@Entity
public class Task {
    @Id
    private UUID id;
    
    @ManyToMany
    @JoinTable(
        name = "task_labels",
        joinColumns = @JoinColumn(name = "task_id"),
        inverseJoinColumns = @JoinColumn(name = "label_id")
    )
    private Set<Label> labels = new HashSet<>();
}

@Entity
public class Label {
    @Id
    private UUID id;
    
    @ManyToMany(mappedBy = "labels")
    private Set<Task> tasks = new HashSet<>();
}
```

### Fetch Types : LAZY vs EAGER

```
┌─────────────────────────────────────────────────────────────┐
│  EAGER (Immédiat)                                           │
│  - Charge la relation en même temps que l'entité parente   │
│  - Risque de surcharge (N+1 queries)                       │
│  - Utilisé pour les données toujours nécessaires           │
├─────────────────────────────────────────────────────────────┤
│  LAZY (Différé) - RECOMMANDÉ                                │
│  - Charge la relation uniquement si accédée                │
│  - Évite les requêtes inutiles                             │
│  - Nécessite une transaction ouverte                       │
└─────────────────────────────────────────────────────────────┘
```

## 3.2 Les Repositories

### Qu'est-ce qu'un Repository ?

Un **Repository** est une interface qui abstrait l'accès aux données. Spring Data JPA génère automatiquement l'implémentation.

```java
// Back/src/main/java/com/mypersonaltasks/repository/UserRepository.java

package com.mypersonaltasks.repository;

import com.mypersonaltasks.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    
    // ===== MÉTHODES HÉRITÉES AUTOMATIQUEMENT =====
    // save(User user)          → INSERT ou UPDATE
    // findById(UUID id)        → SELECT WHERE id = ?
    // findAll()                → SELECT *
    // deleteById(UUID id)      → DELETE WHERE id = ?
    // count()                  → SELECT COUNT(*)
    
    // ===== MÉTHODES PERSONNALISÉES =====
    // Convention: findBy + NomChamp
    Optional<User> findByUsername(String username);
    
    Optional<User> findByEmail(String email);
    
    boolean existsByUsername(String username);
    
    boolean existsByEmail(String email);
    
    // Requête avec plusieurs critères
    Optional<User> findByUsernameOrEmail(String username, String email);
    
    // Requête avec mot-clé
    List<User> findByRole(UserRole role);
    
    // Requête avec @Query personnalisée
    @Query("SELECT u FROM User u WHERE u.enabled = true AND u.createdAt > :date")
    List<User> findActiveUsersCreatedAfter(@Param("date") LocalDateTime date);
}
```

### Conventions de Nommage

| Mot-clé | Description | Exemple |
|---------|-------------|---------|
| `findBy` | Recherche | `findByUsername` |
| `existsBy` | Existence | `existsByEmail` |
| `countBy` | Comptage | `countByRole` |
| `deleteBy` | Suppression | `deleteByEnabledFalse` |
| `And` | ET logique | `findByUsernameAndEmail` |
| `Or` | OU logique | `findByUsernameOrEmail` |
| `Between` | Entre deux valeurs | `findByCreatedAtBetween` |
| `LessThan` | Inférieur à | `findByAgeLessThan` |
| `GreaterThan` | Supérieur à | `findByAgeGreaterThan` |
| `Like` | Recherche partielle | `findByNameLike` |
| `In` | Dans une liste | `findByRoleIn` |
| `OrderBy` | Tri | `findByRoleOrderByNameAsc` |

## 3.3 Les Services

### Qu'est-ce qu'un Service ?

Un **Service** contient la **logique métier**. Il orchestre les appels aux repositories et applique les règles de gestion.

```java
// Back/src/main/java/com/mypersonaltasks/service/TaskService.java

package com.mypersonaltasks.service;

import com.mypersonaltasks.entity.Task;
import com.mypersonaltasks.entity.Project;
import com.mypersonaltasks.entity.User;
import com.mypersonaltasks.exception.ResourceNotFoundException;
import com.mypersonaltasks.exception.ForbiddenException;
import com.mypersonaltasks.repository.TaskRepository;
import com.mypersonaltasks.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class TaskService {
    
    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserService userService;
    
    /**
     * Crée une nouvelle tâche
     * Règles métier:
     * - Le projet doit exister
     * - L'utilisateur doit être membre du projet
     */
    @Transactional
    public Task createTask(TaskDTO.CreateRequest request, UUID userId) {
        log.info("Creating task '{}' for user {}", request.getTitle(), userId);
        
        // 1. Récupérer l'utilisateur courant
        User currentUser = userService.getUserEntityById(userId);
        
        // 2. Vérifier que le projet existe
        Project project = projectRepository.findById(request.getProjectId())
            .orElseThrow(() -> new ResourceNotFoundException(
                "Project", "id", request.getProjectId()
            ));
        
        // 3. Vérifier que l'utilisateur est membre du projet
        boolean isMember = project.getMembers().stream()
            .anyMatch(m -> m.getUser().getId().equals(userId));
        
        if (!isMember && !project.isPublic()) {
            throw new ForbiddenException("You don't have access to this project");
        }
        
        // 4. Créer la tâche
        Task task = Task.builder()
            .title(request.getTitle())
            .description(request.getDescription())
            .status(TaskStatus.TODO)
            .priority(request.getPriority() != null ? request.getPriority() : TaskPriority.MEDIUM)
            .project(project)
            .dueDate(request.getDueDate())
            .build();
        
        // 5. Sauvegarder
        Task savedTask = taskRepository.save(task);
        
        log.info("Task created successfully with id: {}", savedTask.getId());
        
        return savedTask;
    }
    
    /**
     * Met à jour le statut d'une tâche
     */
    @Transactional
    public Task updateTaskStatus(UUID taskId, TaskStatus newStatus, UUID userId) {
        Task task = getTaskByIdAndCheckAccess(taskId, userId);
        
        task.setStatus(newStatus);
        
        if (newStatus == TaskStatus.COMPLETED) {
            task.setIsCompleted(true);
            task.setCompletedAt(LocalDateTime.now());
        } else {
            task.setIsCompleted(false);
            task.setCompletedAt(null);
        }
        
        return taskRepository.save(task);
    }
    
    /**
     * Méthode privée pour vérifier l'accès à une tâche
     */
    private Task getTaskByIdAndCheckAccess(UUID taskId, UUID userId) {
        Task task = taskRepository.findById(taskId)
            .orElseThrow(() -> new ResourceNotFoundException("Task", "id", taskId));
        
        // Vérifier l'accès au projet parent
        boolean hasAccess = task.getProject().getMembers().stream()
            .anyMatch(m -> m.getUser().getId().equals(userId));
        
        if (!hasAccess) {
            throw new ForbiddenException("Access denied to this task");
        }
        
        return task;
    }
}
```

### Annotations Importantes

| Annotation | Rôle |
|------------|------|
| `@Service` | Déclare la classe comme service Spring |
| `@Transactional` | Gère les transactions automatiquement |
| `@RequiredArgsConstructor` | Génère un constructeur avec les champs final |
| `@Slf4j` | Ajoute un logger |

### Transaction Management

```java
// @Transactional: Que se passe-t-il ?

@Transactional
public void transferMoney(UUID fromId, UUID toId, BigDecimal amount) {
    // Début de la transaction
    Account from = accountRepository.findById(fromId);
    Account to = accountRepository.findById(toId);
    
    from.setBalance(from.getBalance().subtract(amount));
    to.setBalance(to.getBalance().add(amount));
    
    accountRepository.save(from);
    // Si erreur ici → ROLLBACK automatique de tout
    accountRepository.save(to);
    // Fin de la transaction → COMMIT
}
```

## 3.4 Les Contrôleurs

### Qu'est-ce qu'un Contrôleur ?

Un **Contrôleur** expose les endpoints REST et gère les requêtes HTTP.

```java
// Back/src/main/java/com/mypersonaltasks/controller/TaskController.java

package com.mypersonaltasks.controller;

import com.mypersonaltasks.dto.TaskDTO;
import com.mypersonaltasks.dto.ApiResponse;
import com.mypersonaltasks.entity.Task;
import com.mypersonaltasks.entity.TaskStatus;
import com.mypersonaltasks.service.TaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
@Tag(name = "Tasks", description = "Task management API")
@SecurityRequirement(name = "bearerAuth")
public class TaskController {
    
    private final TaskService taskService;
    
    /**
     * Crée une nouvelle tâche
     * POST /api/tasks
     */
    @PostMapping
    @Operation(summary = "Create a new task")
    public ResponseEntity<ApiResponse<TaskDTO.Response>> createTask(
        @Valid @RequestBody TaskDTO.CreateRequest request,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        UUID userId = UUID.fromString(userDetails.getUsername());
        Task task = taskService.createTask(request, userId);
        
        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(ApiResponse.success(TaskDTO.Response.fromEntity(task)));
    }
    
    /**
     * Récupère toutes les tâches de l'utilisateur
     * GET /api/tasks/my-tasks
     */
    @GetMapping("/my-tasks")
    @Operation(summary = "Get current user's tasks")
    public ResponseEntity<ApiResponse<List<TaskDTO.Response>>> getMyTasks(
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        UUID userId = UUID.fromString(userDetails.getUsername());
        List<Task> tasks = taskService.getMyTasks(userId);
        
        List<TaskDTO.Response> response = tasks.stream()
            .map(TaskDTO.Response::fromEntity)
            .toList();
        
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    /**
     * Récupère une tâche par ID
     * GET /api/tasks/{id}
     */
    @GetMapping("/{id}")
    @Operation(summary = "Get task by ID")
    public ResponseEntity<ApiResponse<TaskDTO.Response>> getTaskById(
        @PathVariable UUID id,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        UUID userId = UUID.fromString(userDetails.getUsername());
        Task task = taskService.getTaskById(id, userId);
        
        return ResponseEntity.ok(ApiResponse.success(TaskDTO.Response.fromEntity(task)));
    }
    
    /**
     * Met à jour le statut d'une tâche
     * PATCH /api/tasks/{id}/status
     */
    @PatchMapping("/{id}/status")
    @Operation(summary = "Update task status")
    public ResponseEntity<ApiResponse<TaskDTO.Response>> updateTaskStatus(
        @PathVariable UUID id,
        @Valid @RequestBody TaskDTO.StatusUpdateRequest request,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        UUID userId = UUID.fromString(userDetails.getUsername());
        Task task = taskService.updateTaskStatus(id, request.getStatus(), userId);
        
        return ResponseEntity.ok(ApiResponse.success(TaskDTO.Response.fromEntity(task)));
    }
    
    /**
     * Supprime une tâche
     * DELETE /api/tasks/{id}
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a task")
    public ResponseEntity<ApiResponse<Void>> deleteTask(
        @PathVariable UUID id,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        UUID userId = UUID.fromString(userDetails.getUsername());
        taskService.deleteTask(id, userId);
        
        return ResponseEntity.ok(ApiResponse.success(null, "Task deleted successfully"));
    }
}
```

### Annotations REST

| Annotation | Rôle | Exemple |
|------------|------|---------|
| `@RestController` | Déclare un contrôleur REST | `@RestController` |
| `@RequestMapping` | Définit le préfixe d'URL | `@RequestMapping("/api/tasks")` |
| `@GetMapping` | Gère GET | `@GetMapping("/{id}")` |
| `@PostMapping` | Gère POST | `@PostMapping` |
| `@PutMapping` | Gère PUT | `@PutMapping("/{id}")` |
| `@PatchMapping` | Gère PATCH | `@PatchMapping("/{id}/status")` |
| `@DeleteMapping` | Gère DELETE | `@DeleteMapping("/{id}")` |
| `@PathVariable` | Extrait un paramètre d'URL | `@PathVariable UUID id` |
| `@RequestBody` | Extrait le corps de la requête | `@RequestBody TaskDTO request` |
| `@RequestParam` | Extrait un paramètre de query | `@RequestParam String search` |
| `@Valid` | Active la validation | `@Valid @RequestBody ...` |

### Codes HTTP Appropriés

```
┌─────────────────────────────────────────────────────────────┐
│  2xx - Succès                                                │
│  ├── 200 OK           → Opération réussie (GET, PUT)        │
│  ├── 201 Created      → Ressource créée (POST)              │
│  └── 204 No Content   → Succès sans contenu (DELETE)        │
├─────────────────────────────────────────────────────────────┤
│  4xx - Erreur Client                                         │
│  ├── 400 Bad Request  → Données invalides                   │
│  ├── 401 Unauthorized → Non authentifié                     │
│  ├── 403 Forbidden    → Accès refusé                        │
│  ├── 404 Not Found    → Ressource inexistante               │
│  └── 409 Conflict     → Conflit (doublon)                   │
├─────────────────────────────────────────────────────────────┤
│  5xx - Erreur Serveur                                        │
│  └── 500 Internal Error → Bug côté serveur                  │
└─────────────────────────────────────────────────────────────┘
```

## 3.5 Les DTOs (Data Transfer Objects)

### Qu'est-ce qu'un DTO ?

Un **DTO** est un objet utilisé pour transférer des données entre le client et le serveur. Il permet de :
- Valider les données entrantes
- Filtrer les données sortantes
- Découpler l'API de la base de données

```java
// Back/src/main/java/com/mypersonaltasks/dto/TaskDTO.java

package com.mypersonaltasks.dto;

import com.mypersonaltasks.entity.Task;
import com.mypersonaltasks.entity.TaskPriority;
import com.mypersonaltasks.entity.TaskStatus;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class TaskDTO {
    
    // ===== DTO POUR CRÉATION =====
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {
        
        @NotBlank(message = "Title is required")
        @Size(min = 1, max = 200, message = "Title must be between 1 and 200 characters")
        private String title;
        
        @Size(max = 5000, message = "Description must not exceed 5000 characters")
        private String description;
        
        @NotNull(message = "Project ID is required")
        private UUID projectId;
        
        @Enumerated(EnumType.STRING)
        private TaskStatus status = TaskStatus.TODO;
        
        @Enumerated(EnumType.STRING)
        private TaskPriority priority = TaskPriority.MEDIUM;
        
        private LocalDateTime dueDate;
        
        private LocalDateTime startDate;
        
        @Min(value = 0, message = "Estimated hours must be positive")
        private Integer estimatedHours;
        
        private UUID assigneeId;
    }
    
    // ===== DTO POUR MISE À JOUR =====
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest {
        
        @NotBlank
        @Size(min = 1, max = 200)
        private String title;
        
        @Size(max = 5000)
        private String description;
        
        private TaskStatus status;
        
        private TaskPriority priority;
        
        private LocalDateTime dueDate;
        
        private LocalDateTime startDate;
        
        @Min(0)
        private Integer estimatedHours;
        
        @Min(0)
        private Integer actualHours;
    }
    
    // ===== DTO POUR RÉPONSE =====
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private UUID id;
        private String title;
        private String description;
        private TaskStatus status;
        private TaskPriority priority;
        private LocalDateTime dueDate;
        private LocalDateTime startDate;
        private Integer estimatedHours;
        private Integer actualHours;
        private Boolean isCompleted;
        private LocalDateTime completedAt;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        
        // Relations simplifiées
        private UUID projectId;
        private String projectName;
        private UUID assigneeId;
        private String assigneeName;
        
        private List<LabelDTO.Response> labels;
        private Integer commentCount;
        private Integer checklistCount;
        
        // Conversion depuis l'entité
        public static Response fromEntity(Task task) {
            return Response.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .status(task.getStatus())
                .priority(task.getPriority())
                .dueDate(task.getDueDate())
                .startDate(task.getStartDate())
                .estimatedHours(task.getEstimatedHours())
                .actualHours(task.getActualHours())
                .isCompleted(task.getIsCompleted())
                .completedAt(task.getCompletedAt())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .projectId(task.getProject() != null ? task.getProject().getId() : null)
                .projectName(task.getProject() != null ? task.getProject().getName() : null)
                .assigneeId(task.getAssignee() != null ? task.getAssignee().getId() : null)
                .assigneeName(task.getAssignee() != null ? 
                    task.getAssignee().getFirstName() + " " + task.getAssignee().getLastName() : null)
                .commentCount(task.getComments() != null ? task.getComments().size() : 0)
                .checklistCount(task.getChecklistItems() != null ? task.getChecklistItems().size() : 0)
                .labels(task.getLabels() != null ? 
                    task.getLabels().stream().map(LabelDTO.Response::fromEntity).toList() : null)
                .build();
        }
    }
}
```

### Validation Jakarta

| Annotation | Rôle | Exemple |
|------------|------|---------|
| `@NotNull` | Ne peut pas être null | `@NotNull UUID id` |
| `@NotBlank` | Ne peut pas être vide ou null | `@NotBlank String title` |
| `@Size` | Taille min/max | `@Size(min=1, max=200)` |
| `@Min` / `@Max` | Valeur min/max numérique | `@Min(0) Integer hours` |
| `@Email` | Format email valide | `@Email String email` |
| `@Pattern` | Expression régulière | `@Pattern(regexp = "...")` |
| `@Past` | Date dans le passé | `@Past LocalDate birthDate` |
| `@Future` | Date dans le futur | `@Future LocalDate dueDate` |

---

# 4. Design Patterns Implémentés

## 4.1 Pattern Repository

### Définition
Le **Repository Pattern** abstraction l'accès aux données, permettant de changer de base de données sans modifier le code métier.

```
┌─────────────────────────────────────────────────────────────┐
│                    Service Layer                             │
│                  (Ne connaît que l'interface)               │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              TaskRepository (Interface)                      │
│  - findById(UUID id)                                         │
│  - save(Task task)                                          │
│  - findByProjectId(UUID projectId)                          │
└─────────────────────────┬───────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
    ┌──────────┐    ┌──────────┐    ┌──────────┐
    │  H2 Impl │    │MySQL Impl│    │Mongo Impl│
    └──────────┘    └──────────┘    └──────────┘
```

### Dans notre projet

```java
// L'interface
public interface TaskRepository extends JpaRepository<Task, UUID> {
    List<Task> findByProjectId(UUID projectId);
    List<Task> findByAssigneeId(UUID assigneeId);
}

// Spring génère automatiquement l'implémentation !
// Pas besoin d'écrire le SQL
```

## 4.2 Pattern DTO (Data Transfer Object)

### Définition
Sépare les données exposées via l'API de la structure interne de la base de données.

```
┌─────────────────────────────────────────────────────────────┐
│                     Base de Données                          │
│  Task: { id, title, description, password, internal_notes } │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼ Conversion
┌─────────────────────────────────────────────────────────────┐
│                         API Response                         │
│  TaskDTO: { id, title, description }                        │
│  (password et internal_notes NON exposés)                   │
└─────────────────────────────────────────────────────────────┘
```

### Avantages
- **Sécurité** : Ne pas exposer les données sensibles
- **Performance** : Ne charger que les données nécessaires
- **Flexibilité** : Adapter la réponse selon le contexte
- **Validation** : Valider les données entrantes

## 4.3 Pattern Builder

### Définition
Construit des objets complexes étape par étape.

```java
// Sans Builder (constructeur difficile à lire)
Task task = new Task(
    null,                    // id
    "Titre",                 // title
    "Description",           // description
    TaskStatus.TODO,         // status
    TaskPriority.HIGH,       // priority
    null, null, null, null, null, null, null, null
);

// Avec Builder (Lombok @Builder)
Task task = Task.builder()
    .title("Titre")
    .description("Description")
    .status(TaskStatus.TODO)
    .priority(TaskPriority.HIGH)
    .build();

// Beaucoup plus lisible !
```

## 4.4 Pattern Dependency Injection (DI)

### Définition
Les dépendances sont injectées automatiquement par Spring, pas créées manuellement.

```java
// ❌ Sans Dependency Injection
public class TaskController {
    private TaskService taskService;
    
    public TaskController() {
        this.taskService = new TaskService();  // Couplage fort !
    }
}

// ✅ Avec Dependency Injection
@RestController
@RequiredArgsConstructor  // Lombok génère le constructeur
public class TaskController {
    private final TaskService taskService;  // Injecté par Spring
}
```

### Types d'Injection

```java
// 1. Injection par constructeur (RECOMMANDÉ)
@Service
@RequiredArgsConstructor
public class TaskService {
    private final TaskRepository taskRepository;
}

// 2. Injection par champ (déconseillé)
@Service
public class TaskService {
    @Autowired
    private TaskRepository taskRepository;
}

// 3. Injection par setter (rare)
@Service
public class TaskService {
    private TaskRepository taskRepository;
    
    @Autowired
    public void setTaskRepository(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }
}
```

## 4.5 Pattern Singleton

### Définition
Une seule instance de chaque bean Spring dans l'application.

```java
@Service  // Par défaut: Singleton
public class TaskService {
    // Une seule instance partagée par tous les contrôleurs
}

// Tous ces appels utilisent la MÊME instance
taskController1.taskService.createTask(...)
taskController2.taskService.createTask(...)
taskController3.taskService.createTask(...)
```

## 4.6 Pattern Chain of Responsibility

### Définition
Les filtres Spring forment une chaîne de traitement.

```
Requête HTTP
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│  Filter 1: CorsFilter                                       │
│  → Vérifie les en-têtes CORS                                │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  Filter 2: JwtAuthenticationFilter                          │
│  → Extrait et valide le JWT                                 │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  Filter 3: AuthorizationFilter                              │
│  → Vérifie les permissions                                  │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
                    Contrôleur
```

## 4.7 Pattern Exception Handler

### Définition
Gestion centralisée des exceptions.

```java
// Back/src/main/java/com/mypersonaltasks/exception/GlobalExceptionHandler.java

@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<?>> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity
            .status(HttpStatus.NOT_FOUND)
            .body(ApiResponse.error(ex.getMessage()));
    }
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<?>> handleValidation(MethodArgumentNotValidException ex) {
        List<String> errors = ex.getBindingResult()
            .getFieldErrors()
            .stream()
            .map(e -> e.getField() + ": " + e.getDefaultMessage())
            .toList();
        
        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(ApiResponse.error("Validation failed", errors));
    }
}
```

---

# 5. Sécurité avec Spring Security

## 5.1 Architecture de Sécurité

```
┌─────────────────────────────────────────────────────────────┐
│                     Requête HTTP                             │
│                  Authorization: Bearer xxx                   │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              Security Filter Chain                           │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  1. CORS Filter                                       │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  2. JWT Filter (JwtAuthenticationFilter)             │  │
│  │     - Extrait le token                                │  │
│  │     - Valide le token                                 │  │
│  │     - Charge l'utilisateur                            │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  3. Authorization Filter                              │  │
│  │     - Vérifie les rôles/permissions                   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Security Context                          │
│            Authentication (User Principal)                   │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
                    Contrôleur
```

## 5.2 Configuration de Sécurité

```java
// Back/src/main/java/com/mypersonaltasks/security/SecurityConfig.java

package com.mypersonaltasks.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    
    private final JwtAuthenticationFilter jwtAuthFilter;
    private final CustomUserDetailsService userDetailsService;
    
    /**
     * Configuration principale de la chaîne de sécurité
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Désactive CSRF (non nécessaire pour les APIs REST stateless)
            .csrf(csrf -> csrf.disable())
            
            // Configure CORS
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            // Session stateless (pas de session HTTP)
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            
            // Règles d'autorisation
            .authorizeHttpRequests(auth -> auth
                // Endpoints publics
                .requestMatchers(
                    "/api/auth/**",
                    "/api/health",
                    "/h2-console/**",
                    "/swagger-ui/**",
                    "/v3/api-docs/**"
                ).permitAll()
                
                // Tous les autres endpoints nécessitent une authentification
                .anyRequest().authenticated()
            )
            
            // Configure l'authentification HTTP Basic (désactivé)
            .httpBasic(basic -> basic.disable())
            
            // Configure l'authentification par formulaire (désactivé)
            .formLogin(form -> form.disable())
            
            // Ajoute le filtre JWT avant le filtre standard
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
            
            // Pour H2 Console (frames)
            .headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()));
        
        return http.build();
    }
    
    /**
     * Configuration CORS
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        config.addAllowedOrigin("http://localhost:3000");
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");
        config.addExposedHeader("Authorization");
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        
        return source;
    }
    
    /**
     * Encodeur de mot de passe (BCrypt)
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
    /**
     * Gestionnaire d'authentification
     */
    @Bean
    public AuthenticationManager authenticationManager(
        AuthenticationConfiguration config
    ) throws Exception {
        return config.getAuthenticationManager();
    }
}
```

## 5.3 JWT (JSON Web Token)

### Structure d'un JWT

```
┌─────────────────────────────────────────────────────────────┐
│                         JWT Token                            │
├─────────────────────────────────────────────────────────────┤
│  HEADER (Base64)                                            │
│  { "alg": "HS256", "typ": "JWT" }                           │
├─────────────────────────────────────────────────────────────┤
│  PAYLOAD (Base64)                                           │
│  {                                                          │
│    "sub": "user-uuid",                                      │
│    "username": "john_doe",                                  │
│    "role": "USER",                                          │
│    "iat": 1699000000,                                       │
│    "exp": 1699003600                                        │
│  }                                                          │
├─────────────────────────────────────────────────────────────┤
│  SIGNATURE                                                  │
│  HMACSHA256(                                                │
│    base64UrlEncode(header) + "." + base64UrlEncode(payload),│
│    secret                                                   │
│  )                                                          │
└─────────────────────────────────────────────────────────────┘
```

### Service JWT

```java
// Back/src/main/java/com/mypersonaltasks/security/JwtService.java

@Service
@RequiredArgsConstructor
public class JwtService {
    
    @Value("${jwt.secret}")
    private String secret;
    
    @Value("${jwt.expiration}")
    private long jwtExpiration;
    
    @Value("${jwt.refresh-expiration}")
    private long refreshExpiration;
    
    /**
     * Génère un access token
     */
    public String generateAccessToken(User user) {
        return buildToken(user, jwtExpiration);
    }
    
    /**
     * Génère un refresh token
     */
    public String generateRefreshToken(User user) {
        return buildToken(user, refreshExpiration);
    }
    
    /**
     * Construit le token JWT
     */
    private String buildToken(User user, long expiration) {
        return Jwts.builder()
            .setSubject(user.getId().toString())
            .claim("username", user.getUsername())
            .claim("role", user.getRole().name())
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + expiration))
            .signWith(getSignInKey(), SignatureAlgorithm.HS256)
            .compact();
    }
    
    /**
     * Extrait l'ID utilisateur du token
     */
    public UUID extractUserId(String token) {
        String subject = Jwts.parserBuilder()
            .setSigningKey(getSignInKey())
            .build()
            .parseClaimsJws(token)
            .getBody()
            .getSubject();
        
        return UUID.fromString(subject);
    }
    
    /**
     * Vérifie si le token est valide
     */
    public boolean isTokenValid(String token, User user) {
        UUID userId = extractUserId(token);
        return userId.equals(user.getId()) && !isTokenExpired(token);
    }
    
    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }
    
    private Date extractExpiration(String token) {
        return Jwts.parserBuilder()
            .setSigningKey(getSignInKey())
            .build()
            .parseClaimsJws(token)
            .getBody()
            .getExpiration();
    }
    
    private Key getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
```

## 5.4 Filtre d'Authentification JWT

```java
// Back/src/main/java/com/mypersonaltasks/security/JwtAuthenticationFilter.java

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;
    
    @Override
    protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain
    ) throws ServletException, IOException {
        
        // 1. Extraire le token de l'en-tête Authorization
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final UUID userId;
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }
        
        jwt = authHeader.substring(7);  // Retire "Bearer "
        
        try {
            // 2. Extraire l'ID utilisateur du token
            userId = jwtService.extractUserId(jwt);
            
            // 3. Vérifier si l'utilisateur n'est pas déjà authentifié
            if (SecurityContextHolder.getContext().getAuthentication() == null) {
                // Charger l'utilisateur
                UserDetails userDetails = userDetailsService.loadUserById(userId);
                
                // Valider le token
                if (jwtService.isTokenValid(jwt, (User) userDetails)) {
                    // Créer l'authentication token
                    UsernamePasswordAuthenticationToken authToken = 
                        new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                        );
                    
                    authToken.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                    );
                    
                    // Mettre à jour le SecurityContext
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    
                    log.debug("User authenticated: {}", userId);
                }
            }
        } catch (Exception e) {
            log.error("JWT authentication failed: {}", e.getMessage());
            SecurityContextHolder.clearContext();
        }
        
        // 4. Continuer la chaîne de filtres
        filterChain.doFilter(request, response);
    }
}
```

---

# 6. Base de Données et JPA

## 6.1 Hibernate et ORM

### Qu'est-ce que l'ORM ?

**ORM** (Object-Relational Mapping) fait le lien entre les objets Java et les tables SQL.

```
┌─────────────────────────────────────────────────────────────┐
│                    Objet Java                                │
│  class User {                                               │
│    private UUID id;                                         │
│    private String username;                                 │
│    private String email;                                    │
│  }                                                          │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ Hibernate (ORM)
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Table SQL                                 │
│  CREATE TABLE users (                                       │
│    id UUID PRIMARY KEY,                                     │
│    username VARCHAR(50),                                    │
│    email VARCHAR(100)                                       │
│  );                                                         │
└─────────────────────────────────────────────────────────────┘
```

### Cycle de Vie des Entités

```
┌──────────────┐    new()     ┌──────────────┐
│   TRANSIENT   │─────────────▶│              │
│  (Nouveau)    │              │              │
└──────────────┘              │              │
                              │   MANAGED    │
┌──────────────┐    detach()  │  (Attaché)   │
│              │◀─────────────│              │
│   DETACHED   │              │              │
│  (Détaché)   │─────────────▶│              │
└──────────────┘    merge()   └──────┬───────┘
                                     │
                                     │ remove()
                                     ▼
                              ┌──────────────┐
                              │   REMOVED    │
                              │  (Supprimé)  │
                              └──────────────┘
```

## 6.2 Configuration de la Base de Données

```yaml
# Back/src/main/resources/application.yml

spring:
  datasource:
    # H2 (Développement)
    url: jdbc:h2:file:./data/mpt
    driver-class-name: org.h2.Driver
    username: sa
    password: 
    
    # PostgreSQL (Production)
    # url: jdbc:postgresql://localhost:5432/mpt
    # driver-class-name: org.postgresql.Driver
    # username: ${DB_USER}
    # password: ${DB_PASSWORD}
    
  jpa:
    hibernate:
      ddl-auto: update  # Dev only! Utiliser validate en prod
      
    show-sql: true      # Affiche les requêtes SQL
    
    properties:
      hibernate:
        format_sql: true
        dialect: org.hibernate.dialect.H2Dialect
        # dialect: org.hibernate.dialect.PostgreSQLDialect
        
  h2:
    console:
      enabled: true
      path: /h2-console
```

### ddl-auto Options

| Valeur | Description | Utilisation |
|--------|-------------|-------------|
| `none` | Aucune action | Production |
| `validate` | Valide le schéma | Production |
| `update` | Met à jour le schéma | Développement |
| `create` | Crée le schéma (drop au redémarrage) | Tests |
| `create-drop` | Crée et supprime à l'arrêt | Tests |

## 6.3 Requêtes Personnalisées

### JPQL (Java Persistence Query Language)

```java
@Repository
public interface TaskRepository extends JpaRepository<Task, UUID> {
    
    // Requête JPQL simple
    @Query("SELECT t FROM Task t WHERE t.project.id = :projectId")
    List<Task> findByProjectId(@Param("projectId") UUID projectId);
    
    // Requête avec jointure
    @Query("SELECT t FROM Task t JOIN FETCH t.project WHERE t.assignee.id = :userId")
    List<Task> findByAssigneeIdWithProject(@Param("userId") UUID userId);
    
    // Requête de mise à jour
    @Modifying
    @Query("UPDATE Task t SET t.status = :status WHERE t.id = :id")
    int updateStatus(@Param("id") UUID id, @Param("status") TaskStatus status);
    
    // Requête native SQL
    @Query(value = "SELECT * FROM tasks WHERE due_date < CURRENT_DATE", nativeQuery = true)
    List<Task> findOverdueTasks();
    
    // Requête avec projection
    @Query("SELECT new com.mypersonaltasks.dto.TaskDTO$Summary(t.id, t.title, t.status) FROM Task t")
    List<TaskDTO.Summary> findAllSummaries();
}
```

### N+1 Problem et Solutions

```
┌─────────────────────────────────────────────────────────────┐
│  PROBLÈME N+1                                                │
├─────────────────────────────────────────────────────────────┤
│  1. Charger 10 projets → 1 requête                          │
│  2. Pour chaque projet, charger ses tâches → 10 requêtes   │
│  Total: 11 requêtes !                                       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  SOLUTION: FETCH JOIN                                       │
├─────────────────────────────────────────────────────────────┤
│  @Query("SELECT p FROM Project p JOIN FETCH p.tasks")       │
│  → 1 seule requête avec JOIN                                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  SOLUTION: EntityGraph                                      │
├─────────────────────────────────────────────────────────────┤
│  @EntityGraph(attributePaths = {"tasks"})                   │
│  List<Project> findAll();                                   │
└─────────────────────────────────────────────────────────────┘
```

---

# 7. Frontend avec Next.js

## 7.1 Architecture Frontend

```
Front/src/
├── app/                    ← App Router (Next.js 15)
│   ├── layout.tsx         ← Layout racine
│   ├── page.tsx           ← Page d'accueil (/)
│   ├── providers.tsx      ← Providers globaux
│   ├── globals.css        ← Styles globaux
│   │
│   ├── login/             ← Route /login
│   │   └── page.tsx
│   │
│   ├── projects/          ← Route /projects
│   │   ├── page.tsx       ← Liste
│   │   ├── new/page.tsx   ← Création
│   │   └── [id]/page.tsx  ← Détail (dynamic route)
│   │
│   └── tasks/             ← Route /tasks
│       ├── page.tsx
│       ├── new/page.tsx
│       └── [id]/page.tsx
│
├── components/
│   ├── ui/                ← Composants shadcn/ui
│   └── layout/            ← Composants layout
│
├── services/              ← Appels API
│   ├── api.ts            ← Client HTTP
│   ├── auth-service.ts
│   ├── project-service.ts
│   └── task-service.ts
│
├── stores/                ← État global (Zustand)
│   ├── auth-store.ts
│   └── app-store.ts
│
├── hooks/                 ← Hooks personnalisés
│   ├── use-auth.ts
│   └── use-toast.ts
│
├── lib/                   ← Utilitaires
│   ├── i18n-context.tsx
│   └── query-cache.tsx
│
├── locales/               ← Traductions
│   ├── en/
│   └── fr/
│
└── types/                 ← Types TypeScript
    └── index.ts
```

## 7.2 App Router vs Pages Router

### App Router (Next.js 13+)

```
app/
├── layout.tsx         → Layout partagé
├── page.tsx           → Page (route /)
├── loading.tsx        → État de chargement
├── error.tsx          → Gestion d'erreur
├── not-found.tsx      → Page 404
├── [id]/              → Route dynamique
│   └── page.tsx       → Page (route /:id)
└── (group)/           → Groupe de routes (n'affecte pas l'URL)
    └── page.tsx
```

### Layout et Imbrication

```tsx
// app/layout.tsx - Layout racine
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

// app/projects/layout.tsx - Layout projets
export default function ProjectsLayout({ children }) {
  return (
    <div className="projects-container">
      <ProjectsSidebar />
      {children}
    </div>
  );
}

// Résultat:
// <RootLayout>
//   <ProjectsLayout>
//     <ProjectsPage />
//   </ProjectsLayout>
// </RootLayout>
```

## 7.3 Gestion d'État avec Zustand

### Pourquoi Zustand ?

```
┌─────────────────────────────────────────────────────────────┐
│  Redux                                                       │
│  - Beaucoup de boilerplate                                  │
│  - Actions, reducers, selectors                             │
│  - Courbe d'apprentissage élevée                            │
├─────────────────────────────────────────────────────────────┤
│  Zustand                                                     │
│  - API simple et minimaliste                                │
│  - Pas de boilerplate                                       │
│  - TypeScript natif                                         │
│  - Persist automatique                                      │
└─────────────────────────────────────────────────────────────┘
```

### Store d'Authentification

```tsx
// Front/src/stores/auth-store.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  
  // Actions
  setAuth: (response: AuthResponse) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // État initial
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      
      // Actions
      setAuth: (response) => set({
        user: response.user,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        isAuthenticated: true,
      }),
      
      setTokens: (accessToken, refreshToken) => set({
        accessToken,
        refreshToken,
      }),
      
      logout: () => {
        localStorage.removeItem('auth-storage');
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },
      
      setUser: (user) => set({ user }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
```

### Hook d'Hydratation

```tsx
// Problème: Zustand avec persist cause un mismatch SSR/Client

// Solution: Hook d'hydratation
export function useHydration() {
  const [hydrated, setHydrated] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setHydrated(true), 50);
    return () => clearTimeout(timer);
  }, []);
  
  return hydrated;
}

// Utilisation
function MyComponent() {
  const hydrated = useHydration();
  
  if (!hydrated) {
    return <LoadingSpinner />;
  }
  
  // Maintenant le store est hydraté
  const { user } = useAuthStore();
  
  return <div>{user?.name}</div>;
}
```

## 7.4 Services API

### Client HTTP avec Fetch

```tsx
// Front/src/services/api.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

class ApiError extends Error {
  status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

// Fonction pour rafraîchir le token
async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = useAuthStore.getState().refreshToken;
  if (!refreshToken) return null;
  
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  
  if (!response.ok) return null;
  
  const data = await response.json();
  const { accessToken, refreshToken: newRefreshToken } = data.data;
  
  if (accessToken && newRefreshToken) {
    useAuthStore.getState().setTokens(accessToken, newRefreshToken);
    return accessToken;
  }
  
  return null;
}

// Client API principal
async function fetchWithAuth<T>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const accessToken = useAuthStore.getState().accessToken;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...options.headers,
  };
  
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
  
  let response = await fetch(fullUrl, { ...options, headers });
  
  // Gérer 401 - tenter de rafraîchir le token
  if (response.status === 401) {
    const newToken = await refreshAccessToken();
    
    if (newToken) {
      // Réessayer avec le nouveau token
      response = await fetch(fullUrl, {
        ...options,
        headers: { ...headers, Authorization: `Bearer ${newToken}` },
      });
    } else {
      // Échec du refresh - déconnecter
      useAuthStore.getState().logout();
      window.location.href = '/login';
      throw new ApiError('Session expired', 401);
    }
  }
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      errorData.message || `HTTP error! status: ${response.status}`,
      response.status
    );
  }
  
  return response.json();
}

// Export du client
export const api = {
  get: <T>(url: string, params?: Record<string, unknown>) => {
    const queryString = params
      ? `?${new URLSearchParams(
          Object.entries(params)
            .filter(([, v]) => v !== undefined)
            .map(([k, v]) => [k, String(v)])
        ).toString()}`
      : '';
    return fetchWithAuth<T>(`${url}${queryString}`);
  },
  
  post: <T>(url: string, data?: unknown) =>
    fetchWithAuth<T>(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),
  
  put: <T>(url: string, data?: unknown) =>
    fetchWithAuth<T>(url, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),
  
  delete: <T>(url: string) =>
    fetchWithAuth<T>(url, { method: 'DELETE' }),
};
```

## 7.5 Internationalisation (i18n)

### Structure des Traductions

```json
// Front/src/locales/fr/common.json
{
  "common": {
    "loading": "Chargement...",
    "error": "Une erreur est survenue",
    "save": "Enregistrer"
  },
  "tasks": {
    "title": "Tâches",
    "createTask": "Créer une tâche"
  },
  "taskStatus": {
    "todo": "À faire",
    "in_progress": "En cours",
    "completed": "Terminée"
  }
}
```

### Hook de Traduction

```tsx
// Front/src/lib/i18n-context.tsx

import { useCallback } from 'react';
import { useAppStore, Locale } from '@/stores/app-store';
import en from '@/locales/en/common.json';
import fr from '@/locales/fr/common.json';

const translations: Record<Locale, typeof en> = { en, fr };

function getNestedValue(obj: unknown, key: string): string | undefined {
  const keys = key.split('.');
  let value: unknown = obj;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = (value as Record<string, unknown>)[k];
    } else {
      return undefined;
    }
  }
  
  return typeof value === 'string' ? value : undefined;
}

export function useTranslations(namespace?: string) {
  const locale = useAppStore((state) => state.locale);
  
  const t = useCallback((key: string, params?: Record<string, string | number>) => {
    const fullKey = namespace ? `${namespace}.${key}` : key;
    
    let value = getNestedValue(translations[locale], fullKey);
    
    // Fallback en français puis anglais
    if (!value) {
      value = getNestedValue(translations.fr, fullKey);
    }
    if (!value) {
      value = getNestedValue(translations.en, fullKey);
    }
    if (!value) {
      return key; // Clé non trouvée
    }
    
    // Remplacer les paramètres
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        value = value!.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      });
    }
    
    return value;
  }, [locale, namespace]);
  
  return t;
}

// Utilisation
function MyComponent() {
  const t = useTranslations();
  
  return (
    <div>
      <h1>{t('tasks.title')}</h1>
      <p>{t('common.loading')}</p>
    </div>
  );
}
```

---

# 8. Communication Front-Back

## 8.1 Architecture REST API

### Principes REST

```
┌─────────────────────────────────────────────────────────────┐
│  RESSOURCE          │ VERBE    │ ENDPOINT         │ STATUS │
├─────────────────────────────────────────────────────────────┤
│  Liste tâches       │ GET      │ /tasks           │ 200    │
│  Une tâche          │ GET      │ /tasks/{id}      │ 200    │
│  Créer tâche        │ POST     │ /tasks           │ 201    │
│  Modifier tâche     │ PUT      │ /tasks/{id}      │ 200    │
│  Modifier statut    │ PATCH    │ /tasks/{id}/...  │ 200    │
│  Supprimer tâche    │ DELETE   │ /tasks/{id}      │ 204    │
└─────────────────────────────────────────────────────────────┘
```

### Format de Réponse Standardisé

```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "id": "uuid",
    "title": "Nouvelle tâche",
    "status": "TODO"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## 8.2 Gestion des Erreurs

### Backend

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<?>> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity
            .status(HttpStatus.NOT_FOUND)
            .body(ApiResponse.error(ex.getMessage()));
    }
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<?>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error -> {
            errors.put(error.getField(), error.getDefaultMessage());
        });
        
        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(ApiResponse.error("Validation failed", errors));
    }
    
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<?>> handleAccessDenied(AccessDeniedException ex) {
        return ResponseEntity
            .status(HttpStatus.FORBIDDEN)
            .body(ApiResponse.error("Access denied"));
    }
}
```

### Frontend

```tsx
// Front/src/services/task-service.ts

export const taskService = {
  async createTask(data: CreateTaskRequest): Promise<Task> {
    try {
      const response = await api.post<Task>('/tasks', data);
      if (!response?.data) {
        throw new Error('Failed to create task');
      }
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        // Erreur API connue
        if (error.status === 400) {
          throw new Error('Invalid task data');
        }
        if (error.status === 403) {
          throw new Error('You do not have access to this project');
        }
      }
      // Erreur inconnue
      throw error;
    }
  }
};

// Utilisation dans un composant
async function handleSubmit(e: FormEvent) {
  e.preventDefault();
  setIsLoading(true);
  
  try {
    const task = await taskService.createTask(formData);
    toast({ title: 'Success', description: 'Task created' });
    router.push('/tasks');
  } catch (error) {
    toast({
      title: 'Error',
      description: error instanceof Error ? error.message : 'An error occurred',
      variant: 'destructive',
    });
  } finally {
    setIsLoading(false);
  }
}
```

---

# 9. Bonnes Pratiques et Conventions

## 9.1 Convention de Nommage

### Java (Backend)

| Type | Convention | Exemple |
|------|------------|---------|
| Classes | PascalCase | `TaskService` |
| Méthodes | camelCase | `createTask()` |
| Variables | camelCase | `taskList` |
| Constantes | SCREAMING_SNAKE_CASE | `MAX_RETRY_COUNT` |
| Packages | lowercase | `com.mypersonaltasks.service` |

### TypeScript (Frontend)

| Type | Convention | Exemple |
|------|------------|---------|
| Components | PascalCase | `TaskCard` |
| Hooks | camelCase avec use | `useTaskList` |
| Functions | camelCase | `fetchTasks` |
| Variables | camelCase | `taskList` |
| Types/Interfaces | PascalCase | `TaskResponse` |
| Files (components) | kebab-case | `task-card.tsx` |

## 9.2 Structure d'un Commit

```
type(scope): description

Types:
- feat: Nouvelle fonctionnalité
- fix: Correction de bug
- docs: Documentation
- style: Formatage
- refactor: Refactoring
- test: Tests
- chore: Maintenance

Exemples:
- feat(tasks): add task filtering by status
- fix(auth): correct JWT token refresh
- docs(readme): update installation instructions
```

## 9.3 Principe SOLID

| Principe | Description | Exemple |
|----------|-------------|---------|
| **S**ingle Responsibility | Une classe = une responsabilité | `TaskService` gère uniquement les tâches |
| **O**pen/Closed | Ouvert à l'extension, fermé à la modification | Interfaces pour les repositories |
| **L**iskov Substitution | Les sous-types sont substituables | `AdminUser` peut remplacer `User` |
| **I**nterface Segregation | Interfaces spécifiques | `ReadableRepository`, `WritableRepository` |
| **D**ependency Inversion | Dépendre des abstractions | Injection de `TaskRepository` |

## 9.4 Clean Code

### Méthodes

```java
// ❌ Mal
public void p(UUID id) {
    Task t = r.findById(id).orElse(null);
    if (t != null) {
        if (t.getStatus() == TaskStatus.TODO) {
            t.setStatus(TaskStatus.IN_PROGRESS);
            r.save(t);
        }
    }
}

// ✅ Bien
public void startTask(UUID taskId) {
    Task task = findTaskById(taskId);
    
    if (task.canBeStarted()) {
        task.markAsInProgress();
        taskRepository.save(task);
    }
}

private Task findTaskById(UUID id) {
    return taskRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Task", id));
}
```

### Nommage

```java
// ❌ Mal
List<Task> l = taskRepository.findByPId(pId);
if (l.size() > 0) { ... }

// ✅ Bien
List<Task> projectTasks = taskRepository.findByProjectId(projectId);
if (!projectTasks.isEmpty()) { ... }
```

---

# 10. Exercices Pratiques

## Exercice 1 : Créer une entité Label

**Objectif** : Créer l'entité Label avec ses relations.

```java
// À faire:
// 1. Créer l'entité Label dans entity/Label.java
// 2. Configurer la relation Many-to-Many avec Task
// 3. Ajouter les champs: id, name, color, description, project

@Entity
@Table(name = "labels")
public class Label {
    // TODO: Implémenter
}
```

## Exercice 2 : Créer le CRUD Commentaire

**Objectif** : Implémenter le CRUD complet pour les commentaires.

```java
// À faire:
// 1. Créer CommentController
// 2. Créer CommentService
// 3. Créer CommentRepository
// 4. Créer les DTOs

// Endpoints attendus:
// POST   /tasks/{taskId}/comments
// GET    /tasks/{taskId}/comments
// PUT    /comments/{id}
// DELETE /comments/{id}
```

## Exercice 3 : Créer une page d'édition

**Objectif** : Créer la page d'édition de tâche.

```tsx
// À faire:
// 1. Créer /tasks/[id]/edit/page.tsx
// 2. Pré-remplir le formulaire avec les données existantes
// 3. Appeler l'API PUT /tasks/{id}
// 4. Gérer la navigation après modification
```

## Exercice 4 : Implémenter la recherche

**Objectif** : Ajouter une recherche globale.

```java
// Backend
// 1. Créer un endpoint de recherche
// 2. Utiliser @Query avec LIKE

@GetMapping("/search")
public List<Task> search(@RequestParam String query) {
    // TODO: Implémenter
}
```

```tsx
// Frontend
// 1. Créer un composant GlobalSearch
// 2. Appeler l'API de recherche
// 3. Afficher les résultats
```

## Exercice 5 : Ajouter les tests

**Objectif** : Écrire des tests unitaires.

```java
// TaskServiceTest.java
@ExtendWith(MockitoExtension.class)
class TaskServiceTest {
    
    @Mock
    private TaskRepository taskRepository;
    
    @Mock
    private ProjectRepository projectRepository;
    
    @InjectMocks
    private TaskService taskService;
    
    @Test
    void createTask_WhenProjectExists_ReturnsTask() {
        // Given
        // When
        // Then
    }
    
    @Test
    void createTask_WhenProjectNotFound_ThrowsException() {
        // Given
        // When
        // Then
    }
}
```

---

# Annexes

## A. Commandes Utiles

### Backend (Spring Boot)

```bash
# Compiler
mvn clean compile

# Tester
mvn test

# Packager
mvn package -DskipTests

# Exécuter
java -jar target/myapp.jar

# Avec Maven Spring Boot
mvn spring-boot:run
```

### Frontend (Next.js)

```bash
# Installer les dépendances
bun install

# Développement
bun run dev

# Build production
bun run build

# Linter
bun run lint

# Type check
bun run type-check
```

## B. Ressources

### Documentation Officielle

- [Spring Boot](https://spring.io/projects/spring-boot)
- [Spring Security](https://spring.io/projects/spring-security)
- [Spring Data JPA](https://spring.io/projects/spring-data-jpa)
- [Next.js](https://nextjs.org/docs)
- [React](https://react.dev/)

### Livres Recommandés

- "Effective Java" - Joshua Bloch
- "Clean Code" - Robert C. Martin
- "Spring in Action" - Craig Walls
- "Design Patterns" - Gang of Four

---

**Document créé pour le projet MyPersonalTasks**
*Version 1.0 - Formation Complète*

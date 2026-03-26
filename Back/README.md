# MyPersonalTasks Backend

A robust RESTful API backend for personal and collaborative task management, built with **Spring Boot 3.2** and **Java 17**.

## 📋 Table of Contents

- [Architecture Overview](#architecture-overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Documentation](#api-documentation)
- [Security Architecture](#security-architecture)
- [Getting Started](#getting-started)
- [Configuration](#configuration)

---

## 🏗️ Architecture Overview

### Layered Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│                     (Controllers)                            │
│   - REST Endpoints                                           │
│   - Request Validation                                       │
│   - Response Formatting                                      │
├─────────────────────────────────────────────────────────────┤
│                     Service Layer                            │
│                     (Services)                               │
│   - Business Logic                                           │
│   - Transaction Management                                   │
│   - Security Checks                                          │
├─────────────────────────────────────────────────────────────┤
│                  Data Access Layer                           │
│                   (Repositories)                             │
│   - JPA Repositories                                         │
│   - Custom Queries                                           │
│   - Entity Mappings                                          │
├─────────────────────────────────────────────────────────────┤
│                    Database Layer                            │
│                  (PostgreSQL/H2)                             │
│   - Tables                                                   │
│   - Indexes                                                  │
│   - Constraints                                              │
└─────────────────────────────────────────────────────────────┘
```

### Key Architectural Patterns

| Pattern | Implementation | Purpose |
|---------|---------------|---------|
| **Layered Architecture** | Controllers → Services → Repositories | Separation of concerns |
| **DTO Pattern** | Request/Response DTOs | Data transfer isolation |
| **Repository Pattern** | Spring Data JPA | Data access abstraction |
| **Service Layer Pattern** | @Service classes | Business logic encapsulation |
| **Builder Pattern** | Lombok @Builder | Object construction |
| **Factory Pattern** | Entity builders | Complex object creation |

---

## 🔧 Technology Stack

### Core Framework
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Java** | 17 | Runtime environment |
| **Spring Boot** | 3.2.1 | Application framework |
| **Maven** | 3.9+ | Build tool & dependency management |

### Spring Modules
| Module | Purpose |
|--------|---------|
| **Spring Web MVC** | REST API development |
| **Spring Data JPA** | Database operations |
| **Spring Security** | Authentication & Authorization |
| **Spring Validation** | Input validation |
| **Spring Mail** | Email notifications |
| **Spring WebSocket** | Real-time communication |

### Database & ORM
| Technology | Purpose |
|-----------|---------|
| **PostgreSQL** | Production database |
| **H2** | Development/testing database |
| **Hibernate** | ORM implementation |
| **HikariCP** | Connection pooling |

### Security
| Technology | Purpose |
|-----------|---------|
| **JWT (jjwt)** | Token-based authentication |
| **BCrypt** | Password hashing |
| **Spring Security** | Security framework |

### Documentation
| Technology | Purpose |
|-----------|---------|
| **SpringDoc OpenAPI** | API documentation |
| **Swagger UI** | Interactive API explorer |

### Utilities
| Library | Purpose |
|---------|---------|
| **Lombok** | Boilerplate reduction |
| **MapStruct** | DTO mapping |

---

## 📁 Project Structure

```
Back/
├── pom.xml                              # Maven configuration
├── src/
│   ├── main/
│   │   ├── java/com/mypersonaltasks/
│   │   │   ├── MyPersonalTasksApplication.java    # Main entry point
│   │   │   ├── config/                            # Configuration classes
│   │   │   │   ├── OpenApiConfig.java            # Swagger/OpenAPI config
│   │   │   │   └── SecurityConfig.java           # Security configuration
│   │   │   ├── controller/                        # REST Controllers
│   │   │   │   ├── AuthController.java           # Authentication endpoints
│   │   │   │   ├── UserController.java           # User management
│   │   │   │   ├── ProjectController.java        # Project endpoints
│   │   │   │   └── TaskController.java           # Task endpoints
│   │   │   ├── dto/                               # Data Transfer Objects
│   │   │   │   ├── UserDTO.java                  # User DTOs
│   │   │   │   ├── ProjectDTO.java               # Project DTOs
│   │   │   │   ├── TaskDTO.java                  # Task DTOs
│   │   │   │   ├── ApiResponse.java              # Generic API response
│   │   │   │   └── ...
│   │   │   ├── entity/                            # JPA Entities
│   │   │   │   ├── User.java                     # User entity
│   │   │   │   ├── Project.java                  # Project entity
│   │   │   │   ├── Task.java                     # Task entity
│   │   │   │   └── ...
│   │   │   ├── enums/                             # Enumerations
│   │   │   │   ├── TaskStatus.java               # Task statuses
│   │   │   │   ├── TaskPriority.java             # Priority levels
│   │   │   │   ├── ProjectStatus.java            # Project statuses
│   │   │   │   └── ...
│   │   │   ├── exception/                         # Custom exceptions
│   │   │   │   ├── GlobalExceptionHandler.java   # Exception handling
│   │   │   │   ├── ResourceNotFoundException.java
│   │   │   │   └── ...
│   │   │   ├── repository/                        # Data repositories
│   │   │   │   ├── UserRepository.java
│   │   │   │   ├── ProjectRepository.java
│   │   │   │   ├── TaskRepository.java
│   │   │   │   └── ...
│   │   │   ├── security/                          # Security components
│   │   │   │   ├── JwtService.java               # JWT operations
│   │   │   │   ├── JwtAuthenticationFilter.java  # JWT filter
│   │   │   │   └── CustomUserDetailsService.java
│   │   │   ├── service/                           # Business services
│   │   │   │   ├── UserService.java
│   │   │   │   ├── ProjectService.java
│   │   │   │   ├── TaskService.java
│   │   │   │   └── ...
│   │   │   └── util/                              # Utility classes
│   │   └── resources/
│   │       ├── application.yml                    # Main configuration
│   │       └── application-dev.yml                # Dev profile config
│   └── test/                                      # Test sources
└── README.md
```

---

## 🗄️ Database Schema

### Entity-Relationship Diagram

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│     User     │       │ProjectMember │       │   Project    │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id (PK)      │◄──────│ id (PK)      │──────►│ id (PK)      │
│ username     │       │ user_id (FK) │       │ name         │
│ email        │       │ project_id(FK)│      │ description  │
│ password     │       │ role         │       │ status       │
│ first_name   │       │ joined_at    │       │ owner_id(FK) │
│ last_name    │       └──────────────┘       │ is_public    │
│ role         │                              │ created_at   │
│ created_at   │                              └──────┬───────┘
└──────────────┘                                     │
                                                     │
       ┌─────────────────────────────────────────────┘
       │
       ▼
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│     Task     │       │TaskLabel     │       │    Label     │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id (PK)      │       │ task_id (FK) │       │ id (PK)      │
│ title        │       │ label_id (FK)│       │ name         │
│ description  │       └──────────────┘       │ color        │
│ status       │                              │ project_id(FK)│
│ priority     │◄─────────────────────────────┤ created_at   │
│ due_date     │                              └──────────────┘
│ project_id(FK)│
│ assigned_to  │       ┌──────────────┐       ┌──────────────┐
│ created_by   │       │   Comment    │       │ ChecklistItem│
│ parent_task  │       ├──────────────┤       ├──────────────┤
│ created_at   │       │ id (PK)      │       │ id (PK)      │
└──────────────┘       │ content      │       │ content      │
                       │ task_id (FK) │       │ is_completed │
                       │ user_id (FK) │       │ task_id (FK) │
                       │ created_at   │       │ position     │
                       └──────────────┘       └──────────────┘
```

### Core Tables

| Table | Description | Key Relationships |
|-------|-------------|-------------------|
| **users** | User accounts | Has many projects, tasks, comments |
| **projects** | Project containers | Belongs to owner (user), has many members |
| **project_members** | Project-user association | Many-to-many with role |
| **tasks** | Task items | Belongs to project, assigned to user |
| **labels** | Task labels | Belongs to project, many-to-many with tasks |
| **comments** | Task comments | Belongs to task and user |
| **checklist_items** | Task checklists | Belongs to task |
| **task_attachments** | File attachments | Belongs to task |
| **refresh_tokens** | JWT refresh tokens | Belongs to user |

---

## 📚 API Documentation

### Base URL
```
http://localhost:8080/api
```

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | User login | No |
| POST | `/auth/refresh` | Refresh access token | No |
| POST | `/auth/logout` | User logout | Yes |

### User Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/users/me` | Get current user | Yes |
| PUT | `/users/me` | Update profile | Yes |
| POST | `/users/me/change-password` | Change password | Yes |
| GET | `/users/{id}` | Get user by ID | Yes |

### Project Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/projects` | Create project | Yes |
| GET | `/projects` | List projects | Yes |
| GET | `/projects/{id}` | Get project | Yes |
| PUT | `/projects/{id}` | Update project | Yes |
| DELETE | `/projects/{id}` | Delete project | Yes |
| POST | `/projects/{id}/archive` | Archive project | Yes |
| POST | `/projects/{id}/members` | Add member | Yes |
| DELETE | `/projects/{id}/members/{userId}` | Remove member | Yes |

### Task Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/tasks` | Create task | Yes |
| GET | `/tasks/project/{projectId}` | List project tasks | Yes |
| GET | `/tasks/{id}` | Get task | Yes |
| PUT | `/tasks/{id}` | Update task | Yes |
| DELETE | `/tasks/{id}` | Delete task | Yes |
| PATCH | `/tasks/{id}/status` | Update status | Yes |
| POST | `/tasks/project/{projectId}/reorder` | Reorder tasks | Yes |
| GET | `/tasks/my-tasks` | Get assigned tasks | Yes |
| GET | `/tasks/overdue` | Get overdue tasks | Yes |

### Swagger UI
Access interactive API documentation at:
```
http://localhost:8080/api/swagger-ui.html
```

---

## 🔐 Security Architecture

### Authentication Flow

```
┌─────────┐                  ┌─────────────┐                  ┌─────────────┐
│  Client │                  │    API      │                  │  Database   │
└────┬────┘                  └──────┬──────┘                  └──────┬──────┘
     │                              │                                │
     │  POST /auth/login            │                                │
     │  {email, password}           │                                │
     │─────────────────────────────►│                                │
     │                              │  Find user by email            │
     │                              │───────────────────────────────►│
     │                              │                                │
     │                              │  Return user                   │
     │                              │◄───────────────────────────────│
     │                              │                                │
     │                              │  Verify password (BCrypt)      │
     │                              │                                │
     │                              │  Generate JWT tokens           │
     │                              │                                │
     │  Return {accessToken,        │                                │
     │         refreshToken}        │                                │
     │◄─────────────────────────────│                                │
     │                              │                                │
     │  GET /projects               │                                │
     │  Authorization: Bearer {JWT} │                                │
     │─────────────────────────────►│                                │
     │                              │  Validate JWT                  │
     │                              │  Extract user from token       │
     │                              │  Process request               │
     │                              │───────────────────────────────►│
     │                              │                                │
     │  Return projects             │                                │
     │◄─────────────────────────────│                                │
     │                              │                                │
```

### JWT Token Structure

```json
{
  "header": {
    "alg": "HS256"
  },
  "payload": {
    "sub": "username",
    "userId": "uuid",
    "email": "user@email.com",
    "iat": 1234567890,
    "exp": 1234654290
  },
  "signature": "..."
}
```

### Authorization Levels

| Role | Permissions |
|------|-------------|
| **USER** | Create projects, manage own tasks, join projects |
| **ADMIN** | Full system access, user management |
| **OWNER** | Full project control, delete project |
| **ADMIN (Project)** | Manage project settings and members |
| **MEMBER (Project)** | Create and edit tasks |
| **VIEWER (Project)** | Read-only project access |

---

## 🚀 Getting Started

### Prerequisites

- Java 17+
- Maven 3.9+
- PostgreSQL 14+ (or use H2 for development)

### Installation

1. **Clone the repository**
   ```bash
   cd Back
   ```

2. **Configure database** (PostgreSQL)
   ```yaml
   # application.yml
   spring:
     datasource:
       url: jdbc:postgresql://localhost:5432/mypersonaltasks
       username: postgres
       password: your_password
   ```

3. **Run with Maven**
   ```bash
   mvn spring-boot:run
   ```

4. **Or build and run JAR**
   ```bash
   mvn clean package
   java -jar target/my-personal-tasks-backend-1.0.0.jar
   ```

### Development Mode (H2 Database)

For quick development, the application uses H2 in-memory database by default:

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

Access H2 Console: `http://localhost:8080/api/h2-console`

---

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_USERNAME` | Database username | postgres |
| `DB_PASSWORD` | Database password | postgres |
| `JWT_SECRET` | JWT signing secret | (dev key) |
| `CORS_ORIGINS` | Allowed CORS origins | localhost:3000 |
| `MAIL_HOST` | SMTP server host | smtp.gmail.com |
| `MAIL_USERNAME` | Email username | - |
| `MAIL_PASSWORD` | Email password | - |

### Application Properties

Key configurations in `application.yml`:

```yaml
# Server
server:
  port: 8080
  servlet:
    context-path: /api

# JWT
app:
  jwt:
    secret: your-256-bit-secret
    access-token-expiration: 86400000  # 24 hours
    refresh-token-expiration: 604800000  # 7 days

# CORS
app:
  cors:
    allowed-origins: http://localhost:3000,http://localhost:3001
```

---

## 📝 License

MIT License - See [LICENSE](LICENSE) for details.

---

## 👥 Authors

**MyPersonalTasks Team**
- Email: support@mypersonaltasks.com
- Website: https://mypersonaltasks.com

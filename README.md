# Hostel Grievance System (HGS)

A production-ready, privacy-first web application designed for educational and defense hostels. The system enables students and cadets to submit and track maintenance grievances (plumbing, electrical, civil, hygiene, etc.) without requiring authentication, while empowering authenticated administrators (wardens, caretakers) with a centralized management portal to triage, update, resolve with mandatory photographic verification, and permanently audit complaints.

GitHub Repository: https://github.com/aditivermacodes/hostel-grievance-system

---

## Table of Contents

1. System Architecture
2. Tech Stack and Key Implementation Decisions
3. Repository Directory Layout
4. Database Design and Entity Relationship Diagram
5. Default Seed Data and Administrative Credentials
6. REST API Reference
7. Getting Started: Running the Application
   - Option A: Multi-Container Setup via Docker Compose
   - Option B: Independent Local Development
8. Automated Testing Suite
9. Database Backup and Disaster Recovery Strategy
10. Security and Production Hardening

---

## 1. System Architecture

`mermaid
graph TD
    subgraph Client Tier
        SP["Student / Cadet (Public User)"]
        AP["Hostel Warden / Administrator (Authenticated)"]
    end

    subgraph Presentation Tier
        FE["React 18 + Vite SPA (Served via Nginx on Port 3000)"]
    end

    subgraph Application Tier [Spring Boot 3.4 / 4.1 on Port 8080]
        API["REST Controllers"]
        SEC["Spring Security + Stateless JWT"]
        RL["RateLimitFilter (In-Memory Sliding Window)"]
        SVC["Complaint, Admin, and Lookup Services"]
        FSS["FileStorageService (Local Volume / S3 Pluggable)"]
        EMS["SmtpEmailService (Resilient Delivery and Audit Logging)"]
        IDS["IdGenerationService (Atomic HGS-YYYY-XXXXXX Sequence)"]
    end

    subgraph Persistence Tier
        DB[("PostgreSQL 16 Relational Database")]
        VOL[("Persistent Uploads Volume (/app/uploads)")]
    end

    SP -->|"Submit Grievance / Track Status"| FE
    AP -->|"Authenticate & Triage Grievances"| FE
    FE -->|"REST Requests over HTTP"| API
    API --> SEC
    API --> RL
    SEC --> SVC
    SVC --> IDS
    SVC --> FSS
    SVC --> EMS
    SVC --> DB
    FSS --> VOL
`

---

## 2. Tech Stack and Key Implementation Decisions

| Layer | Technology | Implementation Details |
| :--- | :--- | :--- |
| Frontend | React 18, Vite, Lucide Icons, Modern CSS | Lightweight single-page application with responsive layouts for mobile, tablet, and desktop. Touch targets meet accessibility standards (>= 48px). |
| Backend | Spring Boot 3.4, Java 21 / 24, Spring Data JPA | Modular enterprise architecture with compile-time type safety, declarative transactions, and Flyway database migrations. |
| Database | PostgreSQL 16 (H2 for in-memory local testing) | ACID-compliant relational persistence with indexed foreign keys, constraints, and custom sequences. |
| Security | Spring Security 6, Stateless JWT (HMAC-SHA256) | Decoupled token authentication for admin endpoints with 24-hour expiration, BCrypt password hashing, and strict CORS. |
| File Storage | Local Disk Volume (FileStorageService) | Interface-driven storage layer with MIME-type validation and 5MB size limit; swappable for AWS S3 or MinIO. |
| Notifications | JavaMailSender (EmailService) | Interface-driven SMTP delivery with resilient error handling so email failures never abort database transactions. |
| Orchestration | Docker, Docker Compose, Multi-stage Builds | Production containerization for all components with health checks, persistent volumes, and non-root execution. |

### Key Design Choices

1. **Deterministic Complaint ID Format**: Formatted as HGS-<YYYY>-<000001> (e.g., HGS-2026-001001), generated atomically using a dedicated database sequence (complaint_code_seq).
2. **Lifecycle State Machine**:
   - SUBMITTED: Newly registered grievance.
   - IN_PROGRESS: Acknowledged and assigned to maintenance personnel.
   - COMPLETED: Work resolved and verified with photographic proof.
   - REJECTED: Invalid, duplicate, or out-of-scope ticket with mandatory admin remarks.
3. **Mandatory Photographic Completion Verification**: Enforced as a strict backend validation rule. Resolving a grievance without an uploaded completion photo results in an immediate 400 Bad Request.
4. **Student Privacy Protection**: Public tracking queries (/api/complaints/track/{code}) return issue progress, category, hostel, location, dates, and resolution notes, but strictly redact the student's name, email, and phone number.
5. **Notification Fault Tolerance**: If an SMTP server is unreachable, the exception is logged to 
otification_logs without rolling back the transaction. Administrators can resend notifications with one click.

---

## 3. Repository Directory Layout

`	ext
hostel-grievance-system/
|-- .env.example                     # Environment variables template
|-- .gitignore                       # Git ignore rules for Java, Node, and containers
|-- README.md                        # Comprehensive system documentation
|-- docker-compose.yml               # Multi-container orchestration specification
|-- start-local.ps1                  # One-click Windows local development runner
|-- backend/
|   |-- Dockerfile                   # Multi-stage JDK build and JRE runtime container
|   |-- pom.xml                      # Maven dependencies and build configuration
|   |-- src/
|   |   |-- main/
|   |   |   |-- java/com/hgs/
|   |   |   |   |-- config/          # Security, JWT, CORS, Rate limiting, Jackson
|   |   |   |   |-- controller/      # REST API Controllers (Public, Admin, Media)
|   |   |   |   |-- domain/          # JPA Entities and Enums
|   |   |   |   |-- dto/             # Request and Response Data Transfer Objects
|   |   |   |   |-- exception/       # Global exception handler and custom exceptions
|   |   |   |   |-- repository/      # Spring Data JPA Repositories and Specifications
|   |   |   |   -- service/         # Business logic, file storage, email, ID generation
|   |   |   -- resources/
|   |   |       |-- application.yml  # Base Spring Boot configuration
|   |   |       -- db/migration/    # Flyway schema (V1) and seed data (V2) migrations
|   |   -- test/                    # Integration and unit test suite
|-- frontend/
|   |-- Dockerfile                   # Node build and Nginx production container
|   |-- nginx.conf                   # Reverse proxy configuration for frontend
|   |-- package.json                 # React dependencies and scripts
|   |-- vite.config.js               # Vite build configuration with API proxying
|   -- src/
|       |-- api/                     # Axios/fetch HTTP client with interceptors
|       |-- components/              # Navbar, Footer, StatusBadge, Modal components
|       |-- context/                 # AuthContext for admin JWT state management
|       -- pages/                   # Home, Submit, Track, Admin Login, Admin Dashboard
-- scripts/
    |-- backup.sh                    # Linux / Docker automated pg_dump backup script
    -- backup.bat                   # Windows automated backup script
`

---

## 4. Database Design and Entity Relationship Diagram

`mermaid
erDiagram
    HOSTEL ||--o{ COMPLAINT : receives
    CATEGORY ||--o{ COMPLAINT : categorizes
    COMPLAINT ||--o{ COMPLAINT_STATUS_HISTORY : tracks
    COMPLAINT ||--o| COMPLAINT_COMPLETION : resolves
    ADMIN_USER ||--o{ COMPLAINT_COMPLETION : approves
    COMPLAINT ||--o{ NOTIFICATION_LOG : dispatches

    HOSTEL {
        bigint id PK
        varchar name UK
        varchar code UK
        boolean active
        timestamp created_at
    }

    CATEGORY {
        bigint id PK
        varchar name UK
        text description
        boolean active
        timestamp created_at
    }

    ADMIN_USER {
        bigint id PK
        varchar username UK
        varchar password_hash
        varchar email
        varchar full_name
        timestamp created_at
    }

    COMPLAINT {
        bigint id PK
        varchar complaint_code UK
        varchar student_name
        varchar student_email
        bigint hostel_id FK
        varchar location_type
        varchar location_detail
        bigint category_id FK
        text description
        varchar photo_url
        varchar status
        timestamp submitted_at
        timestamp created_at
        timestamp updated_at
    }

    COMPLAINT_STATUS_HISTORY {
        bigint id PK
        bigint complaint_id FK
        varchar old_status
        varchar new_status
        varchar changed_by
        timestamp changed_at
        text note
    }

    COMPLAINT_COMPLETION {
        bigint id PK
        bigint complaint_id FK, UK
        text remarks
        varchar completion_photo_url
        timestamp completed_at
        bigint completed_by_admin_id FK
    }

    NOTIFICATION_LOG {
        bigint id PK
        bigint complaint_id FK
        varchar type
        varchar status
        varchar recipient_email
        timestamp attempted_at
        text error_message
    }
`

---

## 5. Default Seed Data and Administrative Credentials

Initial database records are automatically created upon application startup via Flyway migrations:

### Hostels
- Hostel A (Ganga Block) - Code: HOSTEL-A
- Hostel B (Yamuna Block) - Code: HOSTEL-B

### Categories
- Plumbing: Water leaks, taps, flush valves, pipelines, drainage
- Electrical: Lighting, fans, switchboards, wiring, geysers
- Civil / Carpentry: Doors, window panes, locks, study tables, beds
- Cleaning / Hygiene: Corridor hygiene, sanitation, waste disposal
- Other: General maintenance or infrastructure requests

### Default Administrator Account
- Username: admin
- Password: Admin@Hgs2026!
- Role: Chief Hostel Warden

---

## 6. REST API Reference

### Public Endpoints (No Authentication Required)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | /api/status | Backend service health and status indicator |
| GET | /api/hostels | List all active hostels for form dropdowns |
| GET | /api/categories | List all active categories for form dropdowns |
| POST | /api/complaints | Submit grievance (multipart form: student info, hostel, category, optional photo) |
| GET | /api/complaints/track/{code} | Track grievance progress (student contact details redacted) |
| GET | /api/media/{folder}/{filename} | Stream uploaded grievance or resolution photos |

### Administrator Endpoints (Requires Header: Authorization: Bearer <JWT>)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | /api/auth/login | Authenticate admin credentials and return JWT bearer token |
| GET | /api/auth/me | Retrieve logged-in administrator profile details |
| GET | /api/admin/complaints | Paginated complaints list with filtering (hostel, category, status, date, search) |
| GET | /api/admin/complaints/{id} | Comprehensive complaint record with student contact info, history, and photos |
| PATCH | /api/admin/complaints/{id}/status | Update grievance status (IN_PROGRESS, REJECTED) with administrative note |
| POST | /api/admin/complaints/{id}/complete | Resolve grievance (multipart form: remarks and mandatory completion photo) |
| POST | /api/admin/complaints/{id}/resend-notification | Manually re-trigger email notification to student |

---

## 7. Getting Started: Running the Application

### Option A: Multi-Container Setup via Docker Compose (Recommended)

Start the full stack (PostgreSQL database, Spring Boot API, and React frontend) with a single command:

`ash
docker compose up -d --build
`

Access the components:
- Frontend Web Portal: http://localhost:3000
- Backend REST API: http://localhost:8080/api
- PostgreSQL Database: localhost:5432 (Database: hgs_db, Username: hgs_user, Password: hgs_secret_2026)

To view backend service logs:
`ash
docker logs -f hgs-backend
`

To stop all services and containers:
`ash
docker compose down
`

---

### Option B: Independent Local Development

#### Prerequisites
- Java Development Kit (JDK 17, 21, or 24)
- Node.js (version 18 or higher) and npm
- PostgreSQL running locally, or local H2 in-memory mode

#### 1. Start the Backend Service
`ash
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
`
*(On Windows: .\mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=local)*

When run with the local profile:
- Backend starts at http://localhost:8080
- In-memory database web console is accessible at http://localhost:8080/h2-console (JDBC URL: jdbc:h2:mem:hgs_local_db, Username: sa, Password: empty)

#### 2. Start the Frontend Application
`ash
cd frontend
npm install
npm run dev
`
The React development server will start at http://localhost:3000 (or http://localhost:5173) and proxy API requests to port 8080.

---

## 8. Automated Testing Suite

The backend includes a comprehensive integration and unit test suite verifying:
1. Public complaint submission with unique ID sequence generation (HGS-YYYY-XXXXXX).
2. Student privacy preservation on public tracking endpoints (asserting that names and emails are never exposed).
3. JWT authentication, role verification, and unauthorized request rejection.
4. Valid status progression and immutable audit trail creation.
5. Mandatory photographic proof enforcement on completion (400 Bad Request if missing).
6. Notification resilience ensuring transactions commit safely even during SMTP downtime.

To execute the tests:
`ash
cd backend
./mvnw test
`
*(On Windows: .\mvnw.cmd test)*

---

## 9. Database Backup and Disaster Recovery Strategy

Automated backup scripts are included in the scripts/ directory:
- Linux / Docker Cron Script: scripts/backup.sh
- Windows Script: scripts/backup.bat

### Automated Daily Snapshot (Linux Host via Cron)
Add this entry to your host crontab (crontab -e) to execute daily at 02:00 AM:
`ash
0 2 * * * /path/to/hostel-grievance-system/scripts/backup.sh >> /var/log/hgs_backup.log 2>&1
`

The backup mechanism:
1. Performs an online consistent pg_dump of the hgs_db database.
2. Compresses the SQL dump with gzip to ./backups/hgs_backup_YYYYMMDD_HHMMSS.sql.gz.
3. Automatically deletes backup archives older than 30 days to optimize storage.

---

## 10. Security and Production Hardening

- Reverse Proxy and TLS: In production, configure Nginx, Traefik, or an AWS Application Load Balancer to terminate TLS/HTTPS before forwarding traffic to the application.
- Secret Management: Do not commit .env files containing production secrets. Supply JWT_SECRET, database passwords, and SMTP credentials via secure container environment variables or cloud secrets managers.
- In-Memory Rate Limiting: An internal sliding-window filter throttles incoming requests on public submission and tracking endpoints to mitigate automated brute-force attempts.
- File Upload Validation: The file storage service enforces strict MIME-type checking (JPEG, PNG, WEBP) and caps uploads at 5MB to prevent storage exhaustion.
- Non-Root Container Execution: Containers are configured to run as dedicated unprivileged system users for minimal host attack surface.

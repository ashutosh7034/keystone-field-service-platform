# PROJECT KEYSTONE - Field Service Management Platform
### Enterprise Facility Maintenance System for Meridian Facilities Management

[![Spring Boot 3.3.4](https://img.shields.io/badge/Spring_Boot-3.3.4-6DB33F?logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Java 21](https://img.shields.io/badge/Java-21-ED8B00?logo=openjdk&logoColor=white)](https://openjdk.org/)
[![React 18](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MySQL 8](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Flyway](https://img.shields.io/badge/Flyway-10-CC0202?logo=flyway&logoColor=white)](https://flywaydb.org/)
[![Swagger OpenAPI](https://img.shields.io/badge/OpenAPI-3.0-85EA2D?logo=swagger&logoColor=black)](http://localhost:8080/swagger-ui.html)

---

## 1. System Architecture & Overview

**PROJECT KEYSTONE** is an enterprise-grade Field Service Management (FSM) platform tailored for **Meridian Facilities Management** to oversee and automate mission-critical field operations across HVAC, electrical, and plumbing trades.

### Architectural Core Pillars
- **Strict Lifecycle State Machine**: Enforces a non-bypassable backend transition matrix (`NEW` ➔ `ASSIGNED` ➔ `IN_PROGRESS` ➔ `ON_HOLD` / `COMPLETED` ➔ `CLOSED` / `CANCELLED`). Any invalid transition triggers an immediate `409 Conflict`.
- **Atomic Immutable Audit Trail**: State transitions generate an immutable history record in `work_order_status_history` in the same database transaction.
- **Pessimistic Inventory Locking**: Parts usage deduction uses `@Lock(LockModeType.PESSIMISTIC_WRITE)` with atomic validation preventing negative warehouse quantities under concurrent technician loggings.
- **Live Automated SLA Engine**: Background monitoring evaluates resolution times dynamically, computing `ON_TRACK`, `AT_RISK`, and `BREACHED` states and dispatching real-time notifications to dispatchers and managers.
- **Multi-Tenant Customer & Technician Isolation**: Customer users can only view their own facilities, service requests, and sanitized public timeline notes. Technicians only access assigned jobs.
- **Modern Responsive UI**: React 18 + TypeScript SPA with an enterprise design system supporting dark/light themes, Kanban boards, interactive modals, and mobile-responsive technician controls.

```
┌─────────────────────────────────────────────────────────────┐
│                   React 18 + TypeScript SPA                 │
│   (Vite, Context API, Lucide Icons, Enterprise CSS Tokens)  │
└──────────────────────────────┬──────────────────────────────┘
                               │ REST APIs + JWT Bearer
┌──────────────────────────────▼──────────────────────────────┐
│                  Spring Boot 3.3.4 (Java 21)                │
│  ├── Spring Security + Stateless JWT Filter                │
│  ├── WorkOrderLifecycleStateMachine (Validation Matrix)     │
│  ├── SlaService (@Scheduled Background Heartbeat)           │
│  ├── PartUsageService (@Lock PESSIMISTIC_WRITE)             │
│  └── GlobalExceptionHandler (Standardized Error Payloads)   │
└──────────────────────────────┬──────────────────────────────┘
                               │ Spring Data JPA + Hibernate
┌──────────────────────────────▼──────────────────────────────┐
│                    MySQL 8 (keystone_db)                    │
│   Managed via Flyway Migrations (V1__... to V11__...)       │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Seed Demo Credentials

The platform is pre-loaded with sample operational data across all 4 system roles (Default password for all demo accounts is **`password123`**):

| Role | Email | Name | Key Capabilities |
| :--- | :--- | :--- | :--- |
| **Manager** | `manager@keystone.demo` | Eleanor Vance (Operations Director) | Complete system administration, Work Order closure, SLA reports, Staff creation |
| **Dispatcher** | `dispatcher@keystone.demo` | David Ross (Head Dispatcher) | Triage, job assignment to technicians, priority changes, schedule dispatch |
| **Technician 1** | `technician1@keystone.demo` | Alex Rivera (Lead HVAC Tech) | View assigned jobs, start/pause timers, log labor hours, consume warehouse parts |
| **Technician 2** | `technician2@keystone.demo` | Sarah Chen (Master Electrician) | Assigned HVAC / Electrical field technician |
| **Customer 1** | `customer1@keystone.demo` | David Miller (Apex Facilities VP) | Tenant portal for Apex Towers: submit service tickets, track technician arrival |
| **Customer 2** | `customer2@keystone.demo` | Elena Rostova (Metro Mall Director) | Tenant portal for Metro Outlets: submit service tickets, track technician arrival |

> **Quick Demo Bar**: The frontend application includes a persistent top toolbar enabling 1-click instantaneous switching between all 4 roles for demonstration and evaluation.

---

## 3. How to Run (Step-by-Step Guide)

You can run PROJECT KEYSTONE locally on your machine using either **Native Local Setup (XAMPP / MySQL + Maven + Vite)** or **Docker 1-Click Setup**.

### Quick 1-Click Launchers (Windows)
If you are on Windows, you can launch both Backend and Frontend simultaneously:
- **Double-click** `start-keystone.bat`
- Or in PowerShell: `.\start-keystone.ps1`

---

### Method A: Manual Local Execution (Step-by-Step)

#### Step 1: Verify Prerequisites
Open a terminal and verify the required runtime environments:
```bash
# Verify Java (Requires Java 21 or higher)
java -version

# Verify Node.js & npm (Requires Node 18+)
node -v
npm -v

# Verify Maven
mvn -v
```

#### Step 2: Set Up MySQL Database
1. Start your local **MySQL Server** (or open the **XAMPP Control Panel** and click **Start** next to MySQL on port `3306`).
2. Open phpMyAdmin (`http://localhost/phpmyadmin`) or your MySQL client/terminal:
   ```sql
   CREATE DATABASE keystone_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
3. Default connection settings configured in `backend/src/main/resources/application.yml`:
   - URL: `jdbc:mysql://localhost:3306/keystone_db`
   - Username: `root`
   - Password: *(blank by default)*

> *Note: If your local MySQL has a root password, update `spring.datasource.password` in `backend/src/main/resources/application.yml` or set environment variable `SPRING_DATASOURCE_PASSWORD`.*

#### Step 3: Start Spring Boot Backend
Open a terminal in the project root:

**Windows (PowerShell):**
```powershell
cd backend
mvn clean package -DskipTests
mvn spring-boot:run
```

**Linux / macOS (Bash):**
```bash
cd backend
mvn clean package -DskipTests
mvn spring-boot:run
```

**What happens on startup:**
- Flyway automatically executes database migrations `V1` through `V11`.
- Creates all database schema tables, constraints, foreign keys, and indexes.
- Seeds demo users, facilities, parts inventory, and work orders.
- Backend server begins listening at `http://localhost:8080`.

**Verify Backend is Running:**
- Health Check: [http://localhost:8080/api/health](http://localhost:8080/api/health)
- Swagger OpenAPI Docs: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)

#### Step 4: Start React Frontend
Open a **new terminal window** in the project root:

```powershell
cd frontend
npm install
npm run dev
```

**Access the Web Application:**
- Open your browser and navigate to: **`http://localhost:5173`**
- Use the top **Demo Login Bar** to switch between Manager, Dispatcher, Technician, and Customer roles with a single click!

---

### Method B: Docker Compose 1-Click Execution

To build and orchestrate the entire environment (MySQL 8 database + Spring Boot Java 21 backend + Nginx React 18 frontend) inside isolated Docker containers:

```bash
# Build and run all containers in the background
docker-compose up --build -d
```

**Access points:**
- **Web App**: `http://localhost:3000`
- **Backend REST API**: `http://localhost:8080`
- **Swagger Documentation**: `http://localhost:8080/swagger-ui.html`
- **MySQL Database**: `localhost:3306`

**To stop all containers:**
```bash
docker-compose down -v
```

---

## 4. Running Automated Tests

Run the full backend automated test suite (verifying lifecycle states, customer tenant isolation, concurrency locks, SLA alarms, and authentication):

```powershell
cd backend
mvn test
```

### Verified Test Suites (18 / 18 Passing):
| Test Class | Tests | Key Scenarios Verified |
| :--- | :---: | :--- |
| `WorkOrderLifecycleTest` | 7 | Legal state progression, invalid transition rejection (409 Conflict), note validation, manager closure enforcement |
| `CustomerIsolationTest` | 3 | Customer scoped queries, cross-tenant forbidden access, internal notes exclusion |
| `PartUsageTransactionTest`| 2 | Atomic inventory deduction, pessimistic write locking (`@Lock`), insufficient stock rejection |
| `SlaServiceTest` | 2 | SLA status calculation, automated notification dispatch for breached tickets |
| `AuthServiceTest` | 4 | JWT issuance, password hashing verification, unauthorized rejection |

---

## 5. Work Order State Machine Rules

The state transition validation matrix in `WorkOrderLifecycleStateMachine.java` strictly enforces:

```
                  ┌─────────┐
                  │   NEW   │
                  └────┬────┘
                       │ (Assign Tech)
                  ┌────▼────┐
             ┌───►│ ASSIGNED│◄──┐
(Resume Job) │    └────┬────┘   │ (Hold -> Reassigned)
             │         │ (Start Work)
             │    ┌────▼───────┐│
             ├────┤ IN_PROGRESS├┤
             │    └────┬───┬───┘│
             │         │   │    │
             │ (Pause) │   │ (Finish Work)
          ┌──┴───┐     │   │
          │ON_HOLD│◄───┘   │
          └──────┘         │
                      ┌────▼────┐
                      │COMPLETED│
                      └────┬────┘
                           │ (Manager Review & Signoff)
                      ┌────▼───┐
                      │ CLOSED │
                      └────────┘
```

- **Rule 5 & 6**: Only users with `ROLE_MANAGER` can transition a job to `CLOSED`. Technicians can only mark jobs as `COMPLETED`.
- **Cancellation**: Only `ROLE_MANAGER` or `ROLE_DISPATCHER` can transition a non-terminal job to `CANCELLED`.
- **Audit Requirement**: Any transition requiring a hold reason, cancellation reason, or completion note records mandatory notes into the immutable audit history.

---

## 6. SLA & Concurrency Specifications

1. **SLA Breach Calculations**:
   - `CRITICAL`: 4 hours SLA deadline
   - `HIGH`: 8 hours SLA deadline
   - `MEDIUM`: 24 hours SLA deadline
   - `LOW`: 48 hours SLA deadline
   - Status updates automatically (`ON_TRACK` ➔ `AT_RISK` at 75% elapsed ➔ `BREACHED` at 100% elapsed).
2. **Pessimistic Inventory Locking**:
   - In `PartUsageService.java`, stock deduction executes inside `@Transactional` with `partRepository.findByIdWithLock(partId)` (`LockModeType.PESSIMISTIC_WRITE`).
   - Prevents stock overselling under parallel technician submissions.

---

## 7. Primary API Endpoints

| Method | Endpoint | Allowed Roles | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Public | Authenticate user and receive JWT bearer token |
| `GET` | `/api/auth/me` | Authenticated | Retrieve current user profile and role |
| `GET` | `/api/health` | Public | System status and database connectivity |
| `GET` | `/api/work-orders` | Manager, Dispatcher | Search and filter work orders with pagination |
| `POST` | `/api/work-orders` | Manager, Dispatcher | Create new work order |
| `GET` | `/api/work-orders/{id}` | All Roles (Scoped) | Retrieve detailed work order payload |
| `PATCH`| `/api/work-orders/{id}/status` | All Roles (RBAC) | Execute state machine status transition |
| `POST` | `/api/work-orders/{id}/parts` | Manager, Technician | Log parts consumed with warehouse lock |
| `POST` | `/api/work-orders/{id}/timelogs` | Manager, Technician | Log technician labor hours |
| `POST` | `/api/work-orders/{id}/attachments` | Authenticated | Upload job photos and documentation |
| `GET` | `/api/dashboard/summary` | Manager, Dispatcher | Live KPIs, SLA health, and status counters |
| `GET` | `/api/reports/summary` | Manager | SLA breach rates, technician workloads, category costs |
| `GET` | `/api/customers` | Manager, Dispatcher | List customers and facilities |
| `GET` | `/api/parts` | All Roles | Real-time warehouse inventory and stock levels |

---

## 8. Troubleshooting Guide

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| `Access denied for user 'root'@'localhost'` | MySQL has a password configured. | Update `spring.datasource.password` in `application.yml` or set environment variable `SPRING_DATASOURCE_PASSWORD`. |
| `Port 8080 already in use` | Another process is using port 8080. | Stop the conflicting process or change `server.port` in `application.yml`. |
| `Port 5173 already in use` | Another Vite server is running. | Vite will automatically suggest port `5174` or stop previous frontend process. |
| `Java compilation error (Lombok)` | JDK 21+ compiler settings. | Ensure Lombok version is 1.18.36+ (configured in `pom.xml`). |

---

## 9. License & Credits
Built for **Meridian Facilities Management** as part of **Project KEYSTONE** engineering specifications.
Designed and implemented with modern clean architecture principles.

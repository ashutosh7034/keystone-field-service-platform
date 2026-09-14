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
| **Manager** | `manager@keystone.com` | Marcus Vance | Complete system administration, Work Order closure, SLA reports, Staff creation |
| **Dispatcher** | `dispatcher@keystone.com` | Diana Ross | Triage, job assignment to technicians, priority changes, schedule dispatch |
| **Technician** | `tech1@keystone.com` | Carlos Mendez | View assigned jobs, start/pause timers, log labor hours, consume warehouse parts |
| **Technician 2** | `tech2@keystone.com` | Aisha Khan | Assigned HVAC / Electrical field technician |
| **Customer** | `customer@apex.com` | Sarah Jenkins | Tenant portal for Apex Towers: submit service tickets, track technician arrival |

> **Quick Demo Bar**: The frontend application includes a persistent top toolbar enabling 1-click instantaneous switching between all 4 roles for demonstration and evaluation.

---

## 3. Local Development Setup (XAMPP / MySQL)

### Prerequisites
- **Java 21 JDK** installed (`java -version` should report 21+)
- **Node.js 18+** and **npm**
- **MySQL 8.0** or **XAMPP MySQL** running locally on port `3306`
- **Apache Maven 3.9+**

### Step 1: Create Database
Start MySQL (e.g. through the XAMPP Control Panel) and create the database:
```sql
CREATE DATABASE keystone_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Step 2: Configure & Start Backend
Verify `backend/src/main/resources/application.yml` matches your local MySQL username/password (default is `root` with no password).

Run Maven:
```powershell
cd backend
mvn clean package -DskipTests
mvn spring-boot:run
```
Flyway will automatically execute migrations `V1` through `V11` and seed all users, facilities, parts, and active work orders.
- **Backend URL**: `http://localhost:8080`
- **Health Check**: `http://localhost:8080/api/health`
- **Swagger OpenAPI Docs**: `http://localhost:8080/swagger-ui.html`

### Step 3: Start Frontend Dev Server
In a separate terminal:
```powershell
cd frontend
npm install
npm run dev
```
- **Frontend App**: `http://localhost:5173`

---

## 4. Docker Deployment Quickstart

To run the entire ecosystem (MySQL 8 + Spring Boot Backend + Nginx Frontend) in isolated Docker containers:

```bash
docker-compose up --build -d
```
- **Application Portal**: `http://localhost:3000`
- **Backend API**: `http://localhost:8080`
- **Database**: Port `3306`

To shut down:
```bash
docker-compose down -v
```

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

## 7. Running Automated Tests

Run the full backend test suite containing lifecycle verification, tenant isolation, concurrency tests, and SLA calculations:

```powershell
cd backend
mvn test
```

### Verified Test Suites:
- `WorkOrderLifecycleTest`: Validates legal and forbidden state machine transitions, note validation, and role restrictions.
- `CustomerIsolationTest`: Verifies cross-tenant data protection and private internal notes exclusion.
- `PartUsageTransactionTest`: Verifies inventory decrements, pessimistic locking, and negative stock rejection.
- `SlaServiceTest`: Verifies SLA threshold calculations and automated notification dispatches.
- `AuthServiceTest`: Verifies JWT issuance, password hashing, and user credential validation.

---

## 8. Primary API Endpoints

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

## 9. License & Credits
Built for **Meridian Facilities Management** as part of **Project KEYSTONE** engineering specifications.
Designed and implemented with modern clean architecture principles.

# MediStock — Medical Inventory Management Platform

MediStock is a full-stack medical inventory management platform designed for **pharmacies, hospitals, clinics, and healthcare organizations**.

The platform provides centralized management of medicines, inventory, suppliers, purchases, expiry dates, stock levels, notifications, analytics, and reports.

The system is built using a **React.js frontend and Spring Boot backend**, with role-based access and secure authentication.

---

## 🎯 Project Objective

The main objective of MediStock is to build a reliable and scalable medical inventory management platform that helps healthcare organizations:

* Manage medicine inventory
* Track real-time stock availability
* Monitor medicine expiry dates
* Manage medicine suppliers
* Track purchases
* Receive low-stock and expiry alerts
* Search and filter medicines
* Analyze inventory data
* Generate inventory and purchase reports

---

# 🚀 Key Features

### 🔐 Authentication & Role-Based Access

* JWT authentication
* OAuth2 / Google login
* Role-based access control
* Password reset
* User profile management

### 💊 Medicine Inventory Management

* Add medicines
* Update medicine details
* Delete medicines
* Manage medicine categories
* Track medicine batches
* Track inventory history
* Monitor quantities
* Store manufacturing and expiry dates

### 🏢 Supplier Management

* Add supplier information
* Manage supplier contacts
* Track supplier purchases
* Maintain supplier history
* Monitor supplier performance

### 📦 Stock Monitoring

* Real-time stock tracking
* Automatic stock updates
* Low-stock alerts
* Out-of-stock notifications
* Inventory movement tracking

### ⏳ Expiry Tracking

* Monitor medicine expiry dates
* Track near-expiry medicines
* Expiry notifications
* Expired-stock management
* Expiry reports

### 🔎 Search & Filtering

Medicines can be searched and filtered using:

* Medicine name
* Category
* Supplier
* Batch number
* Expiry date
* Stock status

### 📊 Dashboard & Analytics

#### Pharmacist Dashboard

* Inventory overview
* Low-stock medicines
* Expiring medicines
* Purchase summary
* Supplier insights

#### Admin Dashboard

* Inventory analytics
* User activity
* Supplier analytics
* Stock movement reports
* System monitoring

### 🔔 Notifications

* Low-stock notifications
* Expiry alerts
* Inventory reminders
* Purchase alerts
* Email notifications
* Push notifications

### 📑 Reports & Data Export

* Inventory reports
* Purchase history reports
* Expiry reports
* Stock data export
* PDF reports
* Excel reports

## These modules and features are based on the project specification in the MediStock document.

# 🏗️ Technology Stack

## Frontend

* React.js
* JavaScript
* React Router
* Axios
* Tailwind CSS
* Context API
* Framer Motion
* React Testing Library

## Backend

* Java
* Spring Boot
* Spring Security
* Spring Data JPA
* Hibernate
* Maven

## Database

### Development

* MySQL

### Production

* PostgreSQL

## Authentication

* Spring Security
* JWT Authentication
* OAuth2 / Google Login

## Notifications

* Firebase Cloud Messaging (FCM)
* Twilio
* JavaMailSender

## Testing

* JUnit
* Mockito
* Postman
* React Testing Library

## Development & Deployment

* IntelliJ IDEA
* VS Code
* Git
* GitHub
* Docker
* Docker Compose
* GitHub Actions
* AWS / Render / Railway

The technology stack follows the project specification provided in the MediStock document.

---

# 📅 Milestone-Wise Project Development

The project is divided into **4 major milestones across 8 weeks**.

---

## 🟢 Milestone 1 — Weeks 1 & 2

### Requirements, Database Design & Backend Setup

### Objectives

Establish the basic architecture of the application, finalize the database structure, and implement the initial authentication system.

### Tasks Completed

* Defined project scope
* Defined user roles
* Designed database schema
* Created entities for:

  * Users
  * Roles
  * Medicines
  * Suppliers
  * Inventory
  * Stock Logs
  * Purchase Orders
  * Expiry Tracking
  * Notifications
  * Reports
* Initialized Spring Boot backend
* Configured database
* Implemented JWT authentication APIs
* Created React frontend structure

### Expected Outcome

* Backend architecture established
* Frontend architecture established
* Database schema finalized
* Authentication flow functional
* Role-based access configured

### Milestone Evaluation

## The expected Milestone 1 evaluation includes Spring Boot scaffolding, JWT authentication, finalized database schema, and working frontend authentication.

# 🟡 Milestone 2 — Weeks 3 & 4

## Inventory & Supplier Management

### Objectives

Develop the core medical inventory functionality and supplier management workflow.

### Tasks

* Implement medicine inventory APIs
* Build medicine management pages
* Implement medicine CRUD operations
* Implement stock tracking
* Build supplier management system
* Add medicine categories
* Implement medicine search
* Implement filtering
* Track inventory movement
* Track supplier purchases

### Expected Outcome

* Inventory management operational
* Supplier workflow functional
* Dynamic stock tracking implemented
* Medicine search and filtering available

### Milestone Evaluation

## Milestone 2 focuses on operational medicine inventory management, supplier management, and search/filtering functionality.

# 🟠 Milestone 3 — Weeks 5 & 6

## Expiry Tracking, Notifications & Analytics

### Objectives

Introduce proactive inventory monitoring through expiry tracking, alerts, notifications, analytics, and reporting.

### Tasks

* Implement medicine expiry tracking
* Identify near-expiry medicines
* Manage expired stock
* Implement low-stock alerts
* Implement out-of-stock notifications
* Integrate notification services
* Develop analytics APIs
* Implement report generation
* Generate inventory insights

### Expected Outcome

* Expiry monitoring operational
* Alert system functional
* Notification system functional
* Inventory analytics completed
* Reporting workflow implemented

### Milestone Evaluation

## The Milestone 3 evaluation focuses on operational expiry tracking, a functional notification system, and completion of the inventory analytics workflow.

# 🔵 Milestone 4 — Weeks 7 & 8

## Analytics, Testing & Deployment

### Objectives

Complete the application, integrate dashboards and reports, perform testing, and deploy the system.

### Tasks

* Build analytics dashboard
* Add charts and reporting visualizations
* Perform API testing
* Perform frontend testing
* Perform end-to-end workflow testing
* Perform security validation
* Optimize application performance
* Configure environment variables
* Configure CORS
* Configure SSL
* Containerize using Docker
* Deploy frontend and backend
* Configure monitoring and logging
* Complete project documentation

### Expected Outcome

* Fully deployed application
* Production-ready frontend and backend
* Operational inventory monitoring
* Operational dashboards and reports
* Complete end-to-end inventory workflow

### Milestone Evaluation

## Milestone 4 is considered complete when the frontend and backend are deployed, dashboards and reporting are operational, and the complete inventory workflow can be demonstrated end-to-end.

# 🔄 Overall Development Flow

```text
Milestone 1
Requirements + Database + Authentication
              ↓
Milestone 2
Inventory + Supplier Management
              ↓
Milestone 3
Expiry + Alerts + Notifications + Analytics
              ↓
Milestone 4
Dashboard + Testing + Deployment
              ↓
        MediStock Platform
```

---

# 📊 Performance Metrics

The project evaluates system performance using several categories.

### Inventory Metrics

* Stock tracking accuracy
* Inventory update success rate
* Inventory reconciliation accuracy
* Medicine search efficiency

### Expiry & Alert Metrics

* Expiry detection accuracy
* Low-stock alert accuracy
* Notification delivery success rate
* Expired-stock identification rate

### Supplier Metrics

* Supplier performance tracking accuracy
* Purchase order processing efficiency
* Supplier response monitoring

### System Performance

* API response time
* Dashboard loading speed
* Concurrent user handling capacity
* Database query performance

These metrics are specified as the project's performance evaluation areas.

---

# 🎯 Project Goals

### Inventory Tracking

Maintain accurate medicine inventory and stock movement records.

### Expiry Monitoring

Identify and proactively notify users about near-expiry and expired medicines.

### Supplier Management

Track supplier performance and purchase activities efficiently.

### Inventory Analytics

Provide actionable inventory insights through dashboards and reports.

### Platform Performance

Support pharmacies, hospitals, and clinics with stable and scalable inventory management workflows.

---

# 👥 User Roles

The platform defines three primary roles:

| Role           | Responsibilities                                             |
| -------------- | ------------------------------------------------------------ |
| **Admin**      | System monitoring, users, analytics, suppliers and inventory |
| **Pharmacist** | Medicine inventory, stock, expiry and purchase management    |
| **Staff**      | Inventory-related operational activities                     |

---

# 📂 Project Structure

```text
medistock_project/
│
├── backend/
│   ├── src/
│   ├── pom.xml
│   ├── mvnw
│   └── mvnw.cmd
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── README.md
└── .gitignore
```

> Update this structure if your current repository has additional folders or a different frontend/backend organization.

---

# ⚙️ Local Setup

## 1. Clone the Repository

```bash
git clone <repository-url>
cd medistock_project
```

## 2. Start the Backend

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

The backend is based on Spring Boot.

## 3. Start the Frontend

Open another terminal:

```powershell
cd frontend
npm install
npm run dev
```

The frontend runs using React.js and the configured Vite development environment.

---

# 🧪 Testing

The project uses:

* JUnit
* Mockito
* Postman
* React Testing Library

Testing covers:

* API validation
* Authentication
* Inventory workflows
* Frontend components
* End-to-end workflows
* Security validation

---

# 🚀 Deployment

The production deployment plan includes:

* Frontend deployment
* Backend deployment
* PostgreSQL production database
* Environment variable configuration
* SSL configuration
* CORS configuration
* Docker containerization
* Monitoring and logging
* GitHub Actions CI/CD

The project specification identifies AWS, Render, and Railway as possible deployment platforms.

---

# 📈 8-Week Roadmap

| Week         | Milestone   | Major Deliverables                                        |
| ------------ | ----------- | --------------------------------------------------------- |
| **Week 1–2** | Milestone 1 | Requirements, database, Spring Boot setup, authentication |
| **Week 3–4** | Milestone 2 | Inventory, suppliers, search and filtering                |
| **Week 5–6** | Milestone 3 | Expiry tracking, alerts, notifications, analytics         |
| **Week 7–8** | Milestone 4 | Dashboard, testing, optimization and deployment           |

---

# 🏆 Final Project Outcome

At the completion of all four milestones, MediStock provides an end-to-end medical inventory management workflow covering:

```text
Authentication
      ↓
Medicine Management
      ↓
Inventory & Stock Tracking
      ↓
Supplier & Purchase Management
      ↓
Expiry Monitoring
      ↓
Low-Stock & Expiry Alerts
      ↓
Analytics & Reports
      ↓
Testing
      ↓
Production Deployment
```

The intended final outcome is a fully deployed application with operational inventory monitoring, dashboards, reporting, and a demonstrable end-to-end inventory workflow.

---

# 📌 Project Status

| Milestone                                     | Status                     |
| --------------------------------------------- | -------------------------- |
| Milestone 1 — Setup & Authentication          | 🔄 In Progress / Completed |
| Milestone 2 — Inventory & Suppliers           | 🔄 In Progress / Completed |
| Milestone 3 — Expiry & Notifications          | 🔄 In Progress / Completed |
| Milestone 4 — Analytics, Testing & Deployment | 🔄 In Progress / Completed |

> Update the status column according to the actual implementation in the repository.

---

# 👨‍💻 Team

**MediStock — Medical Inventory Management Platform**

Developed as a full-stack application using React.js and Spring Boot.

---

## 📄 License

This project is developed for academic and educational purposes.

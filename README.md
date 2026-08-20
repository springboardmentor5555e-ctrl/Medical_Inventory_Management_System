# MediStock 🏥

> Modern, professional, enterprise-grade Medical Inventory Management Platform with role-based clinical security, real-time stock analytics, and automated email alerts.

MediStock is a high-performance, responsive clinical supply chain and medical inventory platform built with a **React (Vite)** frontend, **Spring Boot** backend, and a **Cloud PostgreSQL** database. It features an interactive clinical dashboard, strict role-based access controls (RBAC), real-time stock updates, automated low-stock & expiry alerts via email, and complete procurement workflow management.

---

## 🛠️ Tech Stack & Architecture

### **Frontend**
* **Framework**: React (v18+) with Vite
* **Routing**: React Router DOM (v7)
* **Form Validation**: React Hook Form with Yup schema validation
* **Styling**: Tailwind CSS & Lucide Icons
* **Data Visualization**: Recharts (Pie, Bar, Area, and Line charts)

### **Backend**
* **Language & Framework**: Java 21 & Spring Boot 3.3.5
* **Security & Authentication**: Spring Security, JWT (JSON Web Tokens), and Google OAuth2 Social Login
* **Data Access**: Spring Data JPA, Hibernate, and Spring JDBC Template
* **Notifications Engine**: Spring Boot Starter Mail (Gmail SMTP)
* **Automated Scheduler**: Spring Task Scheduling (Daily expiry & low-stock sweeps)

### **Database**
* **Database Engine**: **Cloud PostgreSQL Database**
* **Schema Management**: Relational design with normalized tables (`medicines`, `medicine_batches`, `inventory_transactions`, `purchase_orders`, `suppliers`, `categories`, `users`, `notifications`, `system_logs`)

---

## 🎨 Key Features & Functional Modules

1. **Role-Based Access Control (RBAC)**:
   * **ADMIN**: Full access to dashboard analytics, user terminal management, inventory control, purchase order approvals, and system audit logs.
   * **PHARMACIST**: Access to inventory, medicine catalog, batch expiry tracking, supplier management, and purchase order creation.
   * **STAFF**: Access to view dashboard, medicine catalog, and record inventory transaction logs.

2. **Real-Time Inventory & Dynamic Stock Calculation**:
   * Dynamic, live stock calculation aggregated from batch inventories and transaction logs.
   * Instant tracking for stock-ins, sales, adjustments, returns, and expired batch quarantines.

3. **Expiry & Low-Stock Warning Engine**:
   * Automatic classification of batch expiry risk levels (Expired, Urgent <30d, Warning <60d, Safe).
   * Instant & automated daily email notifications sent to administrators for low-stock items and near-expiry medicine batches.

4. **Procurement & Purchase Order Lifecycle**:
   * End-to-end Purchase Order workflow: `PENDING` ➔ `APPROVED` / `REJECTED` ➔ `RECEIVED`.
   * Automatic stock batch creation and inventory update upon order receipt.

5. **Analytical Reports & Data Exports**:
   * Generate, preview, and export customized analytical CSV/Excel reports for Inventory Valuation, Expiry Warnings, Procurement Summaries, and Supplier Performance.

---

## 🔐 Role-Based Access Control (RBAC) Matrix

| Component / Page | ADMIN 🛡️ | PHARMACIST 🩺 | STAFF 📋 |
| :--- | :---: | :---: | :---: |
| **Clinical Dashboard** | Full Access | Full Access | Full Access |
| **Medicine Catalog** | Full Access | Full Access | Read-Only Catalog |
| **Batch & Expiry Management** | Full Access | Full Access | 🚫 No Access |
| **Category Management** | Full Access | Full Access | 🚫 No Access |
| **Supplier Profiles** | Full Access | Full Access | 🚫 No Access |
| **Purchase Orders & Approval** | Full Access | Full Access | 🚫 No Access |
| **Inventory Transaction Ledger** | Full Access | Full Access | Append-Only Logs |
| **Analytical Reports** | Full Access | Full Access | 🚫 No Access |
| **User Management** | Full Access | 🚫 No Access | 🚫 No Access |
| **My Profile & Settings** | Full Access | Full Access | Full Access |

---

## 🏃 Getting Started

### 1. Prerequisites
* Node.js (v18+) & npm
* Java OpenJDK 21
* Maven 3.x
* Cloud PostgreSQL Database connection details

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Configure environment variables or update `src/main/resources/application.yml` with your Cloud PostgreSQL database connection details, Mail SMTP credentials, and JWT signing key.
3. Build and run the Spring Boot server:
   ```bash
   mvn spring-boot:run
   ```
   The backend REST API will run on `http://localhost:8080`.

### 3. Frontend Setup
1. In the root directory, install dependencies:
   ```bash
   npm install
   ```
2. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The frontend application will be accessible at `http://localhost:3000`.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

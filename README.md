# 💊 MediStock – Medical Inventory Management System


### Full-Stack Medical Inventory Management Platform


MediStock is a full-stack web application designed to help pharmacies, hospitals, and healthcare organizations manage medicines, suppliers, inventory, stock levels, expiry dates, notifications, analytics, and reports from a centralized system.

The project is developed using **React.js** for the frontend and **Spring Boot** for the backend, with **PostgreSQL** as the database.

---

## 📌 Project Overview

Managing medical inventory manually can make it difficult to track medicine quantities, expiry dates, suppliers, and stock availability.

MediStock provides a centralized platform where users can:

- Manage medicines
- Manage suppliers
- Track inventory
- Monitor stock levels
- Identify low-stock medicines
- Track near-expiry medicines
- Identify expired medicines
- Search and filter medicines
- View inventory analytics
- Manage notifications
- Generate inventory reports

The system provides a dashboard-based interface for quickly understanding the current inventory status.

---

## 🎯 Objectives

The main objectives of MediStock are:
- To digitize medical inventory management
- To maintain medicine and supplier information
- To monitor stock availability
- To identify low-stock medicines
- To monitor medicine expiry dates
- To provide useful inventory analytics
- To reduce manual inventory management
- To provide a centralized and user-friendly interface
- To maintain a structured backend and database

---

# 🏗️ System Architecture

```text
                         ┌───────────────────────┐
                         │         USER          │
                         │                       │
                         │ Admin / Pharmacist    │
                         │       / Staff         │
                         └───────────┬───────────┘
                                     │
                                     ▼
                         ┌───────────────────────┐
                         │    REACT.JS FRONTEND  │
                         │                       │
                         │ • Dashboard           │
                         │ • Medicines           │
                         │ • Suppliers           │
                         │ • Inventory           │
                         │ • Notifications       │
                         │ • Reports             │
                         └───────────┬───────────┘
                                     │
                                REST APIs
                                     │
                                     ▼
                         ┌───────────────────────┐
                         │    SPRING BOOT        │
                         │       BACKEND         │
                         │                       │
                         │ • Controllers         │
                         │ • Services            │
                         │ • Repositories        │
                         │ • Security             │
                         └───────────┬───────────┘
                                     │
                                     ▼
                         ┌───────────────────────┐
                         │      POSTGRESQL       │
                         │       DATABASE        │
                         │                       │
                         │ • Users               │
                         │ • Medicines           │
                         │ • Suppliers           │
                         │ • Inventory           │
                         │ • Stock Logs          │
                         │ • Notifications       │
                         │ • Reports             │
                         └───────────────────────┘
🔄 Application Workflow
                    ┌───────────────┐
                    │     LOGIN     │
                    └───────┬───────┘
                            │
                            ▼
                    ┌───────────────┐
                    │  DASHBOARD    │
                    └───────┬───────┘
                            │
             ┌──────────────┼──────────────┐
             │              │              │
             ▼              ▼              ▼
       ┌──────────┐   ┌──────────┐   ┌──────────┐
       │Medicines │   │ Suppliers│   │Inventory │
       └────┬─────┘   └────┬─────┘   └────┬─────┘
            │              │              │
            └──────────────┼──────────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │ Stock Monitoring│
                  └────────┬────────┘
                           │
                ┌──────────┴──────────┐
                │                     │
                ▼                     ▼
         ┌──────────────┐      ┌──────────────┐
         │ Low Stock    │      │ Expiry Check │
         │ Detection    │      │              │
         └──────┬───────┘      └──────┬───────┘
                │                     │
                └──────────┬──────────┘
                           ▼
                   ┌───────────────┐
                   │ Notifications │
                   └───────┬───────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │ Analytics/Reports│
                  └─────────────────┘
✨ Main Features

🔐 1. Authentication & Security

The application provides authentication and controlled access to the system.

Features
User registration
User login
JWT-based authentication
Password encryption using BCrypt
Role-based access
Protected API endpoints

💊 2. Medicine Management
The Medicine module provides complete CRUD operations for medicines.

Features
Add medicine
View medicines
Update medicine
Delete medicine
Medicine category
Manufacturer details
Batch number
Manufacturing date
Expiry date
Supplier information
Price
Quantity
Medicine Workflow
       Add Medicine
            │
            ▼
      Medicine Details
            │
            ▼
      Store in Database
            │
            ▼
     Display in Medicine
          Dashboard
            │
       ┌────┴────┐
       ▼         ▼
     Update    Delete

🔎 3. Medicine Search & Filtering

The Medicines page supports multiple filtering options.

Available Filters
Medicine name
Manufacturer
Category
Supplier
Batch number
Expiry date
Stock status
Stock Status
                  Stock Quantity
                       │
          ┌────────────┼────────────┐
          │            │            │
          ▼            ▼            ▼
       > 20         1 - 20          0
          │            │            │
          ▼            ▼            ▼
      In Stock     Low Stock    Out of Stock

🏢 4. Supplier Management

The Supplier module maintains supplier information.

Features
Add supplier
View suppliers
Update supplier
Delete supplier
Maintain supplier information
Connect suppliers with medicines

📦 5. Inventory Management

The Inventory module is used to monitor medicine stock.

Features
Add inventory
View inventory
Update inventory
Delete inventory
Track quantities
Monitor stock availability
Inventory Flow
Medicine
   │
   ▼
Inventory Record
   │
   ▼
Quantity Monitoring
   │
   ├───────────────┐
   ▼               ▼
Normal Stock     Low Stock
                   │
                   ▼
                 Alert

⚠️ 6. Low Stock Monitoring

MediStock identifies medicines whose available quantity reaches the low-stock threshold.

             Check Quantity
                    │
                    ▼
             Quantity > 20 ?
               /         \
             YES          NO
              │            │
              ▼            ▼
          In Stock     Low Stock
                           │
                           ▼
                      Alert User

This helps users identify medicines that require restocking.

⏳ 7. Expiry Tracking

The system monitors medicine expiry dates.

Expiry Categories
                 Expiry Date
                     │
          ┌──────────┼──────────┐
          │          │          │
          ▼          ▼          ▼
       Normal    Near Expiry   Expired
          │          │          │
          │          ▼          ▼
          │        Alert       Alert
          │
          ▼
      Available
Features
Expiry date monitoring
Near-expiry identification
Expired medicine identification
Expiry alerts
Expiry information in dashboard

📊 8. Dashboard

The MediStock dashboard provides a centralized overview of the system.

Dashboard KPI Cards
Total Medicines
Suppliers
Notifications
Expired Medicines
Low Stock
Near Expiry
Dashboard Sections
                 DASHBOARD
                     │
       ┌─────────────┼─────────────┐
       │             │             │
       ▼             ▼             ▼
     KPI Cards     Inventory     Alerts
                    Chart
       │             │             │
       └─────────────┼─────────────┘
                     │
                     ▼
             Recent Notifications
                     │
                     ▼
               Quick Modules

🔔 9. Notifications

The notification section displays important inventory-related alerts.

Notification Types
Low-stock alerts
Expiry alerts
Inventory-related notifications
System updates

Users can view recent notifications directly from the dashboard and navigate to the Notifications page for more details.

📈 10. Analytics

The analytics functionality provides an overview of inventory information.

Example Metrics
Total medicines
Total suppliers
Total inventory
Low-stock medicines
Near-expiry medicines
Expired medicines

Example:

Total Medicines     → 16
Total Suppliers     → 1
Total Inventory     → 16
Low Stock           → 3
Near Expiry         → 1
Expired             → 1

The dashboard also provides a visual inventory overview using charts.

📄 11. Reports

The Reports module provides summarized inventory information.

Report Information
Report date
Total medicines
Total suppliers
Total inventory
Low-stock count
Near-expiry count
Expired count
Inventory summary

Reports help users understand the current state of the medical inventory.

🗃️ Database Structure

The application uses PostgreSQL for persistent data storage.

                    ┌─────────────┐
                    │    Users    │
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  Medicines  │
                    └──────┬──────┘
                           │
            ┌──────────────┼──────────────┐
            ▼              ▼              ▼
      ┌───────────┐  ┌───────────┐  ┌────────────┐
      │ Suppliers │  │ Inventory │  │ Stock Logs │
      └───────────┘  └───────────┘  └────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │Notifications│
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │   Reports   │
                    └─────────────┘

🛠️ Technology Stack
Layer	Technology
Frontend	React.js
Backend	Spring Boot
Programming Language	Java, JavaScript
Database	PostgreSQL
ORM	Spring Data JPA / Hibernate
Security	Spring Security, JWT
API Communication	Axios
Build Tool	Maven
API Testing	Postman
Database Management	pgAdmin
Version Control	Git & GitHub
IDE	VS Code / IntelliJ IDEA

📁 Project Structure
Medical_Inventory_Management_System/
│
├── backend/
│   │
│   ├── src/
│   │   └── main/
│   │       ├── java/
│   │       │   └── com/
│   │       │       └── medistock/
│   │       │
│   │       └── resources/
│   │
│   ├── pom.xml
│   └── ...
│
├── frontend/
│   │
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── css/
│   │   └── ...
│   │
│   ├── package.json
│   └── ...
│
├── .gitignore
├── LICENSE
└── README.md
🔌 API Modules

The backend is organized around REST APIs.

Medicine APIs
GET     /medicines
POST    /medicines
GET     /medicines/{id}
PUT     /medicines/{id}
DELETE  /medicines/{id}
Supplier APIs
GET     /suppliers
POST    /suppliers
GET     /suppliers/{id}
PUT     /suppliers/{id}
DELETE  /suppliers/{id}
Inventory APIs
GET     /inventory
POST    /inventory
GET     /inventory/{id}
PUT     /inventory/{id}
DELETE  /inventory/{id}
Monitoring APIs
/medicines/expired
/medicines/nearexpiry
/medicines/lowstock

🚀 Running the Project
Prerequisites

Install the following:

Java
Maven
Node.js
npm
PostgreSQL
pgAdmin
Git
1. Clone the Repository
git clone https://github.com/springboardmentor5555e-ctrl/Medical_Inventory_Management_System.git
cd Medical_Inventory_Management_System
2. Configure PostgreSQL

Create a PostgreSQL database for the application.

Update the backend database configuration in:

backend/src/main/resources/application.properties

Example:

spring.datasource.url=jdbc:postgresql://localhost:5432/medistock
spring.datasource.username=YOUR_USERNAME
spring.datasource.password=YOUR_PASSWORD

Use your own PostgreSQL username, password, and database name.

3. Run the Backend

Move to the backend directory:

cd backend

Run:

mvn spring-boot:run

The Spring Boot application will start on the configured port.

4. Run the Frontend

Open another terminal:

cd frontend

Install dependencies:

npm install

Start the React application:

npm start

The frontend will start using the configured React development server.

🧪 Testing

The application APIs can be tested using Postman.

Testing Flow
        React Frontend
              │
              ▼
          REST API
              │
              ▼
        Spring Boot
              │
              ▼
          PostgreSQL
              │
              ▼
        API Response
              │
              ▼
        React Frontend

Testing includes:

Authentication testing
Medicine CRUD testing
Supplier CRUD testing
Inventory CRUD testing
Low-stock testing
Expiry testing
Notification testing
Report/analytics testing
🔒 Security

Security is handled through the Spring Boot backend.

Security Features
Spring Security
JWT authentication
Password encryption using BCrypt
Protected endpoints
Role-based access

Sensitive configuration values such as database credentials and secret keys should not be committed to GitHub.

📅 Project Development Milestones

Milestone 1 – Requirements, Database & Backend Setup
Project requirements
Database design
Spring Boot setup
PostgreSQL configuration
Authentication
React project setup

Milestone 2 – Inventory & Supplier Management
Medicine management
Supplier management
Inventory management
Search and filtering
Stock monitoring
Dashboard development

Milestone 3 – Expiry Tracking & Notifications
Expiry tracking
Low-stock alerts
Notifications
Analytics
Reports

Milestone 4 – Testing & Final Integration
Dashboard improvements
Testing
Validation
Final integration
Deployment preparation

📌 Current Project Status
Implemented Modules
✅ User Authentication
✅ JWT Authentication
✅ Password Encryption
✅ Medicine Management
✅ Supplier Management
✅ Inventory Management
✅ Medicine Search
✅ Medicine Filtering
✅ Stock Status Monitoring
✅ Low Stock Detection
✅ Expiry Detection
✅ Near Expiry Detection
✅ Dashboard
✅ Inventory Analytics
✅ Notifications
✅ Reports

Project Structure

Frontend
   │
   ├── Dashboard
   ├── Medicines
   ├── Suppliers
   ├── Inventory
   ├── Notifications
   └── Reports

Backend
   │
   ├── Authentication
   ├── Medicines
   ├── Suppliers
   ├── Inventory
   ├── Stock Monitoring
   ├── Notifications
   ├── Analytics
   └── Reports

Database
   │
   └── PostgreSQL

🔮 Future Enhancements

Potential future improvements include:

Advanced inventory analytics
Enhanced supplier performance tracking
Improved report export options
Email and push notification enhancements
Advanced role and permission management
Cloud deployment
Docker-based deployment
Automated CI/CD pipeline
Improved performance monitoring

👩‍💻 Developer
Ch. Pushpitha Ram
Project: MediStock – Medical Inventory Management System

Repository:
https://github.com/springboardmentor5555e-ctrl/Medical_Inventory_Management_System

⭐ Conclusion

MediStock provides a centralized solution for managing medical inventory.

The system combines medicine management, supplier management, inventory tracking, stock monitoring, expiry tracking, notifications, analytics, and reporting into one full-stack application.

The project demonstrates the integration of:

React.js + Spring Boot + PostgreSQL + REST APIs + Spring Security + JWT

to build a practical medical inventory management platform.

🙏 Thank You
MediStock

Manage Medicines • Monitor Stock • Track Expiry • Stay Informed

Presented by

Ch. Pushpitha Ram

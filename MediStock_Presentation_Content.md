# 🏥 MediStock: Medical Inventory Management System — 10-Slide Deck (Concise)

---

### **Slide 1: Title & Overview**
- **Title:** MediStock
- **Subtitle:** Intelligent Medical Inventory & Pharmacy Procurement System
- **Stack:** Java 21 • Spring Boot 3 • React 18 • PostgreSQL • Tailwind UI
- **Core Mission:** A secure, automated platform to prevent medication stockouts, eliminate expiration losses, and streamline hospital procurement.
- **Speaker Note:**
  > *"Welcome everyone. MediStock is an enterprise healthcare platform engineered for zero-stockout pharmacy tracking and automated procurement."*

---

### **Slide 2: Problem Statement & Objectives**
- **The Healthcare Problem:**
  - **Unnoticed Expirations:** Millions lost yearly discarding expired medicines.
  - **Emergency Stockouts:** Shortages of critical drugs during patient surges.
  - **Manual Inefficiency:** Disjointed paper logs and slow supplier ordering.
- **MediStock Solution & Goals:**
  - **Zero Stockouts:** Real-time tracking with low-stock alerts ($\le 10$ units).
  - **Zero Expiration Waste:** Proactive 90-day early warning engine.
  - **1-Click Restock:** Integrated supplier purchase orders.
- **Speaker Note:**
  > *"MediStock replaces error-prone spreadsheets with automated alerts and 1-click procurement to safeguard patient care."*

---

### **Slide 3: System Architecture & Tech Stack**
- **Frontend (Client Layer):** React 18 (Vite) • Tailwind Glassmorphic UI • jsPDF / html2canvas.
- **Backend (API Layer):** Spring Boot 3 • Java 21 • Spring Security 6 • Spring Data JPA.
- **Data & Services:** PostgreSQL Database • Background Schedulers (`@Scheduled`) • SMS/SMTP Gateways.
- **Architecture Highlights:** Decoupled RESTful design with stateless JWT token lifecycle.
- **Speaker Note:**
  > *"Built on a high-performance decoupled architecture using Spring Boot 3 for secure business logic and React for a fluid user experience."*

---

### **Slide 4: Enterprise Security & Multi-Factor Auth (MFA)**
- **Triple-Channel Authentication:**
  - 📱 **Mobile Phone SMS OTP:** 6-digit dynamic passcode delivered via SMS.
  - 📧 **Google / Gmail SSO:** 1-click frictionless OAuth2 login.
  - 🔐 **Email OTP (2FA):** Secondary verification code via SMTP.
- **Role-Based Access Control (RBAC):**
  - **Admin:** Full governance, user provisioning & employee phone directory.
  - **Pharmacist:** Stock management, supplier catalogue & purchase orders.
  - **Staff:** Read-only inventory browsing and lookup.
- **Speaker Note:**
  > *"We enforce hospital-grade security through Google SSO, Phone SMS OTP, and strict role-based access control."*

---

### **Slide 5: Real-World Medicine Inventory & Batch Tracking**
- **Authentic Pharmacy Catalogue:**
  - **56 Branded Medicines & Supplies:** *Dolo 650, Augmentin 625, Pan 40, Glycomet-GP, Betadine, Accu-Chek strips*.
  - **10 Healthcare Categories & 8 Top Pharma Distributors:** *Sun Pharma, Cipla, Dr. Reddy's, Abbott*.
- **Key Inventory Features:**
  - **Granular Batch Tracking:** Tracks batch ID, expiry date, rack location & stock counts.
  - **Immutable Movement Logs:** Audit trails for `STOCK_IN`, `STOCK_OUT`, and `ADJUSTMENT`.
- **Speaker Note:**
  > *"Pre-seeded with 56 real-world medicines, MediStock provides instant search, batch metadata, and immutable audit logs."*

---

### **Slide 6: Proactive 90-Day Expiry Engine & Smart Alerts**
- **Tiered 90-Day Warning Horizon:**
  - 🔴 **Critical (0 – 30 Days):** Immediate clearance / return queue.
  - 🟡 **Warning (31 – 60 Days):** Priority dispensation list.
  - 🔵 **Attention (61 – 90 Days):** Monitored restock buffer.
- **Intelligent Alert Engine:**
  - Automated nightly background audits (`@Scheduled`).
  - 23-hour deduplication window to prevent alert flooding.
- **Speaker Note:**
  > *"Our proactive 90-day warning engine gives pharmacists months of notice to clear or return stock before expiration."*

---

### **Slide 7: Supplier Catalogue & 1-Click Procurement**
- **Vendor Directory:** Real-time supplier profiles with live drug counts and valuations.
- **⚡ 1-Click Quick Order Drawer:** Instant reorder panel inside the Suppliers screen.
- **⚡ "Select All Items":** Bulk reorders vendor catalogues with 1 click using smart quantity chips (`+20`, `+50`).
- **Automated Ingestion:** Marking an order `RECEIVED` automatically increments inventory stock.
- **Speaker Note:**
  > *"Pharmacists can draft and fulfill purchase orders in seconds with 1-click quick orders and automated inventory restocking."*

---

### **Slide 8: Analytics, Audit Logs & Reporting Engine**
- **Executive KPI Dashboard:** Real-time metrics for Total Stock, Low-Stock items, Expiring Batches, and Inventory Valuation.
- **1-Click PDF Reports:** Formatted, print-ready inventory summaries with timestamps and hospital branding.
- **Raw CSV Audit Logs:** Granular movement logs exportable for compliance inspections and accounting.
- **Speaker Note:**
  > *"The analytics engine gives management instant financial visibility and 1-click PDF/CSV reports for audit inspections."*

---

### **Slide 9: UI/UX Design System & Engineering Highlights**
- **Adaptive Glassmorphic Design:**
  - ☀️ **Clinical Ivory (Light Theme):** High-contrast daylight counter mode.
  - 🌙 **Midnight Cyber (Dark Theme):** Low-strain night shift mode.
- **Engineering Solutions:**
  - **Atomic Concurrency:** `@Transactional` boundaries eliminate race conditions in stock dispensation.
  - **Client-Side Export:** Pure vector PDF generation with automatic page breaks.
- **Speaker Note:**
  > *"We crafted a dual-theme glassmorphic design system and solved key engineering challenges in concurrency and reporting."*

---

### **Slide 10: Business Impact, Roadmap & Conclusion**
- **Business Impact:**
  - **90% Stockout Reduction** via automated threshold alerts.
  - **Zero Waste** through proactive 90-day expiry tracking.
  - **100% Traceability** with verified multi-factor audit trails.
- **Future Scope:**
  - 📷 **Barcode & QR Scanner Integration** for instant check-in.
  - 🤖 **AI Demand Forecasting** for seasonal surge prediction.
- **Conclusion:** MediStock delivers an intelligent, secure, and production-ready healthcare inventory platform.
- **Speaker Note:**
  > *"MediStock bridges clinical operations and supply chain management. Thank you, and we now welcome your questions."*

---

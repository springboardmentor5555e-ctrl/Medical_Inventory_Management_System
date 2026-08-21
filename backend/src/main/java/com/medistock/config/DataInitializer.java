package com.medistock.config;

import com.medistock.entity.Category;
import com.medistock.entity.Medicine;
import com.medistock.entity.Role;
import com.medistock.entity.Supplier;
import com.medistock.entity.User;
import com.medistock.repository.CategoryRepository;
import com.medistock.repository.MedicineRepository;
import com.medistock.repository.RoleRepository;
import com.medistock.repository.SupplierRepository;
import com.medistock.repository.UserRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

@Configuration
@RequiredArgsConstructor
public class DataInitializer {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final SupplierRepository supplierRepository;
    private final MedicineRepository medicineRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    CommandLineRunner seedMediStockData() {
        return args -> seedData();
    }

    @Transactional
    void seedData() {
        Role admin = role("ADMIN");
        Role pharmacist = role("PHARMACIST");
        Role staff = role("STAFF");

        removeFakeUsers();
        upsertUser("Admin User", "admin@medistock.com", "Admin@123", admin);
        upsertUser("Pharmacist User", "pharmacist@medistock.com", "Pharma@123", pharmacist);
        upsertUser("Staff User", "staff@medistock.com", "Staff@123", staff);

        List<String> categories = List.of("Antibiotic", "Diabetes", "Analgesic", "Antihistamine", "Cardiology", "Dermatology", "Gastro", "Nutrition", "Emergency");
        categories.forEach(this::category);

        List<SupplierSeed> suppliers = List.of(
                new SupplierSeed("Apollo Health Supplies", "Apollo Medical Distribution Pvt Ltd", "Ravi Kumar", "040-4856-1101", "orders@apollohealthsupplies.com", "12-5-81, Banjara Hills, Hyderabad", "Hyderabad", "Telangana", "36AAPCA4581L1Z5"),
                new SupplierSeed("Cipla Distributors", "Cipla Distribution Services", "Neha Sharma", "022-4078-2210", "supply@cipladistributors.com", "18 MIDC Road, Andheri East, Mumbai", "Mumbai", "Maharashtra", "27CIPLA4582M1Z6"),
                new SupplierSeed("Sun Pharma Distribution", "Sun Pharma Logistics", "Arun Mehta", "079-4012-3320", "dispatch@sunpharmadist.com", "Sarkhej Gandhinagar Highway, Ahmedabad", "Ahmedabad", "Gujarat", "24SUNPD4583N1Z7"),
                new SupplierSeed("Dr. Reddy's Medical Supply", "Dr. Reddy's Supply Chain", "Priya Reddy", "040-4900-4430", "orders@drreddysmedsupply.com", "8-2-337, Jubilee Hills, Hyderabad", "Hyderabad", "Telangana", "36DRRMS4584P1Z8"),
                new SupplierSeed("Mankind Pharma Supply", "Mankind Wholesale Pharma", "Sanjay Verma", "011-4621-5540", "care@mankindpharmasupply.com", "Okhla Industrial Estate, New Delhi", "New Delhi", "Delhi", "07MANPS4585Q1Z9"),
                new SupplierSeed("MedPlus Wholesale", "MedPlus Healthcare Wholesale", "Kiran Rao", "040-6712-6650", "wholesale@medplusindia.com", "Madhapur Main Road, Hyderabad", "Hyderabad", "Telangana", "36MEDPW4586R1Z1"),
                new SupplierSeed("Abbott Healthcare Supply", "Abbott India Healthcare Supply", "Anjali Nair", "080-4308-7760", "supply@abbotthealthcare.in", "Whitefield Road, Bengaluru", "Bengaluru", "Karnataka", "29ABBHS4587S1Z2"),
                new SupplierSeed("Alkem Distribution", "Alkem Pharma Distribution", "Manoj Singh", "033-4081-8870", "sales@alkemdistribution.com", "Salt Lake Sector V, Kolkata", "Kolkata", "West Bengal", "19ALKED4588T1Z3"),
                new SupplierSeed("Torrent Pharma Supply", "Torrent Pharma Supply Network", "Bhavesh Patel", "079-4099-9980", "orders@torrentpharmasupply.com", "Ashram Road, Ahmedabad", "Ahmedabad", "Gujarat", "24TORPS4589U1Z4"),
                new SupplierSeed("Glenmark Distributors", "Glenmark Distribution Services", "Farhan Khan", "022-4188-1090", "dispatch@glenmarkdistributors.com", "Lower Parel, Mumbai", "Mumbai", "Maharashtra", "27GLEND4590V1Z5")
        );
        suppliers.forEach(this::upsertSupplier);

        List<MedicineSeed> medicines = List.of(
                med("Dolo 650", "Paracetamol", "Micro Labs", "Analgesic", "orders@apollohealthsupplies.com", "DOL-650-2401", "890100100001", "2025-01-10", "2027-01-10", "1.20", "2.00", 540, 25, "Rack A1", "Fever and mild pain relief"),
                med("Paracetamol 500mg", "Paracetamol", "Generic Care", "Analgesic", "wholesale@medplusindia.com", "PCM-500-2402", "890100100002", "2025-02-12", "2027-02-12", "0.80", "1.50", 420, 30, "Rack A2", "General antipyretic tablet"),
                med("Crocin Advance", "Paracetamol", "GSK", "Analgesic", "supply@abbotthealthcare.in", "CRO-ADV-2403", "890100100003", "2025-03-08", "2027-03-08", "1.50", "2.80", 260, 20, "Rack A3", "Fast-release fever relief"),
                med("Augmentin 625", "Amoxicillin Clavulanate", "GSK", "Antibiotic", "supply@cipladistributors.com", "AUG-625-2404", "890100100004", "2025-02-20", "2026-08-20", "12.50", "18.00", 130, 15, "Rack B1", "Broad spectrum antibiotic"),
                med("Azithromycin 500", "Azithromycin", "Cipla", "Antibiotic", "supply@cipladistributors.com", "AZI-500-2405", "890100100005", "2025-04-01", "2026-10-01", "8.20", "13.50", 96, 15, "Rack B2", "Macrolide antibiotic"),
                med("Amoxicillin 500", "Amoxicillin", "Alkem", "Antibiotic", "sales@alkemdistribution.com", "AMX-500-2406", "890100100006", "2025-01-25", "2026-07-25", "4.80", "8.00", 22, 20, "Rack B3", "Penicillin antibiotic"),
                med("Pantoprazole 40", "Pantoprazole", "Sun Pharma", "Gastro", "dispatch@sunpharmadist.com", "PAN-040-2407", "890100100007", "2025-03-15", "2027-03-15", "2.20", "4.50", 310, 25, "Rack C1", "Acid reflux management"),
                med("Omeprazole 20", "Omeprazole", "Dr. Reddy's", "Gastro", "orders@drreddysmedsupply.com", "OME-020-2408", "890100100008", "2025-02-02", "2027-02-02", "1.90", "3.80", 280, 25, "Rack C2", "Proton pump inhibitor"),
                med("Cetirizine 10", "Cetirizine", "Mankind", "Antihistamine", "care@mankindpharmasupply.com", "CET-010-2409", "890100100009", "2025-04-18", "2027-04-18", "0.90", "1.80", 340, 30, "Rack D1", "Allergy relief"),
                med("Levocetirizine", "Levocetirizine", "Glenmark", "Antihistamine", "dispatch@glenmarkdistributors.com", "LEV-005-2410", "890100100010", "2025-04-22", "2027-04-22", "1.10", "2.20", 205, 20, "Rack D2", "Anti-allergic tablet"),
                med("Metformin 500", "Metformin", "Torrent", "Diabetes", "orders@torrentpharmasupply.com", "MET-500-2411", "890100100011", "2025-01-18", "2027-01-18", "1.00", "2.10", 480, 35, "Rack E1", "Type 2 diabetes management"),
                med("Telma 40", "Telmisartan", "Glenmark", "Cardiology", "dispatch@glenmarkdistributors.com", "TEL-040-2412", "890100100012", "2025-05-10", "2027-05-10", "5.60", "9.50", 160, 18, "Rack F1", "Hypertension therapy"),
                med("Amlodipine 5", "Amlodipine", "Torrent", "Cardiology", "orders@torrentpharmasupply.com", "AML-005-2413", "890100100013", "2025-05-14", "2027-05-14", "1.30", "2.70", 190, 20, "Rack F2", "Calcium channel blocker"),
                med("Ecosprin 75", "Aspirin", "USV", "Cardiology", "orders@apollohealthsupplies.com", "ECO-075-2414", "890100100014", "2025-02-28", "2027-02-28", "0.70", "1.50", 260, 25, "Rack F3", "Antiplatelet tablet"),
                med("Insulin Glargine", "Insulin Glargine", "Abbott", "Diabetes", "supply@abbotthealthcare.in", "INS-GLA-2415", "890100100015", "2025-06-01", "2026-06-01", "320.00", "415.00", 18, 10, "Cold Storage 1", "Long acting insulin"),
                med("ORS Powder", "Oral Rehydration Salts", "FDC", "Emergency", "wholesale@medplusindia.com", "ORS-021-2416", "890100100016", "2025-03-30", "2027-03-30", "8.00", "12.00", 150, 20, "Rack G1", "Rehydration sachet"),
                med("Zincovit", "Multivitamin Zinc", "Apex", "Nutrition", "care@mankindpharmasupply.com", "ZIN-MV-2417", "890100100017", "2025-04-05", "2027-04-05", "4.50", "7.50", 240, 20, "Rack H1", "Daily multivitamin"),
                med("Becosules", "Vitamin B Complex", "Pfizer", "Nutrition", "sales@alkemdistribution.com", "BEC-BX-2418", "890100100018", "2025-04-12", "2027-04-12", "2.50", "5.00", 210, 20, "Rack H2", "B complex capsule"),
                med("Shelcal 500", "Calcium Vitamin D3", "Torrent", "Nutrition", "orders@torrentpharmasupply.com", "SHE-500-2419", "890100100019", "2025-05-02", "2027-05-02", "3.50", "6.80", 175, 18, "Rack H3", "Calcium supplement"),
                med("Volini Spray", "Diclofenac Topical", "Sun Pharma", "Dermatology", "dispatch@sunpharmadist.com", "VOL-SPR-2420", "890100100020", "2025-01-05", "2026-01-05", "95.00", "140.00", 8, 12, "Rack I1", "Pain relief spray")
        );
        medicines.forEach(this::seedMedicine);
    }

    private Role role(String name) {
        return roleRepository.findByName(name)
                .orElseGet(() -> roleRepository.save(Role.builder().name(name).build()));
    }

    private Category category(String name) {
        return categoryRepository.findByNameIgnoreCase(name)
                .orElseGet(() -> categoryRepository.save(Category.builder().name(name).build()));
    }

    private void removeFakeUsers() {
        userRepository.findAll().stream()
                .filter(user -> {
                    String email = user.getEmail().toLowerCase();
                    return email.contains("codex")
                            || email.startsWith("test@")
                            || email.contains("dummy")
                            || email.contains("example")
                            || email.contains("sample")
                            || email.contains("demo");
                })
                .forEach(userRepository::delete);
    }

    private void upsertUser(String name, String email, String password, Role role) {
        User user = userRepository.findByEmail(email).orElseGet(User::new);
        user.setName(name);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(role);
        userRepository.save(user);
    }

    private void upsertSupplier(SupplierSeed seed) {
        Supplier supplier = supplierRepository.findByEmailIgnoreCase(seed.email()).orElseGet(Supplier::new);
        supplier.setSupplierName(seed.supplierName());
        supplier.setCompanyName(seed.companyName());
        supplier.setContactPerson(seed.contactPerson());
        supplier.setPhone(seed.phone());
        supplier.setEmail(seed.email().toLowerCase());
        supplier.setAddress(seed.address());
        supplier.setCity(seed.city());
        supplier.setState(seed.state());
        supplier.setCountry("India");
        supplier.setGstNumber(seed.gstNumber());
        supplierRepository.save(supplier);
    }

    private void seedMedicine(MedicineSeed seed) {
        if (medicineRepository.existsByBatchNumberIgnoreCase(seed.batchNumber())
                || medicineRepository.existsByBarcodeIgnoreCase(seed.barcode())) {
            return;
        }
        Supplier supplier = supplierRepository.findByEmailIgnoreCase(seed.supplierEmail())
                .orElseThrow(() -> new IllegalStateException("Seed supplier missing: " + seed.supplierEmail()));
        Medicine medicine = Medicine.builder()
                .medicineName(seed.name())
                .genericName(seed.genericName())
                .brand(seed.brand())
                .category(category(seed.category()))
                .supplier(supplier)
                .batchNumber(seed.batchNumber())
                .barcode(seed.barcode())
                .manufacturingDate(LocalDate.parse(seed.manufacturingDate()))
                .expiryDate(LocalDate.parse(seed.expiryDate()))
                .purchasePrice(new BigDecimal(seed.purchasePrice()))
                .sellingPrice(new BigDecimal(seed.sellingPrice()))
                .quantity(seed.quantity())
                .reservedQuantity(0)
                .damagedQuantity(0)
                .minimumStock(seed.minimumStock())
                .storageLocation(seed.storageLocation())
                .description(seed.description())
                .build();
        medicineRepository.save(medicine);
    }

    private MedicineSeed med(
            String name,
            String genericName,
            String brand,
            String category,
            String supplierEmail,
            String batchNumber,
            String barcode,
            String manufacturingDate,
            String expiryDate,
            String purchasePrice,
            String sellingPrice,
            int quantity,
            int minimumStock,
            String storageLocation,
            String description
    ) {
        return new MedicineSeed(name, genericName, brand, category, supplierEmail, batchNumber, barcode, manufacturingDate, expiryDate, purchasePrice, sellingPrice, quantity, minimumStock, storageLocation, description);
    }

    private record SupplierSeed(String supplierName, String companyName, String contactPerson, String phone, String email, String address, String city, String state, String gstNumber) {
    }

    private record MedicineSeed(String name, String genericName, String brand, String category, String supplierEmail, String batchNumber, String barcode, String manufacturingDate, String expiryDate, String purchasePrice, String sellingPrice, int quantity, int minimumStock, String storageLocation, String description) {
    }
}

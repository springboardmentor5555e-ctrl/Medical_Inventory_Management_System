package com.medistock.config;

import com.medistock.entity.Category;
import com.medistock.entity.Medicine;
import com.medistock.entity.StockLog;
import com.medistock.entity.Supplier;
import com.medistock.repository.CategoryRepository;
import com.medistock.repository.MedicineRepository;
import com.medistock.repository.StockLogRepository;
import com.medistock.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

/**
 * Seeds a handful of sample medicines (total inventory value: ₹5,000) so the
 * dashboard, search/filter, and stock-history views have something to show
 * immediately after a fresh setup.
 *
 * Only runs when the medicines table is empty, so it never duplicates data
 * on subsequent restarts (the dev database persists to disk — see
 * application-dev.properties).
 */
@Component
@RequiredArgsConstructor
public class MedicineDataSeeder implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final SupplierRepository supplierRepository;
    private final MedicineRepository medicineRepository;
    private final StockLogRepository stockLogRepository;

    @Override
    public void run(String... args) {
        if (medicineRepository.count() > 0) {
            return;
        }

        Category painRelief = categoryRepository.save(Category.builder().name("Pain Relief").build());
        Category antibiotics = categoryRepository.save(Category.builder().name("Antibiotics").build());
        Category allergyRelief = categoryRepository.save(Category.builder().name("Allergy Relief").build());
        Category rehydration = categoryRepository.save(Category.builder().name("Rehydration").build());
        Category diabetesCare = categoryRepository.save(Category.builder().name("Diabetes Care").build());

        Supplier apex = supplierRepository.save(Supplier.builder()
                .name("Apex Pharma Distributors")
                .contactNumber("+91 98765 43210")
                .email("orders@apexpharma.example")
                .address("Plot 14, Industrial Estate, Hyderabad")
                .build());

        Supplier medsource = supplierRepository.save(Supplier.builder()
                .name("MedSource Healthcare Supplies")
                .contactNumber("+91 91234 56789")
                .email("sales@medsource.example")
                .address("22 MG Road, Bengaluru")
                .build());

        LocalDate today = LocalDate.now();

        // Quantities x prices are chosen so the total inventory value is exactly ₹5,000.
        seedMedicine("Paracetamol 500mg Tablets", "PCM-2026-001", painRelief, apex,
                100, today.minusMonths(4), today.plusYears(1), 10.00, 20);

        seedMedicine("Amoxicillin 250mg Capsules", "AMX-2026-014", antibiotics, medsource,
                50, today.minusMonths(2), today.plusMonths(18), 20.00, 15);

        seedMedicine("ORS Rehydration Sachets", "ORS-2026-030", rehydration, apex,
                200, today.minusMonths(1), today.plusYears(2), 5.00, 40);

        seedMedicine("Cetirizine 10mg Tablets", "CTZ-2026-007", allergyRelief, medsource,
                40, today.minusMonths(3), today.plusMonths(10), 25.00, 10);

        seedMedicine("Insulin Glargine Vial", "INS-2026-002", diabetesCare, apex,
                20, today.minusMonths(1), today.plusMonths(6), 50.00, 8);

        System.out.println(">>> Seeded 5 sample medicines (total inventory value: Rs. 5,000.00)");
    }

    private void seedMedicine(String name, String batchNumber, Category category, Supplier supplier,
                               int quantity, LocalDate manufacturingDate, LocalDate expiryDate,
                               double price, int lowStockThreshold) {
        Medicine medicine = Medicine.builder()
                .name(name)
                .batchNumber(batchNumber)
                .category(category)
                .supplier(supplier)
                .quantity(quantity)
                .manufacturingDate(manufacturingDate)
                .expiryDate(expiryDate)
                .price(price)
                .lowStockThreshold(lowStockThreshold)
                .build();

        Medicine saved = medicineRepository.save(medicine);

        stockLogRepository.save(StockLog.builder()
                .medicine(saved)
                .action(StockLog.StockAction.INITIAL)
                .quantityChanged(quantity)
                .resultingQuantity(quantity)
                .note("Initial stock — seeded sample data")
                .build());
    }
}

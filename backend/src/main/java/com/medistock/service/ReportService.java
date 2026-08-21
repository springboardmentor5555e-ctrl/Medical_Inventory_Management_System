package com.medistock.service;

import com.lowagie.text.Document;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.medistock.entity.Medicine;
import com.medistock.repository.MedicineRepository;
import com.medistock.repository.SupplierRepository;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final MedicineRepository medicineRepository;
    private final SupplierRepository supplierRepository;
    private final InventoryMapper mapper;

    @Transactional(readOnly = true)
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACIST')")
    public byte[] inventoryPdf() {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document();
        PdfWriter.getInstance(document, out);
        document.open();
        document.add(new Paragraph("MediStock Inventory Report", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18)));
        document.add(new Paragraph("Generated inventory snapshot."));

        PdfPTable table = new PdfPTable(6);
        table.setWidthPercentage(100);
        for (String header : new String[]{"Medicine", "Batch", "Supplier", "Qty", "Available", "Status"}) {
            table.addCell(header);
        }
        for (Medicine medicine : medicineRepository.findAll()) {
            table.addCell(medicine.getMedicineName());
            table.addCell(medicine.getBatchNumber());
            table.addCell(medicine.getSupplier().getSupplierName());
            table.addCell(String.valueOf(medicine.getQuantity()));
            table.addCell(String.valueOf(mapper.availableQuantity(medicine)));
            table.addCell(mapper.resolveStatus(medicine));
        }
        document.add(table);
        document.close();
        return out.toByteArray();
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACIST')")
    public byte[] inventoryExcel() throws IOException {
        try (XSSFWorkbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Inventory");
            Row header = sheet.createRow(0);
            String[] columns = {"Medicine", "Generic", "Category", "Supplier", "Batch", "Quantity", "Available", "Reserved", "Damaged", "Expiry", "Status"};
            for (int i = 0; i < columns.length; i++) {
                header.createCell(i).setCellValue(columns[i]);
            }
            int rowIndex = 1;
            for (Medicine medicine : medicineRepository.findAll()) {
                Row row = sheet.createRow(rowIndex++);
                row.createCell(0).setCellValue(medicine.getMedicineName());
                row.createCell(1).setCellValue(medicine.getGenericName());
                row.createCell(2).setCellValue(medicine.getCategory().getName());
                row.createCell(3).setCellValue(medicine.getSupplier().getSupplierName());
                row.createCell(4).setCellValue(medicine.getBatchNumber());
                row.createCell(5).setCellValue(medicine.getQuantity());
                row.createCell(6).setCellValue(mapper.availableQuantity(medicine));
                row.createCell(7).setCellValue(medicine.getReservedQuantity());
                row.createCell(8).setCellValue(medicine.getDamagedQuantity());
                row.createCell(9).setCellValue(String.valueOf(medicine.getExpiryDate()));
                row.createCell(10).setCellValue(mapper.resolveStatus(medicine));
            }
            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }
            workbook.write(out);
            return out.toByteArray();
        }
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACIST')")
    public String supplierCsv() {
        StringBuilder csv = new StringBuilder("supplierName,companyName,email,phone,city,state,country,activeMedicines\n");
        supplierRepository.findAll().forEach(supplier -> csv
                .append(supplier.getSupplierName()).append(',')
                .append(supplier.getCompanyName()).append(',')
                .append(supplier.getEmail()).append(',')
                .append(supplier.getPhone()).append(',')
                .append(supplier.getCity()).append(',')
                .append(supplier.getState()).append(',')
                .append(supplier.getCountry()).append(',')
                .append(medicineRepository.countBySupplierId(supplier.getId()))
                .append('\n'));
        return csv.toString();
    }
}

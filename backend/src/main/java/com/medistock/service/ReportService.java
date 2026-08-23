package com.medistock.service;

import com.medistock.entity.Medicine;
import com.medistock.repository.MedicineRepository;
import lombok.RequiredArgsConstructor;
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final MedicineRepository medicineRepository;

    // ============================================================
    // INVENTORY REPORT - PDF
    // ============================================================

    public byte[] generateInventoryPdf() {

        List<Medicine> medicines = medicineRepository.findAll();

        ByteArrayOutputStream outputStream =
                new ByteArrayOutputStream();

        Document document = new Document(PageSize.A4.rotate());

        try {

            PdfWriter.getInstance(document, outputStream);

            document.open();

            Font titleFont =
                    FontFactory.getFont(
                            FontFactory.HELVETICA_BOLD,
                            20
                    );

            Font normalFont =
                    FontFactory.getFont(
                            FontFactory.HELVETICA,
                            10
                    );

            Paragraph title =
                    new Paragraph(
                            "MediStock - Inventory Report",
                            titleFont
                    );

            title.setAlignment(Element.ALIGN_CENTER);

            document.add(title);

            document.add(
                    new Paragraph(
                            "Generated on: "
                                    + LocalDate.now(),
                            normalFont
                    )
            );

            document.add(
                    new Paragraph(" ")
            );

            PdfPTable table =
                    new PdfPTable(8);

            table.setWidthPercentage(100);

            String[] headers = {
                    "Medicine",
                    "Batch",
                    "Category",
                    "Supplier",
                    "Quantity",
                    "Price (₹)",
                    "Expiry Date",
                    "Stock Status"
            };

            for (String header : headers) {

                table.addCell(
                        new Phrase(header)
                );
            }

            for (Medicine medicine : medicines) {

                table.addCell(
                        safe(medicine.getName())
                );

                table.addCell(
                        safe(medicine.getBatchNumber())
                );

                table.addCell(
                        medicine.getCategory() != null
                                ? safe(medicine.getCategory().getName())
                                : "-"
                );

                table.addCell(
                        medicine.getSupplier() != null
                                ? safe(medicine.getSupplier().getName())
                                : "-"
                );

                table.addCell(
                        String.valueOf(
                                medicine.getQuantity()
                        )
                );

                table.addCell(
                        "₹"
                                + String.format(
                                "%.2f",
                                medicine.getPrice()
                        )
                );

                table.addCell(
                        medicine.getExpiryDate() != null
                                ? medicine.getExpiryDate().toString()
                                : "-"
                );

                table.addCell(
                        getStockStatus(medicine)
                );
            }

            document.add(table);

            document.add(
                    new Paragraph(
                            "Total Medicines: "
                                    + medicines.size()
                    )
            );

            document.close();

        } catch (Exception e) {

            throw new RuntimeException(
                    "Failed to generate inventory PDF",
                    e
            );
        }

        return outputStream.toByteArray();
    }


    // ============================================================
    // LOW STOCK REPORT - PDF
    // ============================================================

    public byte[] generateLowStockPdf() {

        List<Medicine> medicines =
                medicineRepository.findByQuantityLessThanEqual(20);

        return generateMedicineReportPdf(
                medicines,
                "MediStock - Low Stock Report"
        );
    }


    // ============================================================
    // EXPIRED REPORT - PDF
    // ============================================================

    public byte[] generateExpiredPdf() {

        List<Medicine> medicines =
                medicineRepository.findByExpiryDateBefore(
                        LocalDate.now()
                );

        return generateMedicineReportPdf(
                medicines,
                "MediStock - Expired Medicines Report"
        );
    }


    // ============================================================
    // EXPIRING SOON REPORT - PDF
    // ============================================================

    public byte[] generateExpiringSoonPdf() {

        LocalDate today =
                LocalDate.now();

        LocalDate warningDate =
                today.plusDays(30);

        List<Medicine> medicines =
                medicineRepository.findByExpiryDateBetween(
                        today,
                        warningDate
                );

        return generateMedicineReportPdf(
                medicines,
                "MediStock - Expiring Soon Report"
        );
    }


    // ============================================================
    // COMMON MEDICINE PDF
    // ============================================================

    private byte[] generateMedicineReportPdf(
            List<Medicine> medicines,
            String reportTitle
    ) {

        ByteArrayOutputStream outputStream =
                new ByteArrayOutputStream();

        Document document =
                new Document(PageSize.A4.rotate());

        try {

            PdfWriter.getInstance(
                    document,
                    outputStream
            );

            document.open();

            Font titleFont =
                    FontFactory.getFont(
                            FontFactory.HELVETICA_BOLD,
                            20
                    );

            Paragraph title =
                    new Paragraph(
                            reportTitle,
                            titleFont
                    );

            title.setAlignment(
                    Element.ALIGN_CENTER
            );

            document.add(title);

            document.add(
                    new Paragraph(
                            "Generated on: "
                                    + LocalDate.now()
                    )
            );

            document.add(
                    new Paragraph(" ")
            );

            PdfPTable table =
                    new PdfPTable(6);

            table.setWidthPercentage(100);

            String[] headers = {
                    "Medicine",
                    "Batch",
                    "Supplier",
                    "Quantity",
                    "Price (₹)",
                    "Expiry Date"
            };

            for (String header : headers) {

                table.addCell(
                        new Phrase(header)
                );
            }

            for (Medicine medicine : medicines) {

                table.addCell(
                        safe(medicine.getName())
                );

                table.addCell(
                        safe(medicine.getBatchNumber())
                );

                table.addCell(
                        medicine.getSupplier() != null
                                ? safe(
                                medicine
                                        .getSupplier()
                                        .getName()
                        )
                                : "-"
                );

                table.addCell(
                        String.valueOf(
                                medicine.getQuantity()
                        )
                );

                table.addCell(
                        "₹"
                                + String.format(
                                "%.2f",
                                medicine.getPrice()
                        )
                );

                table.addCell(
                        medicine.getExpiryDate() != null
                                ? medicine
                                .getExpiryDate()
                                .toString()
                                : "-"
                );
            }

            document.add(table);

            document.add(
                    new Paragraph(
                            "Total Records: "
                                    + medicines.size()
                    )
            );

            document.close();

        } catch (Exception e) {

            throw new RuntimeException(
                    "Failed to generate PDF report",
                    e
            );
        }

        return outputStream.toByteArray();
    }


    // ============================================================
    // INVENTORY REPORT - EXCEL
    // ============================================================

    public byte[] generateInventoryExcel() {

        List<Medicine> medicines =
                medicineRepository.findAll();

        try (
                Workbook workbook =
                        new XSSFWorkbook();

                ByteArrayOutputStream outputStream =
                        new ByteArrayOutputStream()
        ) {

            Sheet sheet =
                    workbook.createSheet(
                            "Inventory Report"
                    );

            Row header =
                    sheet.createRow(0);

            String[] headers = {
                    "Medicine",
                    "Batch Number",
                    "Category",
                    "Supplier",
                    "Quantity",
                    "Price (₹)",
                    "Expiry Date",
                    "Stock Status"
            };

            for (int i = 0;
                 i < headers.length;
                 i++) {

                Cell cell =
                        header.createCell(i);

                cell.setCellValue(
                        headers[i]
                );
            }

            int rowNumber = 1;

            for (Medicine medicine : medicines) {

                Row row =
                        sheet.createRow(
                                rowNumber++
                        );

                row.createCell(0)
                        .setCellValue(
                                safe(medicine.getName())
                        );

                row.createCell(1)
                        .setCellValue(
                                safe(
                                        medicine
                                                .getBatchNumber()
                                )
                        );

                row.createCell(2)
                        .setCellValue(
                                medicine.getCategory() != null
                                        ? safe(
                                        medicine
                                                .getCategory()
                                                .getName()
                                )
                                        : "-"
                        );

                row.createCell(3)
                        .setCellValue(
                                medicine.getSupplier() != null
                                        ? safe(
                                        medicine
                                                .getSupplier()
                                                .getName()
                                )
                                        : "-"
                        );

                row.createCell(4)
                        .setCellValue(
                                medicine.getQuantity()
                        );

                row.createCell(5)
                        .setCellValue(
                                medicine.getPrice()
                        );

                row.createCell(6)
                        .setCellValue(
                                medicine.getExpiryDate() != null
                                        ? medicine
                                        .getExpiryDate()
                                        .toString()
                                        : "-"
                        );

                row.createCell(7)
                        .setCellValue(
                                getStockStatus(medicine)
                        );
            }

            for (int i = 0;
                 i < headers.length;
                 i++) {

                sheet.autoSizeColumn(i);
            }

            workbook.write(
                    outputStream
            );

            return outputStream.toByteArray();

        } catch (Exception e) {

            throw new RuntimeException(
                    "Failed to generate Excel report",
                    e
            );
        }
    }


    // ============================================================
    // HELPERS
    // ============================================================

    private String getStockStatus(
            Medicine medicine
    ) {

        if (medicine.isOutOfStock()) {
            return "OUT OF STOCK";
        }

        if (medicine.isLowStock()) {
            return "LOW STOCK";
        }

        return "IN STOCK";
    }


    private String safe(String value) {

        return value == null
                ? "-"
                : value;
    }
}
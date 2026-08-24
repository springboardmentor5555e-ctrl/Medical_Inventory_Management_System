package com.medistock.demo.service;

import com.itextpdf.text.Document;
import com.itextpdf.text.Font;
import com.itextpdf.text.FontFactory;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.pdf.PdfWriter;

import com.medistock.demo.entity.Sale;
import com.medistock.demo.repository.SaleRepository;

import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.List;

@Service
public class SalePdfService {

    private final SaleRepository saleRepository;
    private final NotificationService notificationService;

    public SalePdfService(
            SaleRepository saleRepository,
            NotificationService notificationService
    ) {
        this.saleRepository = saleRepository;
        this.notificationService = notificationService;
    }

    // =========================================================
    // GENERATE SALES PDF FOR LOGGED-IN USER
    // =========================================================

    public byte[] generateSalesPdf(Long userId) {

        try {

            List<Sale> sales =
                    saleRepository.findBySoldById(userId);

            ByteArrayOutputStream outputStream =
                    new ByteArrayOutputStream();

            Document document = new Document();

            PdfWriter.getInstance(
                    document,
                    outputStream
            );

            document.open();

            // =================================================
            // TITLE
            // =================================================

            Font titleFont =
                    FontFactory.getFont(
                            FontFactory.HELVETICA_BOLD,
                            20
                    );

            document.add(
                    new Paragraph(
                            "MediStock Sales History",
                            titleFont
                    )
            );

            document.add(new Paragraph(" "));

            // =================================================
            // USER INFORMATION
            // =================================================

            document.add(
                    new Paragraph(
                            "Pharmacist/User ID : " + userId
                    )
            );

            document.add(new Paragraph(" "));

            // =================================================
            // SALES DATA
            // =================================================

            if (sales == null || sales.isEmpty()) {

                document.add(
                        new Paragraph(
                                "No sales records available."
                        )
                );

            } else {

                for (Sale sale : sales) {

                    String medicineName = "N/A";
                    String batchNumber = "N/A";
                    String soldBy = "N/A";

                    if (sale.getMedicine() != null) {

                        medicineName =
                                sale.getMedicine().getName();

                        batchNumber =
                                sale.getMedicine().getBatchNumber();
                    }

                    if (sale.getSoldBy() != null) {

                        soldBy =
                                sale.getSoldBy().getEmail();
                    }

                    document.add(
                            new Paragraph(
                                    "Medicine : "
                                            + medicineName

                                            + "\nBatch : "
                                            + batchNumber

                                            + "\nQuantity : "
                                            + sale.getQuantity()

                                            + "\nTotal Amount : Rs. "
                                            + sale.getTotalAmount()

                                            + "\nSold By : "
                                            + soldBy

                                            + "\nSale Date : "
                                            + sale.getSaleDate()

                                            + "\n\n----------------------------\n"
                            )
                    );
                }
            }

            document.close();

            byte[] pdf =
                    outputStream.toByteArray();

            // =================================================
            // NOTIFICATION
            // =================================================

            try {

                notificationService.salesHistoryDownloaded();

            } catch (Exception notificationError) {

                notificationError.printStackTrace();

            }

            return pdf;

        } catch (Exception e) {

            e.printStackTrace();

            throw new RuntimeException(
                    "Sales PDF generation failed: "
                            + e.getMessage(),
                    e
            );
        }
    }

    // =========================================================
    // GENERATE PDF FOR ALL SALES
    // =========================================================

    public byte[] generateAllSalesPdf() {

        try {

            List<Sale> sales =
                    saleRepository.findAll();

            ByteArrayOutputStream outputStream =
                    new ByteArrayOutputStream();

            Document document =
                    new Document();

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

            document.add(
                    new Paragraph(
                            "MediStock - All Sales History",
                            titleFont
                    )
            );

            document.add(new Paragraph(" "));

            if (sales == null || sales.isEmpty()) {

                document.add(
                        new Paragraph(
                                "No sales records available."
                        )
                );

            } else {

                for (Sale sale : sales) {

                    String medicineName = "N/A";
                    String batchNumber = "N/A";
                    String soldBy = "N/A";

                    if (sale.getMedicine() != null) {

                        medicineName =
                                sale.getMedicine().getName();

                        batchNumber =
                                sale.getMedicine().getBatchNumber();
                    }

                    if (sale.getSoldBy() != null) {

                        soldBy =
                                sale.getSoldBy().getEmail();
                    }

                    document.add(
                            new Paragraph(

                                    "Medicine : "
                                            + medicineName

                                            + "\nBatch : "
                                            + batchNumber

                                            + "\nQuantity : "
                                            + sale.getQuantity()

                                            + "\nTotal Amount : Rs. "
                                            + sale.getTotalAmount()

                                            + "\nSold By : "
                                            + soldBy

                                            + "\nSale Date : "
                                            + sale.getSaleDate()

                                            + "\n\n----------------------------\n"
                            )
                    );
                }
            }

            document.close();

            return outputStream.toByteArray();

        } catch (Exception e) {

            e.printStackTrace();

            throw new RuntimeException(
                    "All sales PDF generation failed",
                    e
            );
        }
    }
}
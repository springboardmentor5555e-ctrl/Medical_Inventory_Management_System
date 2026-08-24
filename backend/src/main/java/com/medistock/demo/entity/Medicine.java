package com.medistock.demo.entity;


import jakarta.persistence.*;

import lombok.Data;
import lombok.NoArgsConstructor;


import java.time.LocalDate;
import java.time.LocalDateTime;



@Entity
@Table(name = "medicines")
@Data
@NoArgsConstructor
public class Medicine {



    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    private Long id;





    // ===============================
    // MEDICINE NAME
    // ===============================


    @Column(
            nullable = false
    )
    private String name;







    // ===============================
    // BATCH NUMBER
    // ===============================


    @Column(
            nullable = false,
            unique = true
    )
    private String batchNumber;







    // ===============================
    // CATEGORY
    // TABLET / SYRUP / INJECTION
    // ===============================


    @Column(
            nullable = false
    )
    private String category;







    // ===============================
    // SUPPLIER
    // ===============================


    private String supplier;







    // ===============================
    // MANUFACTURER
    // ===============================


    private String manufacturer;







    // ===============================
    // STOCK QUANTITY
    // ===============================


    @Column(
            nullable = false
    )
    private int quantity;







    // ===============================
    // PURCHASE PRICE
    // ===============================


    @Column(
            nullable = false
    )
    private double price;







    // ===============================
    // SELLING PRICE
    // ===============================


    private double sellingPrice;







    // ===============================
    // LOW STOCK LIMIT
    // ===============================


   @Column(
        name = "minimum_stock",
        nullable = false
)
private int minStockLevel = 10;




    // ===============================
    // MANUFACTURE DATE
    // ===============================


    @Column(
            name = "manufacture_date"
    )
    private LocalDate manufactureDate;







    // ===============================
    // EXPIRY DATE
    // ===============================


    @Column(
            nullable = false
    )
    private LocalDate expiryDate;







    // ===============================
    // AUDIT FIELDS
    // ===============================


    private LocalDateTime createdAt;


    private LocalDateTime updatedAt;








    @PrePersist
    public void onCreate(){


        createdAt =
                LocalDateTime.now();


        updatedAt =
                LocalDateTime.now();


    }







    @PreUpdate
    public void onUpdate(){


        updatedAt =
                LocalDateTime.now();


    }









    // ===============================
    // LOW STOCK CHECK
    // ===============================


    public boolean isLowStock(){


        return quantity <= minStockLevel;


    }









    // ===============================
    // EXPIRED CHECK
    // ===============================


    public boolean isExpired(){


        return expiryDate != null

                &&

                expiryDate.isBefore(
                        LocalDate.now()
                );


    }









    // ===============================
    // NEAR EXPIRY CHECK
    // 30 DAYS
    // ===============================


    public boolean isNearExpiry(){


        return expiryDate != null

                &&

                !expiryDate.isBefore(
                        LocalDate.now()
                )

                &&

                expiryDate.isBefore(

                        LocalDate.now()
                                .plusDays(30)

                );


    }









    // ===============================
    // INVENTORY VALUE
    // ===============================


    public double getTotalValue(){


        return quantity * price;


    }



}
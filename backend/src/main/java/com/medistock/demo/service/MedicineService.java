package com.medistock.demo.service;

import com.medistock.demo.entity.Medicine;
import com.medistock.demo.repository.MedicineRepository;
import com.medistock.demo.repository.SaleRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;


@Service
public class MedicineService {


    private final MedicineRepository medicineRepository;

    private final StockLogService stockLogService;

    private final ExpiryTrackingService expiryTrackingService;

    private final NotificationService notificationService;

    private final SaleRepository saleRepository;



    public MedicineService(

            MedicineRepository medicineRepository,

            StockLogService stockLogService,

            ExpiryTrackingService expiryTrackingService,

            NotificationService notificationService,

            SaleRepository saleRepository

    ) {

        this.medicineRepository = medicineRepository;

        this.stockLogService = stockLogService;

        this.expiryTrackingService = expiryTrackingService;

        this.notificationService = notificationService;

        this.saleRepository = saleRepository;

    }



    // ==============================
    // GET ALL
    // ==============================

    public List<Medicine> getAllMedicines(){

        return medicineRepository.findAll();

    }




    // ==============================
    // GET BY ID
    // ==============================

    public Medicine getMedicineById(Long id){

        return medicineRepository.findById(id)

                .orElseThrow(() ->
                        new RuntimeException(
                                "Medicine not found"
                        )
                );

    }





    // ==============================
    // ADD MEDICINE
    // ==============================

    @Transactional
    public Medicine saveMedicine(Medicine medicine){


        validateDates(medicine);



        if(medicine.getMinStockLevel()==0){

            medicine.setMinStockLevel(10);

        }



        if(medicine.getSellingPrice()==0){

            medicine.setSellingPrice(
                    medicine.getPrice()+10
            );

        }



        Medicine saved =
                medicineRepository.save(medicine);



        stockLogService.createLog(

                saved,

                "ADD",

                0,

                saved.getQuantity()

        );



        createExpiryTracking(saved);


notificationService.medicineAdded(saved);



        createStockAlert(saved);



        return saved;

    }





    // ==============================
    // UPDATE MEDICINE
    // ==============================

    @Transactional
    public Medicine updateMedicine(

            Long id,

            Medicine medicine

    ){


        validateDates(medicine);



        Medicine existing =
                getMedicineById(id);



        int oldQuantity =
                existing.getQuantity();



        existing.setName(
                medicine.getName()
        );


        existing.setBatchNumber(
                medicine.getBatchNumber()
        );


        existing.setCategory(
                medicine.getCategory()
        );


        existing.setSupplier(
                medicine.getSupplier()
        );


        existing.setManufacturer(
                medicine.getManufacturer()
        );


        existing.setQuantity(
                medicine.getQuantity()
        );


        existing.setPrice(
                medicine.getPrice()
        );



        existing.setSellingPrice(

                medicine.getSellingPrice()==0

                        ?

                medicine.getPrice()+10

                        :

                medicine.getSellingPrice()

        );



        existing.setMinStockLevel(

                medicine.getMinStockLevel()==0

                        ?

                10

                        :

                medicine.getMinStockLevel()

        );



        existing.setManufactureDate(
                medicine.getManufactureDate()
        );


        existing.setExpiryDate(
                medicine.getExpiryDate()
        );




        Medicine updated =
                medicineRepository.save(existing);




        if(oldQuantity != updated.getQuantity()){


            stockLogService.createLog(

                    updated,

                    "UPDATE",

                    oldQuantity,

                    updated.getQuantity()

            );

        }




        createExpiryTracking(updated);



        notificationService.medicineUpdated(

                updated.getName()

        );



        createStockAlert(updated);



        return updated;

    }


// ==============================
// DELETE MEDICINE
// ==============================

@Transactional
public void deleteMedicine(Long id){


    Medicine medicine =
            getMedicineById(id);



    String name =
            medicine.getName();




    // =====================================
    // DELETE SALES FIRST
    // because sales table has FK medicine_id
    // =====================================

    saleRepository.deleteByMedicine(medicine);




    // =====================================
    // DELETE EXPIRY TRACKING
    // =====================================

    expiryTrackingService
            .deleteByMedicine(medicine);




    // =====================================
    // DELETE STOCK LOGS
    // =====================================

    stockLogService
            .deleteByMedicine(medicine);




    // =====================================
    // DELETE NOTIFICATIONS
    // =====================================

    notificationService
            .deleteByMedicine(medicine);




    // =====================================
    // DELETE MEDICINE
    // =====================================

    medicineRepository.delete(medicine);




    // =====================================
    // FINAL NOTIFICATION
    // =====================================

    notificationService
            .medicineDeleted(name);


}


   

    // ==============================
    // EXPIRY TRACKING
    // ==============================


    private void createExpiryTracking(

            Medicine medicine

    ){


        if(medicine.getExpiryDate()!=null){


            expiryTrackingService
                    .createExpiryTracking(medicine);

        }

    }





    // ==============================
    // VALIDATE DATES
    // ==============================


    private void validateDates(

            Medicine medicine

    ){


        if(

                medicine.getManufactureDate()!=null

                &&

                medicine.getExpiryDate()!=null

        ){


            if(

                    medicine.getManufactureDate()
                    .isAfter(
                            medicine.getExpiryDate()
                    )

            ){


                throw new RuntimeException(

                        "Manufacture date cannot be after expiry date"

                );

            }

        }

    }





    // ==============================
    // STOCK ALERT
    // ==============================


    private void createStockAlert(

            Medicine medicine

    ){


        if(

                medicine.getQuantity()
                <=
                medicine.getMinStockLevel()

        ){


            notificationService.createStockAlert(

                    medicine.getName(),

                    medicine.getQuantity()

            );

        }

    }





    // ==============================
    // SEARCH
    // ==============================

    public List<Medicine> searchMedicine(String keyword){

        return medicineRepository
                .findByNameContainingIgnoreCase(keyword);

    }



    public List<Medicine> filterByCategory(String category){

        return medicineRepository
                .findByCategoryIgnoreCase(category);

    }




    public List<Medicine> getLowStockMedicines(){

        return medicineRepository
                .findLowStockMedicines();

    }




    public List<Medicine> getExpiredMedicines(){

        return medicineRepository
                .findByExpiryDateBefore(
                        LocalDate.now()
                );

    }




    public List<Medicine> getNearExpiryMedicines(){

        LocalDate today =
                LocalDate.now();


        return medicineRepository.findNearExpiry(

                today,

                today.plusDays(30)

        );

    }





    // ==============================
    // DASHBOARD COUNTS
    // ==============================


    public long getTotalMedicines(){

        return medicineRepository.count();

    }



    public long getTotalStock(){

        return medicineRepository.getTotalStock();

    }



    public long getLowStockCount(){

        return medicineRepository.countLowStockMedicines();

    }



    public long getExpiredCount(){

        return medicineRepository.countByExpiryDateBefore(
                LocalDate.now()
        );

    }



    public double getInventoryValue(){

        return medicineRepository.getTotalStockValue();

    }

}
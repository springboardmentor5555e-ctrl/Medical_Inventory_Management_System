package com.medistock.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "stock_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "medicine_id", nullable = false)
    private Medicine medicine;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StockAction action;

    @Column(nullable = false)
    private Integer quantityChanged;

    private Integer resultingQuantity;

    private String note;

    @ManyToOne
    @JoinColumn(name = "performed_by")
    private User performedBy;

    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();

    public enum StockAction {
        STOCK_IN, STOCK_OUT, ADJUSTMENT, INITIAL
    }
}

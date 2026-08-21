package com.medistock.dto;

import com.medistock.entity.StockMovementType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StockMutationRequest {

    @NotNull
    private StockMovementType type;

    @NotNull
    @Min(0)
    private Integer quantity;

    @NotBlank
    @Size(max = 250)
    private String reason;
}

package com.bdspro.dto.request;

import com.bdspro.enums.PaymentMethod;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class DepositRequest {
    @NotBlank(message = "Property ID không được để trống")
    private String propertyId;

    @NotNull(message = "Số tiền cọc không được để trống")
    @Positive(message = "Số tiền cọc phải lớn hơn 0")
    private BigDecimal amount;

    private PaymentMethod paymentMethod = PaymentMethod.vnpay;
}

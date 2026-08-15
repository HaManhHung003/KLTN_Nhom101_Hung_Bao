package com.bdspro.dto.request;

import com.bdspro.enums.LegalStatus;
import com.bdspro.enums.PropertyType;
import com.bdspro.enums.TransactionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class PropertyCreateRequest {
    @NotBlank(message = "Tiêu đề không được để trống")
    private String title;

    @NotNull(message = "Loại BĐS không được để trống")
    private PropertyType type;

    @NotNull(message = "Hình thức giao dịch không được để trống")
    private TransactionType transactionType;

    @NotNull(message = "Giá không được để trống")
    @Positive(message = "Giá phải lớn hơn 0")
    private BigDecimal price;

    @NotNull(message = "Diện tích không được để trống")
    @Positive(message = "Diện tích phải lớn hơn 0")
    private BigDecimal area;

    private LegalStatus legalStatus = LegalStatus.so_hong;

    @NotBlank(message = "Địa chỉ không được để trống")
    private String address;

    @NotBlank(message = "Quận/Huyện không được để trống")
    private String district;

    private String city = "TP. Hồ Chí Minh";

    private Double latitude = 10.7769;
    private Double longitude = 106.7009;

    @NotBlank(message = "Mô tả không được để trống")
    private String description;

    private Integer bedrooms = 1;
    private Integer bathrooms = 1;

    private List<String> images;
    private List<String> amenities;
}

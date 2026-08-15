package com.bdspro.dto.request;

import com.bdspro.enums.TourType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class AppointmentRequest {
    @NotBlank(message = "Property ID không được để trống")
    private String propertyId;

    @NotNull(message = "Ngày xem nhà không được để trống")
    private LocalDate appointmentDate;

    @NotBlank(message = "Khung giờ xem không được để trống")
    private String appointmentTime;

    private TourType tourType = TourType.in_person;
    private String note;
}

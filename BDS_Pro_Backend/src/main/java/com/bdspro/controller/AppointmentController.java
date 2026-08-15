package com.bdspro.controller;

import com.bdspro.dto.request.AppointmentRequest;
import com.bdspro.dto.response.ApiResponse;
import com.bdspro.entity.Appointment;
import com.bdspro.entity.User;
import com.bdspro.enums.AppointmentStatus;
import com.bdspro.service.AppointmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/appointments")
@RequiredArgsConstructor
@Tag(name = "3. Appointments", description = "Các API đặt lịch hẹn xem nhà và quản lý lịch")
public class AppointmentController {

    private final AppointmentService appointmentService;

    @PostMapping
    @Operation(summary = "Khách hàng đặt lịch xem nhà")
    public ResponseEntity<ApiResponse<Appointment>> create(
            @Valid @RequestBody AppointmentRequest request,
            @AuthenticationPrincipal User user
    ) {
        Appointment appointment = appointmentService.create(request, user);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Đặt lịch xem nhà thành công!", appointment));
    }

    @GetMapping("/my")
    @Operation(summary = "Lấy danh sách lịch hẹn của tôi (Khách hàng hoặc Môi giới)")
    public ResponseEntity<ApiResponse<List<Appointment>>> getMyAppointments(@AuthenticationPrincipal User user) {
        List<Appointment> list = appointmentService.getMyAppointments(user);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Cập nhật trạng thái lịch hẹn (Xác nhận, hoàn thành, hủy)")
    public ResponseEntity<ApiResponse<Appointment>> updateStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal User user
    ) {
        AppointmentStatus status = AppointmentStatus.valueOf(body.get("status"));
        Appointment appointment = appointmentService.updateStatus(id, status, user);
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật trạng thái lịch hẹn thành công.", appointment));
    }
}

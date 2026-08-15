package com.bdspro.controller;

import com.bdspro.dto.response.ApiResponse;
import com.bdspro.dto.response.DashboardStatsResponse;
import com.bdspro.entity.*;
import com.bdspro.enums.ListingStatus;
import com.bdspro.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "6. Admin Operations", description = "Các API dành riêng cho Quản trị viên: Thống kê, Kiểm duyệt, Quản trị người dùng, Logs")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/stats")
    @Operation(summary = "Lấy dữ liệu thống kê tổng quan (KPIs) cho Admin Dashboard")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getDashboardStats() {
        DashboardStatsResponse stats = adminService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.ok(stats));
    }

    @GetMapping("/moderation")
    @Operation(summary = "Lấy danh sách tin BĐS đang chờ kiểm duyệt")
    public ResponseEntity<ApiResponse<List<Property>>> getModerationQueue() {
        List<Property> list = adminService.getModerationQueue();
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @PatchMapping("/moderation/{id}")
    @Operation(summary = "Phê duyệt (active) hoặc Từ chối (rejected) tin BĐS")
    public ResponseEntity<ApiResponse<Property>> moderateProperty(
            @PathVariable String id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal User adminUser
    ) {
        ListingStatus status = ListingStatus.valueOf(body.get("status"));
        Property property = adminService.moderateProperty(id, status, adminUser);
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật kiểm duyệt tin BĐS thành công.", property));
    }

    @GetMapping("/users")
    @Operation(summary = "Lấy danh sách tất cả người dùng trong hệ thống")
    public ResponseEntity<ApiResponse<List<User>>> getUsers() {
        List<User> list = adminService.getUsers();
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @PatchMapping("/users/{id}/verify")
    @Operation(summary = "Bật / Tắt trạng thái xác minh tài khoản người dùng")
    public ResponseEntity<ApiResponse<User>> toggleVerifyUser(
            @PathVariable String id,
            @AuthenticationPrincipal User adminUser
    ) {
        User user = adminService.toggleVerifyUser(id, adminUser);
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật xác minh tài khoản thành công.", user));
    }

    @GetMapping("/audit-logs")
    @Operation(summary = "Lấy danh sách nhật ký hoạt động hệ thống (Audit Logs)")
    public ResponseEntity<ApiResponse<List<AuditLog>>> getAuditLogs() {
        List<AuditLog> list = adminService.getAuditLogs();
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/reports")
    @Operation(summary = "Lấy danh sách báo cáo vi phạm tin BĐS")
    public ResponseEntity<ApiResponse<List<Report>>> getReports() {
        List<Report> list = adminService.getReports();
        return ResponseEntity.ok(ApiResponse.ok(list));
    }
}

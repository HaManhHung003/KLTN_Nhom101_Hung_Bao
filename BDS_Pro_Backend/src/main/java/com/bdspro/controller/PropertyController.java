package com.bdspro.controller;

import com.bdspro.dto.request.PropertyCreateRequest;
import com.bdspro.dto.response.ApiResponse;
import com.bdspro.entity.Property;
import com.bdspro.entity.User;
import com.bdspro.enums.ListingStatus;
import com.bdspro.enums.PropertyType;
import com.bdspro.enums.TransactionType;
import com.bdspro.service.PropertyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/properties")
@RequiredArgsConstructor
@Tag(name = "2. Properties", description = "Các API tìm kiếm, lọc, xem chi tiết và quản lý BĐS")
public class PropertyController {

    private final PropertyService propertyService;

    @GetMapping
    @Operation(summary = "Lấy danh sách BĐS kèm bộ lọc đa tiêu chí (giá, quận, loại hình, keyword)")
    public ResponseEntity<ApiResponse<List<Property>>> getAll(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) PropertyType type,
            @RequestParam(required = false) TransactionType transactionType,
            @RequestParam(required = false) String district,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) ListingStatus status,
            @RequestParam(required = false, defaultValue = "newest") String sortBy
    ) {
        List<Property> list = propertyService.getAll(keyword, type, transactionType, district, city, minPrice, maxPrice, status, sortBy);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/detail/{id}")
    @Operation(summary = "Xem chi tiết BĐS theo ID")
    public ResponseEntity<ApiResponse<Property>> getById(@PathVariable String id) {
        Property property = propertyService.getById(id);
        return ResponseEntity.ok(ApiResponse.ok(property));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('AGENT', 'ADMIN')")
    @Operation(summary = "Môi giới đăng tin BĐS mới")
    public ResponseEntity<ApiResponse<Property>> create(
            @Valid @RequestBody PropertyCreateRequest request,
            @AuthenticationPrincipal User user
    ) {
        Property property = propertyService.create(request, user);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Đăng tin BĐS thành công, đang chờ phê duyệt.", property));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật thông tin tin BĐS")
    public ResponseEntity<ApiResponse<Property>> update(
            @PathVariable String id,
            @Valid @RequestBody PropertyCreateRequest request,
            @AuthenticationPrincipal User user
    ) {
        Property property = propertyService.update(id, request, user);
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật tin BĐS thành công.", property));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa tin BĐS")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable String id,
            @AuthenticationPrincipal User user
    ) {
        propertyService.delete(id, user);
        return ResponseEntity.ok(ApiResponse.ok("Xóa tin BĐS thành công.", null));
    }

    @GetMapping("/my/properties")
    @PreAuthorize("hasAnyRole('AGENT', 'ADMIN')")
    @Operation(summary = "Lấy danh sách tin đăng của Môi giới hiện tại")
    public ResponseEntity<ApiResponse<List<Property>>> getMyProperties(@AuthenticationPrincipal User user) {
        List<Property> list = propertyService.getMyProperties(user.getId());
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @PostMapping("/my/favorites/toggle/{id}")
    @Operation(summary = "Thêm / Xóa khỏi danh sách yêu thích")
    public ResponseEntity<ApiResponse<Map<String, Object>>> toggleFavorite(
            @PathVariable String id,
            @AuthenticationPrincipal User user
    ) {
        boolean favorited = propertyService.toggleFavorite(user.getId(), id);
        return ResponseEntity.ok(ApiResponse.ok(Map.of("favorited", favorited)));
    }

    @GetMapping("/my/favorites")
    @Operation(summary = "Lấy danh sách BĐS yêu thích của người dùng")
    public ResponseEntity<ApiResponse<List<Property>>> getFavorites(@AuthenticationPrincipal User user) {
        List<Property> list = propertyService.getFavorites(user.getId());
        return ResponseEntity.ok(ApiResponse.ok(list));
    }
}

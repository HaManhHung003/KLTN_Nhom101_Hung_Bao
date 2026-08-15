package com.bdspro.controller;

import com.bdspro.dto.request.DepositRequest;
import com.bdspro.dto.response.ApiResponse;
import com.bdspro.entity.Transaction;
import com.bdspro.entity.User;
import com.bdspro.service.TransactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/transactions")
@RequiredArgsConstructor
@Tag(name = "5. Transactions", description = "Các API thanh toán đặt cọc và quản lý giao dịch")
public class TransactionController {

    private final TransactionService transactionService;

    @PostMapping("/deposit")
    @Operation(summary = "Khách hàng thực hiện thanh toán đặt cọc")
    public ResponseEntity<ApiResponse<Transaction>> createDeposit(
            @Valid @RequestBody DepositRequest request,
            @AuthenticationPrincipal User user
    ) {
        Transaction transaction = transactionService.createDeposit(request, user);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Thanh toán đặt cọc thành công!", transaction));
    }

    @GetMapping("/my")
    @Operation(summary = "Lấy lịch sử giao dịch đặt cọc của tôi")
    public ResponseEntity<ApiResponse<List<Transaction>>> getMyTransactions(@AuthenticationPrincipal User user) {
        List<Transaction> list = transactionService.getMyTransactions(user);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }
}

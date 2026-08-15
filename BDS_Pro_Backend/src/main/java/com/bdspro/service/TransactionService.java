package com.bdspro.service;

import com.bdspro.dto.request.DepositRequest;
import com.bdspro.entity.*;
import com.bdspro.enums.TransactionStatus;
import com.bdspro.enums.UserRole;
import com.bdspro.repository.AuditLogRepository;
import com.bdspro.repository.PropertyRepository;
import com.bdspro.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final PropertyRepository propertyRepository;
    private final AuditLogRepository auditLogRepository;

    @Transactional
    public Transaction createDeposit(DepositRequest request, User buyer) {
        Property property = propertyRepository.findById(request.getPropertyId())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bất động sản."));

        String coverImg = property.getImages().isEmpty() ? null : property.getImages().get(0).getImageUrl();
        String receiptId = "REC-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss")) + "-" + (new Random().nextInt(900) + 100);

        Transaction transaction = Transaction.builder()
                .propertyId(property.getId())
                .propertyTitle(property.getTitle())
                .propertyImage(coverImg)
                .buyerId(buyer.getId())
                .buyerName(buyer.getName())
                .agentId(property.getOwnerId())
                .agentName(property.getOwnerName())
                .amount(request.getAmount())
                .paymentMethod(request.getPaymentMethod())
                .status(TransactionStatus.completed) // Demo đặt cọc thành công
                .receiptId(receiptId)
                .build();

        transaction = transactionRepository.save(transaction);

        // Ghi log
        AuditLog log = AuditLog.builder()
                .actorId(buyer.getId())
                .actor(buyer.getName())
                .actorRole("buyer")
                .action("completed deposit")
                .target(property.getTitle() + " — " + request.getAmount().toString() + " VNĐ")
                .build();
        auditLogRepository.save(log);

        return transaction;
    }

    public List<Transaction> getMyTransactions(User user) {
        if (user.getRole() == UserRole.admin) {
            return transactionRepository.findAll();
        }
        if (user.getRole() == UserRole.agent) {
            return transactionRepository.findByAgentIdOrderByCreatedAtDesc(user.getId());
        }
        return transactionRepository.findByBuyerIdOrderByCreatedAtDesc(user.getId());
    }
}

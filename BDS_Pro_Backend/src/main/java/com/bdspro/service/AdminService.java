package com.bdspro.service;

import com.bdspro.dto.response.DashboardStatsResponse;
import com.bdspro.entity.*;
import com.bdspro.enums.ListingStatus;
import com.bdspro.enums.TransactionStatus;
import com.bdspro.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final PropertyRepository propertyRepository;
    private final TransactionRepository transactionRepository;
    private final AuditLogRepository auditLogRepository;
    private final ReportRepository reportRepository;

    public DashboardStatsResponse getDashboardStats() {
        long totalUsers = userRepository.count();
        long totalProperties = propertyRepository.count();
        long activeProperties = propertyRepository.countByStatus(ListingStatus.active);
        long pendingProperties = propertyRepository.countByStatus(ListingStatus.pending);

        List<Transaction> completedTrans = transactionRepository.findByStatus(TransactionStatus.completed);
        long totalTransactions = completedTrans.size();
        BigDecimal revenue = completedTrans.stream()
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return DashboardStatsResponse.builder()
                .totalUsers(totalUsers)
                .totalProperties(totalProperties)
                .activeProperties(activeProperties)
                .pendingProperties(pendingProperties)
                .totalTransactions(totalTransactions)
                .revenue(revenue)
                .build();
    }

    public List<Property> getModerationQueue() {
        return propertyRepository.findByStatus(ListingStatus.pending);
    }

    @Transactional
    public Property moderateProperty(String id, ListingStatus status, User adminUser) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bất động sản."));

        property.setStatus(status);
        property = propertyRepository.save(property);

        AuditLog log = AuditLog.builder()
                .actorId(adminUser.getId())
                .actor(adminUser.getName())
                .actorRole("admin")
                .action(status == ListingStatus.active ? "approved listing" : "rejected listing")
                .target("#" + property.getId() + " — " + property.getTitle())
                .build();
        auditLogRepository.save(log);

        return property;
    }

    public List<User> getUsers() {
        return userRepository.findAll();
    }

    @Transactional
    public User toggleVerifyUser(String userId, User adminUser) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng."));

        user.setVerified(!user.getVerified());
        user = userRepository.save(user);

        AuditLog log = AuditLog.builder()
                .actorId(adminUser.getId())
                .actor(adminUser.getName())
                .actorRole("admin")
                .action(user.getVerified() ? "verified user account" : "unverified user account")
                .target(user.getName() + " (" + user.getEmail() + ")")
                .build();
        auditLogRepository.save(log);

        return user;
    }

    public List<AuditLog> getAuditLogs() {
        return auditLogRepository.findTop50ByOrderByCreatedAtDesc();
    }

    public List<Report> getReports() {
        return reportRepository.findAllByOrderByCreatedAtDesc();
    }
}

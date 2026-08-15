package com.bdspro.repository;

import com.bdspro.entity.Transaction;
import com.bdspro.enums.TransactionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, String> {
    List<Transaction> findByBuyerIdOrderByCreatedAtDesc(String buyerId);
    List<Transaction> findByAgentIdOrderByCreatedAtDesc(String agentId);
    List<Transaction> findByStatus(TransactionStatus status);
    Optional<Transaction> findByReceiptId(String receiptId);
}

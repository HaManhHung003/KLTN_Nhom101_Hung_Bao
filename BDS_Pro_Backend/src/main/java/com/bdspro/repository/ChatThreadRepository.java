package com.bdspro.repository;

import com.bdspro.entity.ChatThread;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatThreadRepository extends JpaRepository<ChatThread, String> {
    List<ChatThread> findByBuyerIdOrderByUpdatedAtDesc(String buyerId);
    List<ChatThread> findByAgentIdOrderByUpdatedAtDesc(String agentId);
    Optional<ChatThread> findByBuyerIdAndAgentId(String buyerId, String agentId);
    Optional<ChatThread> findByBuyerIdAndAgentIdAndPropertyId(String buyerId, String agentId, String propertyId);
}

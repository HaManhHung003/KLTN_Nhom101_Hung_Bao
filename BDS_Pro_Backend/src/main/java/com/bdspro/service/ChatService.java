package com.bdspro.service;

import com.bdspro.dto.request.ChatMessageRequest;
import com.bdspro.entity.*;
import com.bdspro.enums.ListingStatus;
import com.bdspro.enums.TransactionType;
import com.bdspro.enums.UserRole;
import com.bdspro.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatThreadRepository threadRepository;
    private final ChatMessageRepository messageRepository;
    private final PropertyRepository propertyRepository;

    public List<ChatThread> getThreads(User user) {
        if (user.getRole() == UserRole.agent) {
            return threadRepository.findByAgentIdOrderByUpdatedAtDesc(user.getId());
        }
        return threadRepository.findByBuyerIdOrderByUpdatedAtDesc(user.getId());
    }

    public List<ChatMessage> getMessages(String threadId) {
        return messageRepository.findByThreadIdOrderByCreatedAtAsc(threadId);
    }

    @Transactional
    public ChatThread createOrGetThread(String buyerId, String agentId, String propertyId) {
        return threadRepository.findByBuyerIdAndAgentIdAndPropertyId(buyerId, agentId, propertyId)
                .orElseGet(() -> {
                    String title = null;
                    String thumb = null;
                    if (propertyId != null) {
                        Property p = propertyRepository.findById(propertyId).orElse(null);
                        if (p != null) {
                            title = p.getTitle();
                            thumb = p.getImages().isEmpty() ? null : p.getImages().get(0).getImageUrl();
                        }
                    }

                    ChatThread thread = ChatThread.builder()
                            .buyerId(buyerId)
                            .agentId(agentId)
                            .propertyId(propertyId)
                            .propertyTitle(title)
                            .propertyThumbnail(thumb)
                            .lastMessage("Bắt đầu cuộc hội thoại")
                            .lastMessageTime(LocalTime.now().format(DateTimeFormatter.ofPattern("HH:mm")))
                            .build();

                    return threadRepository.save(thread);
                });
    }

    @Transactional
    public ChatMessage sendMessage(String threadId, ChatMessageRequest request, User sender) {
        ChatThread thread = threadRepository.findById(threadId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy cuộc hội thoại."));

        ChatMessage message = ChatMessage.builder()
                .thread(thread)
                .senderId(sender.getId())
                .content(request.getContent())
                .messageType(request.getMessageType() != null ? request.getMessageType() : "text")
                .imageUrl(request.getImageUrl())
                .isRead(false)
                .build();

        message = messageRepository.save(message);

        thread.setLastMessage(request.getContent());
        thread.setLastMessageTime(LocalTime.now().format(DateTimeFormatter.ofPattern("HH:mm")));
        threadRepository.save(thread);

        return message;
    }

    public Map<String, Object> aiChat(String userMessage) {
        String lower = userMessage.toLowerCase();
        List<Property> suggested;
        String reply;

        if (lower.contains("thuê") || lower.contains("rent")) {
            suggested = propertyRepository.findByTypeAndTransactionType(null, TransactionType.rent);
            if (suggested.isEmpty()) {
                suggested = propertyRepository.findByStatus(ListingStatus.active);
            }
            reply = "Dưới đây là một số bất động sản cho thuê nổi bật phù hợp với nhu cầu của bạn:";
        } else if (lower.contains("mua") || lower.contains("bán") || lower.contains("sale")) {
            suggested = propertyRepository.findByTypeAndTransactionType(null, TransactionType.sale);
            if (suggested.isEmpty()) {
                suggested = propertyRepository.findByStatus(ListingStatus.active);
            }
            reply = "Tôi đã tìm thấy những bất động sản đang mở bán với pháp lý hoàn chỉnh:";
        } else {
            suggested = propertyRepository.findByStatus(ListingStatus.active);
            reply = "Chào bạn! Tôi là trợ lý ảo AI BDS Pro. Dưới đây là những gợi ý BĐS tốt nhất dành cho bạn:";
        }

        if (suggested.size() > 3) {
            suggested = suggested.subList(0, 3);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("reply", reply);
        response.put("suggestedProperties", suggested);
        return response;
    }
}

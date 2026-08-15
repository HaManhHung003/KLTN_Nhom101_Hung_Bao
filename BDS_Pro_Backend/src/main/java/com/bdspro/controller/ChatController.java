package com.bdspro.controller;

import com.bdspro.dto.request.AiChatRequest;
import com.bdspro.dto.request.ChatMessageRequest;
import com.bdspro.dto.response.ApiResponse;
import com.bdspro.entity.ChatMessage;
import com.bdspro.entity.ChatThread;
import com.bdspro.entity.User;
import com.bdspro.service.ChatService;
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
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
@Tag(name = "4. Chat & AI", description = "Các API nhắn tin 1-1 và Trợ lý ảo AI tư vấn BĐS")
public class ChatController {

    private final ChatService chatService;

    @PostMapping("/ai")
    @Operation(summary = "Hỏi đáp tư vấn BĐS với AI Chatbot")
    public ResponseEntity<ApiResponse<Map<String, Object>>> aiChat(@Valid @RequestBody AiChatRequest request) {
        Map<String, Object> response = chatService.aiChat(request.getMessage());
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/threads")
    @Operation(summary = "Lấy danh sách các cuộc hội thoại chat")
    public ResponseEntity<ApiResponse<List<ChatThread>>> getThreads(@AuthenticationPrincipal User user) {
        List<ChatThread> list = chatService.getThreads(user);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @PostMapping("/threads")
    @Operation(summary = "Tạo hoặc lấy cuộc hội thoại với Môi giới")
    public ResponseEntity<ApiResponse<ChatThread>> createOrGetThread(
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal User user
    ) {
        String agentId = body.get("agentId");
        String propertyId = body.get("propertyId");
        ChatThread thread = chatService.createOrGetThread(user.getId(), agentId, propertyId);
        return ResponseEntity.ok(ApiResponse.ok(thread));
    }

    @GetMapping("/threads/{threadId}/messages")
    @Operation(summary = "Lấy lịch sử tin nhắn của một cuộc hội thoại")
    public ResponseEntity<ApiResponse<List<ChatMessage>>> getMessages(@PathVariable String threadId) {
        List<ChatMessage> list = chatService.getMessages(threadId);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @PostMapping("/threads/{threadId}/messages")
    @Operation(summary = "Gửi tin nhắn mới")
    public ResponseEntity<ApiResponse<ChatMessage>> sendMessage(
            @PathVariable String threadId,
            @Valid @RequestBody ChatMessageRequest request,
            @AuthenticationPrincipal User user
    ) {
        ChatMessage message = chatService.sendMessage(threadId, request, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(message));
    }
}

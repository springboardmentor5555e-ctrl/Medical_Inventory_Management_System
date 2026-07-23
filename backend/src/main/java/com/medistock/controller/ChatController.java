package com.medistock.controller;

import com.medistock.entity.ChatMessage;
import com.medistock.entity.User;
import com.medistock.enums.Role;
import com.medistock.repository.UserRepository;
import com.medistock.security.UserPrincipal;
import com.medistock.service.ChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;
    private final UserRepository userRepository;

    public ChatController(ChatService chatService, UserRepository userRepository) {
        this.chatService = chatService;
        this.userRepository = userRepository;
    }

    @GetMapping("/history/{recipientId}")
    public ResponseEntity<List<ChatMessage>> getChatHistory(@PathVariable Long recipientId) {
        return ResponseEntity.ok(chatService.getChatHistory(recipientId));
    }

    @PostMapping("/send")
    public ResponseEntity<ChatMessage> sendMessage(
            @RequestParam Long receiverId,
            @RequestParam(required = false) String content,
            @RequestParam(required = false, defaultValue = "TEXT") String messageType,
            @RequestParam(required = false) String fileUrl
    ) {
        return ResponseEntity.ok(chatService.sendMessage(receiverId, content, messageType, fileUrl));
    }

    @GetMapping("/unread")
    public ResponseEntity<Long> getTotalUnread() {
        return ResponseEntity.ok(chatService.getTotalUnreadCount());
    }

    @PostMapping("/read/{senderId}")
    public ResponseEntity<Void> markRead(@PathVariable Long senderId) {
        chatService.markMessagesAsRead(senderId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/users")
    public ResponseEntity<List<Map<String, Object>>> getChatUsers(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (userPrincipal == null) {
            return ResponseEntity.status(401).build();
        }
        User current = userPrincipal.getUser();
        List<User> list = new ArrayList<>();

        if (current.getRole() == Role.ADMIN) {
            // Admin can chat with Owners (PHARMACIST) and Suppliers
            list = userRepository.findAll().stream()
                    .filter(u -> u.getRole() == Role.PHARMACIST || u.getRole() == Role.SUPPLIER)
                    .collect(Collectors.toList());
        } else if (current.getRole() == Role.PHARMACIST) {
            // Owner can chat with their Staff, partner Suppliers, and Admin
            list = userRepository.findAll().stream()
                    .filter(u -> (u.getRole() == Role.STAFF && current.getId().equals(u.getOwnerId()))
                            || u.getRole() == Role.SUPPLIER
                            || u.getRole() == Role.ADMIN)
                    .collect(Collectors.toList());
        } else if (current.getRole() == Role.STAFF) {
            // Staff can chat with their Owner
            if (current.getOwnerId() != null) {
                userRepository.findById(current.getOwnerId()).ifPresent(list::add);
            }
        } else if (current.getRole() == Role.SUPPLIER) {
            // Supplier can chat with all pharmacy owners and Admin
            list = userRepository.findAll().stream()
                    .filter(u -> u.getRole() == Role.PHARMACIST || u.getRole() == Role.ADMIN)
                    .collect(Collectors.toList());
        }

        List<Map<String, Object>> response = list.stream().map(u -> {
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", u.getId());
            map.put("name", u.getName());
            map.put("email", u.getEmail());
            map.put("role", u.getRole().name());
            map.put("status", u.getStatus());
            map.put("online", chatService.isUserOnline(u.getId()));
            map.put("unread", chatService.getUnreadCountFromSender(u.getId()));
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }
}

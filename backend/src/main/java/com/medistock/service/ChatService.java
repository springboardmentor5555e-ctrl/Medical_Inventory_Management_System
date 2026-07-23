package com.medistock.service;

import com.medistock.entity.ChatMessage;
import com.medistock.entity.User;
import com.medistock.exception.ResourceNotFoundException;
import com.medistock.repository.ChatMessageRepository;
import com.medistock.repository.UserRepository;
import com.medistock.security.UserPrincipal;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;

    // In-memory mappings to track online status
    private static final Map<Long, Boolean> onlineUsers = new ConcurrentHashMap<>();

    public ChatService(ChatMessageRepository chatMessageRepository, UserRepository userRepository) {
        this.chatMessageRepository = chatMessageRepository;
        this.userRepository = userRepository;
    }

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new AccessDeniedException("User not authenticated");
        }
        Object principal = auth.getPrincipal();
        if (principal instanceof UserPrincipal) {
            return ((UserPrincipal) principal).getUser().getId();
        }
        throw new AccessDeniedException("User principal not found");
    }

    @Transactional
    public ChatMessage sendMessage(Long receiverId, String content, String messageType, String fileUrl) {
        Long senderId = getCurrentUserId();
        
        // Verify receiver exists
        if (!userRepository.existsById(receiverId)) {
            throw new ResourceNotFoundException("Recipient user not found with ID: " + receiverId);
        }

        ChatMessage message = ChatMessage.builder()
                .senderId(senderId)
                .receiverId(receiverId)
                .content(content)
                .messageType(messageType != null ? messageType : "TEXT")
                .fileUrl(fileUrl)
                .isRead(false)
                .build();

        return chatMessageRepository.save(message);
    }

    @Transactional(readOnly = true)
    public List<ChatMessage> getChatHistory(Long recipientId) {
        Long senderId = getCurrentUserId();
        return chatMessageRepository.findChatHistory(senderId, recipientId);
    }

    @Transactional
    public void markMessagesAsRead(Long senderId) {
        Long receiverId = getCurrentUserId();
        List<ChatMessage> unread = chatMessageRepository.findByReceiverIdAndSenderIdAndIsReadFalse(receiverId, senderId);
        unread.forEach(msg -> msg.setRead(true));
        chatMessageRepository.saveAll(unread);
    }

    @Transactional(readOnly = true)
    public long getUnreadCountFromSender(Long senderId) {
        Long receiverId = getCurrentUserId();
        return chatMessageRepository.countUnreadFromSender(receiverId, senderId);
    }

    @Transactional(readOnly = true)
    public long getTotalUnreadCount() {
        Long receiverId = getCurrentUserId();
        return chatMessageRepository.countTotalUnread(receiverId);
    }

    // Manage online status
    public void setOnlineStatus(Long userId, boolean isOnline) {
        if (userId != null) {
            onlineUsers.put(userId, isOnline);
        }
    }

    public boolean isUserOnline(Long userId) {
        return onlineUsers.getOrDefault(userId, false);
    }
}

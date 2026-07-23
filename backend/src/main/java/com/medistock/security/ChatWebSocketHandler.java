package com.medistock.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medistock.service.ChatService;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class ChatWebSocketHandler extends TextWebSocketHandler {

    private final ChatService chatService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // Map to link user ID to active WebSocket sessions
    private static final Map<Long, WebSocketSession> userSessions = new ConcurrentHashMap<>();

    public ChatWebSocketHandler(ChatService chatService) {
        this.chatService = chatService;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        System.out.println("WebSocket connection established: " + session.getId());
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws IOException {
        String payload = message.getPayload();
        Map<String, Object> data = objectMapper.readValue(payload, Map.class);
        
        String type = (String) data.get("type");
        if (type == null) return;

        switch (type) {
            case "ONLINE":
                Long userId = Long.valueOf(data.get("userId").toString());
                userSessions.put(userId, session);
                chatService.setOnlineStatus(userId, true);
                broadcastStatus(userId, true);
                break;
            case "TYPING":
                Long senderId = Long.valueOf(data.get("senderId").toString());
                Long receiverId = Long.valueOf(data.get("receiverId").toString());
                Boolean isTyping = (Boolean) data.get("isTyping");
                forwardMessage(receiverId, payload);
                break;
            case "READ":
                Long sender = Long.valueOf(data.get("senderId").toString());
                Long receiver = Long.valueOf(data.get("receiverId").toString());
                forwardMessage(sender, payload); // Tell the sender that the receiver read it
                break;
            case "MESSAGE":
                Long toId = Long.valueOf(data.get("receiverId").toString());
                forwardMessage(toId, payload);
                break;
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        Long userIdToRemove = null;
        for (Map.Entry<Long, WebSocketSession> entry : userSessions.entrySet()) {
            if (entry.getValue().getId().equals(session.getId())) {
                userIdToRemove = entry.getKey();
                break;
            }
        }
        if (userIdToRemove != null) {
            userSessions.remove(userIdToRemove);
            chatService.setOnlineStatus(userIdToRemove, false);
            broadcastStatus(userIdToRemove, false);
            System.out.println("WebSocket connection closed for user: " + userIdToRemove);
        }
    }

    private void forwardMessage(Long recipientId, String payload) {
        WebSocketSession session = userSessions.get(recipientId);
        if (session != null && session.isOpen()) {
            try {
                session.sendMessage(new TextMessage(payload));
            } catch (IOException e) {
                System.err.println("Error forwarding message: " + e.getMessage());
            }
        }
    }

    private void broadcastStatus(Long userId, boolean isOnline) {
        String msg = String.format("{\"type\":\"STATUS\",\"userId\":%d,\"online\":%b}", userId, isOnline);
        userSessions.values().forEach(session -> {
            if (session.isOpen()) {
                try {
                    session.sendMessage(new TextMessage(msg));
                } catch (IOException e) {
                    // Ignore connection errors during broadcast
                }
            }
        });
    }
}

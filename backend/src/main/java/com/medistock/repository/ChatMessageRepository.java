package com.medistock.repository;

import com.medistock.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    
    @Query("SELECT m FROM ChatMessage m WHERE (m.senderId = :u1 AND m.receiverId = :u2) OR (m.senderId = :u2 AND m.receiverId = :u1) ORDER BY m.timestamp ASC")
    List<ChatMessage> findChatHistory(@Param("u1") Long user1, @Param("u2") Long user2);

    @Query("SELECT COUNT(m) FROM ChatMessage m WHERE m.receiverId = :recipientId AND m.senderId = :senderId AND m.isRead = false")
    long countUnreadFromSender(@Param("recipientId") Long recipientId, @Param("senderId") Long senderId);

    @Query("SELECT COUNT(m) FROM ChatMessage m WHERE m.receiverId = :recipientId AND m.isRead = false")
    long countTotalUnread(@Param("recipientId") Long recipientId);

    List<ChatMessage> findByReceiverIdAndSenderIdAndIsReadFalse(Long receiverId, Long senderId);
}

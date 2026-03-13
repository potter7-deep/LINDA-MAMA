import express from 'express';
import db from '../config/database.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all conversations for a user
router.get('/conversations', authenticate, (req, res) => {
  try {
    const userId = req.user.id;
    
    const conversations = db.prepare(`
      SELECT 
        c.id,
        c.lastMessageAt,
        c.createdAt,
        CASE 
          WHEN c.participant1Id = ? THEN c.participant2Id 
          ELSE c.participant1Id 
        END as partnerId,
        u.fullName as partnerName,
        u.role as partnerRole,
        (SELECT content FROM messages WHERE conversationId = c.id ORDER BY createdAt DESC LIMIT 1) as lastMessage,
        (SELECT COUNT(*) FROM messages m 
         JOIN conversations c2 ON m.conversationId = c2.id 
         WHERE (c2.participant1Id = ? OR c2.participant2Id = ?) 
         AND m.senderId != ? 
         AND m.isRead = 0) as unreadCount
      FROM conversations c
      JOIN users u ON u.id = CASE 
        WHEN c.participant1Id = ? THEN c.participant2Id 
        ELSE c.participant1Id 
      END
      WHERE c.participant1Id = ? OR c.participant2Id = ?
      ORDER BY c.lastMessageAt DESC
    `).all(userId, userId, userId, userId, userId, userId, userId);

    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Get or create a conversation with a provider/mother
router.post('/conversations', authenticate, async (req, res) => {
  try {
    const { participantId } = req.body;
    const userId = req.user.id;

    if (!participantId) {
      return res.status(400).json({ error: 'Participant ID is required' });
    }

    // Check if conversation already exists
    let conversation = db.prepare(`
      SELECT * FROM conversations 
      WHERE (participant1Id = ? AND participant2Id = ?) 
      OR (participant1Id = ? AND participant2Id = ?)
    `).get(userId, participantId, participantId, userId);

    if (!conversation) {
      // Create new conversation
      const result = db.prepare(`
        INSERT INTO conversations (participant1Id, participant2Id)
        VALUES (?, ?)
      `).run(userId, participantId);
      
      conversation = { id: result.lastInsertRowid };
    }

    // Get participant details
    const participant = db.prepare(`
      SELECT id, fullName, role FROM users WHERE id = ?
    `).get(participantId);

    res.json({ 
      conversationId: conversation.id,
      participant 
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// Get messages for a conversation
router.get('/conversations/:conversationId/messages', authenticate, (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    // Verify user is part of conversation
    const conversation = db.prepare(`
      SELECT * FROM conversations WHERE id = ? AND (participant1Id = ? OR participant2Id = ?)
    `).get(conversationId, userId, userId);

    if (!conversation) {
      return res.status(403).json({ error: 'Access denied to this conversation' });
    }

    // Get messages
    const messages = db.prepare(`
      SELECT 
        m.*,
        u.fullName as senderName,
        u.role as senderRole
      FROM messages m
      JOIN users u ON m.senderId = u.id
      WHERE m.conversationId = ?
      ORDER BY m.createdAt ASC
    `).all(conversationId);

    // Mark messages as read
    db.prepare(`
      UPDATE messages 
      SET isRead = 1 
      WHERE conversationId = ? AND senderId != ?
    `).run(conversationId, userId);

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send a message
router.post('/conversations/:conversationId/messages', authenticate, (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Message content is required' });
    }

    // Verify user is part of conversation
    const conversation = db.prepare(`
      SELECT * FROM conversations WHERE id = ? AND (participant1Id = ? OR participant2Id = ?)
    `).get(conversationId, userId, userId);

    if (!conversation) {
      return res.status(403).json({ error: 'Access denied to this conversation' });
    }

    // Insert message
    const result = db.prepare(`
      INSERT INTO messages (conversationId, senderId, content)
      VALUES (?, ?, ?)
    `).run(conversationId, userId, content.trim());

    // Update conversation lastMessageAt
    db.prepare(`
      UPDATE conversations SET lastMessageAt = CURRENT_TIMESTAMP WHERE id = ?
    `).run(conversationId);

    // Get the created message with sender details
    const message = db.prepare(`
      SELECT m.*, u.fullName as senderName, u.role as senderRole
      FROM messages m
      JOIN users u ON m.senderId = u.id
      WHERE m.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Get providers list (for mothers to start chat)
router.get('/providers', authenticate, (req, res) => {
  try {
    const providers = db.prepare(`
      SELECT id, fullName, role, email, phone, address
      FROM users 
      WHERE role IN ('provider', 'admin') AND isActive = 1
      ORDER BY fullName ASC
    `).all();

    res.json(providers);
  } catch (error) {
    console.error('Error fetching providers:', error);
    res.status(500).json({ error: 'Failed to fetch providers' });
  }
});

// Get patients list (for providers to start chat)
router.get('/patients', authenticate, authorize('provider', 'admin'), (req, res) => {
  try {
    const patients = db.prepare(`
      SELECT id, fullName, role, email, phone, address, createdAt
      FROM users 
      WHERE role = 'mother' AND isActive = 1
      ORDER BY fullName ASC
    `).all();

    res.json(patients);
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
});

// Get unread message count
router.get('/unread', authenticate, (req, res) => {
  try {
    const userId = req.user.id;

    const count = db.prepare(`
      SELECT COUNT(*) as count FROM messages m
      JOIN conversations c ON m.conversationId = c.id
      WHERE (c.participant1Id = ? OR c.participant2Id = ?)
      AND m.senderId != ?
      AND m.isRead = 0
    `).get(userId, userId, userId);

    res.json({ unreadCount: count.count });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
});

export default router;


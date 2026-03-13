import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  MessageCircle, 
  Send, 
  User, 
  Search, 
  Phone, 
  Video, 
  MoreVertical,
  ArrowLeft,
  Check,
  CheckCheck,
  Clock,
  Sparkles,
  X,
  MessageSquare
} from 'lucide-react';

const Chat = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [providers, setProviders] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
    if (user?.role === 'mother') {
      fetchProviders();
    }
  }, [user]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Poll for new messages
  useEffect(() => {
    if (!selectedConversation) return;
    
    const interval = setInterval(() => {
      fetchMessages(selectedConversation.id);
      fetchConversations();
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [selectedConversation?.id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      const res = await api.get('/chat/conversations');
      setConversations(res);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProviders = async () => {
    try {
      const res = await api.get('/chat/providers');
      // Data is already extracted by the API interceptor
      setProviders(res);
    } catch (error) {
      console.error('Error fetching providers:', error);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const res = await api.get(`/chat/conversations/${conversationId}/messages`);
      // Data is already extracted by the API interceptor
      setMessages(res);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const startNewChat = async (providerId) => {
    try {
      const res = await api.post('/chat/conversations', { participantId: providerId });
      // Data is already extracted by the API interceptor
      setSelectedConversation({ id: res.conversationId, partnerName: res.participant.fullName, partnerRole: res.participant.role });
      setShowNewChat(false);
      fetchConversations();
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || sending) return;

    setSending(true);
    try {
      const res = await api.post(`/chat/conversations/${selectedConversation.id}/messages`, {
        content: newMessage
      });
      // Data is already extracted by the API interceptor
      setMessages([...messages, res]);
      setNewMessage('');
      fetchConversations();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const filteredConversations = conversations.filter(c => 
    c.partnerName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProviders = providers.filter(p => 
    p.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'provider':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'admin':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
      default:
        return 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-4">
      {/* Conversations List */}
      <div className={`${selectedConversation ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden`}>
        {/* Header */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-primary-500" />
              Messages
            </h2>
            <button
              onClick={() => setShowNewChat(true)}
              className="p-2 rounded-xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors"
            >
              <Sparkles className="w-5 h-5" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-neutral-100 dark:bg-neutral-700 border-0 rounded-xl text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation)}
                className={`w-full p-4 flex items-center gap-3 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors border-b border-neutral-100 dark:border-neutral-700 ${
                  selectedConversation?.id === conversation.id ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {conversation.partnerName?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                      {conversation.partnerName}
                    </span>
                    <span className="text-xs text-neutral-500">
                      {formatTime(conversation.lastMessageAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">
                      {conversation.lastMessage || 'No messages yet'}
                    </p>
                    {conversation.unreadCount > 0 && (
                      <span className="ml-2 px-2 py-0.5 bg-primary-500 text-white text-xs rounded-full">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs capitalize ${getRoleBadge(conversation.partnerRole)}`}>
                    {conversation.partnerRole}
                  </span>
                </div>
              </button>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <MessageSquare className="w-16 h-16 text-neutral-300 dark:text-neutral-600 mb-4" />
              <p className="text-neutral-500 dark:text-neutral-400 mb-4">No conversations yet</p>
              <button
                onClick={() => setShowNewChat(true)}
                className="btn-primary"
              >
                Start a Conversation
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
          {/* Chat Header */}
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedConversation(null)}
                className="md:hidden p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
              </button>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center text-white font-bold">
                {selectedConversation.partnerName?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {selectedConversation.partnerName || selectedConversation.partnerName}
                </h3>
                <span className={`text-xs px-2 py-0.5 rounded-full ${getRoleBadge(selectedConversation.partnerRole)}`}>
                  {selectedConversation.partnerRole}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors">
                <Phone className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
              </button>
              <button className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors">
                <Video className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
              </button>
              <button className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors">
                <MoreVertical className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-50 dark:bg-neutral-900/50">
            {messages.map((message, index) => {
              const isOwn = message.senderId === user.id;
              const showAvatar = !isOwn && (index === 0 || messages[index - 1].senderId !== message.senderId);
              
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  {!isOwn && showAvatar && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center text-white text-sm font-bold mr-2 flex-shrink-0">
                      {message.senderName?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {!isOwn && !showAvatar && <div className="w-8 mr-2" />}
                  
                  <div className={`max-w-[70%] ${isOwn ? 'order-1' : ''}`}>
                    <div
                      className={`px-4 py-2 rounded-2xl ${
                        isOwn
                          ? 'bg-gradient-to-r from-primary-500 to-pink-500 text-white rounded-br-sm'
                          : 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 rounded-bl-sm'
                      } shadow-sm`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                    <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <span className="text-xs text-neutral-400">
                        {formatTime(message.createdAt)}
                      </span>
                      {isOwn && (
                        message.isRead ? (
                          <CheckCheck className="w-3 h-3 text-info-500" />
                        ) : (
                          <Check className="w-3 h-3 text-neutral-400" />
                        )
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <form onSubmit={sendMessage} className="p-4 border-t border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 bg-neutral-100 dark:bg-neutral-700 border-0 rounded-xl text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 focus:ring-2 focus:ring-primary-500"
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || sending}
                className="p-3 bg-gradient-to-r from-primary-500 to-pink-500 text-white rounded-xl hover:from-primary-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30 rounded-full flex items-center justify-center">
              <MessageCircle className="w-12 h-12 text-primary-500" />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
              Welcome to Messages
            </h3>
            <p className="text-neutral-500 dark:text-neutral-400 max-w-sm">
              Select a conversation to start messaging or begin a new conversation with a healthcare provider.
            </p>
          </div>
        </div>
      )}

      {/* New Chat Modal */}
      {showNewChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-800 rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
              <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                New Conversation
              </h3>
              <button
                onClick={() => setShowNewChat(false)}
                className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg"
              >
                <X className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
              </button>
            </div>
            <div className="p-4">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search providers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-neutral-100 dark:bg-neutral-700 border-0 rounded-xl text-neutral-900 dark:text-neutral-100 placeholder-neutral-500"
                />
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {user?.role === 'mother' ? (
                  filteredProviders.length > 0 ? (
                    filteredProviders.map((provider) => (
                      <button
                        key={provider.id}
                        onClick={() => startNewChat(provider.id)}
                        className="w-full p-3 flex items-center gap-3 hover:bg-neutral-50 dark:hover:bg-neutral-700 rounded-xl transition-colors text-left"
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center text-white font-bold">
                          {provider.fullName?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                            {provider.fullName}
                          </p>
                          <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${getRoleBadge(provider.role)}`}>
                            {provider.role}
                          </span>
                        </div>
                      </button>
                    ))
                  ) : (
                    <p className="text-center text-neutral-500 py-8">No providers found</p>
                  )
                ) : (
                  <p className="text-center text-neutral-500 py-8">Providers can only start chats from patient list</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;


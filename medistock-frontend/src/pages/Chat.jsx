import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../services/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { 
  Send, 
  Paperclip, 
  Image, 
  FileText, 
  Check, 
  CheckCheck, 
  MessageSquare,
  Smile
} from 'lucide-react';
import { toast } from 'sonner';

const Chat = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef(null);

  // States
  const [selectedUser, setSelectedUser] = useState(null);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [recipientTyping, setRecipientTyping] = useState(false);
  
  // WebSocket Reference
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // 1. Fetch Contact list
  const { data: contacts, isLoading: contactsLoading } = useQuery({
    queryKey: ['chatUsers'],
    queryFn: () => axiosInstance.get('/api/chat/users').then(res => res.data),
    refetchInterval: 5000 // Poll contacts for unread counts and online status updates
  });

  // Connect to WebSocket
  useEffect(() => {
    if (!user) return;

    // Establish WebSocket Connection
    const ws = new WebSocket('ws://localhost:8080/ws-chat');
    socketRef.current = ws;

    ws.onopen = () => {
      console.log('Connected to Chat WebSocket');
      // Register online status
      ws.send(JSON.stringify({
        type: 'ONLINE',
        userId: user.id || 1 // Fallback just in case
      }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'STATUS') {
          // Invalidate contacts query to update online dots
          queryClient.invalidateQueries(['chatUsers']);
        } 
        else if (data.type === 'TYPING') {
          if (selectedUser && selectedUser.id === data.senderId) {
            setRecipientTyping(data.isTyping);
          }
        } 
        else if (data.type === 'MESSAGE') {
          // If receiving message from currently open recipient, add to log and mark read
          if (selectedUser && selectedUser.id === data.senderId) {
            setMessages(prev => [...prev, data.message]);
            // Send READ receipt
            ws.send(JSON.stringify({
              type: 'READ',
              senderId: user.id,
              receiverId: selectedUser.id
            }));
            // Mark read on backend
            axiosInstance.post(`/api/chat/read/${selectedUser.id}`);
          } else {
            // Refetch contacts to update unread badge counts
            queryClient.invalidateQueries(['chatUsers']);
            toast.info(`New message from contact ID: #${data.senderId}`);
          }
        }
        else if (data.type === 'READ') {
          if (selectedUser && selectedUser.id === data.receiverId) {
            // Update messages to double blue tick
            setMessages(prev => prev.map(m => m.receiverId === data.receiverId ? { ...m, read: true } : m));
          }
        }
      } catch (e) {
        console.error("Error parsing socket message:", e);
      }
    };

    ws.onclose = () => {
      console.log('Chat WebSocket connection closed');
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [user, selectedUser]);

  // Load chat history when selected contact changes
  useEffect(() => {
    if (!selectedUser) return;
    
    // Fetch log history from REST API
    axiosInstance.get(`/api/chat/history/${selectedUser.id}`)
      .then(res => {
        setMessages(res.data);
        // Clear unread counts on backend
        axiosInstance.post(`/api/chat/read/${selectedUser.id}`).then(() => {
          queryClient.invalidateQueries(['chatUsers']);
        });
      });

    setRecipientTyping(false);
  }, [selectedUser]);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, recipientTyping]);

  // Handle typing triggers
  const handleInputChange = (e) => {
    setInputText(e.target.value);
    
    if (!selectedUser || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;

    // Send TYPING event
    socketRef.current.send(JSON.stringify({
      type: 'TYPING',
      senderId: user.id,
      receiverId: selectedUser.id,
      isTyping: true
    }));

    // Debounce typing status removal
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current.send(JSON.stringify({
        type: 'TYPING',
        senderId: user.id,
        receiverId: selectedUser.id,
        isTyping: false
      }));
    }, 1500);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedUser) return;

    const textToSend = inputText.trim();
    setInputText('');

    try {
      // 1. Post message to database via REST
      const response = await axiosInstance.post(
        `/api/chat/send?receiverId=${selectedUser.id}&content=${encodeURIComponent(textToSend)}`
      );
      
      const savedMessage = response.data;
      setMessages(prev => [...prev, savedMessage]);

      // 2. Alert receiver in real-time via WebSocket
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({
          type: 'MESSAGE',
          senderId: user.id,
          receiverId: selectedUser.id,
          message: savedMessage
        }));
      }

      // 3. Clear typing status
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      socketRef.current.send(JSON.stringify({
        type: 'TYPING',
        senderId: user.id,
        receiverId: selectedUser.id,
        isTyping: false
      }));

    } catch (error) {
      toast.error("Failed to send message.");
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !selectedUser) return;

    // Simulate upload and send image/pdf link
    const fileType = file.type.includes('pdf') ? 'PDF' : 'IMAGE';
    const mockUrl = fileType === 'PDF' 
      ? 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' 
      : 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500';

    axiosInstance.post(
      `/api/chat/send?receiverId=${selectedUser.id}&content=${encodeURIComponent(file.name)}&messageType=${fileType}&fileUrl=${encodeURIComponent(mockUrl)}`
    ).then(res => {
      const savedMessage = res.data;
      setMessages(prev => [...prev, savedMessage]);
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({
          type: 'MESSAGE',
          senderId: user.id,
          receiverId: selectedUser.id,
          message: savedMessage
        }));
      }
      toast.success(`${fileType} attachment sent!`);
    });
  };

  return (
    <div className="h-[calc(100vh-100px)] flex border border-slate-200/50 dark:border-slate-800/40 rounded-3xl overflow-hidden bg-white dark:bg-slate-900 shadow-lg">
      
      {/* Contact List Sidebar */}
      <div className="w-80 border-r border-slate-200/50 dark:border-slate-800/40 flex flex-col justify-between shrink-0">
        <div className="p-4 border-b border-slate-200/50 dark:border-slate-800/40 text-left">
          <h4 className="font-bold text-slate-800 dark:text-slate-250 flex items-center gap-2">
            <MessageSquare size={18} />
            Workspace Conversations
          </h4>
        </div>
        
        <div className="flex-grow overflow-y-auto p-2 space-y-1">
          {contactsLoading ? (
            <div className="text-center py-6 text-slate-400 text-sm">Loading contacts...</div>
          ) : contacts && contacts.length > 0 ? (
            contacts.map((contact) => (
              <div 
                key={contact.id} 
                onClick={() => setSelectedUser(contact)}
                className={`p-3.5 rounded-2xl flex items-center justify-between cursor-pointer transition-all ${
                  selectedUser?.id === contact.id 
                    ? 'bg-sky-50 dark:bg-sky-950/30 border border-sky-100/50 dark:border-sky-900/30' 
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden text-left">
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-250">
                      {contact.name.charAt(0).toUpperCase()}
                    </div>
                    {/* Online status indicator dot */}
                    <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${
                      contact.online ? 'bg-emerald-500' : 'bg-slate-350'
                    }`}></span>
                  </div>
                  <div className="overflow-hidden">
                    <h5 className="font-semibold text-sm text-slate-800 dark:text-slate-200 truncate">{contact.name}</h5>
                    <p className="text-[10px] text-slate-400 truncate capitalize">{contact.role.toLowerCase()}</p>
                  </div>
                </div>

                {/* Unread badge count */}
                {contact.unread > 0 && (
                  <span className="bg-sky-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                    {contact.unread}
                  </span>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-slate-400 text-sm">No workspace contacts available to chat.</div>
          )}
        </div>
      </div>

      {/* Main Messaging Area */}
      <div className="flex-grow flex flex-col justify-between bg-slate-50/50 dark:bg-slate-950/20">
        {selectedUser ? (
          <>
            {/* Chat Pane Header */}
            <div className="h-16 px-6 border-b border-slate-200/50 dark:border-slate-800/40 bg-white dark:bg-slate-900 flex items-center justify-between text-left shadow-sm">
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{selectedUser.name}</h4>
                <p className="text-[10px] text-slate-400 capitalize">
                  {recipientTyping ? (
                    <span className="text-sky-500 font-semibold animate-pulse">typing...</span>
                  ) : (
                    selectedUser.online ? 'online' : 'offline'
                  )}
                </p>
              </div>
            </div>

            {/* Chat messages log history */}
            <div className="flex-grow overflow-y-auto p-6 space-y-4">
              {messages.map((msg) => {
                const isMine = msg.senderId !== selectedUser.id;
                return (
                  <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] p-3.5 rounded-3xl text-sm text-left shadow-sm flex flex-col ${
                      isMine 
                        ? 'bg-sky-500 text-white rounded-tr-none' 
                        : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200/50 dark:border-slate-800/40 rounded-tl-none'
                    }`}>
                      {msg.messageType === 'TEXT' && (
                        <p>{msg.content}</p>
                      )}
                      {msg.messageType === 'IMAGE' && (
                        <div className="space-y-2">
                          <img src={msg.fileUrl} alt="Shared attachment" className="rounded-2xl max-w-full h-auto max-h-40 object-cover" />
                          <p className="text-[10px] opacity-80">{msg.content}</p>
                        </div>
                      )}
                      {msg.messageType === 'PDF' && (
                        <a 
                          href={msg.fileUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center gap-2 p-2 rounded-xl bg-slate-100/10 text-xs font-semibold hover:underline"
                        >
                          <FileText size={16} />
                          <span className="truncate">{msg.content}</span>
                        </a>
                      )}
                      
                      <div className="flex items-center justify-end gap-1.5 mt-1.5 opacity-60 text-[10px]">
                        <span>{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        {isMine && (
                          msg.isRead ? <CheckCheck size={12} className="text-sky-200" /> : <Check size={12} />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {recipientTyping && (
                <div className="flex justify-start">
                  <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl rounded-tl-none flex gap-1 items-center">
                    <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"></span>
                    <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce delay-100"></span>
                    <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce delay-200"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Message Form */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200/50 dark:border-slate-800/40 bg-white dark:bg-slate-900 flex items-center gap-3">
              {/* Attachment selector */}
              <label className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                <Paperclip size={18} />
                <input 
                  type="file" 
                  onChange={handleFileUpload} 
                  className="hidden" 
                  accept="image/*,application/pdf"
                />
              </label>

              <input 
                type="text" 
                placeholder="Type your message..."
                value={inputText}
                onChange={handleInputChange}
                className="flex-grow bg-slate-100 dark:bg-slate-800/50 text-slate-800 dark:text-slate-250 px-4 py-2.5 rounded-2xl text-sm border border-transparent focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
              />

              <button 
                type="submit"
                className="p-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl transition-all shadow-sm shrink-0"
              >
                <Send size={16} />
              </button>
            </form>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
            <MessageSquare size={36} />
            <span className="text-sm font-semibold">Select a workspace contact to start messaging.</span>
          </div>
        )}
      </div>

    </div>
  );
};

export default Chat;

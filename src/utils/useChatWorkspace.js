import { useEffect, useMemo, useState } from 'react';
import { appendChatMessage, getChatMessages, getUserConversationPartners } from './chatStorage';

export const useChatWorkspace = ({ currentUserId, users, userName }) => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [chatSearchTerm, setChatSearchTerm] = useState('');
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    if (!selectedChat || !currentUserId) {
      setMessages([]);
      return;
    }
    setMessages(getChatMessages(currentUserId, selectedChat.id));
  }, [selectedChat, currentUserId]);

  useEffect(() => {
    if (!currentUserId || users.length === 0) return undefined;

    const sync = () => {
      setConversations(getUserConversationPartners(currentUserId, users));
      if (selectedChat) setMessages(getChatMessages(currentUserId, selectedChat.id));
    };

    sync();
    const intervalId = window.setInterval(sync, 1000);
    const handleStorage = (e) => {
      if (!e.key || e.key.startsWith('chatThread:')) sync();
    };

    window.addEventListener('storage', handleStorage);
    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('storage', handleStorage);
    };
  }, [currentUserId, users, selectedChat]);

  const searchedUsers = useMemo(() => {
    const term = chatSearchTerm.trim().toLowerCase();
    if (!term) return [];
    return users.filter((u) => `${u.nome || ''} ${u.email || ''}`.toLowerCase().includes(term));
  }, [chatSearchTerm, users]);

  const sendMessage = () => {
    if (!message.trim() || !selectedChat || !currentUserId) return;

    const newMessage = {
      id: `${currentUserId}-${selectedChat.id}-${Date.now()}`,
      mensagem: message.trim(),
      dataChat: new Date().toISOString(),
      statusChat: 'Enviado',
      remetenteId: Number(currentUserId),
      destinatarioId: Number(selectedChat.id),
      remetenteNome: userName,
    };

    const nextMessages = appendChatMessage(currentUserId, selectedChat.id, newMessage);
    setMessages(nextMessages);
    setConversations(getUserConversationPartners(currentUserId, users));
    setMessage('');
  };

  const handleSelectChat = (user) => {
    setSelectedChat(user);
    setMessages(getChatMessages(currentUserId, user.id));
  };

  return {
    selectedChat,
    message,
    setMessage,
    messages,
    conversations,
    chatSearchTerm,
    setChatSearchTerm,
    searchedUsers,
    sendMessage,
    handleSelectChat,
  };
};

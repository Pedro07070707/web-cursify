import { useEffect, useMemo, useState } from 'react';
import api from './api';

const normalize = (row) => ({
  id: row.id,
  mensagem: row.mensagem?.conteudo || row.conteudo,
  dataChat: row.dataChat || row.mensagem?.dataMensagem,
  statusChat: row.statusChat,
  remetenteId: Number(row.remetenteId),
  destinatarioId: Number(row.destinatarioId),
  remetenteNome: row.remetente,
  cursoNome: row.cursoNome,
});

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
    api.get(`/chat/conversa/${currentUserId}/${selectedChat.id}`).then(({ data }) => setMessages(data.map(normalize))).catch(() => setMessages([]));
  }, [selectedChat, currentUserId]);

  useEffect(() => {
    if (!currentUserId || users.length === 0) return undefined;

    const sync = async () => {
      const rows = await Promise.all(users.map(async (user) => {
        const { data } = await api.get(`/chat/conversa/${currentUserId}/${user.id}`);
        const last = data.length ? normalize(data[data.length - 1]) : null;
        return { ...user, lastMessage: last ? { mensagem: last.mensagem, dataChat: last.dataChat, cursoNome: last.cursoNome } : null };
      }));
      // Exibe todos os contatos com os quais o usuário pode conversar,
      // inclusive aqueles que ainda não possuem mensagens.
      setConversations(rows.sort((a, b) => {
        if (!a.lastMessage) return 1;
        if (!b.lastMessage) return -1;
        return new Date(b.lastMessage.dataChat) - new Date(a.lastMessage.dataChat);
      }));
      if (selectedChat) {
        const { data } = await api.get(`/chat/conversa/${currentUserId}/${selectedChat.id}`);
        setMessages(data.map(normalize));
      }
    };

    sync();
    const intervalId = window.setInterval(sync, 1000);
    const handleStorage = (e) => {
      if (!e.key) sync();
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

    api.post('/chat', { remetente: userName, remetenteId: Number(currentUserId), destinatarioId: Number(selectedChat.id), usuarioId: Number(currentUserId), mensagem: { conteudo: message.trim(), dataMensagem: new Date().toISOString(), statusMensagem: 'Enviado' } })
      .then(({ data }) => { setMessages((current) => [...current, normalize(data)]); setMessage(''); })
      .catch((error) => {
        console.error('Erro ao enviar mensagem:', error);
        window.alert(error.response?.data?.message || 'Não foi possível enviar a mensagem.');
      });
  };

  const handleSelectChat = (user) => {
    setSelectedChat(user);
    api.get(`/chat/conversa/${currentUserId}/${user.id}`).then(({ data }) => setMessages(data.map(normalize)));
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

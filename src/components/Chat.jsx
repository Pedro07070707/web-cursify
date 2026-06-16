import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AppHeader from './AppHeader';
import ChatWorkspace from './ChatWorkspace';
import { getChatMessages, appendChatMessage, getUserConversationPartners } from '../utils/chatStorage';
import { getDashboardPathByRole } from '../utils/ui';
import { useTheme } from '../utils/theme';

function Chat() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const nivelAcesso = localStorage.getItem('nivelAcesso');
  const userType = nivelAcesso === 'PROFESSOR' ? 'teacher' : nivelAcesso === 'ADMIN' ? 'admin' : 'student';
  const userName = localStorage.getItem('userName') || 'Usuario';
  const currentUserId = localStorage.getItem('userId');
  const dashboardPath = getDashboardPathByRole(nivelAcesso);

  const refreshConversations = (availableUsers) => {
    if (!currentUserId) {
      setConversations([]);
      return;
    }

    setConversations(getUserConversationPartners(currentUserId, availableUsers));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersResponse = await axios.get('http://localhost:8080/api/v1/usuario');
        const allUsers = usersResponse.data || [];

        let filteredUsers = [];
        if (userType === 'teacher') {
          filteredUsers = allUsers.filter((user) => (
            (user.nivelAcesso === 'ESTUDANTE' || user.nivelAcesso === 'ALUNO')
            && user.id !== parseInt(currentUserId, 10)
          ));
        } else if (userType === 'student') {
          filteredUsers = allUsers.filter((user) => (
            user.nivelAcesso === 'PROFESSOR' && user.id !== parseInt(currentUserId, 10)
          ));
        } else {
          filteredUsers = allUsers.filter((user) => user.id !== parseInt(currentUserId, 10));
        }

        setUsers(filteredUsers);
        refreshConversations(filteredUsers);
      } catch (error) {
        console.error('Erro ao carregar dados do chat:', error);
      }
    };

    fetchData();
  }, [userType, currentUserId]);

  useEffect(() => {
    if (!currentUserId || users.length === 0) return undefined;

    const syncConversations = () => {
      refreshConversations(users);
      if (selectedChat) {
        setMessages(getChatMessages(currentUserId, selectedChat.id));
      }
    };

    syncConversations();

    const intervalId = window.setInterval(syncConversations, 1000);
    const handleStorage = (event) => {
      if (!event.key || event.key.startsWith('chatThread:')) {
        syncConversations();
      }
    };

    window.addEventListener('storage', handleStorage);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('storage', handleStorage);
    };
  }, [currentUserId, users, selectedChat]);

  useEffect(() => {
    if (!selectedChat || !currentUserId) {
      setMessages([]);
      return;
    }

    setMessages(getChatMessages(currentUserId, selectedChat.id));
  }, [selectedChat, currentUserId]);

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
    refreshConversations(users);
    setMessage('');
  };

  const searchedUsers = useMemo(() => {
    const normalizedTerm = searchTerm.trim().toLowerCase();
    if (!normalizedTerm) return [];

    return users.filter((user) => (
      `${user.nome || ''} ${user.email || ''}`.toLowerCase().includes(normalizedTerm)
    ));
  }, [searchTerm, users]);

  return (
    <div className="page-shell">
      <AppHeader
        subtitle="Chat"
        onHome={() => navigate('/')}
        navItems={[
          ...(nivelAcesso !== 'ADMIN'
            ? [{ label: 'Meus cursos', onClick: () => navigate(dashboardPath, { state: { section: 'courses' } }) }]
            : [{ label: 'Painel', onClick: () => navigate(dashboardPath, { state: { section: 'panel' } }) }]),
          { label: 'Chat', onClick: () => navigate('/chat'), active: true },
        ]}
        onGoProfile={() => navigate('/profile')}
        onLogout={() => {
          localStorage.clear();
          navigate('/');
        }}
        onToggleTheme={toggleTheme}
        theme={theme}
      />

      <main className="container dashboard-layout">
        <ChatWorkspace
          selectedChat={selectedChat}
          message={message}
          onMessageChange={setMessage}
          onSendMessage={sendMessage}
          messages={messages}
          conversations={conversations}
          searchedUsers={searchedUsers}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSelectChat={(user) => {
            setSelectedChat(user);
            setMessages(getChatMessages(currentUserId, user.id));
          }}
          currentUserId={currentUserId}
        />
      </main>
    </div>
  );
}

export default Chat;

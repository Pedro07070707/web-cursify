import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import AppHeader from './AppHeader';
import ChatWorkspace from './ChatWorkspace';
import { getDashboardPathByRole, isAdminRole, isTeacherRole, normalizeRole } from '../utils/ui';
import { useTheme } from '../utils/theme';
import { useChatWorkspace } from '../utils/useChatWorkspace';

function Chat() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [users, setUsers] = useState([]);
  const nivelAcesso = localStorage.getItem('nivelAcesso');
  const normalizedRole = normalizeRole(nivelAcesso);
  const userType = isAdminRole(normalizedRole) ? 'admin' : isTeacherRole(normalizedRole) ? 'teacher' : 'student';
  const userName = localStorage.getItem('userName') || 'Usuario';
  const rawUserId = localStorage.getItem('userId');
  const currentUserId = rawUserId ? Number(rawUserId) : null;
  const dashboardPath = getDashboardPathByRole(nivelAcesso);

  const chat = useChatWorkspace({ currentUserId, users, userName });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersResponse = await api.get('/usuario');
        const allUsers = usersResponse.data || [];
        const filteredUsers = allUsers.filter((user) => Number(user.id) !== currentUserId);
        setUsers(filteredUsers);
      } catch (error) {
        console.error('Erro ao carregar dados do chat:', error);
      }
    };

    fetchData();
  }, [userType, currentUserId]);

  const searchedUsers = useMemo(() => {
    const normalizedTerm = chat.chatSearchTerm.trim().toLowerCase();
    if (!normalizedTerm) return [];
    return users.filter((u) => `${u.nome || ''} ${u.email || ''}`.toLowerCase().includes(normalizedTerm));
  }, [chat.chatSearchTerm, users]);

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
          selectedChat={chat.selectedChat}
          message={chat.message}
          onMessageChange={chat.setMessage}
          onSendMessage={chat.sendMessage}
          messages={chat.messages}
          conversations={chat.conversations}
          searchedUsers={searchedUsers}
          searchTerm={chat.chatSearchTerm}
          onSearchChange={chat.setChatSearchTerm}
          onSelectChat={chat.handleSelectChat}
          currentUserId={currentUserId}
        />
      </main>
    </div>
  );
}

export default Chat;

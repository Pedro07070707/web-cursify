import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AppHeader from './AppHeader';
import ChatWorkspace from './ChatWorkspace';
import DirectorySearchSection from './DirectorySearchSection';
import InlineAlert from './InlineAlert';
import { clearSessionData } from '../utils/authStorage';
import { appendChatMessage, getChatMessages, getUserConversationPartners } from '../utils/chatStorage';
import { formatCourseDuration, getUserRoleLabel, NIVEIS } from '../utils/ui';
import { useTheme } from '../utils/theme';

function AdminDashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [activeSection, setActiveSection] = useState(location.state?.section || 'home');
  const [panelTab, setPanelTab] = useState('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [chatSearchTerm, setChatSearchTerm] = useState('');
  const [conversations, setConversations] = useState([]);
  const [feedback, setFeedback] = useState({ type: 'info', message: '' });
  const currentUserId = Number(localStorage.getItem('userId'));
  const isUserActive = (statusUsuario) => statusUsuario === true || statusUsuario === 'Ativo';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersResponse, coursesResponse] = await Promise.all([
          axios.get('http://localhost:8080/api/v1/usuario'),
          axios.get('http://localhost:8080/api/v1/curso'),
        ]);

        const fetchedUsers = usersResponse.data || [];
        const fetchedCourses = coursesResponse.data || [];

        setUsers(fetchedUsers);
        setCourses(fetchedCourses);
        setConversations(
          getUserConversationPartners(
            currentUserId,
            fetchedUsers.filter((user) => Number(user.id) !== currentUserId)
          )
        );
      } catch (error) {
        console.error('Erro ao carregar dados do admin:', error);
        setFeedback({ type: 'error', message: 'Erro ao carregar dados. Verifique a API.' });
      }
    };

    fetchData();
  }, [currentUserId]);

  const availableUsers = useMemo(
    () => users.filter((user) => Number(user.id) !== currentUserId),
    [users, currentUserId]
  );

  useEffect(() => {
    if (!selectedChat || !currentUserId) {
      setMessages([]);
      return;
    }

    setMessages(getChatMessages(currentUserId, selectedChat.id));
  }, [selectedChat, currentUserId]);

  useEffect(() => {
    if (!currentUserId || availableUsers.length === 0) return undefined;

    const syncConversations = () => {
      setConversations(getUserConversationPartners(currentUserId, availableUsers));
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
  }, [currentUserId, availableUsers, selectedChat]);

  const searchResults = useMemo(() => {
    const normalizedTerm = searchTerm.trim().toLowerCase();
    if (!normalizedTerm) return { courses: [], users: [] };

    return {
      courses: courses.filter((course) => (`${course.nome || ''} ${course.descricao || ''}`).toLowerCase().includes(normalizedTerm)),
      users: availableUsers.filter((user) => (`${user.nome || ''} ${user.email || ''}`).toLowerCase().includes(normalizedTerm)),
    };
  }, [courses, availableUsers, searchTerm]);

  const searchedUsers = useMemo(() => {
    const normalizedTerm = chatSearchTerm.trim().toLowerCase();
    if (!normalizedTerm) return [];

    return availableUsers.filter((user) => (
      `${user.nome || ''} ${user.email || ''}`.toLowerCase().includes(normalizedTerm)
    ));
  }, [chatSearchTerm, availableUsers]);

  const sendMessage = () => {
    if (!message.trim() || !selectedChat || !currentUserId) return;

    const newMessage = {
      id: `${currentUserId}-${selectedChat.id}-${Date.now()}`,
      mensagem: message.trim(),
      dataChat: new Date().toISOString(),
      statusChat: 'Enviado',
      remetenteId: Number(currentUserId),
      destinatarioId: Number(selectedChat.id),
    };

    const nextMessages = appendChatMessage(currentUserId, selectedChat.id, newMessage);
    setMessages(nextMessages);
    setConversations(getUserConversationPartners(currentUserId, availableUsers));
    setMessage('');
  };

  const handleUpdateStatus = async (userId, userDisplayName) => {
    const user = users.find((item) => item.id === userId);
    const newStatus = isUserActive(user.statusUsuario) ? 'Inativo' : 'Ativo';

    try {
      await axios.put(`http://localhost:8080/api/v1/usuario/${userId}`, {
        ...user,
        statusUsuario: newStatus,
      });

      setUsers((currentUsers) => currentUsers.map((item) => (
        item.id === userId ? { ...item, statusUsuario: newStatus } : item
      )));
      setFeedback({ type: 'success', message: `Usuario atualizado: ${userDisplayName}.` });
    } catch (error) {
      console.error('Erro ao atualizar usuario:', error);
      setFeedback({ type: 'error', message: 'Erro ao atualizar status do usuario.' });
    }
  };

  const handleDeleteUser = async (userId, userDisplayName) => {
    try {
      await axios.delete(`http://localhost:8080/api/v1/usuario/${userId}`);
      setUsers((currentUsers) => currentUsers.filter((item) => item.id !== userId));
      setFeedback({ type: 'success', message: `Usuario excluido: ${userDisplayName}.` });
    } catch (error) {
      console.error('Erro ao excluir usuario:', error);
      setFeedback({ type: 'error', message: 'Erro ao excluir o usuario.' });
    }
  };

  const handleDeleteCourse = async (courseId, courseName) => {
    try {
      await axios.delete(`http://localhost:8080/api/v1/curso/${courseId}`);
      setCourses((currentCourses) => currentCourses.filter((item) => item.id !== courseId));
      setFeedback({ type: 'success', message: `Curso excluido: ${courseName}.` });
    } catch (error) {
      console.error('Erro ao excluir curso:', error);
      setFeedback({ type: 'error', message: 'Erro ao excluir o curso.' });
    }
  };

  const handleLogout = () => {
    clearSessionData();
    navigate('/');
  };

  return (
    <div className="page-shell">
      <AppHeader
        subtitle="Area do administrador"
        onHome={() => navigate('/')}
        navItems={[
          { label: 'Chat', onClick: () => setActiveSection('chat'), active: activeSection === 'chat' },
          { label: 'Painel', onClick: () => setActiveSection('panel'), active: activeSection === 'panel' },
        ]}
        onGoProfile={() => navigate('/profile')}
        onLogout={handleLogout}
        onToggleTheme={toggleTheme}
        theme={theme}
      />

      <main className="container dashboard-layout">
        <DirectorySearchSection
          minimal
          searchTerm={searchTerm}
          onSearchChange={(value) => {
            setSearchTerm(value);
            setActiveSection('home');
          }}
          results={searchResults}
          onOpenCourse={(course) => navigate(`/course-view/${course.id}`)}
          onUserAction={() => navigate('/profile')}
        />

        <InlineAlert type={feedback.type} message={feedback.message} />

        {activeSection === 'home' ? (
          <>
            <section className="dash-hero panel-card">
              <div className="dash-hero-text">
                <span className="section-badge">Área administrativa</span>
                <h1 className="dash-hero-title">Painel da plataforma 🛡️</h1>
                <p className="dash-hero-desc">
                  Gerencie usuários, cursos e conversas em uma visão única e centralizada.
                </p>
                <div className="hero-actions">
                  <button type="button" className="btn btn-primary btn-hero" onClick={() => setActiveSection('panel')}>
                    Abrir painel
                  </button>
                  <button type="button" className="btn btn-ghost btn-hero" onClick={() => setActiveSection('chat')}>
                    Chat
                  </button>
                </div>
              </div>
              <div className="dash-hero-stats">
                <div className="dash-stat-card">
                  <div className="dash-stat-icon dash-stat-icon-blue">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  </div>
                  <strong>{users.length}</strong>
                  <span>usuários totais</span>
                </div>
                <div className="dash-stat-card">
                  <div className="dash-stat-icon dash-stat-icon-green">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <strong>{users.filter((u) => isUserActive(u.statusUsuario)).length}</strong>
                  <span>contas ativas</span>
                </div>
                <div className="dash-stat-card">
                  <div className="dash-stat-icon dash-stat-icon-blue">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                  </div>
                  <strong>{courses.length}</strong>
                  <span>cursos publicados</span>
                </div>
                <div className="dash-stat-card">
                  <div className="dash-stat-icon dash-stat-icon-green">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                  </div>
                  <strong>{users.filter((u) => u.nivelAcesso === 'PROFESSOR').length}</strong>
                  <span>professores</span>
                </div>
              </div>
            </section>

            <section className="dash-summary-grid">
              <article className="dash-summary-card">
                <div className="feature-icon-wrap feature-icon-blue">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
                </div>
                <h3>Fluxo principal</h3>
                <p>Acesse o painel para moderar usuários e cursos com ações rápidas de ativar, inativar e excluir.</p>
              </article>
              <article className="dash-summary-card">
                <div className="feature-icon-wrap feature-icon-green">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                </div>
                <h3>Busca unificada</h3>
                <p>Pesquise cursos e usuários na caixa acima com resultados separados por tópico.</p>
              </article>
              <article className="dash-summary-card">
                <div className="feature-icon-wrap feature-icon-blue">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                </div>
                <h3>Chat administrativo</h3>
                <p>Converse com qualquer perfil da plataforma para acompanhar casos específicos.</p>
              </article>
            </section>
          </>
        ) : null}

        {activeSection === 'chat' ? (
          <ChatWorkspace
            selectedChat={selectedChat}
            message={message}
            onMessageChange={setMessage}
            onSendMessage={sendMessage}
            messages={messages}
            conversations={conversations}
            searchedUsers={searchedUsers}
            searchTerm={chatSearchTerm}
            onSearchChange={setChatSearchTerm}
            onSelectChat={(user) => {
              setSelectedChat(user);
              setMessages(getChatMessages(currentUserId, user.id));
            }}
            currentUserId={currentUserId}
          />
        ) : null}

        {activeSection === 'panel' ? (
          <section className="panel-card section-stack">
            <div className="section-heading section-heading-inline">
              <div>
                <span className="section-kicker">Painel</span>
                <h3>Administracao da plataforma</h3>
              </div>
              <div className="segmented-tabs">
                <button
                  type="button"
                  className={`segmented-tab${panelTab === 'users' ? ' is-active' : ''}`}
                  onClick={() => setPanelTab('users')}
                >
                  Usuarios
                </button>
                <button
                  type="button"
                  className={`segmented-tab${panelTab === 'courses' ? ' is-active' : ''}`}
                  onClick={() => setPanelTab('courses')}
                >
                  Cursos
                </button>
              </div>
            </div>

            {panelTab === 'users' ? (
              <div className="table-shell">
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>Email</th>
                      <th>CPF</th>
                      <th>Tipo</th>
                      <th>Status</th>
                      <th>Registro</th>
                      <th>Acoes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.nome}</td>
                        <td>{user.email}</td>
                        <td>{user.cpf || '-'}</td>
                        <td>{getUserRoleLabel(user.nivelAcesso)}</td>
                        <td>{isUserActive(user.statusUsuario) ? 'Ativo' : 'Inativo'}</td>
                        <td>
                          {user.dataCadastro
                            ? new Date(user.dataCadastro).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                            })
                            : '-'}
                        </td>
                        <td>
                          <div className="table-actions">
                            <button type="button" className="btn btn-ghost" onClick={() => handleUpdateStatus(user.id, user.nome)}>
                              {isUserActive(user.statusUsuario) ? 'Inativar' : 'Ativar'}
                            </button>
                            <button type="button" className="btn btn-danger" onClick={() => handleDeleteUser(user.id, user.nome)}>
                              Excluir
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}

            {panelTab === 'courses' ? (
              <div className="course-grid modern-grid">
                {courses.map((course) => (
                  <article key={course.id} className="course-card modern-card">
                    <div className="course-card-body" onClick={() => navigate(`/course-view/${course.id}`)}>
                      <span className="course-tag">{NIVEIS[course.categoria] || course.categoria}</span>
                      <h3>{course.nome}</h3>
                      <p>{course.descricao}</p>
                      <small>{formatCourseDuration(course)}</small>
                    </div>
                    <button type="button" className="btn btn-danger" onClick={() => handleDeleteCourse(course.id, course.nome)}>
                      Excluir
                    </button>
                  </article>
                ))}
              </div>
            ) : null}
          </section>
        ) : null}
      </main>
    </div>
  );
}

export default AdminDashboardPage;

import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AppHeader from './AppHeader';
import ChatWorkspace from './ChatWorkspace';
import DirectorySearchSection from './DirectorySearchSection';
import InlineAlert from './InlineAlert';
import { clearSessionData } from '../utils/authStorage';
import { appendChatMessage, getChatMessages, getUserConversationPartners } from '../utils/chatStorage';
import { formatCourseDuration, NIVEIS } from '../utils/ui';
import { useTheme } from '../utils/theme';

function TeacherDashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [chatUsers, setChatUsers] = useState([]);
  const [activeSection, setActiveSection] = useState(location.state?.section || 'home');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [chatSearchTerm, setChatSearchTerm] = useState('');
  const [conversations, setConversations] = useState([]);
  const [feedback, setFeedback] = useState({ type: 'info', message: '' });
  const userName = localStorage.getItem('userName') || 'Professor';
  const currentUserId = Number(localStorage.getItem('userId'));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesResponse, usersResponse] = await Promise.all([
          axios.get('http://localhost:8080/api/v1/curso'),
          axios.get('http://localhost:8080/api/v1/usuario'),
        ]);

        const fetchedCourses = coursesResponse.data || [];
        const fetchedUsers = (usersResponse.data || []).filter((user) => Number(user.id) !== currentUserId);
        const availableChatUsers = fetchedUsers.filter(
          (user) => user.nivelAcesso === 'ESTUDANTE' || user.nivelAcesso === 'ALUNO'
        );

        setCourses(fetchedCourses);
        setUsers(fetchedUsers);
        setChatUsers(availableChatUsers);
        setConversations(getUserConversationPartners(currentUserId, availableChatUsers));
      } catch (error) {
        console.error('Erro ao carregar dados do professor:', error);
        setFeedback({ type: 'error', message: 'Erro ao carregar dados. Verifique a API.' });
      }
    };

    fetchData();
  }, [currentUserId]);

  useEffect(() => {
    if (!selectedChat || !currentUserId) {
      setMessages([]);
      return;
    }

    setMessages(getChatMessages(currentUserId, selectedChat.id));
  }, [selectedChat, currentUserId]);

  useEffect(() => {
    if (!currentUserId || chatUsers.length === 0) return undefined;

    const syncConversations = () => {
      setConversations(getUserConversationPartners(currentUserId, chatUsers));
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
  }, [currentUserId, chatUsers, selectedChat]);

  const teacherCourses = useMemo(() => {
    const ownedCourses = courses.filter((course) => (
      Number(course.usuarioId) === currentUserId
      || Number(course.idUsuario) === currentUserId
      || Number(course.usuario?.id) === currentUserId
    ));

    return ownedCourses.length ? ownedCourses : courses;
  }, [courses, currentUserId]);

  const searchResults = useMemo(() => {
    const normalizedTerm = searchTerm.trim().toLowerCase();
    if (!normalizedTerm) return { courses: [], users: [] };

    return {
      courses: courses.filter((course) => (`${course.nome || ''} ${course.descricao || ''}`).toLowerCase().includes(normalizedTerm)),
      users: users.filter((user) => (`${user.nome || ''} ${user.email || ''}`).toLowerCase().includes(normalizedTerm)),
    };
  }, [courses, users, searchTerm]);

  const searchedUsers = useMemo(() => {
    const normalizedTerm = chatSearchTerm.trim().toLowerCase();
    if (!normalizedTerm) return [];

    return chatUsers.filter((user) => (
      `${user.nome || ''} ${user.email || ''}`.toLowerCase().includes(normalizedTerm)
    ));
  }, [chatSearchTerm, chatUsers]);

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
    setConversations(getUserConversationPartners(currentUserId, chatUsers));
    setMessage('');
  };

  const handleDelete = async (id, nome) => {
    try {
      await axios.delete(`http://localhost:8080/api/v1/curso/${id}`);
      setCourses((currentCourses) => currentCourses.filter((course) => course.id !== id));
      setFeedback({ type: 'success', message: `Curso excluido com sucesso: ${nome}.` });
    } catch (error) {
      console.error('Erro ao excluir curso:', error);
      setFeedback({ type: 'error', message: 'Erro ao excluir o curso. Tente novamente.' });
    }
  };

  const handleLogout = () => {
    clearSessionData();
    navigate('/');
  };

  return (
    <div className="page-shell">
      <AppHeader
        subtitle="Area do professor"
        onHome={() => navigate('/')}
        navItems={[
          { label: 'Meus cursos', onClick: () => setActiveSection('courses'), active: activeSection === 'courses' },
          { label: 'Chat', onClick: () => setActiveSection('chat'), active: activeSection === 'chat' },
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
                <span className="section-badge">Área do professor</span>
                <h1 className="dash-hero-title">Olá, {userName} ✍️</h1>
                <p className="dash-hero-desc">
                  Gerencie seus cursos, acompanhe as interações e converse com seus alunos em um único lugar.
                </p>
                <div className="hero-actions">
                  <button type="button" className="btn btn-primary btn-hero" onClick={() => setActiveSection('courses')}>
                    Meus cursos
                  </button>
                  <button type="button" className="btn btn-ghost btn-hero" onClick={() => navigate('/publish-course')}>
                    Publicar curso
                  </button>
                </div>
              </div>
              <div className="dash-hero-stats">
                <div className="dash-stat-card">
                  <div className="dash-stat-icon dash-stat-icon-blue">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                  </div>
                  <strong>{teacherCourses.length}</strong>
                  <span>cursos publicados</span>
                </div>
                <div className="dash-stat-card">
                  <div className="dash-stat-icon dash-stat-icon-green">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                  </div>
                  <strong>{chatUsers.length}</strong>
                  <span>alunos no chat</span>
                </div>
                <div className="dash-stat-card">
                  <div className="dash-stat-icon dash-stat-icon-blue">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  </div>
                  <strong>{users.filter((u) => u.nivelAcesso === 'PROFESSOR').length + 1}</strong>
                  <span>professores</span>
                </div>
                <div className="dash-stat-card">
                  <div className="dash-stat-icon dash-stat-icon-green">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                  </div>
                  <strong>{courses.length}</strong>
                  <span>total de cursos</span>
                </div>
              </div>
            </section>

            <section className="dash-summary-grid">
              <article className="dash-summary-card">
                <div className="feature-icon-wrap feature-icon-blue">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
                </div>
                <h3>Visão geral</h3>
                <p>Gerencie seus cursos e acompanhe as interações com alunos de forma centralizada.</p>
              </article>
              <article className="dash-summary-card">
                <div className="feature-icon-wrap feature-icon-green">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                </div>
                <h3>Publicação centralizada</h3>
                <p>Publique e edite cursos diretamente pela seção Meus cursos ou pelo botão acima.</p>
              </article>
              <article className="dash-summary-card">
                <div className="feature-icon-wrap feature-icon-blue">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                </div>
                <h3>Busca unificada</h3>
                <p>Pesquise cursos e usuários na caixa acima, com resultados separados por tópico.</p>
              </article>
            </section>
          </>
        ) : null}

        {activeSection === 'courses' ? (
          <section className="panel-card section-stack">
            <div className="section-heading section-heading-inline">
              <div>
                <span className="section-kicker">Meus cursos</span>
                <h3>Todos os cursos publicados pelo professor</h3>
              </div>
              <button type="button" className="btn btn-primary" onClick={() => navigate('/publish-course')}>
                Publicar curso
              </button>
            </div>

            {teacherCourses.length ? (
              <div className="course-grid modern-grid">
                {teacherCourses.map((course) => (
                  <article key={course.id} className="course-card modern-card">
                    <div className="course-card-body" onClick={() => navigate(`/course-view/${course.id}`)}>
                      <span className="course-tag">{NIVEIS[course.categoria] || course.categoria}</span>
                      <h3>{course.nome}</h3>
                      <p>{course.descricao}</p>
                      <small>{formatCourseDuration(course)}</small>
                    </div>
                    <div className="card-button-row">
                      <button type="button" className="btn btn-ghost" onClick={() => navigate(`/update-course/${course.id}`)}>
                        Editar
                      </button>
                      <button type="button" className="btn btn-danger" onClick={() => handleDelete(course.id, course.nome)}>
                        Excluir
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-state-card">
                <h4>Nenhum curso publicado</h4>
                <p>Publique um novo curso para comecar a preencher sua area.</p>
              </div>
            )}
          </section>
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
      </main>
    </div>
  );
}

export default TeacherDashboardPage;

import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AppHeader from './AppHeader';
import ChatWorkspace from './ChatWorkspace';
import DirectorySearchSection from './DirectorySearchSection';
import InlineAlert from './InlineAlert';
import { getUserCourseEntry, getUserCourseState, removeUserCourseEntry, saveUserCourseEntry } from '../utils/userCourseState';
import { clearSessionData } from '../utils/authStorage';
import { appendChatMessage, getChatMessages, getUserConversationPartners } from '../utils/chatStorage';
import { formatCourseDuration, getCourseStatusLabel, NIVEIS } from '../utils/ui';
import { useTheme } from '../utils/theme';

function StudentDashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [allCourses, setAllCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeSection, setActiveSection] = useState(location.state?.section || 'home');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [chatSearchTerm, setChatSearchTerm] = useState('');
  const [conversations, setConversations] = useState([]);
  const [courseStateTick, setCourseStateTick] = useState(0);
  const [feedback, setFeedback] = useState({ type: 'info', message: '' });
  const userName = localStorage.getItem('userName') || 'Aluno';
  const currentUserId = Number(localStorage.getItem('userId'));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesResponse, usersResponse] = await Promise.all([
          axios.get('http://localhost:8080/api/v1/curso'),
          axios.get('http://localhost:8080/api/v1/usuario'),
        ]);

        const visibleCourses = (coursesResponse.data || []).filter(
          (course) => course.statusCurso !== false && course.statusCurso !== 'Inativo'
        );
        const visibleUsers = (usersResponse.data || []).filter((user) => Number(user.id) !== currentUserId);

        setAllCourses(visibleCourses);
        setUsers(visibleUsers);
        setConversations(getUserConversationPartners(currentUserId, visibleUsers));
      } catch (error) {
        console.error('Erro ao carregar dados do aluno:', error);
        setFeedback({ type: 'error', message: 'Erro ao carregar dados. Verifique a API.' });
      }
    };

    fetchData();
  }, [currentUserId]);

  useEffect(() => {
    const syncCourseState = () => setCourseStateTick((value) => value + 1);
    const intervalId = window.setInterval(syncCourseState, 1500);
    const handleStorage = (event) => {
      if (!event.key || event.key.startsWith('userCourseState:')) {
        syncCourseState();
      }
    };

    window.addEventListener('storage', handleStorage);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  useEffect(() => {
    if (!selectedChat || !currentUserId) {
      setMessages([]);
      return;
    }

    setMessages(getChatMessages(currentUserId, selectedChat.id));
  }, [selectedChat, currentUserId]);

  useEffect(() => {
    if (!currentUserId || users.length === 0) return undefined;

    const syncConversations = () => {
      setConversations(getUserConversationPartners(currentUserId, users));
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

  const searchResults = useMemo(() => {
    const normalizedTerm = searchTerm.trim().toLowerCase();
    if (!normalizedTerm) return { courses: [], users: [] };

    return {
      courses: allCourses.filter((course) => (
        `${course.nome || ''} ${course.descricao || ''}`.toLowerCase().includes(normalizedTerm)
      )),
      users: users.filter((user) => (
        `${user.nome || ''} ${user.email || ''}`.toLowerCase().includes(normalizedTerm)
      )),
    };
  }, [allCourses, users, searchTerm]);

  const enrolledCourses = useMemo(() => {
    const userCourseState = getUserCourseState(currentUserId);

    return allCourses
      .filter((course) => userCourseState[String(course.id)]?.enrolled)
      .map((course) => ({
        ...course,
        userStatus: userCourseState[String(course.id)]?.status || 'Em progresso',
      }));
  }, [allCourses, currentUserId, courseStateTick]);

  const completedCount = useMemo(
    () => enrolledCourses.filter((course) => getCourseStatusLabel(course.userStatus) === 'Concluido').length,
    [enrolledCourses]
  );

  const searchedUsers = useMemo(() => {
    const normalizedTerm = chatSearchTerm.trim().toLowerCase();
    if (!normalizedTerm) return [];

    return users.filter((user) => (
      `${user.nome || ''} ${user.email || ''}`.toLowerCase().includes(normalizedTerm)
    ));
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

  const handleToggleCourse = (course) => {
    const existingEntry = getUserCourseEntry(currentUserId, course.id);

    if (existingEntry?.enrolled) {
      removeUserCourseEntry(currentUserId, course.id);
      setCourseStateTick((value) => value + 1);
      setFeedback({ type: 'success', message: `Curso removido: ${course.nome}.` });
      return;
    }

    saveUserCourseEntry(currentUserId, course.id, {
      enrolled: true,
      status: 'Em progresso',
    });
    setCourseStateTick((value) => value + 1);
    setFeedback({ type: 'success', message: `Curso adicionado: ${course.nome}.` });
  };

  const handleLogout = () => {
    clearSessionData();
    navigate('/');
  };

  return (
    <div className="page-shell">
      <AppHeader
        subtitle="Area do aluno"
        onHome={() => navigate('/')}
        navItems={[
          { label: 'Meus cursos', onClick: () => setActiveSection('courses'), active: activeSection === 'courses' },
          { label: 'Chat', onClick: () => navigate('/chat') },
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
          courseActionLabel="Adicionar aos meus cursos"
          onCourseAction={handleToggleCourse}
          isCourseSelected={(course) => Boolean(getUserCourseEntry(currentUserId, course.id)?.enrolled)}
          onOpenCourse={(course) => navigate(`/course-view/${course.id}`)}
          onUserAction={() => navigate('/profile')}
        />

        <InlineAlert type={feedback.type} message={feedback.message} />

        {activeSection === 'home' ? (
          <>
            <section className="dash-hero panel-card">
              <div className="dash-hero-text">
                <span className="section-badge">Área do aluno</span>
                <h1 className="dash-hero-title">Bem-vindo, {userName} 👋</h1>
                <p className="dash-hero-desc">
                  Acompanhe seus estudos, encontre novos cursos e converse com professores em um único lugar.
                </p>
                <div className="hero-actions">
                  <button type="button" className="btn btn-primary btn-hero" onClick={() => setActiveSection('courses')}>
                    Meus cursos
                  </button>
                  <button type="button" className="btn btn-ghost btn-hero" onClick={() => navigate('/chat')}>
                    Abrir chat
                  </button>
                </div>
              </div>
              <div className="dash-hero-stats">
                <div className="dash-stat-card">
                  <div className="dash-stat-icon dash-stat-icon-blue">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                  </div>
                  <strong>{enrolledCourses.length}</strong>
                  <span>cursos ativos</span>
                </div>
                <div className="dash-stat-card">
                  <div className="dash-stat-icon dash-stat-icon-green">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <strong>{completedCount}</strong>
                  <span>concluídos</span>
                </div>
                <div className="dash-stat-card">
                  <div className="dash-stat-icon dash-stat-icon-blue">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  </div>
                  <strong>{users.filter((u) => u.nivelAcesso === 'PROFESSOR').length}</strong>
                  <span>professores</span>
                </div>
                <div className="dash-stat-card">
                  <div className="dash-stat-icon dash-stat-icon-green">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  </div>
                  <strong>{allCourses.length}</strong>
                  <span>na plataforma</span>
                </div>
              </div>
            </section>

            <section className="dash-summary-grid">
              <article className="dash-summary-card">
                <div className="feature-icon-wrap feature-icon-blue">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                </div>
                <h3>Foco agora</h3>
                <p>{enrolledCourses[0]?.nome || 'Escolha um curso para iniciar seu plano de estudos.'}</p>
              </article>
              <article className="dash-summary-card">
                <div className="feature-icon-wrap feature-icon-green">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                </div>
                <h3>Progresso atual</h3>
                <p>{enrolledCourses.length ? `${completedCount} curso(s) concluído(s) de ${enrolledCourses.length}.` : 'Nenhum curso adicionado ainda.'}</p>
              </article>
              <article className="dash-summary-card">
                <div className="feature-icon-wrap feature-icon-blue">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                </div>
                <h3>Suporte rápido</h3>
                <p>Use o chat para tirar dúvidas com professores e manter o ritmo de aprendizagem.</p>
              </article>
            </section>
          </>
        ) : null}

        {activeSection === 'courses' ? (
          <section className="panel-card section-stack">
            <div className="section-heading">
              <span className="section-kicker">Meus cursos</span>
              <h3>Todos os cursos do aluno</h3>
            </div>

            {enrolledCourses.length ? (
              <div className="course-grid modern-grid">
                {enrolledCourses.map((course) => (
                  <article key={course.id} className="course-card modern-card">
                    <div className="course-card-body" onClick={() => navigate(`/course-view/${course.id}`)}>
                      <span className="course-tag">{NIVEIS[course.categoria] || course.categoria}</span>
                      <h3>{course.nome}</h3>
                      <p>{course.descricao}</p>
                      <small>{formatCourseDuration(course)} • {getCourseStatusLabel(course.userStatus)}</small>
                    </div>
                    <button type="button" className="btn btn-ghost" onClick={() => handleToggleCourse(course)}>
                      Remover
                    </button>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-state-card">
                <h4>Nenhum curso adicionado</h4>
                <p>Use a busca acima para encontrar cursos e montar sua trilha.</p>
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

export default StudentDashboardPage;

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
        navItems={[
          { label: 'Pagina inicial', onClick: () => setActiveSection('home'), active: activeSection === 'home' },
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
            <section className="dashboard-hero panel-card">
              <div>
                <span className="section-kicker">Pagina inicial</span>
                <h1>Ola, {userName}</h1>
                <p>
                  Aqui voce acompanha a sua area docente, organiza publicacoes e conversa com os alunos da plataforma.
                </p>
              </div>
              <div className="dashboard-hero-stats">
                <article>
                  <strong>{teacherCourses.length}</strong>
                  <span>cursos publicados</span>
                </article>
                <article>
                  <strong>{chatUsers.length}</strong>
                  <span>alunos no chat</span>
                </article>
                <article>
                  <strong>{users.filter((user) => user.nivelAcesso === 'PROFESSOR').length + 1}</strong>
                  <span>professores na plataforma</span>
                </article>
              </div>
            </section>

            <section className="summary-grid">
              <article className="panel-card info-card">
                <h3>Visao geral</h3>
                <p>Gerencie seus cursos, acompanhe as interacoes e mantenha a area do professor organizada.</p>
              </article>
              <article className="panel-card info-card">
                <h3>Publicacao centralizada</h3>
                <p>O botao para publicar curso agora fica em Meus cursos, junto da sua lista principal.</p>
              </article>
              <article className="panel-card info-card">
                <h3>Busca unificada</h3>
                <p>Pesquise cursos e usuarios na caixa acima, com resultados separados por topico.</p>
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

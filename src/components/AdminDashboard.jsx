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
    const newStatus = !user.statusUsuario;

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
        navItems={[
          { label: 'Pagina inicial', onClick: () => setActiveSection('home'), active: activeSection === 'home' },
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
            <section className="dashboard-hero panel-card">
              <div>
                <span className="section-kicker">Pagina inicial</span>
                <h1>Painel geral da plataforma</h1>
                <p>
                  Acompanhe usuarios, cursos, buscas e conversas em uma visao unica inspirada na experiencia do aluno.
                </p>
              </div>
              <div className="dashboard-hero-stats">
                <article>
                  <strong>{users.length}</strong>
                  <span>usuarios totais</span>
                </article>
                <article>
                  <strong>{courses.length}</strong>
                  <span>cursos publicados</span>
                </article>
                <article>
                  <strong>{users.filter((user) => user.statusUsuario).length}</strong>
                  <span>contas ativas</span>
                </article>
              </div>
            </section>

            <section className="summary-grid">
              <article className="panel-card info-card">
                <h3>Fluxo principal</h3>
                <p>A pagina inicial concentra visao geral, busca e atalhos para moderacao da plataforma.</p>
              </article>
              <article className="panel-card info-card">
                <h3>Busca unificada</h3>
                <p>Pesquise cursos e usuarios na caixa acima com resultados separados.</p>
              </article>
              <article className="panel-card info-card">
                <h3>Chat administrativo</h3>
                <p>Converse com qualquer perfil da plataforma quando precisar acompanhar casos especificos.</p>
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
                        <td>{getUserRoleLabel(user.nivelAcesso)}</td>
                        <td>{user.statusUsuario ? 'Ativo' : 'Inativo'}</td>
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
                              {user.statusUsuario ? 'Inativar' : 'Ativar'}
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

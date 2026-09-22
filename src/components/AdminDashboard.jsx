import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import AppHeader from './AppHeader';
import ChatWorkspace from './ChatWorkspace';
import DirectorySearchSection from './DirectorySearchSection';
import InlineAlert from './InlineAlert';
import { clearSessionData } from '../utils/authStorage';
import { formatCourseDuration, getUserRoleLabel, NIVEIS } from '../utils/ui';
import { useTheme } from '../utils/theme';
import { useChatWorkspace } from '../utils/useChatWorkspace';

function AdminDashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [activeSection, setActiveSection] = useState(location.state?.section || 'home');
  const [panelTab, setPanelTab] = useState('users');
  const [approvalFeedback, setApprovalFeedback] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [feedback, setFeedback] = useState({ type: 'info', message: '' });
  const currentUserId = Number(localStorage.getItem('userId'));
  const isUserActive = (statusUsuario) => statusUsuario === true || statusUsuario === 'Ativo';

  const availableUsers = useMemo(
    () => users.filter((user) => Number(user.id) !== currentUserId),
    [users, currentUserId]
  );

  const chat = useChatWorkspace({ currentUserId, users: availableUsers, userName: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersResponse, coursesResponse] = await Promise.all([
          api.get('/usuario'),
          api.get('/curso'),
        ]);

        const fetchedUsers = usersResponse.data || [];
        const fetchedCourses = coursesResponse.data || [];

        setUsers(fetchedUsers);
        setCourses(fetchedCourses);
      } catch (error) {
        console.error('Erro ao carregar dados do admin:', error);
        setFeedback({ type: 'error', message: 'Erro ao carregar dados. Verifique a API.' });
      }
    };

    fetchData();
  }, [currentUserId]);

  const searchResults = useMemo(() => {
    const normalizedTerm = searchTerm.trim().toLowerCase();
    if (!normalizedTerm) return { courses: [], users: [] };

    return {
      courses: courses.filter((course) => (`${course.nome || ''} ${course.descricao || ''}`).toLowerCase().includes(normalizedTerm)),
      users: availableUsers.filter((user) => (`${user.nome || ''} ${user.email || ''}`).toLowerCase().includes(normalizedTerm)),
    };
  }, [courses, availableUsers, searchTerm]);

  const handleUpdateStatus = async (userId, userDisplayName) => {
    const user = users.find((item) => item.id === userId);
    const newStatus = isUserActive(user.statusUsuario) ? 'Inativo' : 'Ativo';

    try {
      await api.put(`/usuario/${userId}`, {
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
      await api.delete(`/usuario/${userId}`);
      setUsers((currentUsers) => currentUsers.filter((item) => item.id !== userId));
      setFeedback({ type: 'success', message: `Usuario excluido: ${userDisplayName}.` });
    } catch (error) {
      console.error('Erro ao excluir usuario:', error);
      setFeedback({ type: 'error', message: 'Erro ao excluir o usuario.' });
    }
  };

  const pendingCourses = useMemo(() => courses.filter((c) => c.statusCurso === 'Pendente'), [courses]);
  const pendingTeachers = useMemo(
    () => users.filter((u) => u.nivelAcesso === 'PROFESSOR' && u.statusUsuario === 'Pendente'),
    [users]
  );

  const handleApproveCourse = async (courseId, courseName) => {
    const course = courses.find((c) => c.id === courseId);
    try {
      await api.put(`/curso/${courseId}`, { ...course, statusCurso: 'Em progresso' });
      setCourses((prev) => prev.map((c) => c.id === courseId ? { ...c, statusCurso: 'Em progresso' } : c));
      setApprovalFeedback((prev) => ({ ...prev, [`course-${courseId}`]: 'aprovado' }));
      setFeedback({ type: 'success', message: `Curso aprovado: ${courseName}.` });
    } catch {
      setFeedback({ type: 'error', message: 'Erro ao aprovar curso.' });
    }
  };

  const handleRejectCourse = async (courseId, courseName) => {
    const course = courses.find((c) => c.id === courseId);
    try {
      await api.put(`/curso/${courseId}`, { ...course, statusCurso: 'Rejeitado' });
      setCourses((prev) => prev.map((c) => c.id === courseId ? { ...c, statusCurso: 'Rejeitado' } : c));
      setApprovalFeedback((prev) => ({ ...prev, [`course-${courseId}`]: 'rejeitado' }));
      setFeedback({ type: 'success', message: `Curso rejeitado: ${courseName}.` });
    } catch {
      setFeedback({ type: 'error', message: 'Erro ao rejeitar curso.' });
    }
  };

  const handleApproveTeacher = async (userId, userName) => {
    const user = users.find((u) => u.id === userId);
    try {
      await api.put(`/usuario/${userId}`, { ...user, statusUsuario: 'Ativo' });
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, statusUsuario: 'Ativo' } : u));
      setFeedback({ type: 'success', message: `Professor aprovado: ${userName}.` });
    } catch {
      setFeedback({ type: 'error', message: 'Erro ao aprovar professor.' });
    }
  };

  const handleRejectTeacher = async (userId, userName) => {
    try {
      await api.delete(`/usuario/${userId}`);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setFeedback({ type: 'success', message: `Cadastro rejeitado: ${userName}.` });
    } catch {
      setFeedback({ type: 'error', message: 'Erro ao rejeitar professor.' });
    }
  };

  const handleDeleteCourse = async (courseId, courseName) => {
    try {
      await api.delete(`/curso/${courseId}`);
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
            selectedChat={chat.selectedChat}
            message={chat.message}
            onMessageChange={chat.setMessage}
            onSendMessage={chat.sendMessage}
            messages={chat.messages}
            conversations={chat.conversations}
            searchedUsers={chat.searchedUsers}
            searchTerm={chat.chatSearchTerm}
            onSearchChange={chat.setChatSearchTerm}
            onSelectChat={chat.handleSelectChat}
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
                <button type="button" className={`segmented-tab${panelTab === 'users' ? ' is-active' : ''}`} onClick={() => setPanelTab('users')}>
                  Usuarios
                </button>
                <button type="button" className={`segmented-tab${panelTab === 'courses' ? ' is-active' : ''}`} onClick={() => setPanelTab('courses')}>
                  Cursos
                </button>
                <button type="button" className={`segmented-tab${panelTab === 'approve-courses' ? ' is-active' : ''}`} onClick={() => setPanelTab('approve-courses')}>
                  Cursos pendentes
                  {pendingCourses.length > 0 && <span className="approval-badge">{pendingCourses.length}</span>}
                </button>
                <button type="button" className={`segmented-tab${panelTab === 'approve-teachers' ? ' is-active' : ''}`} onClick={() => setPanelTab('approve-teachers')}>
                  Professores pendentes
                  {pendingTeachers.length > 0 && <span className="approval-badge">{pendingTeachers.length}</span>}
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

            {panelTab === 'approve-courses' ? (
              pendingCourses.length === 0 ? (
                <div className="empty-state-card"><p>Nenhum curso aguardando aprovacao.</p></div>
              ) : (
                <div className="approval-list">
                  {pendingCourses.map((course) => {
                    const decision = approvalFeedback[`course-${course.id}`];
                    return (
                      <div key={course.id} className="approval-item">
                        <div className="approval-item-info">
                          <span className="course-tag">{NIVEIS[course.categoria] || course.categoria}</span>
                          <strong>{course.nome}</strong>
                          <p>{course.descricao}</p>
                          <small>{formatCourseDuration(course)}</small>
                        </div>
                        <div className="approval-item-actions">
                          {decision ? (
                            <span className={`approval-decision approval-decision-${decision}`}>
                              {decision === 'aprovado' ? '✓ Aprovado' : '✗ Rejeitado'}
                            </span>
                          ) : (
                            <>
                              <button type="button" className="btn btn-primary" onClick={() => handleApproveCourse(course.id, course.nome)}>Aprovar</button>
                              <button type="button" className="btn btn-danger" onClick={() => handleRejectCourse(course.id, course.nome)}>Rejeitar</button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            ) : null}

            {panelTab === 'approve-teachers' ? (
              pendingTeachers.length === 0 ? (
                <div className="empty-state-card"><p>Nenhum professor aguardando aprovacao.</p></div>
              ) : (
                <div className="approval-list">
                  {pendingTeachers.map((user) => (
                    <div key={user.id} className="approval-item">
                      <div className="approval-item-info">
                        <strong>{user.nome}</strong>
                        <p>{user.email}</p>
                        <small>CPF: {user.cpf || '-'}</small>
                      </div>
                      <div className="approval-item-actions">
                        <button type="button" className="btn btn-primary" onClick={() => handleApproveTeacher(user.id, user.nome)}>Aprovar</button>
                        <button type="button" className="btn btn-danger" onClick={() => handleRejectTeacher(user.id, user.nome)}>Rejeitar</button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : null}
          </section>
        ) : null}
      </main>
    </div>
  );
}

export default AdminDashboardPage;

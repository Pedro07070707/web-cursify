import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AppHeader from './AppHeader';
import InlineAlert from './InlineAlert';
import { clearPersistedUserData, clearSessionData } from '../utils/authStorage';
import { getDashboardPathByRole, getUserRoleLabel } from '../utils/ui';
import { useTheme } from '../utils/theme';

function Profile() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [users, setUsers] = useState([]);
  const [feedback, setFeedback] = useState({ type: 'info', message: '' });
  const nivelAcesso = localStorage.getItem('nivelAcesso');
  const dashboardPath = getDashboardPathByRole(nivelAcesso);
  const userId = Number(localStorage.getItem('userId'));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/v1/usuario');
        setUsers(response.data || []);
      } catch (error) {
        console.error('Erro ao carregar dados do perfil:', error);
        setFeedback({ type: 'error', message: 'Erro ao carregar os dados do perfil.' });
      }
    };

    fetchData();
  }, []);

  const currentUser = useMemo(
    () => users.find((user) => Number(user.id) === userId),
    [users, userId]
  );

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:8080/api/v1/usuario/${userId}`);
      clearPersistedUserData(userId);
      clearSessionData();
      navigate('/');
    } catch (error) {
      console.error('Erro ao excluir usuario:', error);
      setFeedback({ type: 'error', message: 'Erro ao excluir o usuario.' });
    }
  };

  const handleToggleInactive = async () => {
    if (!currentUser) return;

    try {
      const payload = { ...currentUser, statusUsuario: !currentUser.statusUsuario };
      await axios.put(`http://localhost:8080/api/v1/usuario/${userId}`, payload);
      setUsers((currentUsers) => currentUsers.map((user) => (
        Number(user.id) === userId ? payload : user
      )));
      setFeedback({
        type: 'success',
        message: payload.statusUsuario ? 'Conta reativada com sucesso.' : 'Conta inativada com sucesso.',
      });
    } catch (error) {
      console.error('Erro ao atualizar status da conta:', error);
      setFeedback({ type: 'error', message: 'Erro ao atualizar o status da conta.' });
    }
  };

  const handleLogout = () => {
    clearSessionData();
    navigate('/');
  };

  return (
    <div className="page-shell">
      <AppHeader
        subtitle="Perfil"
        onHome={() => navigate('/')}
        navItems={[
          ...(nivelAcesso !== 'ADMIN'
            ? [{ label: 'Meus cursos', onClick: () => navigate(dashboardPath, { state: { section: 'courses' } }) }]
            : [{ label: 'Painel', onClick: () => navigate(dashboardPath, { state: { section: 'panel' } }) }]),
          { label: 'Chat', onClick: () => navigate(dashboardPath, { state: { section: 'chat' } }) },
        ]}
        onGoProfile={() => navigate('/profile')}
        onLogout={handleLogout}
        onToggleTheme={toggleTheme}
        theme={theme}
      />

      <main className="container dashboard-layout">
        <InlineAlert type={feedback.type} message={feedback.message} />

        {/* Hero do perfil */}
        <section className="profile-hero-card panel-card">
          <div className="profile-hero-avatar">
            {(currentUser?.nome || 'US').slice(0, 2).toUpperCase()}
          </div>
          <div className="profile-hero-info">
            <div className="profile-hero-badges">
              <span className="section-badge">{getUserRoleLabel(currentUser?.nivelAcesso)}</span>
              <span className={`profile-status-badge${currentUser?.statusUsuario ? ' is-active' : ' is-inactive'}`}>
                <span className="profile-status-dot" />
                {currentUser?.statusUsuario ? 'Conta ativa' : 'Conta inativa'}
              </span>
            </div>
            <h1 className="profile-hero-name">{currentUser?.nome || 'Usuário'}</h1>
            <p className="profile-hero-email">{currentUser?.email || 'email@exemplo.com'}</p>
          </div>
          <button
            type="button"
            className="btn btn-primary profile-hero-action"
            onClick={() => navigate('/change-password')}
          >
            Editar perfil
          </button>
        </section>

        {/* Cards de info */}
        <div className="dash-summary-grid">
          <article className="dash-summary-card">
            <div className="feature-icon-wrap feature-icon-blue">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <h3>Informações da conta</h3>
            <div className="profile-info-list">
              <div className="profile-info-row">
                <span>Nome</span>
                <strong>{currentUser?.nome || '-'}</strong>
              </div>
              <div className="profile-info-row">
                <span>Email</span>
                <strong>{currentUser?.email || '-'}</strong>
              </div>
              <div className="profile-info-row">
                <span>Tipo</span>
                <strong>{getUserRoleLabel(currentUser?.nivelAcesso)}</strong>
              </div>
              <div className="profile-info-row">
                <span>Membro desde</span>
                <strong>
                  {currentUser?.dataCadastro
                    ? new Date(currentUser.dataCadastro).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
                    : 'Não informado'}
                </strong>
              </div>
            </div>
          </article>

          <article className="dash-summary-card">
            <div className="feature-icon-wrap feature-icon-green">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </div>
            <h3>Atualizações</h3>
            <p>Altere sua senha e dados cadastrais a qualquer momento.</p>
            <button type="button" className="btn btn-primary" style={{ marginTop: '8px' }} onClick={() => navigate('/change-password')}>
              Atualizar perfil
            </button>
          </article>

          <article className="dash-summary-card">
            <div className="feature-icon-wrap feature-icon-blue">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            </div>
            <h3>Ações da conta</h3>
            <p>Gerencie o status ou exclua sua conta permanentemente.</p>
            <div className="card-button-column" style={{ marginTop: '8px' }}>
              <button type="button" className="btn btn-ghost" onClick={handleToggleInactive}>
                {currentUser?.statusUsuario ? 'Inativar conta' : 'Reativar conta'}
              </button>
              <button type="button" className="btn btn-danger" onClick={handleDelete}>
                Excluir conta
              </button>
            </div>
          </article>
        </div>
      </main>
    </div>
  );
}

export default Profile;

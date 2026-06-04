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
        navItems={[
          { label: 'Pagina inicial', onClick: () => navigate(dashboardPath) },
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

        <section className="profile-shell panel-card">
          <div className="profile-hero">
            <div className="profile-avatar">{(currentUser?.nome || 'US').slice(0, 2).toUpperCase()}</div>
            <div>
              <span className="section-kicker">Perfil</span>
              <h1>{currentUser?.nome || 'Usuario'}</h1>
              <p>{currentUser?.email || 'email@exemplo.com'}</p>
              <div className="profile-tags">
                <span>{getUserRoleLabel(currentUser?.nivelAcesso)}</span>
                <span>{currentUser?.statusUsuario ? 'Conta ativa' : 'Conta inativa'}</span>
              </div>
            </div>
          </div>

          <div className="profile-grid">
            <article className="info-card profile-card">
              <h3>Informacoes da conta</h3>
              <p><strong>Nome:</strong> {currentUser?.nome || '-'}</p>
              <p><strong>Email:</strong> {currentUser?.email || '-'}</p>
              <p><strong>Tipo de usuario:</strong> {getUserRoleLabel(currentUser?.nivelAcesso)}</p>
              <p>
                <strong>Registrado em:</strong>{' '}
                {currentUser?.dataCadastro
                  ? new Date(currentUser.dataCadastro).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })
                  : 'Nao informado'}
              </p>
            </article>

            <article className="info-card profile-card">
              <h3>Atualizacoes</h3>
              <p>Atualize seus dados, senha e tipo de conta em um unico formulario.</p>
              <button type="button" className="btn btn-primary" onClick={() => navigate('/change-password')}>
                Atualizar perfil
              </button>
            </article>

            <article className="info-card profile-card">
              <h3>Acoes da conta</h3>
              <div className="card-button-column">
                <button type="button" className="btn btn-secondary" onClick={handleToggleInactive}>
                  {currentUser?.statusUsuario ? 'Inativar conta' : 'Reativar conta'}
                </button>
                <button type="button" className="btn btn-danger" onClick={handleDelete}>
                  Excluir conta
                </button>
              </div>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Profile;

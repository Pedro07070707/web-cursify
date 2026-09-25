import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
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
  const [bio, setBio] = useState('');
  const [foto, setFoto] = useState('');
  const [fotoCapa, setFotoCapa] = useState('');
  const nivelAcesso = localStorage.getItem('nivelAcesso');
  const dashboardPath = getDashboardPathByRole(nivelAcesso);
  const userId = Number(localStorage.getItem('userId'));
  const isStatusActive = (statusUsuario) => statusUsuario === true || statusUsuario === 'Ativo';

  const formatCpf = (value) => {
    const digits = String(value || '').replace(/\D/g, '');
    if (digits.length !== 11) return value || '-';
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/usuario');
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

  useEffect(() => { setBio(currentUser?.bio || ''); setFoto(currentUser?.foto || ''); setFotoCapa(currentUser?.fotoCapa || ''); }, [currentUser]);

  const readImage = (file, setter) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setter(String(reader.result || '').replace(/^data:image\/[^;]+;base64,/, ''));
    reader.readAsDataURL(file);
  };

  const toImageSrc = (value) => {
    if (!value) return '';
    if (typeof value === 'string') return value.startsWith('data:') ? value : `data:image/jpeg;base64,${value}`;
    if (Array.isArray(value)) {
      const binary = value.map((byte) => String.fromCharCode(byte)).join('');
      return `data:image/jpeg;base64,${btoa(binary)}`;
    }
    return '';
  };

  const handleSaveBio = async () => {
    if (!currentUser) return;
    try {
      const payload = { ...currentUser, bio, foto, fotoCapa };
      await api.put(`/usuario/${userId}`, payload);
      setUsers((items) => items.map((item) => Number(item.id) === userId ? { ...item, bio, foto, fotoCapa } : item));
      setFeedback({ type: 'success', message: 'Perfil salvo no banco.' });
    } catch (error) {
      console.error(error);
      setFeedback({ type: 'error', message: 'Não foi possível salvar a biografia.' });
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/usuario/${userId}`);
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
      const payload = { ...currentUser, statusUsuario: isStatusActive(currentUser.statusUsuario) ? 'Inativo' : 'Ativo' };
      await api.put(`/usuario/${userId}`, payload);
      setUsers((currentUsers) => currentUsers.map((user) => (
        Number(user.id) === userId ? payload : user
      )));
      setFeedback({
        type: 'success',
        message: isStatusActive(payload.statusUsuario) ? 'Conta reativada com sucesso.' : 'Conta inativada com sucesso.',
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
        <section className="profile-hero-card panel-card" style={{ position: 'relative', overflow: 'hidden', backgroundImage: toImageSrc(currentUser?.fotoCapa) ? `url(${toImageSrc(currentUser?.fotoCapa)})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' }}>
          {toImageSrc(currentUser?.fotoCapa) && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.42)' }} />}
          <div className="profile-hero-avatar" style={{ position: 'relative', zIndex: 1 }}>
            {toImageSrc(currentUser?.foto) ? <img src={toImageSrc(currentUser.foto)} alt="Foto de perfil" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} /> : (currentUser?.nome || 'US').slice(0, 2).toUpperCase()}
          </div>
          <div className="profile-hero-info" style={{ position: 'relative', zIndex: 1 }}>
            <div className="profile-hero-badges">
              <span className="section-badge">{getUserRoleLabel(currentUser?.nivelAcesso)}</span>
              <span className={`profile-status-badge${isStatusActive(currentUser?.statusUsuario) ? ' is-active' : ' is-inactive'}`}>
                <span className="profile-status-dot" />
                {isStatusActive(currentUser?.statusUsuario) ? 'Conta ativa' : 'Conta inativa'}
              </span>
            </div>
            <h1 className="profile-hero-name">{currentUser?.nome || 'Usuário'}</h1>
            <p className="profile-hero-email">{currentUser?.email || 'email@exemplo.com'}</p>
          </div>
          <button
            type="button"
            className="btn btn-primary profile-hero-action"
            style={{ position: 'relative', zIndex: 1 }}
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
                <span>CPF</span>
                <strong>{formatCpf(currentUser?.cpf)}</strong>
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
            <h3>Biografia</h3>
            <textarea value={bio} onChange={(event) => setBio(event.target.value)} placeholder="Fale um pouco sobre você" maxLength={2000} />
            <button type="button" className="btn btn-primary" style={{ marginTop: '8px' }} onClick={handleSaveBio}>Salvar bio</button>
          </article>
          <article className="dash-summary-card">
            <h3>Fotos do perfil</h3>
            <label style={{ marginTop: '8px' }}>Foto de perfil<input type="file" accept="image/*" onChange={(event) => readImage(event.target.files?.[0], setFoto)} /></label>
            <label style={{ marginTop: '8px' }}>Foto de capa<input type="file" accept="image/*" onChange={(event) => readImage(event.target.files?.[0], setFotoCapa)} /></label>
            <button type="button" className="btn btn-primary" style={{ marginTop: '8px' }} onClick={handleSaveBio}>Salvar fotos</button>
          </article>

          <article className="dash-summary-card">
            <div className="feature-icon-wrap feature-icon-blue">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            </div>
            <h3>Ações da conta</h3>
            <p>Gerencie o status ou exclua sua conta permanentemente.</p>
            <div className="card-button-column" style={{ marginTop: '8px' }}>
              <button type="button" className="btn btn-ghost" onClick={handleToggleInactive}>
                {isStatusActive(currentUser?.statusUsuario) ? 'Inativar conta' : 'Reativar conta'}
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

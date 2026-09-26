import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api';
import AppHeader from './AppHeader';
import { getUserRoleLabel } from '../utils/ui';
import { useTheme } from '../utils/theme';

function TeacherProfileView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [decision, setDecision] = useState(null);

  const formatCpf = (value) => {
    const digits = String(value || '').replace(/\D/g, '');
    if (digits.length !== 11) return value || '-';
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  };

  const handleRejeitar = async () => {
    const motivo = window.prompt(`Informe o motivo da recusa de "${teacher.nome}":`);
    if (!motivo || !motivo.trim()) return;
    try {
      await api.put(`/usuario/${id}`, { ...teacher, statusUsuario: 'Inativo', professorAprovado: 'Reprovado' });
      setDecision('rejeitado');
    } catch {
      alert('Erro ao rejeitar professor.');
    }
  };

  const handleAprovar = async () => {
    try {
      await api.put(`/usuario/${id}`, { ...teacher, statusUsuario: 'Ativo', professorAprovado: 'Aprovado' });
      setDecision('aprovado');
    } catch {
      alert('Erro ao aprovar professor.');
    }
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

  useEffect(() => {
    api.get(`/usuario/${id}`)
      .then((res) => setTeacher(res.data))
      .catch(() => alert('Erro ao carregar perfil do professor.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="page-shell">
        <AppHeader subtitle="Perfil do professor" onHome={() => navigate('/')} onToggleTheme={toggleTheme} theme={theme} />
        <main className="container" style={{ padding: '3rem 0' }}>
          <div className="empty-state-card"><h4>Carregando perfil...</h4></div>
        </main>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <AppHeader
        subtitle="Perfil do professor"
        onHome={() => navigate('/')}
        onToggleTheme={toggleTheme}
        theme={theme}
      />

      <main className="container dashboard-layout">
        <section
          className="profile-hero-card panel-card"
          style={{
            position: 'relative', overflow: 'hidden',
            backgroundImage: toImageSrc(teacher?.fotoCapa) ? `url(${toImageSrc(teacher?.fotoCapa)})` : undefined,
            backgroundSize: 'cover', backgroundPosition: 'center',
          }}
        >
          {toImageSrc(teacher?.fotoCapa) && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.42)' }} />}
          <div className="profile-hero-avatar" style={{ position: 'relative', zIndex: 1 }}>
            {toImageSrc(teacher?.foto)
              ? <img src={toImageSrc(teacher.foto)} alt="Foto de perfil" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              : (teacher?.nome || 'PR').slice(0, 2).toUpperCase()}
          </div>
          <div className="profile-hero-info" style={{ position: 'relative', zIndex: 1 }}>
            <div className="profile-hero-badges">
              <span className="section-badge">{getUserRoleLabel(teacher?.nivelAcesso)}</span>
              <span className={`profile-status-badge${teacher?.statusUsuario === 'Ativo' ? ' is-active' : ' is-inactive'}`}>
                <span className="profile-status-dot" />
                {teacher?.statusUsuario === 'Ativo' ? 'Conta ativa' : 'Conta inativa'}
              </span>
            </div>
            <h1 className="profile-hero-name">{teacher?.nome || 'Professor'}</h1>
            <p className="profile-hero-email">{teacher?.email || '-'}</p>
          </div>
          <button type="button" className="btn btn-ghost profile-hero-action" style={{ position: 'relative', zIndex: 1 }} onClick={() => navigate(-1)}>
            Voltar
          </button>
        </section>

        <div className="dash-summary-grid">
          <article className="dash-summary-card">
            <div className="feature-icon-wrap feature-icon-blue">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <h3>Informações cadastradas</h3>
            <div className="profile-info-list">
              <div className="profile-info-row">
                <span>Nome</span>
                <strong>{teacher?.nome || '-'}</strong>
              </div>
              <div className="profile-info-row">
                <span>Email</span>
                <strong>{teacher?.email || '-'}</strong>
              </div>
              <div className="profile-info-row">
                <span>CPF</span>
                <strong>{formatCpf(teacher?.cpf)}</strong>
              </div>
              <div className="profile-info-row">
                <span>Tipo</span>
                <strong>{getUserRoleLabel(teacher?.nivelAcesso)}</strong>
              </div>
              <div className="profile-info-row">
                <span>Status</span>
                <strong>{teacher?.statusUsuario || '-'}</strong>
              </div>
              <div className="profile-info-row">
                <span>Aprovação</span>
                <strong>{teacher?.professorAprovado || '-'}</strong>
              </div>
              <div className="profile-info-row">
                <span>Membro desde</span>
                <strong>
                  {teacher?.dataCadastro
                    ? new Date(teacher.dataCadastro).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
                    : '-'}
                </strong>
              </div>
            </div>
          </article>

          {teacher?.bio && (
            <article className="dash-summary-card">
              <div className="feature-icon-wrap feature-icon-green">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              </div>
              <h3>Biografia</h3>
              <p style={{ whiteSpace: 'pre-wrap', marginTop: '8px' }}>{teacher.bio}</p>
            </article>
          )}

          <article className="dash-summary-card">
            <div className="feature-icon-wrap feature-icon-blue">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l7 4v5c0 5-3 8-7 11-4-3-7-6-7-11V6l7-4z"/><path d="M9 12l2 2 4-4"/></svg>
            </div>
            <h3>Ações administrativas</h3>
            <p style={{ marginTop: '4px' }}>Status atual de aprovação: <strong>{teacher?.professorAprovado || '-'}</strong></p>
            <div className="card-button-column" style={{ marginTop: '12px' }}>
              {decision ? (
                <span className={`approval-decision approval-decision-${decision}`}>
                  {decision === 'aprovado' ? '✓ Professor aprovado' : '✗ Professor rejeitado'}
                </span>
              ) : (
                <>
                  <button type="button" className="btn btn-primary" onClick={handleAprovar}>Aprovar professor</button>
                  <button type="button" className="btn btn-danger" onClick={handleRejeitar}>Rejeitar professor</button>
                </>
              )}
            </div>
          </article>
        </div>
      </main>
    </div>
  );
}

export default TeacherProfileView;

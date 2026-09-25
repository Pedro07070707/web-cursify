import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import AppHeader from './AppHeader';
import InlineAlert from './InlineAlert';
import { useTheme } from '../utils/theme';

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const [tokenStatus, setTokenStatus] = useState('validating'); // validating | valid | invalid
  const [tokenError, setTokenError] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmaSenha, setConfirmaSenha] = useState('');
  const [feedback, setFeedback] = useState({ type: 'info', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setTokenStatus('invalid');
      setTokenError('Link inválido. Nenhum token encontrado.');
      return;
    }

    api.get(`/recuperacao-senha/validar?token=${token}`)
      .then(() => setTokenStatus('valid'))
      .catch((error) => {
        setTokenStatus('invalid');
        setTokenError(error.response?.data?.message || 'Link inválido ou expirado.');
      });
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ type: 'info', message: '' });

    if (novaSenha.length < 8 || novaSenha.length > 20) {
      setFeedback({ type: 'error', message: 'A senha deve ter entre 8 e 20 caracteres.' });
      return;
    }

    if (novaSenha !== confirmaSenha) {
      setFeedback({ type: 'error', message: 'As senhas não coincidem.' });
      return;
    }

    setLoading(true);
    try {
      await api.post('/recuperacao-senha/redefinir', { token, novaSenha });
      setSuccess(true);
    } catch (error) {
      const msg = error.response?.data?.message || 'Erro ao redefinir a senha. Tente novamente.';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (tokenStatus === 'validating') {
      return <p style={{ color: 'var(--muted)', textAlign: 'center' }}>Validando link...</p>;
    }

    if (tokenStatus === 'invalid') {
      return (
        <div>
          <InlineAlert type="error" message={tokenError} />
          <button
            type="button"
            className="btn btn-primary auth-submit-full"
            style={{ marginTop: '16px' }}
            onClick={() => navigate('/esqueci-senha')}
          >
            Solicitar novo link
          </button>
        </div>
      );
    }

    if (success) {
      return (
        <div>
          <InlineAlert type="success" message="Senha redefinida com sucesso! Você já pode fazer login com a nova senha." />
          <button
            type="button"
            className="btn btn-primary auth-submit-full"
            style={{ marginTop: '16px' }}
            onClick={() => navigate('/login')}
          >
            Ir para o login
          </button>
        </div>
      );
    }

    return (
      <form onSubmit={handleSubmit}>
        <InlineAlert type={feedback.type} message={feedback.message} />

        <div className="form-group">
          <label>Nova senha</label>
          <div className="input-icon-wrap">
            <svg className="input-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <input
              type="password"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              required
              placeholder="Mínimo 8 caracteres"
            />
          </div>
          <small className="field-help">Entre 8 e 20 caracteres.</small>
        </div>

        <div className="form-group">
          <label>Confirmar nova senha</label>
          <div className="input-icon-wrap">
            <svg className="input-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <input
              type="password"
              value={confirmaSenha}
              onChange={(e) => setConfirmaSenha(e.target.value)}
              required
              placeholder="Repita a nova senha"
              className={confirmaSenha && novaSenha !== confirmaSenha ? 'input-error' : ''}
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary auth-submit-full" disabled={loading}>
          {loading ? 'Redefinindo...' : 'Redefinir senha'}
        </button>
      </form>
    );
  };

  return (
    <div className="page-shell page-shell-auth">
      <AppHeader
        subtitle="Redefinir senha"
        onHome={() => navigate('/')}
        onToggleTheme={toggleTheme}
        theme={theme}
      />

      <main className="auth-split-layout">
        <div className="auth-split-panel" style={{ alignItems: 'center', textAlign: 'center' }}>
          <div className="auth-split-brand" style={{ justifyItems: 'center', textAlign: 'center' }}>
            <img src="/logoCursiFyBranco.png.png" alt="CursiFy" className="auth-brand-logo" style={{ width: '80px', height: '80px' }} />
            <h1 className="auth-brand-name" style={{ fontSize: '3rem' }}>CursiFy</h1>
            <p className="auth-brand-tagline" style={{ fontSize: '1.1rem', textAlign: 'center' }}>Crie uma nova senha segura</p>
          </div>
          <ul className="auth-panel-perks" style={{ alignItems: 'center' }}>
            <li style={{ justifyContent: 'center', fontSize: '1.02rem' }}>
              <span className="perk-icon perk-icon-blue" style={{ width: '32px', height: '32px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </span>
              Use entre 8 e 20 caracteres
            </li>
            <li style={{ justifyContent: 'center', fontSize: '1.02rem' }}>
              <span className="perk-icon perk-icon-blue" style={{ width: '32px', height: '32px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </span>
              O link só pode ser usado uma vez
            </li>
          </ul>
        </div>

        <div className="auth-split-form">
          <div className="auth-form-card">
            <div className="auth-form-header">
              <h2>Redefinir senha</h2>
              <p>Escolha uma nova senha para sua conta</p>
            </div>
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
}

export default ResetPassword;

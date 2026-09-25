import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import AppHeader from './AppHeader';
import InlineAlert from './InlineAlert';
import { useTheme } from '../utils/theme';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [feedback, setFeedback] = useState({ type: 'info', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback({ type: 'info', message: '' });

    try {
      await api.post('/recuperacao-senha/solicitar', { email });
      setSent(true);
    } catch {
      // Sempre mostra a mesma mensagem para não revelar se o e-mail existe
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell page-shell-auth">
      <AppHeader
        subtitle="Recuperar senha"
        onHome={() => navigate('/')}
        onToggleTheme={toggleTheme}
        theme={theme}
      />

      <main className="auth-split-layout">
        <div className="auth-split-panel" style={{ alignItems: 'center', textAlign: 'center' }}>
          <div className="auth-split-brand" style={{ justifyItems: 'center', textAlign: 'center' }}>
            <img src="/logoCursiFyBranco.png.png" alt="CursiFy" className="auth-brand-logo" style={{ width: '80px', height: '80px' }} />
            <h1 className="auth-brand-name" style={{ fontSize: '3rem' }}>CursiFy</h1>
            <p className="auth-brand-tagline" style={{ fontSize: '1.1rem', textAlign: 'center' }}>Recupere o acesso à sua conta</p>
          </div>
          <ul className="auth-panel-perks" style={{ alignItems: 'center' }}>
            <li style={{ justifyContent: 'center', fontSize: '1.02rem' }}>
              <span className="perk-icon perk-icon-blue" style={{ width: '32px', height: '32px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </span>
              Enviaremos um link seguro para seu e-mail
            </li>
            <li style={{ justifyContent: 'center', fontSize: '1.02rem' }}>
              <span className="perk-icon perk-icon-blue" style={{ width: '32px', height: '32px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </span>
              O link expira em 1 hora por segurança
            </li>
            <li style={{ justifyContent: 'center', fontSize: '1.02rem' }}>
              <span className="perk-icon perk-icon-blue" style={{ width: '32px', height: '32px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </span>
              Só pode ser usado uma vez
            </li>
          </ul>
        </div>

        <div className="auth-split-form">
          <div className="auth-form-card">
            <div className="auth-form-header">
              <h2>Esqueceu sua senha?</h2>
              <p>Informe seu e-mail cadastrado e enviaremos as instruções</p>
            </div>

            {sent ? (
              <div>
                <InlineAlert
                  type="success"
                  message="Se este e-mail estiver cadastrado, você receberá as instruções de recuperação em breve. Verifique também sua caixa de spam."
                />
                <button
                  type="button"
                  className="btn btn-primary auth-submit-full"
                  style={{ marginTop: '16px' }}
                  onClick={() => navigate('/login')}
                >
                  Voltar para o login
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <InlineAlert type={feedback.type} message={feedback.message} />

                <div className="form-group">
                  <label>E-mail</label>
                  <div className="input-icon-wrap">
                    <svg className="input-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="seu@email.com"
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary auth-submit-full" disabled={loading}>
                  {loading ? 'Enviando...' : 'Enviar instruções'}
                </button>
              </form>
            )}

            {!sent && (
              <p className="auth-switch">
                Lembrou a senha? <span onClick={() => navigate('/login')}>Voltar para o login</span>
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default ForgotPassword;

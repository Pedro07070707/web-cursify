import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AppHeader from './AppHeader';
import InlineAlert from './InlineAlert';
import { useTheme } from '../utils/theme';

function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [feedback, setFeedback] = useState({ type: 'info', message: '' });
  const [invalidFields, setInvalidFields] = useState({});
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ type: 'info', message: '' });
    setInvalidFields({});

    try {
      const response = await axios.post('http://localhost:8080/api/v1/usuario/login', { email, senha });
      const usuario = response.data;

      localStorage.setItem('userId', usuario.id);
      localStorage.setItem('userName', usuario.nome);
      localStorage.setItem('userEmail', usuario.email);
      localStorage.setItem('userCpf', usuario.cpf || '');
      localStorage.setItem('nivelAcesso', usuario.nivelAcesso);

      if (usuario.nivelAcesso === 'PROFESSOR') {
        navigate('/teacher');
      } else if (usuario.nivelAcesso === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/student');
      }
    } catch (error) {
      const msg = error.response?.data?.message;
      if (error.response?.status === 403) {
        setFeedback({ type: 'error', message: msg || 'Sua conta foi desativada. Entre em contato com o administrador.' });
        setInvalidFields({ email: true, senha: true });
      } else if (error.response?.status === 401) {
        setFeedback({ type: 'error', message: msg || 'Email ou senha incorretos.' });
        setInvalidFields({ email: true, senha: true });
      } else {
        setFeedback({ type: 'error', message: 'Erro no login. Tente novamente.' });
      }
    }
  };

  return (
    <div className="page-shell page-shell-auth">
      <AppHeader
        subtitle="Entrar"
        onHome={() => navigate('/')}
        onToggleTheme={toggleTheme}
        theme={theme}
      />

      <main className="auth-split-layout">
        {/* Painel visual */}
        <div className="auth-split-panel" style={{ alignItems: 'center', textAlign: 'center' }}>
          <div className="auth-split-brand" style={{ justifyItems: 'center', textAlign: 'center' }}>
            <img src="/logoCursiFyBranco.png.png" alt="CursiFy" className="auth-brand-logo" style={{ width: '80px', height: '80px' }} />
            <h1 className="auth-brand-name" style={{ fontSize: '3rem' }}>CursiFy</h1>
            <p className="auth-brand-tagline" style={{ fontSize: '1.1rem', textAlign: 'center' }}>Plataforma educacional para o ensino fundamental e médio</p>
          </div>
          <ul className="auth-panel-perks" style={{ alignItems: 'center' }}>
            <li style={{ justifyContent: 'center', fontSize: '1.02rem' }}>
              <span className="perk-icon perk-icon-blue" style={{ width: '32px', height: '32px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </span>
              Cursos completos de Matemática e Português
            </li>
            <li style={{ justifyContent: 'center', fontSize: '1.02rem' }}>
              <span className="perk-icon perk-icon-blue" style={{ width: '32px', height: '32px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </span>
              Acompanhamento de progresso em tempo real
            </li>
            <li style={{ justifyContent: 'center', fontSize: '1.02rem' }}>
              <span className="perk-icon perk-icon-blue" style={{ width: '32px', height: '32px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </span>
              Área dedicada para alunos e professores
            </li>
          </ul>
        </div>

        {/* Formulário */}
        <div className="auth-split-form">
          <div className="auth-form-card">
            <div className="auth-form-header">
              <h2>Bem-vindo de volta</h2>
              <p>Entre com sua conta para continuar</p>
            </div>

            <form onSubmit={handleSubmit}>
              <InlineAlert type={feedback.type} message={feedback.message} />

              <div className="form-group">
                <label>Email</label>
                <div className="input-icon-wrap">
                  <svg className="input-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setInvalidFields((current) => ({ ...current, email: false }));
                    }}
                    required
                    placeholder="seu@email.com"
                    className={invalidFields.email ? 'input-error' : ''}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Senha</label>
                <div className="input-icon-wrap">
                  <svg className="input-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  <input
                    type="password"
                    value={senha}
                    onChange={(e) => {
                      setSenha(e.target.value);
                      setInvalidFields((current) => ({ ...current, senha: false }));
                    }}
                    required
                    placeholder="Sua senha"
                    className={invalidFields.senha ? 'input-error' : ''}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary auth-submit-full">
                Entrar
              </button>
            </form>

            <p className="auth-switch">
              Não tem conta? <span onClick={() => navigate('/register')}>Cadastre-se gratuitamente</span>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Login;

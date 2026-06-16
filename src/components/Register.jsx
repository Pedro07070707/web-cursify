import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AppHeader from './AppHeader';
import InlineAlert from './InlineAlert';
import { useTheme } from '../utils/theme';

function Register() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nivelAcesso, setNivelAcesso] = useState('ALUNO');
  const [feedback, setFeedback] = useState({ type: 'info', message: '' });
  const [invalidFields, setInvalidFields] = useState({});
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const validatePassword = (password) => {
    const hasLetters = /[a-zA-Z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const validLength = password.length >= 8 && password.length <= 20;
    return hasLetters && hasNumbers && validLength;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ type: 'info', message: '' });
    setInvalidFields({});

    if (!validatePassword(senha)) {
      setFeedback({ type: 'error', message: 'A senha deve ter entre 8 e 20 caracteres, incluindo letras e numeros.' });
      setInvalidFields({ senha: true });
      return;
    }

    const novoUsuario = {
      nome,
      email,
      senha,
      nivelAcesso,
      dataCadastro: new Date().toISOString().slice(0, 19),
      statusUsuario: true,
    };

    try {
      const response = await axios.post('http://localhost:8080/api/v1/usuario', novoUsuario);

      localStorage.setItem('userId', response.data.id);
      localStorage.setItem('userName', nome);
      localStorage.setItem('userEmail', email);
      localStorage.setItem('nivelAcesso', nivelAcesso);

      if (nivelAcesso === 'PROFESSOR') {
        navigate('/teacher');
      } else {
        navigate('/student');
      }
    } catch (error) {
      console.error('Erro ao cadastrar usuario:', error);
      const msg = error.response?.data?.message || error.response?.data || error.message;
      const serialized = JSON.stringify(msg);
      setFeedback({ type: 'error', message: `Erro ao cadastrar: ${serialized}` });
      setInvalidFields({
        email: serialized.toLowerCase().includes('email'),
        senha: serialized.toLowerCase().includes('senha'),
      });
    }
  };

  return (
    <div className="page-shell page-shell-auth">
      <AppHeader
        subtitle="Cadastro"
        onHome={() => navigate('/')}
        onToggleTheme={toggleTheme}
        theme={theme}
      />

      <main className="auth-split-layout">
        {/* Painel visual */}
        <div className="auth-split-panel">
          <div className="auth-split-brand">
            <img src="/logoCursiFy.png" alt="CursiFy" className="auth-brand-logo" />
            <h1 className="auth-brand-name">CursiFy</h1>
            <p className="auth-brand-tagline">Comece sua jornada de aprendizado hoje mesmo</p>
          </div>
          <ul className="auth-panel-perks">
            <li>
              <span className="perk-icon perk-icon-blue">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </span>
              Cadastro gratuito, sem cartão de crédito
            </li>
            <li>
              <span className="perk-icon perk-icon-blue">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </span>
              Acesso imediato a todos os cursos
            </li>
            <li>
              <span className="perk-icon perk-icon-blue">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </span>
              Perfis distintos para alunos e professores
            </li>
          </ul>
        </div>

        {/* Formulário */}
        <div className="auth-split-form">
          <div className="auth-form-card">
            <div className="auth-form-header">
              <h2>Criar conta</h2>
              <p>Preencha os dados abaixo para começar</p>
            </div>

            <form onSubmit={handleSubmit}>
              <InlineAlert type={feedback.type} message={feedback.message} />

              <div className="form-group">
                <label>Nome</label>
                <div className="input-icon-wrap">
                  <svg className="input-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                    placeholder="Seu nome completo"
                  />
                </div>
              </div>

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
                    placeholder="Mínimo 8 caracteres"
                    className={invalidFields.senha ? 'input-error' : ''}
                  />
                </div>
                <small className="field-help">Entre 8 e 20 caracteres, com letras e números.</small>
              </div>

              <div className="form-group">
                <label>Perfil de acesso</label>
                <div className="register-role-toggle">
                  <button
                    type="button"
                    className={`role-option${nivelAcesso === 'ALUNO' ? ' is-active' : ''}`}
                    onClick={() => setNivelAcesso('ALUNO')}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/></svg>
                    Aluno
                  </button>
                  <button
                    type="button"
                    className={`role-option${nivelAcesso === 'PROFESSOR' ? ' is-active' : ''}`}
                    onClick={() => setNivelAcesso('PROFESSOR')}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                    Professor
                  </button>
                </div>
              </div>

              <button type="submit" className="btn btn-primary auth-submit-full">
                Criar conta gratuita
              </button>
            </form>

            <p className="auth-switch">
              Já tem conta? <span onClick={() => navigate('/login')}>Entrar</span>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Register;

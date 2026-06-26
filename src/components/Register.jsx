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
  const [cpf, setCpf] = useState('');
  const [nivelAcesso, setNivelAcesso] = useState('ALUNO');
  const [aceitaTermos, setAceitaTermos] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [feedback, setFeedback] = useState({ type: 'info', message: '' });
  const [invalidFields, setInvalidFields] = useState({});
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleCpfChange = (e) => {
    const onlyDigits = e.target.value.replace(/\D/g, '').slice(0, 11);
    setCpf(onlyDigits);
  };

  const formatCpf = (value) => {
    if (value.length <= 3) return value;
    if (value.length <= 6) return `${value.slice(0, 3)}.${value.slice(3)}`;
    if (value.length <= 9) return `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6)}`;
    return `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6, 9)}-${value.slice(9)}`;
  };

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

    if (cpf.length !== 11) {
      setFeedback({ type: 'error', message: 'O CPF deve ter exatamente 11 dígitos.' });
      setInvalidFields({ cpf: true });
      return;
    }

    if (!aceitaTermos) {
      setFeedback({ type: 'error', message: 'Você precisa aceitar a Política de Privacidade para continuar.' });
      return;
    }

    const novoUsuario = {
      nome,
      email,
      senha,
      cpf,
      nivelAcesso,
      dataCadastro: new Date().toISOString().slice(0, 19),
      statusUsuario: 'Ativo',
    };

    try {
      const response = await axios.post('http://localhost:8080/api/v1/usuario', novoUsuario);

      localStorage.setItem('userId', response.data.id);
      localStorage.setItem('userName', nome);
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userCpf', cpf);
      localStorage.setItem('nivelAcesso', nivelAcesso);

      if (nivelAcesso === 'PROFESSOR') {
        navigate('/teacher');
      } else if (nivelAcesso === 'ADMIN') {
        navigate('/admin');
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
        cpf: serialized.toLowerCase().includes('cpf'),
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
        <div className="auth-split-panel" style={{ alignItems: 'center', textAlign: 'center' }}>
          <div className="auth-split-brand" style={{ justifyItems: 'center', textAlign: 'center' }}>
            <img src="/logoCursiFyBranco.png.png" alt="CursiFy" className="auth-brand-logo" style={{ width: '80px', height: '80px' }} />
            <h1 className="auth-brand-name" style={{ fontSize: '3rem' }}>CursiFy</h1>
            <p className="auth-brand-tagline" style={{ fontSize: '1.1rem', textAlign: 'center' }}>Comece sua jornada de aprendizado hoje mesmo</p>
          </div>
          <ul className="auth-panel-perks" style={{ alignItems: 'center' }}>
            <li style={{ justifyContent: 'center', fontSize: '1.02rem' }}>
              <span className="perk-icon perk-icon-blue" style={{ width: '32px', height: '32px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </span>
              Cadastro gratuito, sem cartão de crédito
            </li>
            <li style={{ justifyContent: 'center', fontSize: '1.02rem' }}>
              <span className="perk-icon perk-icon-blue" style={{ width: '32px', height: '32px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </span>
              Acesso imediato a todos os cursos
            </li>
            <li style={{ justifyContent: 'center', fontSize: '1.02rem' }}>
              <span className="perk-icon perk-icon-blue" style={{ width: '32px', height: '32px' }}>
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
              <label>Nivel de acesso:</label>
              <div className="choice-toggle">
                <button
                  type="button"
                  className={`choice-toggle-button${nivelAcesso === 'ALUNO' ? ' is-active' : ''}`}
                  onClick={() => setNivelAcesso('ALUNO')}
                >
                  Aluno
                </button>
                <button
                  type="button"
                  className={`choice-toggle-button${nivelAcesso === 'PROFESSOR' ? ' is-active' : ''}`}
                  onClick={() => setNivelAcesso('PROFESSOR')}
                >
                  Professor
                </button>
                <button
                  type="button"
                  className={`choice-toggle-button${nivelAcesso === 'ADMIN' ? ' is-active' : ''}`}
                  onClick={() => setNivelAcesso('ADMIN')}
                >
                  Admin
                </button>
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
                <label>CPF</label>
                <div className="input-icon-wrap">
                  <svg className="input-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><line x1="7" y1="9" x2="17" y2="9"/><line x1="7" y1="13" x2="13" y2="13"/></svg>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formatCpf(cpf)}
                    onChange={handleCpfChange}
                    required
                    placeholder="000.000.000-00"
                    className={invalidFields.cpf ? 'input-error' : ''}
                    maxLength={14}
                  />
                </div>
                <small className="field-help">Somente números, 11 dígitos.</small>
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
                  <button
                    type="button"
                    className={`role-option${nivelAcesso === 'ADMIN' ? ' is-active' : ''}`}
                    onClick={() => setNivelAcesso('ADMIN')}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l7 4v5c0 5-3 8-7 11-4-3-7-6-7-11V6l7-4z"/><path d="M9 12l2 2 4-4"/></svg>
                    Admin
                  </button>
                </div>
              </div>

              <label className="privacy-checkbox">
                <input
                  type="checkbox"
                  checked={aceitaTermos}
                  onChange={(e) => setAceitaTermos(e.target.checked)}
                />
                <span className="privacy-checkbox-box" />
                <span className="privacy-checkbox-label">
                  Concordo com a{' '}
                  <button type="button" className="privacy-link" onClick={() => setModalOpen(true)}>
                    Política de Privacidade e Termos de Uso
                  </button>
                </span>
              </label>

              <button
                type="submit"
                className="btn btn-primary auth-submit-full"
                disabled={!aceitaTermos}
              >
                Criar conta gratuita
              </button>
            </form>

            <p className="auth-switch">
              Já tem conta? <span onClick={() => navigate('/login')}>Entrar</span>
            </p>
          </div>
        </div>
      </main>

      {modalOpen ? (
        <div className="privacy-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="privacy-modal" onClick={(e) => e.stopPropagation()}>
            <div className="privacy-modal-header">
              <h2>Política de Privacidade e Termos de Uso</h2>
              <button type="button" className="privacy-modal-close" onClick={() => setModalOpen(false)} aria-label="Fechar">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="privacy-modal-body">
              <p>Declaro que li e concordo com os Termos de Uso e a Política de Privacidade. Estou ciente de que meus dados pessoais (nome, e-mail e informações necessárias) serão utilizados exclusivamente para cadastro, autenticação, gerenciamento da conta e funcionamento dos serviços oferecidos pela plataforma CursiFy.</p>
            </div>
            <div className="privacy-modal-footer">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => { setAceitaTermos(true); setModalOpen(false); }}
              >
                Aceitar e fechar
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default Register;

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
      });
    }
  };

  return (
    <div className="page-shell">
      <AppHeader
        subtitle="Cadastro"
        navItems={[{ label: 'Pagina inicial', onClick: () => navigate('/') }]}
        onToggleTheme={toggleTheme}
        theme={theme}
      />

      <main className="container auth-layout">
        <div className="card auth-card">
          <h2>Criar conta</h2>
          <form onSubmit={handleSubmit}>
            <InlineAlert type={feedback.type} message={feedback.message} />

            <div className="form-group">
              <label>Nome:</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                placeholder="Digite seu nome"
              />
            </div>

            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setInvalidFields((current) => ({ ...current, email: false }));
                }}
                required
                placeholder="Digite seu email"
                className={invalidFields.email ? 'input-error' : ''}
              />
            </div>

            <div className="form-group">
              <label>Senha:</label>
              <input
                type="password"
                value={senha}
                onChange={(e) => {
                  setSenha(e.target.value);
                  setInvalidFields((current) => ({ ...current, senha: false }));
                }}
                required
                placeholder="Digite sua senha"
                className={invalidFields.senha ? 'input-error' : ''}
              />
              <small className="field-help">
                A senha deve ter entre 8 e 20 caracteres com letras e numeros.
              </small>
            </div>

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
            </div>

            <button type="submit" className="btn btn-primary auth-submit">
              Criar conta
            </button>
          </form>

          <p className="auth-switch">
            Ja tem conta? <span onClick={() => navigate('/login')}>Entrar</span>
          </p>
        </div>
      </main>
    </div>
  );
}

export default Register;

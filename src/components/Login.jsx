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
        setFeedback({ type: 'error', message: msg });
      } else if (error.response?.status === 401) {
        setFeedback({ type: 'error', message: msg || 'Email ou senha incorretos.' });
        setInvalidFields({ email: true, senha: true });
      } else {
        setFeedback({ type: 'error', message: 'Erro no login. Tente novamente.' });
      }
    }
  };

  return (
    <div className="page-shell">
      <AppHeader
        subtitle="Entrar"
        navItems={[{ label: 'Pagina inicial', onClick: () => navigate('/') }]}
        onToggleTheme={toggleTheme}
        theme={theme}
      />

      <main className="container auth-layout">
        <div className="card auth-card">
          <h2>Entrar</h2>
          <form onSubmit={handleSubmit}>
            <InlineAlert type={feedback.type} message={feedback.message} />

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
            </div>

            <button type="submit" className="btn btn-primary auth-submit">
              Entrar
            </button>
          </form>

          <p className="auth-switch">
            Nao tem conta? <span onClick={() => navigate('/register')}>Cadastre-se</span>
          </p>
        </div>
      </main>
    </div>
  );
}

export default Login;

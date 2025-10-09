import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Busca o usuário pelo email (ou autentica via API se existir endpoint de login)
      const response = await axios.get('http://localhost:8080/api/v1/usuario');
      const usuarios = response.data;

      const usuario = usuarios.find(
        (u) => u.email === email && u.senha === senha
      );

      if (usuario) {
        alert('Login realizado com sucesso!');
        console.log('Usuário logado:', usuario);

        // Salva informações no localStorage
        localStorage.setItem('userName', usuario.nome);
        localStorage.setItem('userEmail', usuario.email);
        localStorage.setItem('nivelAcesso', usuario.nivelAcesso);

        // Redireciona conforme o tipo de usuário
        if (usuario.nivelAcesso === 'PROFESSOR') {
          navigate('/teacher');
        } else if (usuario.nivelAcesso === 'ADMIN') {
          navigate('/admin');
        } else {
          navigate('/student');
        }
      } else {
        alert('Email ou senha incorretos.');
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      alert('Erro no login. Tente novamente.');
    }
  };

  return (
    <div>
      <header className="header">
        <div className="logo">
          <img src="/logoCursiFy.png" alt="Web Cursify" />
          Cursify - Login
        </div>
        <div className="nav-buttons">
          <button className="btn btn-secondary" onClick={() => navigate('/')}>
            Início
          </button>
        </div>
      </header>

      <div className="container">
        <div className="card" style={{ maxWidth: '400px', margin: '2rem auto' }}>
          <h2>Entrar</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Digite seu email"
              />
            </div>

            <div className="form-group">
              <label>Senha:</label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                placeholder="Digite sua senha"
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Entrar
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1rem' }}>
            Não tem conta?{' '}
            <span
              style={{ color: 'var(--azul-marinho)', cursor: 'pointer' }}
              onClick={() => navigate('/register')}
            >
              Cadastre-se
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
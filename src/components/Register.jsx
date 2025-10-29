import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Register() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nivelAcesso, setNivelAcesso] = useState('ALUNO');
  const navigate = useNavigate();

  const validatePassword = (password) => {
    const hasLetters = /[a-zA-Z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const validLength = password.length >= 8 && password.length <= 20;
    return hasLetters && hasNumbers && validLength;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validatePassword(senha)) {
      alert('A senha deve ter entre 8 e 20 caracteres, incluindo letras e números.');
      return;
    }

    const novoUsuario = {
      nome,
      email,
      senha,
      nivelAcesso,
      dataCadastro: new Date().toISOString().replace('Z', ''),
      statusUsuario: true,
    };

    try {
      const response = await axios.post('http://localhost:8080/api/v1/usuario', novoUsuario);
      console.log('Resposta da API:', response.data);

      // salva informações básicas no localStorage
      localStorage.setItem('userId', response.data.id);
      localStorage.setItem('userName', nome);
      localStorage.setItem('userEmail', email);
      localStorage.setItem('nivelAcesso', nivelAcesso);

      // redireciona de acordo com o tipo de usuário
      if (nivelAcesso === 'PROFESSOR') {
        navigate('/teacher');
      } else if (nivelAcesso === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/student');
      }

    } catch (error) {
      console.error('Erro ao cadastrar usuário:', error);
      alert('Erro ao cadastrar. Verifique os dados e tente novamente.');
    }
  };

  return (
    <div>
      <header className="header">
        <div className="logo">
          <img src="/logoCursiFy.png" alt="Web Cursify" />
          Cursify - Cadastro
        </div>
        <div className="nav-buttons">
          <button className="btn btn-secondary" onClick={() => navigate('/')}>
            Voltar
          </button>
        </div>
      </header>

      <div className="container">
        <div className="card" style={{ maxWidth: '400px', margin: '2rem auto' }}>
          <h2>Criar Conta</h2>
          <form onSubmit={handleSubmit}>
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
              <small style={{ color: '#666', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                A senha deve ter:
                <br />
                Entre 8 e 20 caracteres
                <br />
                Letras e números.
              </small>
            </div>

            <div className="form-group">
              <label>Nível de Acesso:</label>
              <select value={nivelAcesso} onChange={(e) => setNivelAcesso(e.target.value)}>
                <option value="ALUNO">Aluno</option>
                <option value="PROFESSOR">Professor</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Criar Conta
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1rem' }}>
            Já tem conta?{' '}
            <span
              style={{ color: 'var(--azul-marinho)', cursor: 'pointer' }}
              onClick={() => navigate('/login')}
            >
              Entrar
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
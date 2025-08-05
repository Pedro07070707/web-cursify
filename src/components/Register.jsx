import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('student');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulação de cadastro - em produção seria uma API
    localStorage.setItem('userType', userType);
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userName', name);
    
    if (userType === 'teacher') {
      navigate('/teacher');
    } else {
      navigate('/student');
    }
  };

  return (
    <div>
      <header className="header">
        <div className="logo">
          <img src="/folder-icon.svg" alt="Web Cursify" />
          Web Cursify
        </div>
        <div className="nav-buttons">
          <button className="btn btn-secondary" onClick={() => navigate('/')}>
            Início
          </button>
        </div>
      </header>

      <div className="container">
        <div className="card" style={{maxWidth: '400px', margin: '2rem auto'}}>
          <h2>Cadastrar</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nome:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Digite seu nome completo"
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Digite sua senha"
              />
            </div>
            <div className="form-group">
              <label>Tipo de usuário:</label>
              <select value={userType} onChange={(e) => setUserType(e.target.value)}>
                <option value="student">Aluno</option>
                <option value="teacher">Professor</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary" style={{width: '100%'}}>
              Cadastrar
            </button>
          </form>
          <p style={{textAlign: 'center', marginTop: '1rem'}}>
            Já tem conta? <span style={{color: 'var(--azul-marinho)', cursor: 'pointer'}} onClick={() => navigate('/login')}>Entre aqui</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
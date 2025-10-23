import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const userName = localStorage.getItem('userName') || 'Usuário';

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/v1/usuario');
        setUsers(response.data);
      } catch (error) {
        console.error('Erro ao carregar usuários:', error);
      }
    };
    fetchUsers();
  }, []);

  const validatePassword = (password) => {
    const hasLetters = /[a-zA-Z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const validLength = password.length >= 8 && password.length <= 20;
    return hasLetters && hasNumbers && validLength;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validatePassword(newPassword)) {
      alert('A nova senha deve ter entre 8 e 20 caracteres, incluindo letras e números.');
      return;
    }

    if (newPassword !== confirmPassword) {
      alert('A nova senha e a confirmação não coincidem.');
      return;
    }

    try {
      const user = users.find(u => u.id === parseInt(userId));
      
      if (user.senha !== currentPassword) {
        alert('Senha atual incorreta.');
        return;
      }

      await axios.put(`http://localhost:8080/api/v1/usuario/${userId}`, {
        ...user,
        senha: newPassword
      });

      alert('Senha alterada com sucesso!');
      navigate('/profile');
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      alert('Erro ao alterar senha. Tente novamente.');
    }
  };

  return (
    <div>
      <header className="header">
        <div className="logo">
          <img src="/logoCursiFy.png" alt="Web Cursify" />
          Cursify - Alterar Senha
        </div>
        <div className="nav-buttons">
          <span style={{color: 'white', marginRight: '1rem'}}>Olá, {userName}!</span>
          <button className="btn btn-secondary" onClick={() => navigate('/profile')}>
            Voltar
          </button>
        </div>
      </header>

      <div className="container">
        <div className="card" style={{ maxWidth: '400px', margin: '2rem auto' }}>
          <h2>Alterar Senha</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Senha Atual:</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                placeholder="Digite sua senha atual"
              />
            </div>

            <div className="form-group">
              <label>Nova Senha:</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="Digite a nova senha"
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
              <label>Confirmar Nova Senha:</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Confirme a nova senha"
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Alterar Senha
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ChangePassword;
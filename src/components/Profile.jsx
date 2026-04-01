import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Profile() {
    const [users, setUsers] = useState([]);
    const nivelAcesso = localStorage.getItem('nivelAcesso');
    const userType = nivelAcesso === 'PROFESSOR' ? 'teacher' : nivelAcesso === 'ADMIN' ? 'admin' : 'student';
    const navigate = useNavigate();
    const userName = localStorage.getItem('userName') || 'Aluno';
    const userEmail = localStorage.getItem('userEmail') || 'Aluno';
    const userId = localStorage.getItem('userId');

    useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/v1/usuario');
            setUsers(response.data);
        } catch (error) {
            console.error('Erro ao carregar usuários:', error);
            alert('Erro ao carregar usuários. Verifique a API.');
        }
        };
        fetchUsers();
    }, []);

    const handlePasswordChange = () => {
        navigate('/change-password');
    };

    // Função para deletar usuário
  const handleDelete = async (id, nome) => {
    if (!window.confirm(`Tem certeza que deseja excluir o usuário "${nome}"?`)) return;

    try {
    await axios.delete(`http://localhost:8080/api/v1/usuario/${id}`);
        alert(`Usuário "${nome}" excluído com sucesso!`);
        localStorage.clear();
        navigate('/');
        } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        alert('Erro ao excluir o usuário. Tente novamente.');
        }
    };

    return (
    <div>
        <header className="header">
        <div className="logo" onClick={() => navigate("/")} style={{cursor: "pointer"}}>
          <img src="/logoCursiFy.png" alt="Web Cursify" />
          Cursify - Perfil do Aluno
        </div>
        <div className="nav-buttons">
          <span style={{color: 'white', marginRight: '1rem'}}>Olá, {userName}!</span>
          <button className="btn btn-secondary" onClick={() => navigate(userType === 'teacher' ? '/teacher' : userType === 'admin' ? '/admin' : '/student')}>
            Voltar
          </button>
        </div>
      </header>

      <div className="container dashboard">
        <div className="card">
            <h2 style={{color: '', textAlign: 'center', marginBottom: '2rem'}}>
            Seu Perfil
            </h2>
            <div>
                <p><strong>Nome:</strong> {userName}</p><br></br>
                <p><strong>Email:</strong> {userEmail}</p><br></br>
                <p><strong>Tipo de usuário:</strong> {nivelAcesso === 'PROFESSOR' ? 'Professor' : nivelAcesso === 'ADMIN' ? 'Administrador' : 'Estudante'}</p>
            </div>
            <div style={{ textAlign: 'center', marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button 
                onClick={handlePasswordChange}
                style={{
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                🔑 Alterar Senha
              </button>
              <button 
                onClick={() => handleDelete(userId, userName)}
                style={{
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                🗑️ Excluir Conta
              </button>
            </div>
        </div>
      </div>
    </div>
    );
}

export default Profile;
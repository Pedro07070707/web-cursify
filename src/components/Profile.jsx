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

    // 🔹 Função para deletar usuário
  const handleDelete = async (id, nome) => {
    if (!window.confirm(`Tem certeza que deseja excluir o usuário "${nome}"?`)) return;

    try {
    await axios.delete(`http://localhost:8080/api/v1/usuario/${id}`);
        setUsers(users.filter(usuario => usuario.id !== id));
        alert(`Usuário "${nome}" excluído com sucesso!`);
        } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        alert('Erro ao excluir o usuário. Tente novamente.');
        }
    };

    return (
    <div>
        <header className="header">
        <div className="logo">
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
                <h3>Nome: {userName}</h3>
                <p><strong>Email:</strong> {userEmail}</p>
            </div>
            <div className="nav-buttons">
              <button className="btn btn-secondary" onClick={() => handleDelete(userId, userName)}>
                Excluir usuário
              </button>
            </div>
        </div>
      </div>
    </div>
    );
}

export default Profile;
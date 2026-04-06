import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { clearSessionData } from '../utils/authStorage';

const NIVEIS = {
  FUNDAMENTAL_1: 'Fundamental 1 (1o ao 5o ano)',
  FUNDAMENTAL_2: 'Fundamental 2 (6o ao 9o ano)',
  MEDIO_1: 'Ensino Medio - 1o ano',
  MEDIO_2: 'Ensino Medio - 2o ano',
  MEDIO_3: 'Ensino Medio - 3o ano',
  OUTROS: 'Outros',
};

function AdminDashboardPage() {
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [activeTab, setActiveTab] = useState('users');
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'Administrador';

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/v1/usuario');
        setUsers(response.data);
      } catch (error) {
        console.error('Erro ao carregar usuarios:', error);
      }
    };

    const fetchCourses = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/v1/curso');
        setCourses(response.data);
      } catch (error) {
        console.error('Erro ao carregar cursos:', error);
      }
    };

    fetchUsers();
    fetchCourses();
  }, []);

  const handleUpdateStatus = async (userId, userDisplayName) => {
    const user = users.find((item) => item.id === userId);
    const newStatus = !user.statusUsuario;
    const action = newStatus ? 'ativar' : 'inativar';

    if (!window.confirm(`Tem certeza que deseja ${action} o usuario "${userDisplayName}"?`)) return;

    try {
      await axios.put(`http://localhost:8080/api/v1/usuario/${userId}`, {
        ...user,
        statusUsuario: newStatus,
      });

      setUsers(users.map((item) => (
        item.id === userId ? { ...item, statusUsuario: newStatus } : item
      )));

      alert(`Usuario "${userDisplayName}" ${newStatus ? 'ativado' : 'inativado'} com sucesso!`);
    } catch (error) {
      console.error('Erro ao atualizar usuario:', error);
      alert('Erro ao atualizar status do usuario. Tente novamente.');
    }
  };

  const handleDelete = async (userId, userDisplayName) => {
    if (!window.confirm(`Tem certeza que deseja excluir o usuario "${userDisplayName}"?`)) return;

    try {
      await axios.delete(`http://localhost:8080/api/v1/usuario/${userId}`);
      setUsers(users.filter((item) => item.id !== userId));
      alert(`Usuario "${userDisplayName}" excluido com sucesso!`);
    } catch (error) {
      console.error('Erro ao excluir usuario:', error);
      alert('Erro ao excluir o usuario. Tente novamente.');
    }
  };

  const handleCourseDelete = async (courseId, courseName) => {
    if (!window.confirm(`Tem certeza que deseja excluir o curso "${courseName}"?`)) return;

    try {
      await axios.delete(`http://localhost:8080/api/v1/curso/${courseId}`);
      setCourses(courses.filter((item) => item.id !== courseId));
      alert(`Curso "${courseName}" excluido com sucesso!`);
    } catch (error) {
      console.error('Erro ao excluir curso:', error);
      alert('Erro ao excluir o curso. Tente novamente.');
    }
  };

  const handleUpdate = async (userId, userDisplayName) => {
    const newPassword = prompt('Digite a nova senha:');
    if (!newPassword) return;

    const hasLetters = /[a-zA-Z]/.test(newPassword);
    const hasNumbers = /\d/.test(newPassword);
    const validLength = newPassword.length >= 8 && newPassword.length <= 20;

    if (!hasLetters || !hasNumbers || !validLength) {
      alert('A nova senha deve ter entre 8 e 20 caracteres, incluindo letras e numeros.');
      return;
    }

    if (!window.confirm(`Tem certeza que deseja alterar a senha do usuario "${userDisplayName}"?`)) return;

    try {
      const user = users.find((item) => item.id === userId);
      await axios.put(`http://localhost:8080/api/v1/usuario/${userId}`, {
        ...user,
        senha: newPassword,
      });

      alert(`Senha do usuario "${userDisplayName}" alterada com sucesso!`);
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      alert('Erro ao alterar senha. Tente novamente.');
    }
  };

  const handleLogout = () => {
    clearSessionData();
    navigate('/');
  };

  return (
    <div>
      <header className="header">
        <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <img src="/logoCursiFy.png" alt="Web Cursify" />
          Cursify - Area do Administrador
        </div>
        <div className="nav-buttons">
          <span style={{ color: 'white', marginRight: '1rem' }}>Ola, {userName}!</span>
          <button className="btn btn-primary" onClick={() => navigate('/profile')}>
            Perfil
          </button>
          <button className="btn btn-secondary" onClick={handleLogout}>
            Sair
          </button>
        </div>
      </header>

      <div className="container">
        <div className="card" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
          <h1>Painel do Administrador</h1>

          <div style={{ marginBottom: '20px' }}>
            <button
              onClick={() => setActiveTab('users')}
              style={{
                padding: '10px 20px',
                marginRight: '10px',
                backgroundColor: activeTab === 'users' ? '#007bff' : '#f8f9fa',
                color: activeTab === 'users' ? 'white' : 'black',
                border: '1px solid #ddd',
                borderRadius: '5px',
                cursor: 'pointer',
              }}
            >
              Usuarios
            </button>
            <button
              onClick={() => setActiveTab('courses')}
              style={{
                padding: '10px 20px',
                backgroundColor: activeTab === 'courses' ? '#007bff' : '#f8f9fa',
                color: activeTab === 'courses' ? 'white' : 'black',
                border: '1px solid #ddd',
                borderRadius: '5px',
                cursor: 'pointer',
              }}
            >
              Cursos
            </button>
          </div>

          {activeTab === 'users' && (
            <div>
              <h2>Usuarios ({users.length})</h2>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa' }}>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Nome</th>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Email</th>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Tipo</th>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Registrado em</th>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td style={{ padding: '12px', border: '1px solid #ddd' }}>{user.nome}</td>
                      <td style={{ padding: '12px', border: '1px solid #ddd' }}>{user.email}</td>
                      <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                        <span
                          style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            backgroundColor:
                              user.nivelAcesso === 'PROFESSOR' ? '#e3f2fd' :
                              user.nivelAcesso === 'ADMIN' ? '#fff3e0' : '#f3e5f5',
                            color:
                              user.nivelAcesso === 'PROFESSOR' ? '#1976d2' :
                              user.nivelAcesso === 'ADMIN' ? '#f57c00' : '#7b1fa2',
                            fontSize: '12px',
                          }}
                        >
                          {user.nivelAcesso === 'PROFESSOR' ? 'Professor' :
                            user.nivelAcesso === 'ADMIN' ? 'Admin' : 'Estudante'}
                        </span>
                      </td>
                      <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                        <span
                          style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            backgroundColor: user.statusUsuario ? '#e8f5e8' : '#ffebee',
                            color: user.statusUsuario ? '#2e7d32' : '#c62828',
                            fontSize: '12px',
                          }}
                        >
                          {user.statusUsuario ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                        {user.dataCadastro
                          ? new Date(user.dataCadastro).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })
                          : '-'}
                      </td>
                      <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => handleUpdateStatus(user.id, user.nome)}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: user.statusUsuario ? '#dc3545' : '#28a745',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px',
                            }}
                          >
                            {user.statusUsuario ? 'Inativar' : 'Ativar'}
                          </button>
                          <button
                            onClick={() => handleUpdate(user.id, user.nome)}
                            style={{
                              padding: '6px 8px',
                              backgroundColor: '#007bff',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px',
                            }}
                          >
                            Alterar senha
                          </button>
                          <button
                            onClick={() => handleDelete(user.id, user.nome)}
                            style={{
                              padding: '6px 8px',
                              backgroundColor: '#dc3545',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px',
                            }}
                          >
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'courses' && (
            <div>
              <h2>Cursos ({courses.length})</h2>
              <div style={{ display: 'grid', gap: '20px', marginTop: '20px' }}>
                {courses.map((course) => (
                  <div
                    key={course.id}
                    style={{
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      padding: '20px',
                      backgroundColor: '#f8f9fa',
                    }}
                  >
                    <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>{course.nome}</h3>
                    <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#555' }}>
                      <strong>Categoria:</strong> {NIVEIS[course.categoria] || course.categoria}
                    </p>
                    <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#555' }}>
                      <strong>Carga horaria:</strong> {course.duracao || `${course.cargaHoraria} horas`}
                    </p>
                    <p style={{ margin: '0 0 10px 0', color: '#666' }}>{course.descricao}</p>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '15px' }}>
                      <button
                        onClick={() => handleCourseDelete(course.id, course.nome)}
                        style={{
                          padding: '6px 8px',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                        }}
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboardPage;

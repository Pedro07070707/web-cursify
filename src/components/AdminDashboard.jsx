import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function AdminDashboard() {
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
        console.error('Erro ao carregar usuários:', error);
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

  const handleUpdateStatus = async (userId, userName) => {
    const user = users.find(u => u.id === userId);
    const newStatus = !user.statusUsuario;
    const action = newStatus ? 'ativar' : 'inativar';
    
    if (!window.confirm(`Tem certeza que deseja ${action} o usuário "${userName}"?`)) return;
    
    try {
      await axios.put(`http://localhost:8080/api/v1/usuario/${userId}`, {
        ...user,
        statusUsuario: newStatus
      });
      
      setUsers(users.map(u => 
        u.id === userId ? { ...u, statusUsuario: newStatus } : u
      ));
      
      alert(`Usuário "${userName}" ${newStatus ? 'ativado' : 'inativado'} com sucesso!`);
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      alert('Erro ao atualizar status do usuário. Tente novamente.');
    }
  };

  const handleDelete = async (userId, userName) => {
    if (!window.confirm(`Tem certeza que deseja excluir o usuário "${userName}"?`)) return;

    try {
      await axios.delete(`http://localhost:8080/api/v1/usuario/${userId}`);
      setUsers(users.filter(u => u.id !== userId));
      alert(`Usuário "${userName}" excluído com sucesso!`);
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      alert('Erro ao excluir o usuário. Tente novamente.');
    }
  };

  const handleCourseUpdate = async (courseId, courseName) => {
    const course = courses.find(c => c.id === courseId);
    const newStatus = !course.statusCurso;
    const action = newStatus ? 'ativar' : 'inativar';
    
    if (!window.confirm(`Tem certeza que deseja ${action} o curso "${courseName}"?`)) return;
    
    try {
      await axios.put(`http://localhost:8080/api/v1/curso/${courseId}`, {
        ...course,
        statusCurso: newStatus
      });
      
      setCourses(courses.map(c => 
        c.id === courseId ? { ...c, statusCurso: newStatus } : c
      ));
      
      alert(`Curso "${courseName}" ${newStatus ? 'ativado' : 'inativado'} com sucesso!`);
    } catch (error) {
      console.error('Erro ao atualizar curso:', error);
      alert('Erro ao atualizar status do curso. Tente novamente.');
    }
  };

  const handleCourseDelete = async (courseId, courseName) => {
    if (!window.confirm(`Tem certeza que deseja excluir o curso "${courseName}"?`)) return;

    try {
      await axios.delete(`http://localhost:8080/api/v1/curso/${courseId}`);
      setCourses(courses.filter(c => c.id !== courseId));
      alert(`Curso "${courseName}" excluído com sucesso!`);
    } catch (error) {
      console.error('Erro ao excluir curso:', error);
      alert('Erro ao excluir o curso. Tente novamente.');
    }
  };

  const handleUpdate = async (userId, userName) => {
    const newPassword = prompt('Digite a nova senha:');
    if (!newPassword) return;
    
    const hasLetters = /[a-zA-Z]/.test(newPassword);
    const hasNumbers = /\d/.test(newPassword);
    const validLength = newPassword.length >= 8 && newPassword.length <= 20;
    
    if (!hasLetters || !hasNumbers || !validLength) {
      alert('A nova senha deve ter entre 8 e 20 caracteres, incluindo letras e números.');
      return;
    }
    
    if (!window.confirm(`Tem certeza que deseja alterar a senha do usuário "${userName}"?`)) return;
    
    try {
      const user = users.find(u => u.id === userId);
      await axios.put(`http://localhost:8080/api/v1/usuario/${userId}`, {
        ...user,
        senha: newPassword
      });
      
      alert(`Senha do usuário "${userName}" alterada com sucesso!`);
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      alert('Erro ao alterar senha. Tente novamente.');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div>
      <header className="header">
        <div className="logo">
          <img src="/logoCursiFy.png" alt="Web Cursify" />
          Cursify - Área do Administrador
        </div>
        <div className="nav-buttons">
          <span style={{color: 'white', marginRight: '1rem'}}>Olá, {userName}!</span>
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
            cursor: 'pointer'
          }}
        >
          Usuários
        </button>
        <button 
          onClick={() => setActiveTab('courses')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'courses' ? '#007bff' : '#f8f9fa',
            color: activeTab === 'courses' ? 'white' : 'black',
            border: '1px solid #ddd',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Cursos
        </button>
      </div>

      {activeTab === 'users' && (
        <div>
          <h2>Usuários ({users.length})</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Nome</th>
                <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Email</th>
                <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Tipo</th>
                <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Registrado em</th>
                <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td style={{ padding: '12px', border: '1px solid #ddd' }}>{user.nome}</td>
                  <td style={{ padding: '12px', border: '1px solid #ddd' }}>{user.email}</td>
                  <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      backgroundColor: 
                        user.nivelAcesso === 'PROFESSOR' ? '#e3f2fd' : 
                        user.nivelAcesso === 'ADMIN' ? '#fff3e0' : '#f3e5f5',
                      color: 
                        user.nivelAcesso === 'PROFESSOR' ? '#1976d2' : 
                        user.nivelAcesso === 'ADMIN' ? '#f57c00' : '#7b1fa2',
                      fontSize: '12px'
                    }}>
                      {user.nivelAcesso === 'PROFESSOR' ? 'Professor' : 
                       user.nivelAcesso === 'ADMIN' ? 'Admin' : 'Estudante'}
                    </span>
                  </td>
                  <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      backgroundColor: user.statusUsuario ? '#e8f5e8' : '#ffebee',
                      color: user.statusUsuario ? '#2e7d32' : '#c62828',
                      fontSize: '12px'
                    }}>
                      {user.statusUsuario ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                    {user.dataCadastro ? 
                      new Date(user.dataCadastro).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit', 
                        year: 'numeric'
                      }) : '-'
                    }
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
                          fontSize: '12px'
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
                          fontSize: '12px'
                        }}
                      >
                        🔑
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
                          fontSize: '12px'
                        }}
                      >
                        🗑️
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
            {courses.map(course => (
              <div key={course.id} style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '20px',
                backgroundColor: '#f8f9fa'
              }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>{course.nome}</h3>
                <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#555' }}><strong>Matéria:</strong> {course.materia || course.categoria}</p>
                <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#555' }}><strong>Duração:</strong> {course.duracao || `${course.cargaHoraria} horas`}</p>
                <p style={{ margin: '0 0 10px 0', color: '#666' }}>{course.descricao}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    backgroundColor: course.statusCurso ? '#e8f5e8' : '#ffebee',
                    color: course.statusCurso ? '#2e7d32' : '#c62828',
                    fontSize: '12px'
                  }}>
                    {course.statusCurso ? 'Ativo' : 'Inativo'}
                  </span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleCourseUpdate(course.id, course.nome)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: course.statusCurso ? '#dc3545' : '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      {course.statusCurso ? 'Inativar' : 'Ativar'}
                    </button>
                    <button
                      onClick={() => handleCourseDelete(course.id, course.nome)}
                      style={{
                        padding: '6px 8px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      🗑️
                    </button>
                  </div>
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

export default AdminDashboard;
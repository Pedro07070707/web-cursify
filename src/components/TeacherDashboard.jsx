import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function TeacherDashboard() {
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'Professor';

  // 🔹 Buscar cursos do professor
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/v1/curso');
        setCourses(response.data);
      } catch (error) {
        console.error('Erro ao carregar cursos:', error);
        alert('Erro ao carregar cursos. Verifique a API.');
      }
    };
    fetchCourses();
  }, []);

  // 🔹 Função para deletar curso
  const handleDelete = async (id, titulo) => {
    if (!window.confirm(`Tem certeza que deseja excluir o curso "${titulo}"?`)) return;

    try {
      await axios.delete(`http://localhost:8080/api/v1/curso/${id}`);
      setCourses(courses.filter(course => course.id !== id));
      alert(`Curso "${titulo}" excluído com sucesso!`);
    } catch (error) {
      console.error('Erro ao excluir curso:', error);
      alert('Erro ao excluir o curso. Tente novamente.');
    }
  };

  // 🔹 Função para atualizar status do curso
  const handleUpdate = async (id, nome, currentStatus) => {
    const course = courses.find(c => c.id === id);
    const newStatus = !course.statusCurso;
    const action = newStatus ? 'ativar' : 'inativar';
    
    if (!window.confirm(`Tem certeza que deseja ${action} o curso "${nome}"?`)) return;

    try {
      await axios.put(`http://localhost:8080/api/v1/curso/${id}`, {
        ...course,
        statusCurso: newStatus
      });
      
      setCourses(courses.map(c => 
        c.id === id ? { ...c, statusCurso: newStatus } : c
      ));
      
      alert(`Curso "${nome}" ${newStatus ? 'ativado' : 'inativado'} com sucesso!`);
    } catch (error) {
      console.error('Erro ao atualizar curso:', error);
      alert('Erro ao atualizar status do curso. Tente novamente.');
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
          Cursify - Área do Professor
        </div>
        <div className="nav-buttons">
          <span style={{ color: 'white', marginRight: '1rem' }}>Olá, {userName}!</span>
          <button className="btn btn-primary" onClick={() => navigate('/profile')}>
            Perfil
          </button>
          <button className="btn btn-secondary" onClick={handleLogout}>
            Sair
          </button>
        </div>
      </header>

      <div className="container dashboard">
        <h2 style={{ color: 'white', textAlign: 'center', marginBottom: '2rem' }}>
          Cursos Publicados
        </h2>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/publish-course')}
            style={{ marginRight: '1rem' }}
          >
            📚 Publicar Novo Curso
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/chat')}>
            💬 Chat com Alunos
          </button>
        </div>

        <div className="course-grid">
          {courses.map(course => (
            <div
              key={course.id}
              className="card course-card"
              style={{ position: 'relative' }}
            >
              {/* 🔴 Botão de deletar */}
              <button
                onClick={() => handleDelete(course.id, course.titulo)}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  size: 22,
                  color: "red",
                }}
                title="Excluir curso"
              >
              </button>

              <div onClick={() => navigate(`/course-view/${course.id}`)} style={{ cursor: 'pointer' }}>
                <h3>{course.nome}</h3>
                <p><strong>Matéria:</strong> {course.materia || course.categoria}</p>
                <p><strong>Duração:</strong> {course.duracao || `${course.cargaHoraria} horas`}</p>
                <div style={{ marginBottom: '10px' }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    backgroundColor: course.statusCurso ? '#e8f5e8' : '#ffebee',
                    color: course.statusCurso ? '#2e7d32' : '#c62828',
                    fontSize: '12px'
                  }}>
                    {course.statusCurso ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                <p>{course.descricao}</p>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUpdate(course.id, course.nome, course.statusCurso);
                  }}
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
              </div>

              <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
                👁️ Clique para ver detalhes
              </div>
            </div>
          ))}
        </div>

        {courses.length === 0 && (
          <div className="card" style={{ textAlign: 'center' }}>
            <p>Nenhum curso publicado ainda.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default TeacherDashboard;
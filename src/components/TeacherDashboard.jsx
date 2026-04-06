import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const NIVEIS = {
  FUNDAMENTAL_1: 'Fundamental 1 (1o ao 5o ano)',
  FUNDAMENTAL_2: 'Fundamental 2 (6o ao 9o ano)',
  MEDIO_1: 'Ensino Medio - 1o ano',
  MEDIO_2: 'Ensino Medio - 2o ano',
  MEDIO_3: 'Ensino Medio - 3o ano',
  OUTROS: 'Outros',
};

function TeacherDashboardPage() {
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'Professor';

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

  const handleDelete = async (id, nome) => {
    if (!window.confirm(`Tem certeza que deseja excluir o curso "${nome}"?`)) return;

    try {
      await axios.delete(`http://localhost:8080/api/v1/curso/${id}`);
      setCourses(courses.filter((course) => course.id !== id));
      alert(`Curso "${nome}" excluido com sucesso!`);
    } catch (error) {
      console.error('Erro ao excluir curso:', error);
      alert('Erro ao excluir o curso. Tente novamente.');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div>
      <header className="header">
        <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <img src="/logoCursiFy.png" alt="Web Cursify" />
          Cursify - Area do Professor
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
            Publicar Novo Curso
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/chat')}>
            Chat com Alunos
          </button>
        </div>

        <div className="course-grid">
          {courses.map((course) => (
            <div
              key={course.id}
              className="card course-card"
              style={{ position: 'relative' }}
            >
              <button
                onClick={() => handleDelete(course.id, course.nome)}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'red',
                }}
                title="Excluir curso"
              />

              <div onClick={() => navigate(`/course-view/${course.id}`)} style={{ cursor: 'pointer' }}>
                <h3>{course.nome}</h3>
                <p><strong>Categoria:</strong> {NIVEIS[course.categoria] || course.categoria}</p>
                <p><strong>Carga horaria:</strong> {course.duracao || `${course.cargaHoraria} horas`}</p>
                <p>{course.descricao}</p>
              </div>

              <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
                Clique para ver detalhes
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

export default TeacherDashboardPage;

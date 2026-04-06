import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getUserCourseState } from '../utils/userCourseState';

const NIVEIS = {
  FUNDAMENTAL_1: 'Fundamental 1 (1o ao 5o ano)',
  FUNDAMENTAL_2: 'Fundamental 2 (6o ao 9o ano)',
  MEDIO_1: 'Ensino Medio - 1o ano',
  MEDIO_2: 'Ensino Medio - 2o ano',
  MEDIO_3: 'Ensino Medio - 3o ano',
  OUTROS: 'Outros',
};

const getCourseStatusLabel = (status) => {
  if (status === true || status === 'Ativo') return 'Ativo';
  if (status === false || status === 'Inativo') return 'Inativo';
  if (status === 'Concluído') return 'Concluído';
  return status || 'Nao informado';
};

function StudentDashboardPage() {
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'Aluno';
  const currentUserId = Number(localStorage.getItem('userId'));

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/v1/curso');
        const userCourseState = getUserCourseState(currentUserId);
        const enrolledCourseIds = Object.keys(userCourseState).filter((courseId) => userCourseState[courseId]?.enrolled);
        const visibleCourses = response.data
          .filter((course) => enrolledCourseIds.includes(String(course.id)))
          .map((course) => ({
            ...course,
            userStatus: userCourseState[String(course.id)]?.status || 'Em progresso',
          }));
        setCourses(visibleCourses);
      } catch (error) {
        console.error('Erro ao carregar cursos:', error);
        alert('Erro ao carregar cursos. Verifique a API.');
      }
    };

    fetchCourses();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div>
      <header className="header">
        <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <img src="/logoCursiFy.png" alt="Web Cursify" />
          Cursify - Area do Aluno
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
          Seus Cursos
        </h2>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <button className="btn btn-primary" onClick={() => navigate('/search')} style={{ marginRight: '1rem' }}>
            Pesquisar Cursos
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/chat')}>
            Chat com Professores
          </button>
        </div>

        <div className="course-grid">
          {courses.map((course) => (
            <div key={course.id} className="card course-card" style={{ position: 'relative' }}>
              <div onClick={() => navigate(`/course-view/${course.id}`)} style={{ cursor: 'pointer' }}>
                <h3>{course.nome}</h3>
                <p><strong>Categoria:</strong> {NIVEIS[course.categoria] || course.categoria}</p>
                <p><strong>Carga horaria:</strong> {course.duracao || `${course.cargaHoraria} horas`}</p>
                <p><strong>Status:</strong> {course.userStatus || 'Em progresso'}</p>
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

export default StudentDashboardPage;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const NIVEIS = {
  FUNDAMENTAL_1: 'Fundamental 1 (1º ao 5º ano)',
  FUNDAMENTAL_2: 'Fundamental 2 (6º ao 9º ano)',
  MEDIO_1: 'Ensino Médio - 1º ano',
  MEDIO_2: 'Ensino Médio - 2º ano',
  MEDIO_3: 'Ensino Médio - 3º ano',
  OUTROS: 'Outros',
};

function StudentDashboard() {
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'Aluno';
  const [progress, setProgress] = useState({});

  // Buscar cursos do aluno
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/v1/curso');
        // Filtra apenas cursos ativos para estudantes
        const activeCourses = response.data.filter(course => course.statusCurso === 'Ativo');
        setCourses(activeCourses);
      } catch (error) {
        console.error('Erro ao carregar cursos:', error);
        alert('Erro ao carregar cursos. Verifique a API.');
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    // Carrega progresso do localStorage
    const savedProgress = localStorage.getItem('studentProgress');
    if (savedProgress) {
      setProgress(JSON.parse(savedProgress));
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const handleTopicClick = (subject, level, topic) => {
    navigate(`/course/${subject}/${level}/${topic}`);
  };

  return (
    <div>
      <header className="header">
        <div className="logo" onClick={() => navigate("/")} style={{cursor: "pointer"}}>
          <img src="/logoCursiFy.png" alt="Web Cursify" />
          Cursify - Área do Aluno
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

      <div className="container dashboard">
        <h2 style={{color: 'white', textAlign: 'center', marginBottom: '2rem'}}>
          Seus Cursos
        </h2>

        <div style={{textAlign: 'center', marginBottom: '2rem'}}>
          <button className="btn btn-primary" onClick={() => navigate('/search')} style={{marginRight: '1rem'}}>
            🔍 Pesquisar Cursos
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/chat')}>
            💬 Chat com Professores
          </button>
        </div>

        <div className="course-grid">
          {courses.map(course => (
            <div key={course.id} className="card course-card" style={{ position: 'relative' }}>
              <div onClick={() => navigate(`/course-view/${course.id}`)} style={{ cursor: 'pointer' }}>
                <h3>{course.nome}</h3>
                <p><strong>Nível:</strong> {NIVEIS[course.categoria] || course.categoria}</p>
                <p><strong>Duração:</strong> {course.duracao || `${course.cargaHoraria} horas`}</p>
                <p>{course.descricao}</p>
              </div>
              <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
                👁️ Clique para ver detalhes
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
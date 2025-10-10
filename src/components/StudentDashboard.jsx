import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { courses } from '../data/courses';
import axios from 'axios';

function StudentDashboard() {
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'Aluno';
  const [progress, setProgress] = useState({});

  // 🔹 Buscar cursos do aluno
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

  const getLevelProgress = (subjectKey, levelKey) => {
    const level = courses[subjectKey].levels[levelKey];
    let completedTopics = 0;

    level.topics.forEach(topic => {
      if (progress[`${subjectKey}-${levelKey}-${topic}`]) {
        completedTopics++;
      }
    });

    return Math.round((completedTopics / level.topics.length) * 100) || 0;
  };

  return (
    <div>
      <header className="header">
        <div className="logo">
          <img src="/logoCursiFy.png" alt="Web Cursify" />
          Cursify - Área do Aluno
        </div>
        <div className="nav-buttons">
          <span style={{color: 'white', marginRight: '1rem'}}>Olá, {userName}!</span>
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
            Object.entries(courses).map(([subjectKey, subject]) => 
              Object.entries(subject.levels).map(([levelKey, level]) => {
                const levelProgress = getLevelProgress(subjectKey, levelKey);
                return (
                  <div key={`${subjectKey}-${levelKey}`} className="card course-card" onClick={() => navigate(`/subject/${subjectKey}/${levelKey}`)}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
                      <h3>{subject.name} - {level.name}</h3>
                      <div style={{background: 'var(--verde-muco)', color: 'white', padding: '0.3rem 0.8rem', borderRadius: '15px', fontSize: '0.9rem'}}>
                        {levelProgress}% concluído
                      </div>
                    </div>

                    <div key={course.id} className="card course-card"
                    style={{ position: 'relative' }}
                    >

                      <div onClick={() => navigate(`/course/${course.id}`)} style={{ cursor: 'pointer' }}>
                        <h3>{course.titulo}</h3>
                        <p><strong>Matéria:</strong> {course.materia}</p>
                        <p><strong>Nível:</strong> {course.nivel}</p>
                        <p><strong>Duração:</strong> {course.duracao}</p>
                        <p>{course.descricao}</p>
                      </div>
                    
                      <div style={{background: '#f0f0f0', borderRadius: '10px', height: '8px', marginBottom: '1rem'}}>
                        <div 
                          style={{
                            background: 'linear-gradient(90deg, var(--verde-muco), var(--azul-marinho))',
                            height: '100%',
                            borderRadius: '10px',
                            width: `${levelProgress}%`,
                            transition: 'width 0.3s ease'
                          }}
                        ></div>
                      </div>
                    
                      <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
                        👁️ Clique para ver detalhes
                      </div>
                    </div>
                  </div>
                );
              })
            ).flat()))}
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
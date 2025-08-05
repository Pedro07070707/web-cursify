import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { courses } from '../data/courses';

function StudentDashboard() {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'Aluno';
  const [progress, setProgress] = useState({});


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
          <img src="/folder-icon.svg" alt="Web Cursify" />
          Web Cursify - Área do Aluno
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
          {Object.entries(courses).map(([subjectKey, subject]) => 
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
                  
                  <p><strong>Tópicos:</strong> {level.topics.length}</p>
                  <p><strong>Duração:</strong> 40 horas</p>
                  
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
                  
                  <div style={{textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem', color: '#666'}}>
                    👁️ Clique para ver detalhes
                  </div>
                </div>
              );
            })
          ).flat()}
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
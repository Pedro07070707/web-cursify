import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { courses, teacherTasks } from '../data/courses';
import { topicContent } from '../data/topicContent';

function SubjectDetails() {
  const { subjectKey, levelKey } = useParams();
  const navigate = useNavigate();
  const [progress, setProgress] = useState({});
  const userType = localStorage.getItem('userType');
  const userName = localStorage.getItem('userName') || 'Usuário';

  useEffect(() => {
    const savedProgress = localStorage.getItem('studentProgress');
    if (savedProgress) {
      setProgress(JSON.parse(savedProgress));
    }
  }, []);

  const handleTopicClick = (subject, level, topic) => {
    navigate(`/course/${subject}/${level}/${topic}`);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const subject = courses[subjectKey];
  const level = subject?.levels[levelKey];
  if (!subject || !level) return <div>Conteúdo não encontrado</div>;

  const getLevelProgress = () => {
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
          Cursify - {subject.name} - {level.name}
        </div>
        <div className="nav-buttons">
          <span style={{color: 'white', marginRight: '1rem'}}>Olá, {userName}!</span>
          <button className="btn btn-secondary" onClick={() => navigate(userType === 'teacher' ? '/teacher' : '/student')}>
            Voltar
          </button>
          <button className="btn btn-primary" onClick={handleLogout}>
            Sair
          </button>
        </div>
      </header>

      <div className="container">
        <div className="card">
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
            <h2>{subject.name} - {level.name}</h2>
            {userType === 'student' && (
              <div style={{background: 'var(--verde-muco)', color: 'white', padding: '0.5rem 1rem', borderRadius: '20px'}}>
                {getLevelProgress()}% concluído
              </div>
            )}
          </div>

          {userType === 'student' && (
            <div style={{background: '#f0f0f0', borderRadius: '10px', height: '10px', marginBottom: '2rem'}}>
              <div 
                style={{
                  background: 'linear-gradient(90deg, var(--verde-muco), var(--azul-marinho))',
                  height: '100%',
                  borderRadius: '10px',
                  width: `${getLevelProgress()}%`,
                  transition: 'width 0.3s ease'
                }}
              ></div>
            </div>
          )}

          <h3>Tópicos do Curso:</h3>
          <div className="course-grid">
            {level.topics.map((topic, index) => {
              const isCompleted = progress[`${subjectKey}-${levelKey}-${topic}`];
              const content = topicContent[topic] || { description: 'Conteúdo em desenvolvimento', content: 'Descrição não disponível', duration: '4 horas' };
              
              return (
                <div 
                  key={index} 
                  className="card course-card"
                  onClick={() => {
                    if (userType === 'student') {
                      handleTopicClick(subjectKey, levelKey, topic);
                    } else {
                      navigate(`/teacher-topic/${subjectKey}/${levelKey}/${topic}`);
                    }
                  }}
                  style={{
                    background: isCompleted ? 'rgba(143, 188, 143, 0.1)' : 'rgba(255, 255, 255, 0.9)',
                    cursor: 'pointer',
                    border: isCompleted ? '2px solid var(--verde-muco)' : '1px solid #ddd'
                  }}
                >
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
                    <h4>{topic}</h4>
                    {userType === 'student' && isCompleted && <span style={{color: 'green', fontSize: '1.2rem'}}>✓</span>}
                  </div>
                  
                  <p style={{fontSize: '0.9rem', marginBottom: '1rem'}}>{content.description}</p>
                  <p style={{fontSize: '0.8rem', color: '#666', marginBottom: '1rem'}}>{content.content}</p>
                  <p><strong>Duração:</strong> {content.duration}</p>
                  
                  {userType === 'student' && (
                    <div style={{textAlign: 'center', marginTop: '1rem', fontSize: '0.8rem', color: '#666'}}>
                      {isCompleted ? '✅ Concluído' : '📚 Clique para estudar'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SubjectDetails;
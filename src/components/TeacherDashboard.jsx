import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { courses, teacherTasks } from '../data/courses';

function TeacherDashboard() {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'Professor';


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
          <span style={{color: 'white', marginRight: '1rem'}}>Olá, {userName}!</span>
          <button className="btn btn-secondary" onClick={handleLogout}>
            Sair
          </button>
        </div>
      </header>

      <div className="container dashboard">
        <h2 style={{color: 'white', textAlign: 'center', marginBottom: '2rem'}}>
          Cursos publicados
        </h2>

        <div style={{textAlign: 'center', marginBottom: '2rem'}}>
          <button className="btn btn-primary" onClick={() => navigate('/publish-course')} style={{marginRight: '1rem'}}>
            📚 Publicar Novo Curso
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/chat')}>
            💬 Chat com Alunos
          </button>
        </div>

        <div className="course-grid">
          {Object.entries(courses).map(([subjectKey, subject]) => 
            Object.entries(subject.levels).map(([levelKey, level]) => (
              <div key={`${subjectKey}-${levelKey}`} className="card course-card" onClick={() => navigate(`/subject/${subjectKey}/${levelKey}`)}>
                <h3>{subject.name} - {level.name}</h3>
                <p><strong>Tópicos:</strong> {level.topics.length}</p>
                <p><strong>Duração:</strong> 40 horas</p>
                
                <div style={{textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem', color: '#666'}}>
                  👁️ Clique para ver detalhes
                </div>
              </div>
            ))
          ).flat()}
        </div>
      </div>
    </div>
  );
}

export default TeacherDashboard;
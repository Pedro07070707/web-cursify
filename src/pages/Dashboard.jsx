import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const enrolledCourses = [
    { id: 1, title: 'React Fundamentals', progress: 75 },
    { id: 2, title: 'JavaScript Avançado', progress: 30 },
    { id: 3, title: 'Node.js Backend', progress: 10 }
  ];

  return (
    <div className="dashboard">
      <h1>Meu Progresso</h1>
      
      <div className="stats">
        <div className="stat-card">
          <h3>3</h3>
          <p>Cursos Inscritos</p>
        </div>
        <div className="stat-card">
          <h3>38%</h3>
          <p>Progresso Médio</p>
        </div>
        <div className="stat-card">
          <h3>12h</h3>
          <p>Tempo de Estudo</p>
        </div>
      </div>

      <section className="my-courses">
        <h2>Meus Cursos</h2>
        <div className="course-list">
          {enrolledCourses.map(course => (
            <div key={course.id} className="course-item">
              <h3>{course.title}</h3>
              <div className="progress-bar">
                <div 
                  className="progress" 
                  style={{ width: `${course.progress}%` }}
                ></div>
              </div>
              <span>{course.progress}% concluído</span>
              <Link to={`/course/${course.id}`} className="btn-primary">Continuar</Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
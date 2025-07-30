import React from 'react';
import { Link } from 'react-router-dom';

const Courses = () => {
  const courses = [
    { id: 1, title: 'React Fundamentals', price: 'R$ 99,90', category: 'Frontend' },
    { id: 2, title: 'JavaScript Avançado', price: 'R$ 149,90', category: 'Frontend' },
    { id: 3, title: 'Node.js Backend', price: 'R$ 179,90', category: 'Backend' },
    { id: 4, title: 'Python para Iniciantes', price: 'R$ 89,90', category: 'Backend' },
    { id: 5, title: 'UI/UX Design', price: 'R$ 129,90', category: 'Design' },
    { id: 6, title: 'DevOps Essentials', price: 'R$ 199,90', category: 'DevOps' }
  ];

  return (
    <div className="courses">
      <h1>Todos os Cursos</h1>
      <div className="filters">
        <button>Todos</button>
        <button>Frontend</button>
        <button>Backend</button>
        <button>Design</button>
        <button>DevOps</button>
      </div>
      <div className="course-grid">
        {courses.map(course => (
          <div key={course.id} className="course-card">
            <span className="category">{course.category}</span>
            <h3>{course.title}</h3>
            <span className="price">{course.price}</span>
            <Link to={`/course/${course.id}`} className="btn-primary">Ver Detalhes</Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Courses;
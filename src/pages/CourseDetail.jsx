import React from 'react';

const CourseDetail = () => {
  return (
    <div className="course-detail">
      <div className="course-header">
        <h1>React Fundamentals</h1>
        <p>Aprenda React do zero ao avançado</p>
        <div className="course-meta">
          <span>⭐ 4.8 (234 avaliações)</span>
          <span>👥 1,250 alunos</span>
          <span>⏱️ 8 horas</span>
        </div>
      </div>
      
      <div className="course-content">
        <div className="course-info">
          <h2>O que você vai aprender</h2>
          <ul>
            <li>Fundamentos do React</li>
            <li>Componentes e Props</li>
            <li>Estado e Ciclo de Vida</li>
            <li>Hooks Modernos</li>
            <li>Roteamento com React Router</li>
          </ul>
          
          <h2>Conteúdo do Curso</h2>
          <div className="modules">
            <div className="module">
              <h3>Módulo 1: Introdução</h3>
              <p>3 aulas • 45 min</p>
            </div>
            <div className="module">
              <h3>Módulo 2: Componentes</h3>
              <p>5 aulas • 1h 30min</p>
            </div>
            <div className="module">
              <h3>Módulo 3: Hooks</h3>
              <p>4 aulas • 1h 15min</p>
            </div>
          </div>
        </div>
        
        <div className="course-sidebar">
          <div className="price-card">
            <h2>R$ 99,90</h2>
            <button className="enroll-btn">Inscrever-se</button>
            <p>30 dias de garantia</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
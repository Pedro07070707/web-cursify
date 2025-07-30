import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="home">
      <header className="hero">
        <h1>Cursify</h1>
        <p>Aprenda novas habilidades com nossos cursos online</p>
        <Link to="/courses" className="cta-button">Explorar Cursos</Link>
      </header>
      
      <section className="featured-courses">
        <h2>Cursos em Destaque</h2>
        <div className="course-grid">
          <div className="course-card">
            <h3>React Fundamentals</h3>
            <p>Aprenda React do zero</p>
            <span className="price">R$ 99,90</span>
          </div>
          <div className="course-card">
            <h3>JavaScript Avançado</h3>
            <p>Domine conceitos avançados</p>
            <span className="price">R$ 149,90</span>
          </div>
          <div className="course-card">
            <h3>Node.js Backend</h3>
            <p>Desenvolva APIs robustas</p>
            <span className="price">R$ 179,90</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
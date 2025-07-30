import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/"><h2>Cursify</h2></Link>
      </div>
      <div className="nav-links">
        <Link to="/">Início</Link>
        <Link to="/courses">Cursos</Link>
        <Link to="/dashboard">Progresso</Link>
      </div>
      <div className="nav-auth">
        <Link to="/login">Entrar</Link>
        <Link to="/register" className="btn-primary">Cadastrar</Link>
      </div>
    </nav>
  );
};

export default Navbar;
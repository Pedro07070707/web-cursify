import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>Cursify</h3>
          <p>Transforme sua carreira com nossos cursos online</p>
        </div>
        <div className="footer-section">
          <h4>Links</h4>
          <a href="/courses">Cursos</a>
          <a href="/about">Sobre</a>
          <a href="/contact">Contato</a>
        </div>
        <div className="footer-section">
          <h4>Suporte</h4>
          <a href="/help">Ajuda</a>
          <a href="/terms">Termos</a>
          <a href="/privacy">Privacidade</a>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2025 Cursify. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;
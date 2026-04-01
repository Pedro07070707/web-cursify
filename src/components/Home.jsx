import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(null);

  return (
    <div>
      <header className="header">
        <div className="logo" onClick={() => navigate('/')} style={{cursor: 'pointer'}}>
          <img src="/logoCursiFy.png" alt="Web Cursify" />
          Cursify
        </div>
        <div className="nav-buttons">
          <button className="btn btn-secondary" onClick={() => navigate('/login')}>
            Entrar
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/register')}>
            Cadastrar
          </button>
        </div>
      </header>

      <div className="card-home">
      <div className="container">
        <div className="welcome-section">
          <h1><img src="/logoCursiFy.png" alt="Web Cursify" style={{width: '3.3rem', height: '3.8rem', marginRight: '0.2rem', verticalAlign: 'top'}} />CursiFy</h1>
          <p>Plataforma de cursos online</p>
        </div>

        

        <div className="options">
          <div className={`option${activeIndex === 0 ? ' active' : ''}`} onMouseEnter={() => setActiveIndex(0)} onMouseLeave={() => setActiveIndex(null)}>
            <div className="option-bg" style={{backgroundImage: 'url(/carousel-1.jpg)'}}></div>
            <div className="option-bg option-bg-hover" style={{backgroundImage: 'url(/carousel-1-hover.jpg)'}}></div>
          </div>

          <div className={`option${activeIndex === 1 ? ' active' : ''}`} onMouseEnter={() => setActiveIndex(1)} onMouseLeave={() => setActiveIndex(null)}>
            <div className="option-bg" style={{backgroundImage: 'url(/carousel-2.jpg)'}}></div>
            <div className="option-bg option-bg-hover" style={{backgroundImage: 'url(/carousel-2-hover.jpg)'}}></div>
          </div>

          <div className={`option${activeIndex === 2 ? ' active' : ''}`} onMouseEnter={() => setActiveIndex(2)} onMouseLeave={() => setActiveIndex(null)}>
            <div className="option-bg" style={{backgroundImage: 'url(/carousel-3.jpg)'}}></div>
            <div className="option-bg option-bg-hover" style={{backgroundImage: 'url(/carousel-3-hover.jpg)'}}></div>
          </div>

          <div className={`option${activeIndex === 3 ? ' active' : ''}`} onMouseEnter={() => setActiveIndex(3)} onMouseLeave={() => setActiveIndex(null)}>
            <div className="option-bg" style={{backgroundImage: 'url(/carousel-4.jpg)'}}></div>
            <div className="option-bg option-bg-hover" style={{backgroundImage: 'url(/carousel-4-hover.jpg)'}}></div>
          </div>
        </div>

        <div className="card">
          <h2>Sobre a Plataforma</h2>
          <p>
            O Cursify é uma plataforma educacional completa que oferece cursos 
            para estudantes do ensino fundamental ao ensino médio.
          </p>
          <p>
            Nossa missão é democratizar o acesso à educação de qualidade através de 
            conteúdo estruturado e metodologia eficiente.
          </p>
          <h3>O que oferecemos:</h3>
          <ul>
            <li>Cursos de Matemática com mais de 6 tópicos por nível</li>
            <li>Cursos de Português com mais de 6 tópicos por nível</li>
            <li>Conteúdo do ensino fundamental ao ensino médio</li>
            <li>Área específica para professores e alunos</li>
            <li>Acompanhamento de progresso personalizado</li>
          </ul>
          <p><strong>Cadastre-se agora para ter acesso completo aos nossos cursos!</strong></p>
        </div>
      </div>
      </div>
    </div>
  );
}

export default Home;
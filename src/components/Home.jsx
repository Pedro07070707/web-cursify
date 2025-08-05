import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  return (
    <div>
      <header className="header">
        <div className="logo">
          <img src="/folder-icon.svg" alt="Web Cursify" />
          Web Cursify
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

      <div className="container">
        <div className="welcome-section">
          <h1>Web Cursify</h1>
          <p>Plataforma de cursos online de Matemática e Português</p>
          <p>Do ensino fundamental ao ensino médio</p>
        </div>

        <div className="card">
          <h2>Sobre a Plataforma</h2>
          <p>
            O Web Cursify é uma plataforma educacional completa que oferece cursos de 
            Matemática e Português para estudantes do ensino fundamental ao ensino médio.
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
  );
}

export default Home;
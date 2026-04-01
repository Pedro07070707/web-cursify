import { Carousel } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  const options = document.querySelectorAll(".option");
        let currentIndex = 0;

        // Manual click activation
        options.forEach((option, index) => {
            option.addEventListener("click", () => {
                setActive(index);
            });
        });

        // Function to activate selected slide
        function setActive(index) {
            options.forEach(o => o.classList.remove("active"));
            options[index].classList.add("active");
            currentIndex = index;
        }

        // Auto slide every 3 seconds
        setInterval(() => {
            currentIndex = (currentIndex + 1) % options.length;
            setActive(currentIndex);
        }, 3000);

        /*
        <div className="carousel">
          <div className="carousel-item">
            <img src="/1.jpg"></img>
          </div>
          <div className="carousel-item">
            <img src="/2.jpg"></img>
          </div>
          <div className="carousel-item">
            <img src="/3.jpg"></img>
          </div>
        </div>
        */

  return (
    <div>
      <header className="header">
        <div className="logo">
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
          <h1>Cursify</h1>
          <p>Plataforma de cursos online</p>
        </div>

        

        <div className="options">
          <div className="option active">
            <img src="/1.jpg"></img>
              <div className="label">
                  <div className="icon"></div>
                 <div className="info">
                      <div className="main">CursiFy</div>
                      <div className="sub">Plataforma de cursos online</div>
                  </div>
             </div>
          </div>

          <div className="option">
            <img src="/2.jpg"></img>
              <div className="label">
                 <div className="icon"></div>
                  <div className="info">
                      <div className="main">Cursos</div>
                      <div className="sub">Ensino fundamental ao médio</div>
                 </div>
             </div>
          </div>

          <div className="option">
            <img src="/3.jpg"></img>
             <div className="label">
                  <div className="icon"></div>
                  <div className="info">
                      <div className="main">Professores</div>
                      <div className="sub">Professores avaliados e verificados</div>
                  </div>
              </div>
          </div>

          <div className="option">
            <img src="/4.jpg"></img>
              <div className="label">
                  <div className="icon"></div>
                  <div className="info">
                      <div className="main">Cursos gratuitos</div>
                      <div className="sub">Gratuidade total</div>
                  </div>
              </div>
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
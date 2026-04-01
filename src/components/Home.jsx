import { Carousel } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

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

      <div className="container">
        <div className="welcome-section">
          <h1>Cursify</h1>
          <p>Plataforma de cursos online</p>
        </div>

        <div className="card">
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
        </div>

        --------
            <div class="options">

        <div class="option active"
             style="--optionImage: url('https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200');">
            <div class="label">
                <div class="icon"><i class="fas fa-walking"></i></div>
                <div class="info">
                    <div class="main">Nature Walk</div>
                    <div class="sub">Beautiful mountain scenery</div>
                </div>
            </div>
        </div>

        <div class="option"
             style="--optionImage: url('https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=1200');">
            <div class="label">
                <div class="icon"><i class="fas fa-tree"></i></div>
                <div class="info">
                    <div class="main">Forest</div>
                    <div class="sub">Green & peaceful environment</div>
                </div>
            </div>
        </div>

        <div class="option"
             style="--optionImage: url('https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?w=1200');">
            <div class="label">
                <div class="icon"><i class="fas fa-mountain"></i></div>
                <div class="info">
                    <div class="main">Mountains</div>
                    <div class="sub">Snowy high peaks</div>
                </div>
            </div>
        </div>

        <div class="option"
             style="--optionImage: url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200');">
            <div class="label">
                <div class="icon"><i class="fas fa-water"></i></div>
                <div class="info">
                    <div class="main">Lake View</div>
                    <div class="sub">Calm and relaxing water</div>
                </div>
            </div>
        </div>

    </div>

    <script>
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
    </script>
    ----------
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
  );
}

export default Home;
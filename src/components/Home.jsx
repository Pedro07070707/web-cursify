import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AppHeader from './AppHeader';
import DirectorySearchSection from './DirectorySearchSection';
import { useTheme } from '../utils/theme';
import { buildSearchResults, getDashboardPathByRole } from '../utils/ui';

function Home() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeIndex, setActiveIndex] = useState(null);
  const nivelAcesso = localStorage.getItem('nivelAcesso');

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [coursesResponse, usersResponse] = await Promise.all([
          axios.get('http://localhost:8080/api/v1/curso'),
          axios.get('http://localhost:8080/api/v1/usuario'),
        ]);

        setCourses(coursesResponse.data || []);
        setUsers(usersResponse.data || []);
      } catch (error) {
        console.error('Erro ao carregar dados da home:', error);
      }
    };

    fetchHomeData();
  }, []);

  const searchResults = useMemo(
    () => buildSearchResults(courses, users, searchTerm),
    [courses, users, searchTerm]
  );

  return (
    <div className="page-shell page-shell-home">
      <AppHeader
        variant="home"
        subtitle="Plataforma de cursos online"
        navItems={[
          { label: 'Pagina inicial', onClick: () => navigate('/') },
        ]}
        actionItems={[
          { label: 'Entrar', onClick: () => navigate('/login') },
          { label: 'Cadastrar', onClick: () => navigate('/register'), emphasis: true },
        ]}
        onGoProfile={() => navigate('/profile')}
        onLogout={() => {
          localStorage.clear();
          navigate('/');
        }}
        onToggleTheme={toggleTheme}
        theme={theme}
      />

      <main className="container home-layout">
        <DirectorySearchSection
          minimal
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          results={searchResults}
          onOpenCourse={(course) => navigate(`/course-view/${course.id}`)}
          onUserAction={() => navigate(localStorage.getItem('userId') ? '/profile' : '/login')}
        />

        <section className="home-hero">
          <div className="welcome-section">
            <h1>
              <img src="/logoCursiFy.png" alt="Web Cursify" />
              CursiFy
            </h1>
            <p>Plataforma de cursos online</p>
          </div>

          <div className="options home-carousel">
            <div
              className={`option${activeIndex === 0 ? ' active' : ''}`}
              onMouseEnter={() => setActiveIndex(0)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <div className="option-bg" style={{ backgroundImage: 'url(/carousel-1.jpg)' }} />
              <div className="option-bg option-bg-hover" style={{ backgroundImage: 'url(/carousel-1-hover.jpg)' }} />
            </div>

            <div
              className={`option${activeIndex === 1 ? ' active' : ''}`}
              onMouseEnter={() => setActiveIndex(1)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <div className="option-bg" style={{ backgroundImage: 'url(/carousel-2.jpg)' }} />
              <div className="option-bg option-bg-hover" style={{ backgroundImage: 'url(/carousel-2-hover.jpg)' }} />
            </div>

            <div
              className={`option${activeIndex === 2 ? ' active' : ''}`}
              onMouseEnter={() => setActiveIndex(2)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <div className="option-bg" style={{ backgroundImage: 'url(/carousel-3.jpg)' }} />
              <div className="option-bg option-bg-hover" style={{ backgroundImage: 'url(/carousel-3-hover.jpg)' }} />
            </div>

            <div
              className={`option${activeIndex === 3 ? ' active' : ''}`}
              onMouseEnter={() => setActiveIndex(3)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <div className="option-bg" style={{ backgroundImage: 'url(/carousel-4.jpg)' }} />
              <div className="option-bg option-bg-hover" style={{ backgroundImage: 'url(/carousel-4-hover.jpg)' }} />
            </div>
          </div>
        </section>

        <section className="home-feature-board">
          <div className="home-feature-main">
            <span className="section-badge">Sobre a plataforma</span>
            <h2>Aprenda de forma simples, organizada e com acompanhamento real</h2>
            <p>
              O Cursify oferece cursos completos para estudantes do ensino fundamental ao ensino medio,
              com conteudo estruturado e metodologia eficiente.
            </p>

            <div className="hero-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => navigate(localStorage.getItem('userId') ? getDashboardPathByRole(nivelAcesso) : '/login')}
              >
                Comecar agora
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/register')}
              >
                Criar conta gratuita
              </button>
            </div>

            <div className="home-quality-pill">
              <strong>Educacao de qualidade</strong>
              <span>para transformar futuros</span>
            </div>
          </div>

          <div className="feature-grid">
            <article className="feature-card">
              <h3>Cursos completos</h3>
              <p>Matematica e Portugues organizados por nivel.</p>
            </article>
            <article className="feature-card">
              <h3>Do fundamental ao medio</h3>
              <p>Todo o conteudo necessario em um so lugar.</p>
            </article>
            <article className="feature-card">
              <h3>Area para professores e alunos</h3>
              <p>Ambiente dedicado para ensino e aprendizagem.</p>
            </article>
            <article className="feature-card">
              <h3>Acompanhamento de progresso</h3>
              <p>Veja sua evolucao de forma clara e personalizada.</p>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Home;

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
  const [searchTerm, setSearchTerm] = useState('');
  const [activeIndex, setActiveIndex] = useState(null);
  const nivelAcesso = localStorage.getItem('nivelAcesso');

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const coursesResponse = await axios.get('http://localhost:8080/api/v1/curso');

        setCourses(coursesResponse.data || []);
      } catch (error) {
        console.error('Erro ao carregar dados da home:', error);
      }
    };

    fetchHomeData();
  }, []);

  const availableCourses = useMemo(
    () => courses.filter((course) => course.statusCurso !== false && course.statusCurso !== 'Inativo'),
    [courses]
  );

  const searchResults = useMemo(
    () => buildSearchResults(availableCourses, searchTerm),
    [availableCourses, searchTerm]
  );

  return (
    <div className="page-shell page-shell-home">
      <AppHeader
        variant="home"
        subtitle="Plataforma de cursos online"
        onHome={() => navigate('/')}
        onLogin={() => navigate('/login')}
        onRegister={() => navigate('/register')}
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
        />

        {/* HERO */}
        <section className="home-hero-modern">
          <div className="hero-modern-content">
            <span className="section-badge">Plataforma educacional</span>
            <h1 className="hero-modern-title">
              Aprenda no seu ritmo,<br />
              <span className="hero-highlight">evolua de verdade</span>
            </h1>
            <p className="hero-modern-desc">
              Cursos completos de Matemática e Português do Ensino Fundamental ao Médio,
              com conteúdo estruturado, acompanhamento de progresso e ambiente dedicado
              para alunos e professores.
            </p>
            <div className="hero-actions">
              <button
                type="button"
                className="btn btn-primary btn-hero"
                onClick={() => navigate(localStorage.getItem('userId') ? getDashboardPathByRole(nivelAcesso) : '/login')}
              >
                Começar agora
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-hero"
                onClick={() => navigate('/register')}
              >
                Criar conta gratuita
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-hero"
                onClick={() => navigate('/catalog')}
              >
                Ver cursos disponíveis
              </button>
            </div>
            <div className="hero-stats">
              <div className="hero-stat">
                <strong>{availableCourses.length || '+'}</strong>
                <span>Cursos disponíveis</span>
              </div>
            
              <div className="hero-stat">
              </div>
            </div>
          </div>

        </section>

        {/* FEATURES */}
        <section className="home-features-section">
          
          <div className="features-cards-grid">
            <article className="feature-card-modern">
              <div className="feature-icon-wrap feature-icon-blue">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
              </div>
              <h3>Cursos completos</h3>
              <p>Matemática e Português organizados por nível, do fundamental ao médio.</p>
            </article>
            <article className="feature-card-modern">
              <div className="feature-icon-wrap feature-icon-green">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              </div>
              <h3>Acompanhamento de progresso</h3>
              <p>Veja sua evolução de forma clara e personalize seu percurso de aprendizado.</p>
            </article>
            <article className="feature-card-modern">
              <div className="feature-icon-wrap feature-icon-blue">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <h3>Área para professores e alunos</h3>
              <p>Ambiente dedicado para ensino e aprendizagem com funcionalidades específicas para cada perfil.</p>
            </article>
            <article className="feature-card-modern">
              <div className="feature-icon-wrap feature-icon-green">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              </div>
              <h3>Conteúdo de qualidade</h3>
              <p>Material estruturado e metodologia eficiente para transformar futuros.</p>
            </article>
          </div>
        </section>

        <section className="home-carousel-section">
          
          <div className="options home-carousel">
            {[1, 2, 3, 4].map((n, i) => (
              <div
                key={n}
                className={`option${activeIndex === i ? ' active' : ''}`}
                onMouseEnter={() => setActiveIndex(i)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                <div className="option-bg" style={{ backgroundImage: `url(/carousel-${n}.jpg)` }} />
                <div className="option-bg option-bg-hover" style={{ backgroundImage: `url(/carousel-${n}-hover.jpg)` }} />
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Home;

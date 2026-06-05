import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCursiFy } from '../context/CursiFyContext';
import { promptCourses, promptTracks } from '../data/promptData';
import apiClient from '../utils/apiClient';

const fallbackCourses = promptCourses.slice(0, 3);
const fallbackTracks = promptTracks.slice(0, 2);

function PublicHeader({ onLogin, onToggleTheme, theme }) {
  return (
    <header className="app-header public-header">
      <div className="app-header__brand">
        <button type="button" className="logo logo-button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <img src="/logoCursiFy.png" alt="CursiFy" />
          <span>
            <strong>CursiFy</strong>
            <small>Aprenda, pratique e acompanhe seu progresso</small>
          </span>
        </button>
      </div>

      <div className="app-header__nav public-header__nav">
        <button type="button" className="btn btn-secondary public-header__theme" onClick={onToggleTheme}>
          Tema: {theme === 'dark' ? 'Escuro' : 'Claro'}
        </button>
        <button type="button" className="btn btn-primary" onClick={onLogin}>
          Login
        </button>
      </div>
    </header>
  );
}

export default function LandingPageClassic() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useCursiFy();
  const [courses, setCourses] = useState(fallbackCourses);
  const [tracks, setTracks] = useState(fallbackTracks);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    let active = true;

    const loadHomeData = async () => {
      try {
        const [homeResponse, tracksResponse] = await Promise.all([
          apiClient.get('/api/public/home'),
          apiClient.get('/api/public/trilhas'),
        ]);
        const payload = homeResponse.data || {};
        const trackPayload = Array.isArray(tracksResponse.data) ? tracksResponse.data : [];

        if (!active) return;

        const featuredCourses = Array.isArray(payload.featuredCourses) && payload.featuredCourses.length > 0
          ? payload.featuredCourses
          : fallbackCourses;

        setCourses(featuredCourses);
        setTracks(trackPayload.length > 0 ? trackPayload.slice(0, 2) : fallbackTracks);
      } catch (error) {
        if (active) {
          setCourses(fallbackCourses);
          setTracks(fallbackTracks);
        }
        console.error('Erro ao carregar a home publica:', error);
      }
    };

    loadHomeData();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % 4);
    }, 4200);

    return () => window.clearInterval(timer);
  }, []);

  const spotlightCourses = useMemo(() => {
    return courses.slice(0, 3).map((course, index) => ({
      id: course.id ?? index,
      categoria: course.categoria || 'Curso em destaque',
      titulo: course.nome || course.titulo || 'Curso sem titulo',
      descricao: course.descricao || 'Conteudo disponibilizado pela plataforma.',
      cargaHoraria: course.cargaHoraria,
      statusCurso: course.statusCurso,
    }));
  }, [courses]);

  const spotlightTracks = tracks;

  return (
    <div className="page-shell landing-shell">
      <PublicHeader onLogin={() => navigate('/login')} onToggleTheme={toggleTheme} theme={theme} />

      <main className="landing-main">
        <section className="container home-hero">
          <div className="welcome-section">
            <span className="section-badge">Plataforma de aprendizagem</span>
            <h1>
              <img src="/logoCursiFy.png" alt="CursiFy" />
              CursiFy
            </h1>
            <p>Aprenda com cursos, trilhas gamificadas e chat integrado em um unico ambiente.</p>
          </div>

          <div className="options home-carousel">
            <button
              type="button"
              className={`option${activeIndex === 0 ? ' active' : ''}`}
              onMouseEnter={() => setActiveIndex(0)}
              onFocus={() => setActiveIndex(0)}
              onClick={() => navigate('/cursos')}
            >
              <div className="option-bg" style={{ backgroundImage: 'url(/carousel-1.jpg)' }} />
              <div className="option-bg option-bg-hover" style={{ backgroundImage: 'url(/carousel-1-hover.jpg)' }} />
            </button>
            <button
              type="button"
              className={`option${activeIndex === 1 ? ' active' : ''}`}
              onMouseEnter={() => setActiveIndex(1)}
              onFocus={() => setActiveIndex(1)}
              onClick={() => navigate('/trilhas')}
            >
              <div className="option-bg" style={{ backgroundImage: 'url(/carousel-2.jpg)' }} />
              <div className="option-bg option-bg-hover" style={{ backgroundImage: 'url(/carousel-2-hover.jpg)' }} />
            </button>
            <button
              type="button"
              className={`option${activeIndex === 2 ? ' active' : ''}`}
              onMouseEnter={() => setActiveIndex(2)}
              onFocus={() => setActiveIndex(2)}
              onClick={() => navigate('/mensagens')}
            >
              <div className="option-bg" style={{ backgroundImage: 'url(/carousel-3.jpg)' }} />
              <div className="option-bg option-bg-hover" style={{ backgroundImage: 'url(/carousel-3-hover.jpg)' }} />
            </button>
            <button
              type="button"
              className={`option${activeIndex === 3 ? ' active' : ''}`}
              onMouseEnter={() => setActiveIndex(3)}
              onFocus={() => setActiveIndex(3)}
              onClick={() => navigate('/perfil')}
            >
              <div className="option-bg" style={{ backgroundImage: 'url(/carousel-4.jpg)' }} />
              <div className="option-bg option-bg-hover" style={{ backgroundImage: 'url(/carousel-4-hover.jpg)' }} />
            </button>
          </div>
        </section>

        <section className="container home-feature-board">
          <div className="home-feature-main">
            <span className="section-badge">Sobre a plataforma</span>
            <h2>Uma base moderna para estudar, acompanhar progresso e conversar com a comunidade.</h2>
            <p>
              O CursiFy combina catalogo publico, trilhas com XP, area do professor, painel administrativo e chat.
              O acesso publico mostra a vitrine; o restante do sistema fica pronto apos o login.
            </p>

            <div className="hero-actions">
              <button type="button" className="btn btn-primary" onClick={() => navigate('/login')}>
                Entrar
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/cadastro')}>
                Criar conta
              </button>
            </div>

            <div className="home-quality-pill">
              <strong>Com trilhas, cursos e chat em tempo real</strong>
              <span>organizado para alunos, professores e administradores</span>
            </div>
          </div>

          <div className="feature-grid">
            {spotlightCourses.map((course) => (
              <article key={course.id} className="feature-card">
                <span className="section-kicker">{course.categoria}</span>
                <h3>{course.titulo}</h3>
                <p>
                  {course.descricao}
                  {course.cargaHoraria ? ` ${course.cargaHoraria}h de carga horaria.` : ''}
                </p>
              </article>
            ))}
            {spotlightTracks.map((track) => (
              <article key={track.id} className="feature-card">
                <span className="section-kicker">{track.materia}</span>
                <h3>{track.titulo}</h3>
                <p>
                  {track.nos.length} nos, {track.xpTotal} XP e dificuldade {track.dificuldade}.
                </p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

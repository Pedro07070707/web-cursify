import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AppHeader from './AppHeader';
import InlineAlert from './InlineAlert';
import { useTheme } from '../utils/theme';
import { NIVEIS, formatCourseDuration } from '../utils/ui';

const CATEGORY_COLORS = {
  FUNDAMENTAL_1: { bg: 'rgba(70,130,180,0.12)', color: '#326791' },
  FUNDAMENTAL_2: { bg: 'rgba(70,130,180,0.18)', color: '#235a82' },
  MEDIO_1:       { bg: 'rgba(143,188,143,0.15)', color: '#4b7a4b' },
  MEDIO_2:       { bg: 'rgba(143,188,143,0.22)', color: '#3d6b3d' },
  MEDIO_3:       { bg: 'rgba(111,162,111,0.22)', color: '#335933' },
  OUTROS:        { bg: 'rgba(130,130,180,0.12)', color: '#4a4a8a' },
};

const COVER_GRADIENTS = [
  'linear-gradient(135deg, #4682b4 0%, #8fbc8f 100%)',
  'linear-gradient(135deg, #326791 0%, #6fa26f 100%)',
  'linear-gradient(135deg, #5a9fd4 0%, #7ab87a 100%)',
  'linear-gradient(135deg, #3a7bc8 0%, #5daa5d 100%)',
  'linear-gradient(135deg, #4682b4 0%, #4a9a8a 100%)',
  'linear-gradient(135deg, #2c5f8a 0%, #8fbc8f 100%)',
];

function CourseCard({ course, onOpen }) {
  const colors = CATEGORY_COLORS[course.categoria] || CATEGORY_COLORS.OUTROS;
  const gradient = COVER_GRADIENTS[course.id % COVER_GRADIENTS.length];
  const initials = (course.nome || '?').split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();

  return (
    <article className="catalog-card">
      <div className="catalog-card-cover" style={{ background: gradient }}>
        <div className="catalog-card-cover-initials">{initials}</div>
        <div className="catalog-card-cover-overlay" />
      </div>

      <div className="catalog-card-body">
        <div className="catalog-card-meta">
          <span className="catalog-category-badge" style={{ background: colors.bg, color: colors.color }}>
            {NIVEIS[course.categoria] || course.categoria}
          </span>
          <span className="catalog-duration">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            {formatCourseDuration(course)}
          </span>
        </div>

        <h3 className="catalog-card-title">{course.nome}</h3>
        <p className="catalog-card-desc">{course.descricao}</p>

        <button type="button" className="btn btn-primary catalog-card-btn" onClick={onOpen}>
          Ver curso
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
          </svg>
        </button>
      </div>
    </article>
  );
}

function CourseCatalog() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [feedback, setFeedback] = useState({ type: 'info', message: '' });

  useEffect(() => {
    axios.get('http://localhost:8080/api/v1/curso')
      .then((res) => {
        const visible = (res.data || []).filter(
          (c) => c.statusCurso !== false && c.statusCurso !== 'Inativo'
        );
        setCourses(visible);
      })
      .catch(() => setFeedback({ type: 'error', message: 'Erro ao carregar cursos.' }));
  }, []);

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return courses.filter((c) => {
      const matchSearch = !term || `${c.nome || ''} ${c.descricao || ''} ${c.categoria || ''}`.toLowerCase().includes(term);
      const matchCategory = !selectedCategory || c.categoria === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [courses, searchTerm, selectedCategory]);

  const categories = useMemo(() => [...new Set(courses.map((c) => c.categoria).filter(Boolean))], [courses]);

  return (
    <div className="page-shell">
      <AppHeader
        subtitle="Catálogo de cursos"
        onHome={() => navigate('/')}
        onGoProfile={() => navigate('/profile')}
        onLogout={() => { localStorage.clear(); navigate('/'); }}
        onToggleTheme={toggleTheme}
        theme={theme}
      />

      <main className="container" style={{ padding: '2rem 0 5rem' }}>

        {/* Hero */}
        <section className="catalog-hero panel-card">
          <div className="catalog-hero-text">
            <span className="section-badge">Plataforma CursiFy</span>
            <h1 className="catalog-hero-title">Explore nossos cursos</h1>
            <p className="catalog-hero-desc">
              Encontre o curso ideal para você. Do Ensino Fundamental ao Médio, com conteúdo estruturado e de qualidade.
            </p>
            <div className="catalog-stats">
              <div className="catalog-stat">
                <strong>{courses.length}</strong>
                <span>cursos disponíveis</span>
              </div>
              <div className="catalog-stat-divider" />
              <div className="catalog-stat">
                <strong>{categories.length}</strong>
                <span>categorias</span>
              </div>
            </div>
          </div>
          <div className="catalog-hero-visual">
            <svg width="180" height="180" viewBox="0 0 180 180" fill="none">
              <circle cx="90" cy="90" r="80" fill="url(#cg)" opacity="0.15"/>
              <path d="M50 65h80M50 90h60M50 115h70" stroke="url(#cg)" strokeWidth="8" strokeLinecap="round"/>
              <rect x="58" y="48" width="64" height="84" rx="10" stroke="url(#cg)" strokeWidth="5" fill="none"/>
              <defs>
                <linearGradient id="cg" x1="0" y1="0" x2="180" y2="180" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#4682b4"/><stop offset="1" stopColor="#8fbc8f"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
        </section>

        {/* Filtros */}
        <section className="catalog-filters panel-card">
          <div className="input-icon-wrap catalog-search-wrap">
            <svg className="input-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Buscar por nome, descrição ou categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {categories.length > 0 && (
            <div className="catalog-filter-chips">
              <button
                type="button"
                className={`catalog-chip${!selectedCategory ? ' is-active' : ''}`}
                onClick={() => setSelectedCategory('')}
              >
                Todos
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`catalog-chip${selectedCategory === cat ? ' is-active' : ''}`}
                  onClick={() => setSelectedCategory(cat === selectedCategory ? '' : cat)}
                >
                  {NIVEIS[cat] || cat}
                </button>
              ))}
            </div>
          )}
        </section>

        <InlineAlert type={feedback.type} message={feedback.message} />

        {/* Resultados */}
        {filtered.length > 0 ? (
          <>
            <p className="catalog-results-count">
              {filtered.length} curso{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
            </p>
            <div className="catalog-grid">
              {filtered.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onOpen={() => navigate(`/course-view/${course.id}`)}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="empty-state-card" style={{ padding: '48px', textAlign: 'center' }}>
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 16px' }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <h4>Nenhum curso encontrado</h4>
            <p>Tente buscar por outro termo ou remova o filtro de categoria.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default CourseCatalog;

import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AppHeader from './AppHeader';
import InlineAlert from './InlineAlert';
import { useCursiFy } from '../context/CursiFyContext';
import apiClient from '../utils/apiClient';
import {
  promptAchievements,
  promptCategories,
  promptConversations,
  promptCourses,
  promptNotifications,
  promptStats,
  promptTracks,
} from '../data/promptData';

const roleLabels = {
  USUARIO: 'Aluno',
  PROFESSOR: 'Professor',
  ADMIN: 'Admin',
};

const getDashboardPathByRole = (role) => {
  if (role === 'PROFESSOR') return '/professor/dashboard';
  if (role === 'ADMIN') return '/admin/dashboard';
  return '/dashboard';
};

const levelLabels = {
  INICIANTE: 'Iniciante',
  INTERMEDIARIO: 'Intermediario',
  AVANCADO: 'Avancado',
};

const navForRole = (role, navigate, extra = []) => {
  const base = [
    { label: 'Home', onClick: () => navigate('/') },
    { label: 'Cursos', onClick: () => navigate('/cursos') },
    { label: 'Trilhas', onClick: () => navigate('/trilhas') },
    { label: 'Mensagens', onClick: () => navigate('/mensagens') },
  ];

  if (role === 'PROFESSOR') {
    base.splice(1, 0, { label: 'Professor', onClick: () => navigate('/professor/dashboard') });
  }

  if (role === 'ADMIN') {
    base.splice(1, 0, { label: 'Admin', onClick: () => navigate('/admin/dashboard') });
  }

  return [...base, ...extra];
};

const roleActionItems = (role, navigate) => {
  const items = [{ label: 'Perfil', onClick: () => navigate('/perfil') }];
  if (role !== 'ADMIN') {
    items.push({ label: 'Notificacoes', onClick: () => navigate('/notificacoes') });
  }
  return items;
};

const Shell = ({ subtitle, children, extraNav = [] }) => {
  const navigate = useNavigate();
  const { authUser, theme, toggleTheme, logout, unreadChat } = useCursiFy();
  const role = authUser?.role || 'USUARIO';
  const navItems = navForRole(role, navigate, extraNav).map((item) => (
    item.label === 'Mensagens'
      ? { ...item, label: unreadChat > 0 ? `Mensagens (${unreadChat})` : 'Mensagens' }
      : item
  ));

  return (
    <div className="page-shell">
      <AppHeader
        subtitle={subtitle}
        brandDetail={authUser ? `${roleLabels[role] || 'Aluno'} logado` : 'Plataforma de cursos e trilhas'}
        navItems={navItems}
        actionItems={roleActionItems(role, navigate)}
        onGoProfile={() => navigate('/perfil')}
        onLogout={logout}
        onToggleTheme={toggleTheme}
        theme={theme}
      />

      <main className="container section-stack">{children}</main>
    </div>
  );
};

const StatTile = ({ label, value, hint }) => (
  <article className="modern-card">
    <span className="section-kicker">{label}</span>
    <strong style={{ fontSize: '1.6rem' }}>{value}</strong>
    {hint ? <p>{hint}</p> : null}
  </article>
);

const ProgressBar = ({ value }) => (
  <div className="progress-shell">
    <div className="progress-track">
      <span className="progress-fill" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
    <small>{value}%</small>
  </div>
);

const CourseCard = ({ course, onOpen }) => (
  <article className="course-card">
    <img src={course.thumbnail} alt={course.titulo} className="course-thumb" />
    <div className="section-stack" style={{ padding: 0, gap: 8 }}>
      <span className="course-tag">{course.categoria}</span>
      <h3>{course.titulo}</h3>
      <p>{course.descricao}</p>
      <div className="pill-list">
        <span>{course.professor}</span>
        <span>{levelLabels[course.nivel] || course.nivel}</span>
        <span>{course.gratuito ? 'Gratuito' : 'Pago'}</span>
      </div>
      <div className="card-button-row">
        <button type="button" className="btn btn-primary" onClick={onOpen}>Abrir</button>
      </div>
    </div>
  </article>
);

const TrackCard = ({ track, onOpen }) => (
  <article className="course-card">
    <img src={track.thumbnail} alt={track.titulo} className="course-thumb" />
    <div className="section-stack" style={{ padding: 0, gap: 8 }}>
      <span className="course-tag">{track.materia}</span>
      <h3>{track.titulo}</h3>
      <p>{track.nos.length} nos - {track.xpTotal} XP</p>
      <ProgressBar value={track.progresso} />
      <div className="pill-list">
        <span>{track.professor}</span>
        <span>{track.dificuldade}</span>
      </div>
      <button type="button" className="btn btn-primary" onClick={onOpen}>Abrir trilha</button>
    </div>
  </article>
);

const NodePill = ({ node, onOpen }) => (
  <button type="button" className={`track-node ${node.estado.toLowerCase()}`} onClick={onOpen} disabled={node.estado === 'BLOQUEADO'}>
    <span className={`track-node-circle ${node.estado.toLowerCase()}`}>{node.icone.slice(0, 1).toUpperCase()}</span>
    <strong>{node.titulo}</strong>
    <small>{node.tipo} - {node.xp} XP</small>
  </button>
);

const MessageBubble = ({ message }) => (
  <div className={`chat-message${message.own ? ' own' : ''}`}>
    <div className="chat-bubble">
      <strong>{message.author}</strong>
      <p>{message.text}</p>
      <small>{message.time}</small>
    </div>
  </div>
);

const PublicHeader = ({ onLogin, onToggleTheme, theme }) => (
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

export function LandingPage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useCursiFy();

  return (
    <div className="page-shell landing-shell">
      <PublicHeader onLogin={() => navigate('/login')} onToggleTheme={toggleTheme} theme={theme} />

      <main className="landing-main">
        <section className="landing-hero" style={{ backgroundImage: 'url(/Wallpaper.jpg)' }}>
          <div className="landing-hero__overlay" />
          <div className="landing-hero__content container">
            <span className="section-badge">Plataforma de aprendizagem</span>
            <h1>CursiFy</h1>
            <p>
              Cursos, trilhas gamificadas, materiais, chat e acompanhamento de progresso em um unico lugar.
            </p>
            <div className="hero-actions">
              <button type="button" className="btn btn-primary" onClick={() => navigate('/cadastro')}>Criar conta</button>
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/cursos')}>Explorar cursos</button>
            </div>
          </div>
        </section>

        <section className="container landing-preview">
          <div className="landing-preview__stats">
            <article className="modern-card">
              <strong>Trilhas</strong>
              <p>Mapa gamificado com checkpoints, XP e streak.</p>
            </article>
            <article className="modern-card">
              <strong>Chat</strong>
              <p>Conversas diretas e grupos de trilha em tempo real.</p>
            </article>
            <article className="modern-card">
              <strong>Professor e ADM</strong>
              <p>Gestao de conteudo, usuarios, relatorios e moderação.</p>
            </article>
          </div>

          <div className="landing-preview__media">
            <img src="/carousel-1.jpg" alt="Vista da plataforma" />
            <img src="/carousel-2.jpg" alt="Cursos em destaque" />
            <img src="/carousel-3.jpg" alt="Trilhas gamificadas" />
          </div>
        </section>
      </main>
    </div>
  );
}

export function HomePage() {
  const navigate = useNavigate();
  const { authUser } = useCursiFy();
  const featuredCourses = promptCourses.slice(0, 2);
  const featuredTracks = promptTracks.slice(0, 2);

  return (
    <Shell subtitle="Home">
      <section className="dashboard-hero">
        <div className="section-stack" style={{ padding: 0 }}>
          <span className="section-badge">CursiFy</span>
          <h1>Plataforma de cursos, trilhas e chat</h1>
          <p>
            Estrutura pronta para catalogo, progresso gamificado, area do professor, ADM e conversas em tempo real.
          </p>
          <div className="hero-actions">
            <button type="button" className="btn btn-primary" onClick={() => navigate(authUser ? '/dashboard' : '/cadastro')}>
              {authUser ? 'Ir para dashboard' : 'Criar conta'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/cursos')}>
              Ver cursos
            </button>
          </div>
        </div>

        <div className="dashboard-hero-stats">
          <article><strong>{promptStats.xpTotal}</strong><span>XP total</span></article>
          <article><strong>{promptStats.streak}</strong><span>Streak atual</span></article>
          <article><strong>{promptNotifications.filter((n) => !n.lida).length}</strong><span>Notificacoes nao lidas</span></article>
        </div>
      </section>

      <section className="section-stack">
        <div className="section-heading-inline">
          <h2>Cursos em destaque</h2>
          <button type="button" className="btn btn-ghost" onClick={() => navigate('/cursos')}>Catalogo completo</button>
        </div>
        <div className="course-grid">
          {featuredCourses.map((course) => (
            <CourseCard key={course.id} course={course} onOpen={() => navigate(`/cursos/${course.id}`)} />
          ))}
        </div>
      </section>

      <section className="section-stack">
        <div className="section-heading-inline">
          <h2>Trilhas populares</h2>
          <button type="button" className="btn btn-ghost" onClick={() => navigate('/trilhas')}>Ver todas</button>
        </div>
        <div className="course-grid">
          {featuredTracks.map((track) => (
            <TrackCard key={track.id} track={track} onOpen={() => navigate(`/trilhas/${track.id}`)} />
          ))}
        </div>
      </section>
    </Shell>
  );
}

export function AuthPage({ mode }) {
  const navigate = useNavigate();
  const { login } = useCursiFy();
  const [feedback, setFeedback] = useState('');
  const [form, setForm] = useState({
    nome: '',
    email: '',
    senha: '',
    role: 'USUARIO',
    confirmarSenha: '',
  });

  const submit = (event) => {
    event.preventDefault();
    setFeedback('');

    const run = async () => {
      try {
        if (mode === 'login') {
          const response = await apiClient.post('/api/auth/login', {
            email: form.email,
            senha: form.senha,
          });
          const authData = response.data?.data;
          login({
            user: authData.usuario,
            accessToken: authData.accessToken,
            refreshToken: authData.refreshToken,
          });
          navigate(getDashboardPathByRole(authData?.usuario?.nivelAcesso));
          return;
        }

        if (form.senha !== form.confirmarSenha) {
          setFeedback('As senhas precisam ser iguais.');
          return;
        }

        const response = await apiClient.post('/api/auth/cadastro', {
          nome: form.nome,
          email: form.email,
          senha: form.senha,
          role: form.role,
        });

        const authData = response.data?.data;
        login({
          user: authData.usuario,
          accessToken: authData.accessToken,
          refreshToken: authData.refreshToken,
        });
        navigate(getDashboardPathByRole(authData?.usuario?.nivelAcesso));
      } catch (error) {
        const backendMessage = error?.response?.data?.message || error?.response?.data?.error;
        setFeedback(backendMessage || 'Nao foi possivel concluir a operacao.');
      }
    };

    run();
  };

  return (
    <Shell subtitle={mode === 'login' ? 'Login' : 'Cadastro'}>
      <section className="auth-layout">
        <div className="card auth-card">
          <h2>{mode === 'login' ? 'Entrar' : 'Criar conta'}</h2>
          <p>{mode === 'login' ? 'Use um usuario de desenvolvimento para acessar o fluxo.' : 'Cadastro com role aluno, professor ou admin.'}</p>
          <form onSubmit={submit}>
            <InlineAlert type={feedback ? 'error' : 'info'} message={feedback} />
            {mode === 'cadastro' ? (
              <div className="form-group">
                <label>Nome</label>
                <input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required />
              </div>
            ) : null}
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Senha</label>
              <input type="password" value={form.senha} onChange={(e) => setForm({ ...form, senha: e.target.value })} required />
            </div>
            {mode === 'cadastro' ? (
              <>
                <div className="form-group">
                  <label>Confirmar senha</label>
                  <input type="password" value={form.confirmarSenha} onChange={(e) => setForm({ ...form, confirmarSenha: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Tipo de conta</label>
                  <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                    <option value="USUARIO">Aluno</option>
                    <option value="PROFESSOR">Professor</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
              </>
            ) : null}
            <div className="hero-actions">
              <button type="submit" className="btn btn-primary">{mode === 'login' ? 'Entrar' : 'Criar conta'}</button>
              <button type="button" className="btn btn-secondary" onClick={() => navigate(mode === 'login' ? '/cadastro' : '/login')}>
                {mode === 'login' ? 'Ir para cadastro' : 'Ir para login'}
              </button>
            </div>
          </form>
          {mode === 'login' ? <p className="auth-switch">Esqueci minha senha</p> : null}
        </div>
      </section>
    </Shell>
  );
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { authUser } = useCursiFy();
  const role = authUser?.role || 'USUARIO';

  const panels = role === 'ADMIN'
    ? [
        { label: 'Usuarios', value: '1.2k', hint: 'ativos na plataforma' },
        { label: 'Cursos', value: '36', hint: 'publicados e rascunhos' },
        { label: 'Receita', value: 'R$ 18k', hint: 'ultimos 30 dias' },
      ]
    : role === 'PROFESSOR'
      ? [
          { label: 'Alunos', value: '124', hint: 'em acompanhamento' },
          { label: 'Avaliacoes', value: '4.8/5', hint: 'media do portfolio' },
          { label: 'Cursos', value: '5', hint: '2 publicados' },
        ]
      : [
          { label: 'XP total', value: `${promptStats.xpTotal}`, hint: 'nivel ' + promptStats.level },
          { label: 'Streak', value: `${promptStats.streak} dias`, hint: 'maximo ' + promptStats.streakMax },
          { label: 'Certificados', value: `${promptStats.certificates}`, hint: 'emitidos' },
        ];

  return (
    <Shell subtitle="Dashboard">
      <section className="dashboard-hero">
        <div className="section-stack" style={{ padding: 0 }}>
          <span className="section-badge">{roleLabels[role] || 'Aluno'}</span>
          <h1>{role === 'ADMIN' ? 'Painel administrativo' : role === 'PROFESSOR' ? 'Painel do professor' : `Ola, ${authUser?.nome || 'usuario'}`}</h1>
          <p>KPIs, andamento, trilhas, certificados e acesso rapido para as rotas do prompt.</p>
        </div>
        <div className="dashboard-hero-stats">
          {panels.map((panel) => <article key={panel.label}><strong>{panel.value}</strong><span>{panel.label}</span><small>{panel.hint}</small></article>)}
        </div>
      </section>

      <section className="course-grid">
        {promptCourses.slice(0, 3).map((course) => (
          <CourseCard key={course.id} course={course} onOpen={() => navigate(`/cursos/${course.id}`)} />
        ))}
      </section>

      <section className="section-stack">
        <div className="section-heading-inline">
          <h2>Recomendacoes</h2>
          <button type="button" className="btn btn-ghost" onClick={() => navigate('/trilhas')}>Trilhas</button>
        </div>
        <div className="pill-list">
          {promptStats.recommendations.map((item) => <span key={item}>{item}</span>)}
        </div>
      </section>

      <section className="section-stack">
        <h2>Conquistas</h2>
        <div className="course-grid">
          {promptAchievements.map((achievement) => (
            <article key={achievement.id} className="modern-card">
              <span className="section-kicker">{achievement.desbloqueada ? 'Desbloqueada' : 'Bloqueada'}</span>
              <strong>{achievement.titulo}</strong>
              <p>{achievement.descricao}</p>
            </article>
          ))}
        </div>
      </section>
    </Shell>
  );
}

export function CoursesPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [catalogCourses, setCatalogCourses] = useState(promptCourses);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    let active = true;

    const loadCourses = async () => {
      try {
        const response = await apiClient.get('/api/v1/curso');
        const payload = Array.isArray(response.data) ? response.data : [];
        const mapped = payload.map((item) => ({
          id: item.id,
          titulo: item.nome || 'Curso sem titulo',
          descricao: item.descricao || 'Conteudo disponibilizado pela plataforma.',
          categoria: item.categoria || 'Sem categoria',
          nivel: item.statusCurso === 'Ativo' ? 'INICIANTE' : 'INTERMEDIARIO',
          gratuito: true,
          publicado: item.statusCurso === 'Ativo',
          professor: 'Equipe CursiFy',
          avaliacao: 5,
          matriculados: 0,
          cargaHorariaMinutos: Number(item.cargaHoraria || 0) * 60,
          thumbnail: '/ImgCurso1.jpg',
          modulos: [],
        }));

        if (active && mapped.length > 0) {
          setCatalogCourses(mapped);
        }
      } catch (error) {
        if (active) {
          setCatalogCourses(promptCourses);
        }
        console.error('Erro ao carregar cursos:', error);
      }
    };

    loadCourses();

    return () => {
      active = false;
    };
  }, []);

  const course = id ? catalogCourses.find((item) => String(item.id) === String(id)) : null;
  const visibleCourses = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return catalogCourses;

    return catalogCourses.filter((item) => {
      const values = [item.titulo, item.descricao, item.categoria, item.professor]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return values.includes(term);
    });
  }, [catalogCourses, searchTerm]);

  if (course) {
    return (
      <Shell subtitle="Curso">
        <section className="dashboard-hero">
          <div className="section-stack" style={{ padding: 0 }}>
            <span className="section-badge">{course.categoria}</span>
            <h1>{course.titulo}</h1>
            <p>{course.descricao}</p>
            <div className="pill-list">
              <span>{course.professor}</span>
              <span>{levelLabels[course.nivel]}</span>
              <span>{course.gratuito ? 'Gratuito' : 'Pago'}</span>
            </div>
            <button type="button" className="btn btn-primary">Matricular</button>
          </div>
          <div className="dashboard-hero-stats">
            <article><strong>{course.avaliacao}</strong><span>Avaliacao</span></article>
            <article><strong>{course.matriculados}</strong><span>Matriculados</span></article>
            <article><strong>{course.cargaHorariaMinutos}</strong><span>Minutos</span></article>
          </div>
        </section>

        <section className="section-stack">
          <h2>Modulos</h2>
          <div className="course-grid">
            {course.modulos.map((module) => (
              <article key={module.id} className="modern-card">
                <strong>{module.titulo}</strong>
                <div className="section-stack" style={{ padding: 0, gap: 10 }}>
                  {module.aulas.map((lesson) => (
                    <button key={lesson.id} type="button" className="result-card" onClick={() => navigate(`/curso/${course.id}/aula/${lesson.id}`)}>
                      <div>
                        <strong>{lesson.titulo}</strong>
                        <p>{lesson.tipo}</p>
                      </div>
                      <span>{lesson.duracao} min</span>
                    </button>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      </Shell>
    );
  }

  return (
    <Shell subtitle="Cursos">
      <section className="section-stack">
        <div className="section-heading-inline">
          <h1>Catalogo de cursos</h1>
        </div>
        <div className="search-hero-input">
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Buscar por curso, categoria ou professor"
          />
        </div>
        {visibleCourses.length > 0 ? (
          <div className="course-grid">
            {visibleCourses.map((item) => (
              <CourseCard key={item.id} course={item} onOpen={() => navigate(`/cursos/${item.id}`)} />
            ))}
          </div>
        ) : (
          <div className="empty-state-card">
            <h4>Nenhum curso encontrado</h4>
            <p>Tente outro termo de busca ou limpe o filtro.</p>
          </div>
        )}
      </section>
    </Shell>
  );
}

export function CourseLessonPage() {
  const { id, aulaId } = useParams();
  const navigate = useNavigate();
  const course = promptCourses.find((item) => String(item.id) === String(id));
  const lesson = course?.modulos.flatMap((module) => module.aulas).find((item) => String(item.id) === String(aulaId));

  return (
    <Shell subtitle="Aula">
      <section className="dashboard-hero">
        <div className="section-stack" style={{ padding: 0 }}>
          <span className="section-badge">{course?.titulo}</span>
          <h1>{lesson?.titulo || 'Aula'}</h1>
          <p>{lesson ? `Tipo ${lesson.tipo} - ${lesson.duracao} minutos` : 'Aula nao encontrada.'}</p>
          <div className="hero-actions">
            <button type="button" className="btn btn-primary">Concluir aula</button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate(`/cursos/${course?.id || ''}`)}>Voltar ao curso</button>
          </div>
        </div>
        <div className="dashboard-hero-stats">
          <article><strong>+50</strong><span>XP</span></article>
          <article><strong>1/4</strong><span>Progresso</span></article>
        </div>
      </section>
    </Shell>
  );
}

export function TracksPage() {
  const navigate = useNavigate();
  const { id, noId } = useParams();
  const [catalogTracks, setCatalogTracks] = useState(promptTracks);

  useEffect(() => {
    let active = true;

    const loadTracks = async () => {
      try {
        const response = await apiClient.get('/api/public/trilhas');
        const payload = Array.isArray(response.data) ? response.data : [];

        if (active && payload.length > 0) {
          setCatalogTracks(payload);
        }
      } catch (error) {
        if (active) {
          setCatalogTracks(promptTracks);
        }
        console.error('Erro ao carregar trilhas:', error);
      }
    };

    loadTracks();

    return () => {
      active = false;
    };
  }, []);

  const track = id ? catalogTracks.find((item) => String(item.id) === String(id)) : null;
  const node = track?.nos?.find((item) => String(item.id) === String(noId));

  if (track && node) {
    return (
      <Shell subtitle="No da trilha">
        <section className="dashboard-hero">
          <div className="section-stack" style={{ padding: 0 }}>
            <span className="section-badge">{track.titulo}</span>
            <h1>{node.titulo}</h1>
            <p>Execucao do nodo {node.tipo}. Fluxo simplificado para lição, exercicio, quiz, checkpoint e projeto.</p>
            <div className="hero-actions">
              <button type="button" className="btn btn-primary">Executar nodo</button>
              <button type="button" className="btn btn-secondary" onClick={() => navigate(`/trilhas/${track.id}`)}>Voltar ao mapa</button>
            </div>
          </div>
          <div className="dashboard-hero-stats">
            <article><strong>{node.xp}</strong><span>XP</span></article>
            <article><strong>{node.estado}</strong><span>Status</span></article>
          </div>
        </section>
      </Shell>
    );
  }

  if (track) {
    return (
      <Shell subtitle="Mapa da trilha">
        <section className="dashboard-hero">
          <div className="section-stack" style={{ padding: 0 }}>
            <span className="section-badge">{track.materia}</span>
            <h1>{track.titulo}</h1>
            <p>{track.professor} - {track.xpTotal} XP total - dificuldade {track.dificuldade}</p>
          </div>
          <div className="dashboard-hero-stats">
            <article><strong>{track.progresso}%</strong><span>Progresso</span></article>
            <article><strong>{track.streak}</strong><span>Streak</span></article>
            <article><strong>{track.proximoNo}</strong><span>Proximo desbloqueio</span></article>
          </div>
        </section>

        <section className="track-map-shell">
          <div className="track-map">
            {track.nos.map((currentNode) => (
              <NodePill key={currentNode.id} node={currentNode} onOpen={() => navigate(`/trilhas/${track.id}/no/${currentNode.id}`)} />
            ))}
          </div>
        </section>
      </Shell>
    );
  }

  return (
    <Shell subtitle="Trilhas">
      <section className="section-stack">
        <div className="section-heading-inline">
          <h1>Catalogo de trilhas</h1>
          <button type="button" className="btn btn-primary" onClick={() => navigate('/dashboard')}>Dashboard</button>
        </div>
        <div className="course-grid">
          {catalogTracks.map((item) => (
            <TrackCard key={item.id} track={item} onOpen={() => navigate(`/trilhas/${item.id}`)} />
          ))}
        </div>
      </section>
    </Shell>
  );
}

export function LibraryPage() {
  return (
    <Shell subtitle="Biblioteca">
      <section className="section-stack">
        <h1>Biblioteca</h1>
        <div className="course-grid">
          {promptCourses.map((course) => (
            <article key={course.id} className="modern-card">
              <strong>{course.titulo}</strong>
              <p>{course.descricao}</p>
            </article>
          ))}
        </div>
      </section>
    </Shell>
  );
}

export function ProfilePage() {
  const { authUser, logout } = useCursiFy();

  return (
    <Shell subtitle="Perfil">
      <section className="profile-shell">
        <div className="profile-hero">
          <div className="profile-avatar">{(authUser?.nome || 'U').slice(0, 1).toUpperCase()}</div>
          <div>
            <h1>{authUser?.nome || 'Usuario'}</h1>
            <p>{authUser?.email}</p>
            <div className="profile-tags">
              <span>{roleLabels[authUser?.role] || 'Aluno'}</span>
              <span>{promptStats.xpTotal} XP</span>
              <span>Streak {promptStats.streak}</span>
            </div>
          </div>
        </div>
        <div className="hero-actions">
          <button type="button" className="btn btn-primary">Editar perfil</button>
          <button type="button" className="btn btn-danger" onClick={logout}>Sair</button>
        </div>
      </section>
    </Shell>
  );
}

export function MessagesPage() {
  const navigate = useNavigate();
  const { conversaId, usuarioId } = useParams();
  const [conversations, setConversations] = useState(promptConversations);
  const [selectedId, setSelectedId] = useState(conversaId ? Number(conversaId) : promptConversations[0].id);
  const [composer, setComposer] = useState('');

  const selectedConversation = conversations.find((item) => item.id === selectedId);

  const sendMessage = () => {
    if (!composer.trim() || !selectedConversation) return;

    const next = conversations.map((conversation) => {
      if (conversation.id !== selectedConversation.id) return conversation;

      const nextMessage = {
        id: Date.now(),
        authorId: 1,
        author: 'Voce',
        text: composer.trim(),
        time: 'Agora',
        own: true,
      };

      return {
        ...conversation,
        preview: composer.trim(),
        messages: [...conversation.messages, nextMessage],
      };
    });

    setConversations(next);
    setComposer('');
  };

  return (
    <Shell subtitle="Mensagens">
      <section className="chat-workspace">
        <aside className="chat-sidebar panel-card">
          <div className="section-stack" style={{ padding: 0 }}>
            <h2>Conversas</h2>
            <input className="chat-search" placeholder="Buscar conversa" />
            <div className="chat-list">
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  type="button"
                  className={`chat-list-item${selectedConversation?.id === conversation.id ? ' is-selected' : ''}`}
                  onClick={() => setSelectedId(conversation.id)}
                >
                  <strong>{conversation.nome}</strong>
                  <span>{conversation.preview}</span>
                  <small>{conversation.time} {conversation.unread ? `- ${conversation.unread} nao lidas` : ''}</small>
                </button>
              ))}
            </div>
            <button type="button" className="btn btn-primary" onClick={() => navigate('/mensagens/nova/1')}>Nova conversa</button>
          </div>
        </aside>

        <section className="chat-panel panel-card">
          <div className="chat-panel-header">
            <span className="section-kicker">{selectedConversation?.tipo}</span>
            <h2>{selectedConversation?.nome}</h2>
            <p>{selectedConversation?.status}</p>
          </div>
          <div className="chat-message-area">
            {selectedConversation?.messages.map((message) => <MessageBubble key={message.id} message={message} />)}
          </div>
          <div className="chat-composer">
            <input value={composer} onChange={(event) => setComposer(event.target.value)} placeholder="Escrever mensagem" />
            <button type="button" className="btn btn-primary" onClick={sendMessage}>Enviar</button>
          </div>
        </section>
      </section>
    </Shell>
  );
}

export function NotificationsPage() {
  return (
    <Shell subtitle="Notificacoes">
      <section className="section-stack">
        <h1>Notificacoes</h1>
        <div className="section-stack">
          {promptNotifications.map((notification) => (
            <article key={notification.id} className="modern-card">
              <span className="section-kicker">{notification.tipo}</span>
              <strong>{notification.titulo}</strong>
              <p>{notification.mensagem}</p>
              <small>{notification.criadoEm}</small>
            </article>
          ))}
        </div>
      </section>
    </Shell>
  );
}

export function ManagementPage({ title, subtitle }) {
  const navigate = useNavigate();

  return (
    <Shell subtitle={subtitle}>
      <section className="section-stack">
        <div className="section-heading-inline">
          <h1>{title}</h1>
          <button type="button" className="btn btn-primary" onClick={() => navigate('/dashboard')}>Voltar</button>
        </div>
        <div className="course-grid">
          {promptCategories.map((category) => (
            <article key={category.id} className="modern-card">
              <strong>{category.nome}</strong>
              <p>{category.slug}</p>
            </article>
          ))}
        </div>
      </section>
    </Shell>
  );
}

export function NotFoundPage() {
  return (
    <Shell subtitle="Pagina nao encontrada">
      <section className="section-stack">
        <h1>Pagina nao encontrada</h1>
        <p>Use o menu para voltar para uma rota valida.</p>
      </section>
    </Shell>
  );
}

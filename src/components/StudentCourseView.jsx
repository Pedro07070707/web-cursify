import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import AppHeader from './AppHeader';
import InlineAlert from './InlineAlert';
import CourseContentListSection from './CourseContentListSection';
import { CONTENT_TYPES, getCourseContentCourseId, normalizeCourseContentItem } from './courseContentConfig';
import { getUserCourseEntry, saveUserCourseEntry, saveCourseRating, getUserRatingForCourse, calcCourseAverage, getRatingsForCourse } from '../utils/userCourseState';
import { clearSessionData } from '../utils/authStorage';
import { getDashboardPathByRole } from '../utils/ui';

const NIVEIS = {
  FUNDAMENTAL_1: 'Fundamental 1 (1o ao 5o ano)',
  FUNDAMENTAL_2: 'Fundamental 2 (6o ao 9o ano)',
  MEDIO_1: 'Ensino Medio - 1o ano',
  MEDIO_2: 'Ensino Medio - 2o ano',
  MEDIO_3: 'Ensino Medio - 3o ano',
  OUTROS: 'Outros',
};

const getCourseStatusLabel = (status) => {
  if (status === true || status === 'Ativo') return 'Ativo';
  if (status === false || status === 'Inativo') return 'Inativo';
  if (String(status || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim() === 'Concluido') return 'Concluido';
  return status || 'Em progresso';
};

function StudentCourseViewPage() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [contents, setContents] = useState({ material: [], exercicios: [] });
  const [loading, setLoading] = useState(true);
  const [studentStatus, setStudentStatus] = useState('Em progresso');
  const [feedback, setFeedback] = useState({ type: 'info', message: '' });
  const [completedMaterials, setCompletedMaterials] = useState(() => new Set());
  const [completedExercises, setCompletedExercises] = useState(() => new Set());
  const [savedProgress, setSavedProgress] = useState(0);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingStars, setRatingStars] = useState(0);
  const [ratingFeedback, setRatingFeedback] = useState('');
  const navigate = useNavigate();
  const nivelAcesso = localStorage.getItem('nivelAcesso');
  const currentUserId = Number(localStorage.getItem('userId'));
  const isLoggedIn = Boolean(localStorage.getItem('userId'));
  const userType = nivelAcesso === 'PROFESSOR' ? 'teacher' : nivelAcesso === 'ADMIN' ? 'admin' : 'student';
  const homePath = isLoggedIn ? getDashboardPathByRole(nivelAcesso) : '/';

  const goBack = () => {
    const historyIndex = Number(window.history.state?.idx);
    if (Number.isFinite(historyIndex) && historyIndex > 1) {
      navigate(-1);
      return;
    }
    navigate(homePath);
  };

  const requireAccount = () => {
    setFeedback({ type: 'error', message: 'Entre em uma conta ou cadastre-se para salvar ou concluir este curso.' });
  };

  const handleCompleteCourse = () => {
    if (!isLoggedIn) {
      requireAccount();
      return;
    }

    if (!course || studentStatus === 'Concluido') return;

    try {
      saveUserCourseEntry(currentUserId, id, {
        enrolled: true,
        status: 'Concluido',
      });
      setStudentStatus('Concluido');
      setFeedback({ type: 'success', message: 'Curso concluido com sucesso.' });
    } catch (error) {
      console.error('Erro ao concluir curso:', error);
      setFeedback({ type: 'error', message: 'Erro ao concluir o curso.' });
    }
  };

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await api.get(`/curso/${id}`);
        setCourse(response.data);

        if (isLoggedIn && userType === 'student') {
          const progressResponse = await api.get(`/usuarioCurso/progresso/${currentUserId}/${id}`);
          const bancoProgress = Number(progressResponse.data?.progresso) || 0;
          setSavedProgress(bancoProgress);
          if (bancoProgress >= 100 || progressResponse.data?.concluido === true) setStudentStatus('Concluido');
          const existingEntry = getUserCourseEntry(currentUserId, id);
          if (bancoProgress < 100) setStudentStatus(existingEntry?.status || 'Em progresso');
        }

        const responses = await Promise.allSettled(
          CONTENT_TYPES.map((config) => api.get(`/${config.endpoint}`))
        );

        const nextContents = { material: [], exercicios: [] };

        responses.forEach((contentResponse, index) => {
          if (contentResponse.status !== 'fulfilled') return;
          const config = CONTENT_TYPES[index];
          const unique = new Map();
          (contentResponse.value.data || [])
            .filter((item) => String(getCourseContentCourseId(item)) === String(id))
            .map((item) => normalizeCourseContentItem(config.key, item))
            .forEach((item) => {
              const key = [item.titulo, item.subtitulo, item.conteudo, item.link].join('|');
              if (!unique.has(key)) unique.set(key, item);
            });
          nextContents[config.key] = [...unique.values()];
        });

        setContents(nextContents);
      } catch (error) {
        console.error('Erro ao carregar curso:', error);
        setFeedback({ type: 'error', message: 'Erro ao carregar curso.' });
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchCourse();
    else setLoading(false);
  }, [currentUserId, id, isLoggedIn, userType]);

  const totalActivities = contents.material.length + contents.exercicios.length;
  const completedActivities = completedMaterials.size + completedExercises.size;
  const progress = Math.max(savedProgress, totalActivities ? Math.round((completedActivities / totalActivities) * 100) : 0);

  const persistProgress = async (nextProgress, concluded = nextProgress >= 100) => {
    if (!isLoggedIn || !Number.isFinite(currentUserId) || !id) return;
    try {
      await api.post(`/usuarioCurso/inscrever/${currentUserId}/${id}`);
      await api.put(`/usuarioCurso/progresso/${currentUserId}/${id}`, {
        progresso: nextProgress, concluido: concluded,
      });
      setSavedProgress(nextProgress);
      if (concluded) {
        setStudentStatus('Concluido');
        const alreadyRated = getUserRatingForCourse(currentUserId, id);
        if (!alreadyRated) setShowRatingModal(true);
      }
    } catch (error) {
      console.error('Erro ao salvar progresso:', error.response?.data || error);
      setFeedback({ type: 'error', message: error.response?.data?.message || 'Não foi possível salvar o progresso no banco.' });
    }
  };

  const handleSubmitRating = () => {
    if (ratingStars === 0) return;
    saveCourseRating(currentUserId, id, ratingStars, ratingFeedback);
    setShowRatingModal(false);
    setFeedback({ type: 'success', message: `Avaliação de ${ratingStars} estrela${ratingStars > 1 ? 's' : ''} registrada. Obrigado!` });
  };

  if (loading) return <div className="container"><div className="card">Carregando...</div></div>;
  if (!course) return <div className="container"><div className="card">Curso nao encontrado</div></div>;

  return (
    <div className="page-shell">
      <AppHeader
        subtitle="Curso"
        onBack={goBack}
        brandDetail={`${NIVEIS[course.categoria] || course.categoria} - ${course.nome}`}
        onHome={() => navigate('/')}
        navItems={[
          ...(userType === 'student' ? [{ label: 'Meus cursos', onClick: () => navigate(homePath, { state: { section: 'courses' } }) }] : []),
          { label: 'Perfil', onClick: () => navigate('/profile') },
          { label: 'Sair', onClick: () => { clearSessionData(); navigate('/'); } },
        ]}
        onGoProfile={() => navigate('/profile')}
        onLogout={() => {
          clearSessionData();
          navigate('/');
        }}
      />

      <main className="container dashboard-layout">
        <InlineAlert type={feedback.type} message={feedback.message} />

        <div className="card section-stack">
          <h2>{course.nome}</h2>
          <p><strong>Categoria:</strong> {NIVEIS[course.categoria] || course.categoria}</p>
          <p><strong>Carga horaria:</strong> {course.duracao || `${course.cargaHoraria} horas`}</p>
          <p><strong>Matriculados:</strong> {course.numeroAlunos ?? 0}/100</p>
          <p><strong>Data de criacao:</strong> {course.dataCriacao ? new Date(course.dataCriacao).toLocaleDateString('pt-BR') : '-'}</p>

          <div>
            <h3>Descricao do Curso</h3>
            <p>{course.descricao}</p>
          </div>

          <div>
            <h3>Resumo</h3>
            <div className="feature-grid">
              <div className="topic-item">Carga horaria prevista: {course.cargaHoraria} horas</div>
            </div>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <strong>Progresso: {progress}%</strong>
            <div style={{ height: '10px', background: '#e5e7eb', borderRadius: '999px', marginTop: '0.5rem' }}>
              <div style={{ width: `${progress}%`, height: '100%', background: '#2563eb', borderRadius: '999px', transition: 'width .2s' }} />
            </div>
          </div>

          {(() => {
            const avg = calcCourseAverage(id);
            const count = getRatingsForCourse(id).length;
            return avg !== null ? (
              <div className="course-rating-display">
                {[1,2,3,4,5].map((s) => (
                  <svg key={s} width="16" height="16" viewBox="0 0 24 24" fill={s <= Math.round(avg) ? '#f59e0b' : 'none'} stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                ))}
                <span><strong>{avg.toFixed(1)}</strong> média ({count} avaliação{count !== 1 ? 'ões' : ''})</span>
              </div>
            ) : null;
          })()}

          <CourseContentListSection locked={studentStatus === 'Concluido' || savedProgress >= 100} title="Materiais" items={contents.material} typeKey="material" emptyMessage="Nenhum material disponivel." onViewed={(materialId) => { if (studentStatus === 'Concluido' || savedProgress >= 100) return; setCompletedMaterials((current) => { const next = new Set(current).add(materialId); persistProgress(Math.max(savedProgress, Math.min(100, savedProgress + Math.round(100 / (totalActivities || 1))))); return next; }); }} />
          <CourseContentListSection locked={studentStatus === 'Concluido' || savedProgress >= 100} title="Exercicios" items={contents.exercicios} typeKey="exercicios" emptyMessage="Nenhum exercicio disponivel." onResolved={(exerciseId) => { if (studentStatus === 'Concluido' || savedProgress >= 100) return; setCompletedExercises((current) => { const next = new Set(current).add(exerciseId); persistProgress(Math.max(savedProgress, Math.min(100, savedProgress + Math.round(100 / (totalActivities || 1))))); return next; }); }} />

          <div className="hero-actions">
            <button className="btn btn-primary" onClick={() => navigate('/chat')}>Chat com Professor</button>
            {studentStatus === 'Concluido' || savedProgress >= 100 ? (
              <button className="btn btn-secondary" onClick={async () => { await persistProgress(0, false); setSavedProgress(0); setStudentStatus('Em progresso'); setCompletedMaterials(new Set()); setCompletedExercises(new Set()); }}>
                Reiniciar curso
              </button>
            ) : null}
          </div>
        </div>
      </main>

      {showRatingModal ? (
        <div className="rating-modal-overlay">
          <div className="rating-modal">
            <h3>Avalie este curso</h3>
            <p>Você concluiu <strong>{course?.nome}</strong>. Deixe sua avaliação!</p>

            <div className="rating-stars-row">
              {[1,2,3,4,5].map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`rating-star-btn${ratingStars >= s ? ' is-active' : ''}`}
                  onClick={() => setRatingStars(s)}
                  aria-label={`${s} estrela${s > 1 ? 's' : ''}`}
                >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill={ratingStars >= s ? '#f59e0b' : 'none'} stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                </button>
              ))}
            </div>
            {ratingStars > 0 && <p className="rating-stars-label">{ratingStars} estrela{ratingStars > 1 ? 's' : ''}</p>}

            <div className="form-group" style={{ marginTop: '12px' }}>
              <label>Feedback (opcional)</label>
              <textarea
                className="publish-textarea"
                rows={3}
                placeholder="Conte o que achou do curso..."
                value={ratingFeedback}
                onChange={(e) => setRatingFeedback(e.target.value)}
              />
            </div>

            <div className="rating-modal-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSubmitRating}
                disabled={ratingStars === 0}
              >
                Enviar avaliação
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default StudentCourseViewPage;

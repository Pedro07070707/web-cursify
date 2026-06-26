import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AppHeader from './AppHeader';
import InlineAlert from './InlineAlert';
import CourseContentListSection from './CourseContentListSection';
import { CONTENT_TYPES, getCourseContentCourseId, normalizeCourseContentItem } from './courseContentConfig';
import { getUserCourseEntry, saveUserCourseEntry } from '../utils/userCourseState';
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
  const [contents, setContents] = useState({ material: [], exercicios: [], atividades: [], avaliacoes: [] });
  const [loading, setLoading] = useState(true);
  const [studentStatus, setStudentStatus] = useState('Em progresso');
  const [feedback, setFeedback] = useState({ type: 'info', message: '' });
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'Visitante';
  const nivelAcesso = localStorage.getItem('nivelAcesso');
  const currentUserId = Number(localStorage.getItem('userId'));
  const isLoggedIn = Boolean(localStorage.getItem('userId'));
  const userType = nivelAcesso === 'PROFESSOR' ? 'teacher' : nivelAcesso === 'ADMIN' ? 'admin' : 'student';
  const homePath = isLoggedIn ? getDashboardPathByRole(nivelAcesso) : '/';

  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate('/');
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

  const handleSaveCourse = () => {
    if (!isLoggedIn) {
      requireAccount();
      return;
    }

    saveUserCourseEntry(currentUserId, id, {
      enrolled: true,
      status: studentStatus || 'Em progresso',
    });
    setFeedback({ type: 'success', message: 'Curso salvo em Meus cursos.' });
  };

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/v1/curso/${id}`);
        setCourse(response.data);

        if (isLoggedIn && userType === 'student') {
          const existingEntry = getUserCourseEntry(currentUserId, id);
          setStudentStatus(existingEntry?.status || 'Em progresso');
        }

        const responses = await Promise.allSettled(
          CONTENT_TYPES.map((config) => axios.get(`http://localhost:8080/api/v1/${config.endpoint}`))
        );

        const nextContents = { material: [], exercicios: [], atividades: [], avaliacoes: [] };

        responses.forEach((contentResponse, index) => {
          if (contentResponse.status !== 'fulfilled') return;
          const config = CONTENT_TYPES[index];
          nextContents[config.key] = (contentResponse.value.data || [])
            .filter((item) => String(getCourseContentCourseId(item)) === String(id))
            .map((item) => normalizeCourseContentItem(config.key, item));
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

  if (loading) return <div className="container"><div className="card">Carregando...</div></div>;
  if (!course) return <div className="container"><div className="card">Curso nao encontrado</div></div>;

  return (
    <div className="page-shell">
      <AppHeader
        subtitle="Curso"
        brandDetail={`${NIVEIS[course.categoria] || course.categoria} - ${course.nome}`}
        onHome={() => navigate('/')}
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

          <CourseContentListSection title="Materiais" items={contents.material} typeKey="material" emptyMessage="Nenhum material disponivel." />
          <CourseContentListSection title="Exercicios" items={contents.exercicios} typeKey="exercicios" emptyMessage="Nenhum exercicio disponivel." />
          <CourseContentListSection title="Avaliacoes" items={contents.avaliacoes} typeKey="avaliacoes" emptyMessage="Nenhuma avaliacao disponivel." />

          <div className="hero-actions">
            <button className="btn btn-primary" onClick={() => navigate('/chat')}>Chat com Professor</button>
            <button className="btn btn-secondary" onClick={handleSaveCourse}>Salvar curso</button>
            <button className="btn btn-secondary" onClick={handleCompleteCourse} disabled={studentStatus === 'Concluido'}>
              {studentStatus === 'Concluido' ? 'Curso concluido' : 'Marcar como concluido'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default StudentCourseViewPage;

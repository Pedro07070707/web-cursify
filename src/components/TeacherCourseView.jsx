import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AppHeader from './AppHeader';
import InlineAlert from './InlineAlert';
import CourseContentListSection from './CourseContentListSection';
import { CONTENT_TYPES, getCourseContentCourseId, normalizeCourseContentItem } from './courseContentConfig';
import { clearSessionData } from '../utils/authStorage';

const NIVEIS = {
  FUNDAMENTAL_1: 'Fundamental 1 (1o ao 5o ano)',
  FUNDAMENTAL_2: 'Fundamental 2 (6o ao 9o ano)',
  MEDIO_1: 'Ensino Medio - 1o ano',
  MEDIO_2: 'Ensino Medio - 2o ano',
  MEDIO_3: 'Ensino Medio - 3o ano',
  OUTROS: 'Outros',
};

function TeacherCourseViewPage() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [contents, setContents] = useState({ material: [], exercicios: [], atividades: [] });
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: 'info', message: '' });
  const navigate = useNavigate();
  const nivelAcesso = localStorage.getItem('nivelAcesso');
  const userType = nivelAcesso === 'ADMIN' ? 'admin' : 'teacher';

  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate(userType === 'admin' ? '/admin' : '/teacher');
  };

  useEffect(() => {
    if (nivelAcesso !== 'PROFESSOR' && nivelAcesso !== 'ADMIN') {
      navigate('/');
      return;
    }

    const fetchCourse = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/v1/curso/${id}`);
        setCourse(response.data);

        const responses = await Promise.allSettled(
          CONTENT_TYPES.map((config) => axios.get(`http://localhost:8080/api/v1/${config.endpoint}`))
        );

        const nextContents = { material: [], exercicios: [], atividades: [] };

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
  }, [id, nivelAcesso, navigate, userType]);

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:8080/api/v1/curso/${id}`);
      setFeedback({ type: 'success', message: `Curso excluido com sucesso: ${course.nome}.` });
      navigate(userType === 'admin' ? '/admin' : '/teacher');
    } catch (error) {
      console.error('Erro ao excluir curso:', error);
      setFeedback({ type: 'error', message: 'Erro ao excluir o curso.' });
    }
  };

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

          <CourseContentListSection title="Materiais" items={contents.material} typeKey="material" emptyMessage="Nenhum material cadastrado." />
          <CourseContentListSection title="Exercicios" items={contents.exercicios} typeKey="exercicios" emptyMessage="Nenhum exercicio cadastrado." />
          <CourseContentListSection title="Atividades" items={contents.atividades} typeKey="atividades" emptyMessage="Nenhuma atividade cadastrada." />

          <div className="hero-actions">
            <button className="btn btn-primary" onClick={() => navigate('/chat')}>Chat com Alunos</button>
            <button className="btn btn-secondary" onClick={() => navigate(`/manage-course-content/${id}`)}>Gerenciar Conteudo</button>
            <button className="btn btn-secondary" onClick={() => navigate(`/update-course/${id}`)}>Atualizar Curso</button>
            <button className="btn btn-danger" onClick={handleDelete}>Excluir Curso</button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default TeacherCourseViewPage;

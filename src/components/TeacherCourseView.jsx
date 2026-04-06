import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import CourseContentListSection from './CourseContentListSection';
import { CONTENT_TYPES, getCourseContentCourseId, normalizeCourseContentItem } from './courseContentConfig';

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
  if (status === 'Concluído') return 'Concluído';
  return status || 'Em progresso';
};

const getCourseStatusStyles = (status) => {
  const normalizedStatus = getCourseStatusLabel(status);

  if (normalizedStatus === 'Prazo esgotado' || normalizedStatus === 'Inativo') {
    return { backgroundColor: '#ffebee', color: '#c62828' };
  }

  if (normalizedStatus === 'Concluído' || normalizedStatus === 'Ativo') {
    return { backgroundColor: '#e8f5e8', color: '#2e7d32' };
  }

  return { backgroundColor: '#fff8e1', color: '#ef6c00' };
};

function TeacherCourseViewPage() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [contents, setContents] = useState({
    material: [],
    exercicios: [],
    atividades: [],
    avaliacoes: [],
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'Professor';
  const nivelAcesso = localStorage.getItem('nivelAcesso');
  const userType = nivelAcesso === 'ADMIN' ? 'admin' : 'teacher';

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

        const nextContents = {
          material: [],
          exercicios: [],
          atividades: [],
          avaliacoes: [],
        };

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
        alert('Erro ao carregar curso.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCourse();
    } else {
      setLoading(false);
    }
  }, [id, nivelAcesso, navigate]);

  const handleDelete = async () => {
    if (!window.confirm(`Tem certeza que deseja excluir o curso "${course.nome}"?`)) return;

    try {
      await axios.delete(`http://localhost:8080/api/v1/curso/${id}`);
      alert(`Curso "${course.nome}" excluido com sucesso!`);
      navigate(userType === 'admin' ? '/admin' : '/teacher');
    } catch (error) {
      console.error('Erro ao excluir curso:', error);
      alert('Erro ao excluir o curso. Tente novamente.');
    }
  };

  if (loading) return <div>Carregando...</div>;
  if (!course) return <div>Curso nao encontrado</div>;

  const statusStyles = getCourseStatusStyles(course.statusCurso);

  return (
    <div>
      <header className="header">
        <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <img src="/logoCursiFy.png" alt="Web Cursify" />
          Cursify - {course.nome}
        </div>
        <div className="nav-buttons">
          <span style={{ color: 'white', marginRight: '1rem' }}>Ola, {userName}!</span>
          <button className="btn btn-secondary" onClick={() => navigate(userType === 'admin' ? '/admin' : '/teacher')}>
            Voltar
          </button>
          <button className="btn btn-primary" onClick={() => {
            localStorage.clear();
            navigate('/');
          }}>
            Sair
          </button>
        </div>
      </header>

      <div className="container">
        <div className="card">
          <h2>{course.nome}</h2>
          <p><strong>Categoria:</strong> {NIVEIS[course.categoria] || course.categoria}</p>
          <p><strong>Carga horaria:</strong> {course.duracao || `${course.cargaHoraria} horas`}</p>
          <p><strong>Data de criacao:</strong> {course.dataCriacao ? new Date(course.dataCriacao).toLocaleDateString('pt-BR') : '-'}</p>
          <div style={{ marginBottom: '10px' }}>
            <span
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                backgroundColor: statusStyles.backgroundColor,
                color: statusStyles.color,
                fontSize: '12px',
              }}
            >
              {getCourseStatusLabel(course.statusCurso)}
            </span>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <h3>Descricao do Curso</h3>
            <p>{course.descricao}</p>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <h3>Resumo</h3>
            <div className="topic-list">
              <div className="topic-item">Carga horaria prevista: {course.cargaHoraria} horas</div>
              <div className="topic-item">Categoria: {NIVEIS[course.categoria] || course.categoria}</div>
            </div>
          </div>

          <CourseContentListSection
            title="Materiais"
            items={contents.material}
            typeKey="material"
            emptyMessage="Nenhum material cadastrado."
          />
          <CourseContentListSection
            title="Exercicios"
            items={contents.exercicios}
            typeKey="exercicios"
            emptyMessage="Nenhum exercicio cadastrado."
          />
          <CourseContentListSection
            title="Atividades"
            items={contents.atividades}
            typeKey="atividades"
            emptyMessage="Nenhuma atividade cadastrada."
          />
          <CourseContentListSection
            title="Avaliacoes"
            items={contents.avaliacoes}
            typeKey="avaliacoes"
            emptyMessage="Nenhuma avaliacao cadastrada."
          />

          <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
            <button className="btn btn-primary" onClick={() => navigate('/chat')}>
              Chat com Alunos
            </button>
            <button className="btn btn-secondary" onClick={() => navigate(`/manage-course-content/${id}`)}>
              Gerenciar Conteudo
            </button>
            <button
              className="btn btn-warning"
              onClick={() => navigate(`/update-course/${id}`)}
            >
              Atualizar Curso
            </button>
            <button
              className="btn btn-danger"
              onClick={handleDelete}
            >
              Excluir Curso
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeacherCourseViewPage;

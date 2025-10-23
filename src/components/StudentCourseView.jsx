import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function StudentCourseView() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'Aluno';
  const nivelAcesso = localStorage.getItem('nivelAcesso');
  const userType = nivelAcesso === 'PROFESSOR' ? 'teacher' : nivelAcesso === 'ADMIN' ? 'admin' : 'student';

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        console.log('Carregando curso com ID:', id);
        const response = await axios.get(`http://localhost:8080/api/v1/curso/${id}`);
        console.log('Curso carregado:', response.data);
        setCourse(response.data);
      } catch (error) {
        console.error('Erro ao carregar curso:', error);
        console.error('ID do curso:', id);
        alert('Erro ao carregar curso.');
      } finally {
        setLoading(false);
      }
    };

    console.log('ID recebido:', id);
    if (id) {
      fetchCourse();
    } else {
      setLoading(false);
    }
  }, [id]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  if (loading) return <div>Carregando...</div>;
  if (!course) return <div>Curso não encontrado</div>;

  return (
    <div>
      <header className="header">
        <div className="logo">
          <img src="/logoCursiFy.png" alt="Web Cursify" />
          Cursify - {course.nome}
        </div>
        <div className="nav-buttons">
          <span style={{color: 'white', marginRight: '1rem'}}>Olá, {userName}!</span>
          <button className="btn btn-secondary" onClick={() => navigate(userType === 'teacher' ? '/teacher' : userType === 'admin' ? '/admin' : '/student')}>
            Voltar
          </button>
          <button className="btn btn-primary" onClick={handleLogout}>
            Sair
          </button>
        </div>
      </header>

      <div className="container">
        <div className="card">
          <h2>{course.nome}</h2>
          <p><strong>Matéria:</strong> {course.materia || course.categoria}</p>
          <p><strong>Duração:</strong> {course.duracao || `${course.cargaHoraria} horas`}</p>
          <p><strong>Professor:</strong> {course.instrutor}</p>
          <div style={{ marginBottom: '10px' }}>
            <span style={{
              padding: '4px 8px',
              borderRadius: '4px',
              backgroundColor: course.statusCurso ? '#e8f5e8' : '#ffebee',
              color: course.statusCurso ? '#2e7d32' : '#c62828',
              fontSize: '12px'
            }}>
              {course.statusCurso ? 'Ativo' : 'Inativo'}
            </span>
          </div>
          
          <div style={{marginTop: '2rem'}}>
            <h3>Descrição do Curso</h3>
            <p>{course.descricao}</p>
          </div>

          <div style={{marginTop: '2rem'}}>
            <h3>Atividades</h3>
            <div className="topic-list">
              <div className="topic-item">📚 Leitura do material base</div>
              <div className="topic-item">✏️ Exercícios práticos</div>
              <div className="topic-item">🎯 Atividades de fixação</div>
              <div className="topic-item">📝 Avaliação do curso</div>
            </div>
          </div>

          <div style={{marginTop: '2rem'}}>
            <button className="btn btn-primary" onClick={() => navigate('/chat')} style={{marginRight: '1rem'}}>
              💬 Chat com Professor
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => {
                alert('Curso marcado como concluído!');
              }}
            >
              ✅ Marcar como Concluído
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentCourseView;
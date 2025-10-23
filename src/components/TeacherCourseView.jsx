import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function TeacherCourseView() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'Professor';
  const nivelAcesso = localStorage.getItem('nivelAcesso');
  const userType = nivelAcesso === 'ADMIN' ? 'admin' : 'teacher';

  useEffect(() => {
    // Verificar acesso
    if (nivelAcesso !== 'PROFESSOR' && nivelAcesso !== 'ADMIN') {
      navigate('/');
      return;
    }

    const fetchCourse = async () => {
      try {
        console.log('Carregando curso com ID:', id);
        const response = await axios.get(`http://localhost:8080/api/v1/curso/${id}`);
        console.log('Curso carregado:', response.data);
        setCourse(response.data);
      } catch (error) {
        console.error('Erro ao carregar curso:', error);
        alert('Erro ao carregar curso.');
      } finally {
        setLoading(false);
      }
    };

    const fetchCourses = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/v1/curso');
        setCourses(response.data);
      } catch (error) {
        console.error('Erro ao carregar cursos:', error);
      }
    };

    if (id) {
      fetchCourse();
      fetchCourses();
    } else {
      setLoading(false);
    }
  }, [id, nivelAcesso, navigate]);

  const handleUpdate = async () => {
    const newName = prompt('Digite o novo nome do curso:', course.nome);
    if (!newName) return;
    
    if (!window.confirm(`Tem certeza que deseja atualizar o curso "${course.nome}"?`)) return;
    
    try {
      await axios.put(`http://localhost:8080/api/v1/curso/${id}`, {
        ...course,
        nome: newName
      });
      
      setCourse({ ...course, nome: newName });
      alert(`Curso atualizado com sucesso!`);
    } catch (error) {
      console.error('Erro ao atualizar curso:', error);
      alert('Erro ao atualizar curso. Tente novamente.');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Tem certeza que deseja excluir o curso "${course.nome}"?`)) return;

    try {
      await axios.delete(`http://localhost:8080/api/v1/curso/${id}`);
      alert(`Curso "${course.nome}" excluído com sucesso!`);
      navigate(userType === 'admin' ? '/admin' : '/teacher');
    } catch (error) {
      console.error('Erro ao excluir curso:', error);
      alert('Erro ao excluir o curso. Tente novamente.');
    }
  };

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
          <button className="btn btn-secondary" onClick={() => navigate(userType === 'admin' ? '/admin' : '/teacher')}>
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

          <div style={{marginTop: '2rem', display: 'flex', gap: '1rem'}}>
            <button className="btn btn-primary" onClick={() => navigate('/chat')}>
              💬 Chat com Alunos
            </button>
            <button 
              className="btn btn-warning"
              onClick={handleUpdate}
            >
              ✏️ Atualizar Curso
            </button>
            <button 
              className="btn btn-danger"
              onClick={handleDelete}
            >
              🗑️ Excluir Curso
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeacherCourseView;
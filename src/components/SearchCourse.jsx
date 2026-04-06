import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getUserCourseEntry, removeUserCourseEntry, saveUserCourseEntry } from '../utils/userCourseState';

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
  return status || 'Nao informado';
};

function SearchCoursePage() {
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const navigate = useNavigate();
  const nivelAcesso = localStorage.getItem('nivelAcesso');
  const currentUserId = Number(localStorage.getItem('userId'));
  const userType = nivelAcesso === 'ADMIN' ? 'admin' : 'student';

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/v1/curso');
        const visibleCourses = response.data.filter(
          (course) => course.statusCurso !== false && course.statusCurso !== 'Inativo'
        );
        setCourses(visibleCourses);
      } catch (error) {
        console.error('Erro ao carregar cursos:', error);
        alert('Erro ao carregar os cursos. Verifique a API.');
      }
    };

    fetchCourses();
  }, []);

  const filteredCourses = courses.filter((course) => (
    (course.nome || course.titulo || '').toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterCategory === '' || course.categoria === filterCategory)
  ));

  const handleToggleCourse = (courseId) => {
    const existingEntry = getUserCourseEntry(currentUserId, courseId);

    if (existingEntry?.enrolled) {
      removeUserCourseEntry(currentUserId, courseId);
      setCourses([...courses]);
      return;
    }

    saveUserCourseEntry(currentUserId, courseId, {
      enrolled: true,
      status: 'Em progresso',
    });
    setCourses([...courses]);
  };

  return (
    <div>
      <header className="header">
        <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <img src="/logoCursiFy.png" alt="Web Cursify" />
          Cursify - Pesquisar Cursos
        </div>
        <div className="nav-buttons">
          <button className="btn btn-secondary" onClick={() => navigate(userType === 'admin' ? '/admin' : '/student')}>
            Voltar
          </button>
        </div>
      </header>

      <div className="container">
        <div className="card">
          <h2>Pesquisar Cursos</h2>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Digite o nome do curso..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ flex: 1, minWidth: '200px', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '5px' }}
            />
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} style={{ padding: '0.5rem' }}>
              <option value="">Todas as categorias</option>
              <option value="FUNDAMENTAL_1">Fundamental 1</option>
              <option value="FUNDAMENTAL_2">Fundamental 2</option>
              <option value="MEDIO_1">Ensino Medio - 1o ano</option>
              <option value="MEDIO_2">Ensino Medio - 2o ano</option>
              <option value="MEDIO_3">Ensino Medio - 3o ano</option>
              <option value="OUTROS">Outros</option>
            </select>
          </div>
        </div>

        <div className="course-grid">
          {filteredCourses.map((course) => (
            <div key={course.id} className="card course-card">
              <div onClick={() => navigate(`/course-view/${course.id}`)} style={{ cursor: 'pointer' }}>
                <h3>{course.nome || course.titulo}</h3>
                <p><strong>Categoria:</strong> {NIVEIS[course.categoria] || course.categoria}</p>
                <p><strong>Carga horaria:</strong> {course.duracao || `${course.cargaHoraria} horas`}</p>
                {userType === 'student' ? (
                  <p><strong>Status:</strong> {getUserCourseEntry(currentUserId, course.id)?.status || 'Nao adicionado'}</p>
                ) : null}
                <p>{course.descricao}</p>
              </div>
              {userType === 'student' ? (
                <button
                  className="btn btn-secondary"
                  style={{ width: '100%', marginTop: '1rem' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleCourse(course.id);
                  }}
                >
                  {getUserCourseEntry(currentUserId, course.id)?.enrolled ? 'Remover dos meus cursos' : 'Adicionar aos meus cursos'}
                </button>
              ) : null}
              <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
                Clique para ver detalhes
              </div>
            </div>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="card" style={{ textAlign: 'center' }}>
            <p>Nenhum curso encontrado com os filtros selecionados.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchCoursePage;

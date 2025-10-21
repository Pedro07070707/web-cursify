import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function SearchCourse() {
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const navigate = useNavigate();
  const nivelAcesso = localStorage.getItem('nivelAcesso');
  const userType = nivelAcesso === 'ADMIN' ? 'admin' : 'student';

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/v1/curso');
        // Filtra apenas cursos ativos
        const activeCourses = response.data.filter(course => course.statusCurso === true);
        setCourses(activeCourses);
      } catch (error) {
        console.error('Erro ao carregar cursos:', error);
        alert('Erro ao carregar os cursos. Verifique a API.');
      }
    };

    fetchCourses();
  }, []);

  const filteredCourses = courses.filter(course => {
    return (
      (course.nome || course.titulo)?.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterCategory === '' || course.categoria === filterCategory)
    );
  });

  return (
    <div>
      <header className="header">
        <div className="logo">
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
              <option value="MATEMATICA">Matemática</option>
              <option value="PORTUGUES">Português</option>
              <option value="HISTORIA">História</option>
              <option value="CIENCIAS">Ciências</option>
              <option value="GEOGRAFIA">Geografia</option>
            </select>
          </div>
        </div>

        <div className="course-grid">
          {filteredCourses.map(course => (
            <div key={course.id} className="card course-card">
              <div onClick={() => navigate(`/course-view/${course.id}`)} style={{ cursor: 'pointer' }}>
                <h3>{course.nome || course.titulo}</h3>
                <p><strong>Matéria:</strong> {course.materia || course.categoria}</p>
                <p><strong>Duração:</strong> {course.duracao || `${course.cargaHoraria} horas`}</p>
                <p><strong>Professor:</strong> {course.instrutor}</p>
                <p>{course.descricao}</p>
              </div>
              <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
                👁️ Clique para ver detalhes
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

export default SearchCourse;
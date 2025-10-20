import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function SearchCourse() {
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const navigate = useNavigate();
  const nivelAcesso = localStorage.getItem('nivelAcesso');
  const userType = nivelAcesso === 'ADMIN' ? 'admin' : 'student';

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/v1/curso');
        setCourses(response.data);
      } catch (error) {
        console.error('Erro ao carregar cursos:', error);
        alert('Erro ao carregar os cursos. Verifique a API.');
      }
    };

    fetchCourses();
  }, []);

  const filteredCourses = courses.filter(course => {
    return (
      course.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterSubject === '' || course.materia === filterSubject) &&
      (filterLevel === '' || course.nivel === filterLevel)
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
            <select value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)} style={{ padding: '0.5rem' }}>
              <option value="">Todas as matérias</option>
              <option value="Matemática">Matemática</option>
              <option value="Português">Português</option>
              <option value="História">História</option>
              <option value="Ciências">Ciências</option>
            </select>
            <select value={filterLevel} onChange={(e) => setFilterLevel(e.target.value)} style={{ padding: '0.5rem' }}>
              <option value="">Todos os níveis</option>
              <option value="Fundamental">Fundamental</option>
              <option value="Médio">Médio</option>
              <option value="Superior">Superior</option>
            </select>
          </div>
        </div>

        <div className="course-grid">
          {filteredCourses.map(course => (
            <div
              key={course.id}
              className="card course-card"
              onClick={() => navigate(`/course/${course.id}`)}
              style={{ cursor: 'pointer' }}
            >
              <h3>{course.titulo}</h3>
              <p><strong>Professor:</strong> {course.instrutor}</p>
              <p><strong>Nível:</strong> {course.nivel}</p>
              <p><strong>Duração:</strong> {course.duracao}</p>
              <p>{course.descricao}</p>
              <div style={{ marginTop: '1rem' }}>
                <span
                  style={{
                    background: 'var(--azul-marinho)',
                    color: 'white',
                    padding: '0.3rem 0.8rem',
                    borderRadius: '15px',
                    fontSize: '0.8rem',
                  }}
                >
                  {course.materia}
                </span>
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
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CourseContentEditorSection from './CourseContentEditorSection';
import { CONTENT_TYPES } from './courseContentConfig';

const CATEGORIAS = {
  FUNDAMENTAL_1: 'Fundamental 1 (1o ao 5o ano)',
  FUNDAMENTAL_2: 'Fundamental 2 (6o ao 9o ano)',
  MEDIO_1: 'Ensino Medio - 1o ano',
  MEDIO_2: 'Ensino Medio - 2o ano',
  MEDIO_3: 'Ensino Medio - 3o ano',
  OUTROS: 'Outros',
};

function PublishCoursePage() {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('FUNDAMENTAL_1');
  const [cargaHoraria, setCargaHoraria] = useState('');
  const [sections, setSections] = useState({
    material: [],
    exercicios: [],
    atividades: [],
    avaliacoes: [],
  });

  const navigate = useNavigate();
  const nivelAcesso = localStorage.getItem('nivelAcesso');
  const userId = Number(localStorage.getItem('userId'));
  const userType = nivelAcesso === 'ADMIN' ? 'admin' : 'teacher';

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cargaHorariaNumerica = Number(cargaHoraria);

    if (!nome.trim() || !descricao.trim() || Number.isNaN(cargaHorariaNumerica) || cargaHorariaNumerica <= 0) {
      alert('Preencha os dados obrigatorios do curso corretamente.');
      return;
    }

    if (!userId || Number.isNaN(userId)) {
      alert('Nao foi possivel identificar o usuario logado. Entre novamente para publicar o curso.');
      return;
    }

    const novoCurso = {
      nome: nome.trim(),
      descricao: descricao.trim(),
      categoria,
      cargaHoraria: cargaHorariaNumerica,
      dataCriacao: new Date().toISOString(),
      statusCurso: 'Em progresso',
    };

    try {
      const usersResponse = await axios.get('http://localhost:8080/api/v1/usuario');
      const relatedUser = (usersResponse.data || []).find((user) => Number(user.id) === userId);

      if (!relatedUser) {
        alert('Nao foi possivel localizar o usuario logado na API. Entre novamente para publicar o curso.');
        return;
      }

      const courseResponse = await axios.post('http://localhost:8080/api/v1/curso', novoCurso);
      const createdCourseId = courseResponse.data?.id;
      const relatedCourse = courseResponse.data;

      if (createdCourseId) {
        for (const config of CONTENT_TYPES) {
          const validItems = sections[config.key].filter((item) => {
            if (config.key === 'atividades' || config.key === 'avaliacoes') {
              return item.enunciado.trim() && item.alternativa.trim();
            }

            return item.titulo.trim() && item.subtitulo.trim() && item.conteudo.trim();
          });

          await Promise.all(validItems.map((item, index) => (
            axios.post(
              `http://localhost:8080/api/v1/${config.endpoint}`,
              config.buildPayload(item, createdCourseId, userId, index, {
                user: relatedUser,
                course: relatedCourse,
              })
            )
          )));
        }
      }

      alert('Curso publicado com sucesso!');
      navigate(createdCourseId ? `/manage-course-content/${createdCourseId}` : (userType === 'admin' ? '/admin' : '/teacher'));
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.response?.data || error.message;
      alert(`Erro ao publicar curso: ${errorMsg}`);
    }
  };

  return (
    <div>
      <header className="header">
        <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <img src="/logoCursiFy.png" alt="Web Cursify" />
          Cursify - Publicar Curso
        </div>
        <div className="nav-buttons">
          <button className="btn btn-secondary" onClick={() => navigate(userType === 'admin' ? '/admin' : '/teacher')}>
            Voltar
          </button>
        </div>
      </header>

      <div className="container">
        <div className="card" style={{ maxWidth: '600px', margin: '2rem auto' }}>
          <h2>Publicar Novo Curso</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nome do Curso:</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                placeholder="Ex: Matematica Basica"
              />
            </div>

            <div className="form-group">
              <label>Descricao:</label>
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                required
                placeholder="Descreva o conteudo e os objetivos do curso..."
                style={{ minHeight: '100px', resize: 'vertical' }}
              />
            </div>

            <div className="form-group">
              <label>Categoria:</label>
              <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                <option value="FUNDAMENTAL_1">Fundamental 1 (1o ao 5o ano)</option>
                <option value="FUNDAMENTAL_2">Fundamental 2 (6o ao 9o ano)</option>
                <option value="MEDIO_1">Ensino Medio - 1o ano</option>
                <option value="MEDIO_2">Ensino Medio - 2o ano</option>
                <option value="MEDIO_3">Ensino Medio - 3o ano</option>
                <option value="OUTROS">Outros</option>
              </select>
              <small style={{ color: '#666', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                Categoria selecionada: <strong>{CATEGORIAS[categoria]}</strong>
              </small>
            </div>

            <div className="form-group">
              <label>Carga Horaria (em horas):</label>
              <input
                type="number"
                value={cargaHoraria}
                onChange={(e) => setCargaHoraria(e.target.value)}
                required
                placeholder="Ex: 40"
                min="1"
              />
            </div>

            {CONTENT_TYPES.map((config) => (
              <CourseContentEditorSection
                key={config.key}
                config={config}
                items={sections[config.key]}
                onChange={(items) => setSections((current) => ({ ...current, [config.key]: items }))}
              />
            ))}

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Publicar Curso
            </button>
          </form>

          <div
            style={{
              marginTop: '2rem',
              padding: '1rem',
              background: '#f0f8ff',
              borderRadius: '5px',
            }}
          >
            <h4>Status inicial</h4>
            <p>O curso sera publicado com o status "Em progresso".</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PublishCoursePage;

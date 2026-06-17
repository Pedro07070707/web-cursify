import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AppHeader from './AppHeader';
import CourseContentEditorSection from './CourseContentEditorSection';
import { CONTENT_TYPES } from './courseContentConfig';
import { useTheme } from '../utils/theme';

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
  const { theme, toggleTheme } = useTheme();
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
      usuarioId: userId,
      idUsuario: userId,
      usuario_id: userId,
      usuario: { id: userId },
      professorId: userId,
      idProfessor: userId,
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
    <div className="page-shell">
      <AppHeader
        subtitle="Publicar curso"
        onHome={() => navigate('/')}
        onToggleTheme={toggleTheme}
        theme={theme}
      />

      <main className="container publish-layout">
        <div className="publish-sidebar">
          <div className="panel-card publish-info-card">
            <div className="feature-icon-wrap feature-icon-blue">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
            </div>
            <h3>Novo curso</h3>
            <p>Preencha as informações básicas e adicione conteúdo para publicar seu curso na plataforma.</p>
          </div>
          <div className="panel-card publish-info-card">
            <div className="feature-icon-wrap feature-icon-green">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <h3>Status inicial</h3>
            <p>O curso será publicado com o status <strong>Em progresso</strong> e ficará visível para os alunos.</p>
          </div>
          <div className="panel-card publish-info-card">
            <div className="feature-icon-wrap feature-icon-blue">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            </div>
            <h3>Conteúdo rico</h3>
            <p>Adicione materiais, exercícios, atividades e avaliações para enriquecer a experiência dos alunos.</p>
          </div>
        </div>

        <div className="panel-card publish-form-card">
          <div className="publish-form-header">
            <span className="section-badge">Professor</span>
            <h2>Publicar novo curso</h2>
            <p>Categoria selecionada: <strong>{CATEGORIAS[categoria]}</strong></p>
          </div>

          <form onSubmit={handleSubmit} className="publish-form">
            <div className="form-group">
              <label>Nome do curso</label>
              <div className="input-icon-wrap">
                <svg className="input-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                  placeholder="Ex: Matemática Básica"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Descrição</label>
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                required
                placeholder="Descreva o conteúdo e os objetivos do curso..."
                className="publish-textarea"
              />
            </div>

            <div className="publish-form-row">
              <div className="form-group">
                <label>Categoria</label>
                <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                  <option value="FUNDAMENTAL_1">Fundamental 1 (1º ao 5º ano)</option>
                  <option value="FUNDAMENTAL_2">Fundamental 2 (6º ao 9º ano)</option>
                  <option value="MEDIO_1">Ensino Médio - 1º ano</option>
                  <option value="MEDIO_2">Ensino Médio - 2º ano</option>
                  <option value="MEDIO_3">Ensino Médio - 3º ano</option>
                  <option value="OUTROS">Outros</option>
                </select>
              </div>

              <div className="form-group">
                <label>Carga horária (horas)</label>
                <div className="input-icon-wrap">
                  <svg className="input-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  <input
                    type="number"
                    value={cargaHoraria}
                    onChange={(e) => setCargaHoraria(e.target.value)}
                    required
                    placeholder="Ex: 40"
                    min="1"
                  />
                </div>
              </div>
            </div>

            <div className="publish-content-sections">
              {CONTENT_TYPES.map((config) => (
                <CourseContentEditorSection
                  key={config.key}
                  config={config}
                  items={sections[config.key]}
                  onChange={(items) => setSections((current) => ({ ...current, [config.key]: items }))}
                />
              ))}
            </div>

            <button type="submit" className="btn btn-primary auth-submit-full">
              Publicar curso
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default PublishCoursePage;

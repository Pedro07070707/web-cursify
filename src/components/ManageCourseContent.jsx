import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import AppHeader from './AppHeader';
import CourseContentEditorSection from './CourseContentEditorSection';
import { useTheme } from '../utils/theme';
import { CONTENT_TYPES, getCourseContentCourseId, normalizeCourseContentItem } from './courseContentConfig';

const buildInitialState = () => ({
  material: [],
  exercicios: [],
  atividades: [],
});

function ManageCourseContent() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const userId = Number(localStorage.getItem('userId'));
  const [course, setCourse] = useState(null);
  const [relatedUser, setRelatedUser] = useState(null);
  const [sections, setSections] = useState(buildInitialState);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const validConfigs = useMemo(() => CONTENT_TYPES, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const courseResponse = await axios.get(`http://localhost:8080/api/v1/curso/${courseId}`);
        setCourse(courseResponse.data);

        const usersResponse = await axios.get('http://localhost:8080/api/v1/usuario');
        const currentUser = (usersResponse.data || []).find((user) => Number(user.id) === userId) || null;
        setRelatedUser(currentUser);

        const responses = await Promise.allSettled(
          validConfigs.map((config) => axios.get(`http://localhost:8080/api/v1/${config.endpoint}`))
        );

        const nextSections = buildInitialState();

        responses.forEach((response, index) => {
          const config = validConfigs[index];
          if (response.status !== 'fulfilled') return;

          nextSections[config.key] = (response.value.data || [])
            .filter((item) => String(getCourseContentCourseId(item)) === String(courseId))
            .map((item) => normalizeCourseContentItem(config.key, item));
        });

        setSections(nextSections);
      } catch (error) {
        console.error('Erro ao carregar conteudos do curso:', error);
        alert('Erro ao carregar os conteudos do curso.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, validConfigs]);

  const setSectionItems = (key, items) => {
    setSections((current) => ({
      ...current,
      [key]: items,
    }));
  };

  const saveSection = async (config) => {
    const items = sections[config.key];
    const validItems = items.filter((item) => {
      if (config.key === 'atividades') {
        return item.enunciado.trim() && item.alternativa.trim();
      }

      return item.titulo.trim() && item.subtitulo.trim() && item.conteudo.trim();
    });

    try {
      await Promise.all(validItems.map((item, index) => {
        if (item.id) {
          const payload = config.buildPayload(item, Number(courseId), userId, index, {
            user: relatedUser,
            course,
          });
          return axios.put(`http://localhost:8080/api/v1/${config.endpoint}/${item.id}`, {
            ...payload,
            id: item.id,
          });
        }

        return axios.post(
          `http://localhost:8080/api/v1/${config.endpoint}`,
          config.buildPayload(item, Number(courseId), userId, index, {
            user: relatedUser,
            course,
          })
        );
      }));
    } catch (error) {
      console.error(`Erro ao salvar ${config.key}:`, error);
      throw error;
    }
  };

  const handleSaveAll = async () => {
    if (!userId || Number.isNaN(userId)) {
      alert('Nao foi possivel identificar o usuario logado. Entre novamente para salvar o conteudo.');
      return;
    }

    if (!relatedUser || !course) {
      alert('Nao foi possivel carregar os dados necessarios para salvar o conteudo do curso.');
      return;
    }

    setSaving(true);

    try {
      for (const config of validConfigs) {
        await saveSection(config);
      }

      alert('Conteudo do curso salvo com sucesso!');
      navigate(`/teacher-course/${courseId}`);
    } catch (error) {
      const message = error.response?.data?.message || error.response?.data || error.message;
      alert(`Erro ao salvar conteudo do curso: ${message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-shell">
        <AppHeader
          subtitle="Gerenciar conteúdo"
          onHome={() => navigate('/')}
          onGoProfile={() => navigate('/profile')}
          onLogout={() => {
            localStorage.clear();
            navigate('/');
          }}
          onToggleTheme={toggleTheme}
          theme={theme}
        />
        <main className="container" style={{ padding: '3rem 0' }}>
          <div className="empty-state-card">
            <h4>Carregando conteúdo...</h4>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <AppHeader
        subtitle="Gerenciar conteúdo"
        onHome={() => navigate('/')}
        onGoProfile={() => navigate('/profile')}
        onLogout={() => {
          localStorage.clear();
          navigate('/');
        }}
        onToggleTheme={toggleTheme}
        theme={theme}
      />

      <main className="container" style={{ padding: '2rem 0 4rem' }}>
        <section className="panel-card" style={{ maxWidth: '980px', margin: '0 auto', padding: '28px' }}>
          <div className="section-heading section-heading-inline">
            <div>
              <span className="section-kicker">Conteúdo</span>
              <h3>Gerenciar conteúdo</h3>
            </div>
            <button type="button" className="btn btn-ghost" onClick={() => navigate(`/teacher-course/${courseId}`)}>
              Voltar ao curso
            </button>
          </div>

          <div style={{ display: 'grid', gap: '8px', marginBottom: '18px' }}>
            <p style={{ margin: 0, color: 'var(--muted)' }}>
              <strong style={{ color: 'var(--text)' }}>Curso:</strong> {course?.nome}
            </p>
            <p style={{ margin: 0, color: 'var(--muted)' }}>
              Adicione materiais, exercícios, atividades e avaliações deste curso.
            </p>
          </div>

          <div style={{ display: 'grid', gap: '16px' }}>
            {validConfigs.map((config) => (
              <CourseContentEditorSection
                key={config.key}
                config={config}
                items={sections[config.key]}
                onChange={(items) => setSectionItems(config.key, items)}
              />
            ))}
          </div>

          <div className="form-actions-row" style={{ marginTop: '18px' }}>
            <button type="button" className="btn btn-ghost" onClick={() => navigate(`/teacher-course/${courseId}`)} disabled={saving}>
              Cancelar
            </button>
            <button type="button" className="btn btn-primary" onClick={handleSaveAll} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar conteúdo'}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default ManageCourseContent;

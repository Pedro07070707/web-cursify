import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AppHeader from './AppHeader';
import { useTheme } from '../utils/theme';

function UpdateCourse() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const nivelAcesso = localStorage.getItem('nivelAcesso');
  const userType = nivelAcesso === 'ADMIN' ? 'admin' : 'teacher';

  const [form, setForm] = useState({
    nome: '', categoria: '', descricao: '', cargaHoraria: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`http://localhost:8080/api/v1/curso/${id}`)
      .then(res => {
        const c = res.data;
        setForm({
          nome: c.nome || '',
          categoria: c.categoria || '',
          descricao: c.descricao || '',
          cargaHoraria: c.cargaHoraria || '',
        });
      })
      .catch(() => alert('Erro ao carregar curso.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get(`http://localhost:8080/api/v1/curso/${id}`);
      await axios.put(`http://localhost:8080/api/v1/curso/${id}`, {
        ...response.data,
        nome: form.nome,
        categoria: form.categoria,
        descricao: form.descricao,
        cargaHoraria: form.cargaHoraria,
      });
      alert('Curso atualizado com sucesso!');
      navigate(`/teacher-course/${id}`);
    } catch (error) {
      const msg = error.response?.data?.message || error.message;
      alert(`Erro ao atualizar: ${msg}`);
    }
  };

  if (loading) {
    return (
      <div className="page-shell">
        <AppHeader
          subtitle="Atualizar curso"
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
            <h4>Carregando curso...</h4>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <AppHeader
        subtitle="Atualizar curso"
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
        <section className="panel-card" style={{ maxWidth: '920px', margin: '0 auto', padding: '28px' }}>
          <div className="section-heading section-heading-inline">
            <div>
              <span className="section-kicker">Edição</span>
              <h3>Atualizar curso</h3>
            </div>
            <button type="button" className="btn btn-ghost" onClick={() => navigate(`/teacher-course/${id}`)}>
              Voltar ao curso
            </button>
          </div>

          <form onSubmit={handleSubmit} className="form-grid-modern">
            <div className="form-panel-group">
              <h4>Dados principais</h4>
              <div className="form-group">
                <label htmlFor="curso-nome">Nome do curso</label>
                <input id="curso-nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required />
              </div>

              <div className="form-group">
                <label htmlFor="curso-categoria">Nível</label>
                <select id="curso-categoria" value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} required>
                  <option value="FUNDAMENTAL_1">Fundamental 1 (1º ao 5º ano)</option>
                  <option value="FUNDAMENTAL_2">Fundamental 2 (6º ao 9º ano)</option>
                  <option value="MEDIO_1">Ensino Médio - 1º ano</option>
                  <option value="MEDIO_2">Ensino Médio - 2º ano</option>
                  <option value="MEDIO_3">Ensino Médio - 3º ano</option>
                  <option value="OUTROS">Outros</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="curso-carga">Carga horária</label>
                <input id="curso-carga" type="number" value={form.cargaHoraria} onChange={(e) => setForm({ ...form, cargaHoraria: e.target.value })} />
              </div>

              <div className="form-group">
                <label htmlFor="curso-descricao">Descrição</label>
                <textarea id="curso-descricao" value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} rows={6} />
              </div>
            </div>

            <div className="form-actions-row">
              <button type="button" className="btn btn-ghost" onClick={() => navigate(`/manage-course-content/${id}`)}>
                Gerenciar conteúdo
              </button>
              <button type="submit" className="btn btn-primary">
                Salvar alterações
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}

export default UpdateCourse;

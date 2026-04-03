import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function UpdateCourse() {
  const { id } = useParams();
  const navigate = useNavigate();
  const nivelAcesso = localStorage.getItem('nivelAcesso');
  const userType = nivelAcesso === 'ADMIN' ? 'admin' : 'teacher';

  const [form, setForm] = useState({
    nome: '', categoria: '', descricao: '', cargaHoraria: '',
  });
  const [links, setLinks] = useState([]);
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
        setLinks([
          c.linkLeitura ? { nome: c.nomeLinkLeitura || 'Leitura do material base', url: c.linkLeitura } : null,
          c.linkExercicios ? { nome: c.nomeLinkExercicios || 'Exercícios práticos', url: c.linkExercicios } : null,
          c.linkFixacao ? { nome: c.nomeLinkFixacao || 'Atividades de fixação', url: c.linkFixacao } : null,
        ].filter(Boolean));
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
        linkLeitura: links[0]?.url || '',
        nomeLinkLeitura: links[0]?.nome || '',
        linkExercicios: links[1]?.url || '',
        nomeLinkExercicios: links[1]?.nome || '',
        linkFixacao: links[2]?.url || '',
        nomeLinkFixacao: links[2]?.nome || '',
      });
      alert('Curso atualizado com sucesso!');
      navigate(`/teacher-course/${id}`);
    } catch (error) {
      const msg = error.response?.data?.message || error.message;
      alert(`Erro ao atualizar: ${msg}`);
    }
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <div>
      <header className="header">
        <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <img src="/logoCursiFy.png" alt="Web Cursify" />
          Cursify - Atualizar Curso
        </div>
        <div className="nav-buttons">
          <button className="btn btn-secondary" onClick={() => navigate(`/teacher-course/${id}`)}>
            Voltar
          </button>
        </div>
      </header>

      <div className="container">
        <div className="card" style={{ maxWidth: '600px', margin: '2rem auto' }}>
          <h2>Atualizar Curso</h2>
          <form onSubmit={handleSubmit}>

            <h3 style={{ marginTop: '1rem' }}>Dados do Curso</h3>

            <div className="form-group">
              <label>Nome:</label>
              <input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} required />
            </div>

            <div className="form-group">
              <label>Nível:</label>
              <select value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })} required>
                <option value="FUNDAMENTAL_1">Fundamental 1 (1º ao 5º ano)</option>
                <option value="FUNDAMENTAL_2">Fundamental 2 (6º ao 9º ano)</option>
                <option value="MEDIO_1">Ensino Médio - 1º ano</option>
                <option value="MEDIO_2">Ensino Médio - 2º ano</option>
                <option value="MEDIO_3">Ensino Médio - 3º ano</option>
                <option value="OUTROS">Outros</option>
              </select>
            </div>

            <div className="form-group">
              <label>Horas (Carga Horária):</label>
              <input type="number" value={form.cargaHoraria} onChange={e => setForm({ ...form, cargaHoraria: e.target.value })} />
            </div>

            <div className="form-group">
              <label>Descrição:</label>
              <textarea value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} rows={4} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
            </div>

            <h3 style={{ marginTop: '1.5rem' }}>Links das Atividades</h3>

            {links.map((link, index) => (
              <div key={index} className="form-group" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  style={{ flex: 1 }}
                  type="text"
                  placeholder="Nome da atividade"
                  value={link.nome}
                  onChange={(e) => setLinks(links.map((l, i) => i === index ? { ...l, nome: e.target.value } : l))}
                />
                <input
                  style={{ flex: 2 }}
                  type="url"
                  placeholder="https://..."
                  value={link.url}
                  onChange={(e) => setLinks(links.map((l, i) => i === index ? { ...l, url: e.target.value } : l))}
                />
                <button
                  type="button"
                  onClick={() => setLinks(links.filter((_, i) => i !== index))}
                  style={{ padding: '6px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => setLinks([...links, { nome: '', url: '' }])}
              style={{ padding: '8px 16px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '1rem' }}
            >
              + Adicionar Link
            </button>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
              Salvar Alterações
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UpdateCourse;

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function PublishCourse() {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('FUNDAMENTAL_1');
  const [materia, setMateria] = useState('Matemática');
  const [cargaHoraria, setCargaHoraria] = useState('');
  const [links, setLinks] = useState([]);
  const [nomeEditado, setNomeEditado] = useState(false);

  const handleMateriaChange = (e) => {
    setMateria(e.target.value);
  };
  const navigate = useNavigate();
  const nivelAcesso = localStorage.getItem('nivelAcesso');
  const userType = nivelAcesso === 'ADMIN' ? 'admin' : 'teacher';

  const handleSubmit = async (e) => {
    e.preventDefault();

    const novoCurso = {
      nome: `${materia} - ${nome}`,
      descricao,
      categoria,
      materia,
      cargaHoraria: parseInt(cargaHoraria),
      linkLeitura: links[0]?.url || '',
      nomeLinkLeitura: links[0]?.nome || '',
      linkExercicios: links[1]?.url || '',
      nomeLinkExercicios: links[1]?.nome || '',
      linkFixacao: links[2]?.url || '',
      nomeLinkFixacao: links[2]?.nome || '',
      dataCriacao: new Date().toISOString().slice(0, 19),
    };

    try {
      console.log('Dados enviados:', novoCurso);
      const response = await axios.post('http://localhost:8080/api/v1/curso', novoCurso);
      console.log('Curso criado:', response.data);

      navigate(userType === 'admin' ? '/admin' : '/teacher');
    } catch (error) {
      console.error('Erro completo:', error);
      console.error('Resposta do servidor:', error.response?.data);
      console.error('Status:', error.response?.status);
      
      const errorMsg = error.response?.data?.message || error.response?.data || error.message;
      alert(`Erro ao publicar curso: ${errorMsg}`);
    }
  };

  return (
    <div>
      <header className="header">
        <div className="logo" onClick={() => navigate("/")} style={{cursor: "pointer"}}>
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
              <label>Título do Curso:</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => { setNome(e.target.value); setNomeEditado(true); }}
                required
                placeholder="Ex: Matemática Básica"
              />
              <small style={{ color: '#666', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                Título final: <strong>{materia} - {nome || '...'}</strong>
              </small>
            </div>

            <div className="form-group">
              <label>Descrição:</label>
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                required
                placeholder="Descreva o conteúdo e objetivos do curso..."
                style={{ minHeight: '100px', resize: 'vertical' }}
              />
            </div>

           <div className="form-group">
              <label>Matéria:</label>
              <select value={materia} onChange={handleMateriaChange}>
                <option value="Matemática">Matemática</option>
                <option value="Português">Português</option>
                <option value="História">História</option>
                <option value="Ciências">Ciências</option>
                <option value="Geografia">Geografia</option>
                <option value="Física">Física</option>
                <option value="Química">Química</option>
                <option value="Biologia">Biologia</option>
                <option value="Outros">Outros</option>
              </select>
            </div>

            <div className="form-group">
              <label>Nível:</label>
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
              <label>Duração (em horas aproximadas):</label>
              <input
                type="number"
                value={cargaHoraria}
                onChange={(e) => setCargaHoraria(e.target.value)}
                required
                placeholder="Ex: 40"
                min="1"
              />
            </div>

            <h3 style={{ marginTop: '1.5rem' }}>Links</h3>

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

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              📚 Publicar Curso
            </button>
          </form>

          <div
            style={{
              marginTop: '2rem',
              padding: '1rem',
              background: '#f0f8ff',
              borderRadius: '5px'
            }}
          >
            <h4>💡 Dica:</h4>
            <p>Após publicar o curso, você poderá adicionar vídeo aulas na área de gerenciamento.</p>
          </div>
        </div>
      </div>
    </div>


  );
}

export default PublishCourse;
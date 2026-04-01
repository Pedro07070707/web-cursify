import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function PublishCourse() {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [materia, setMateria] = useState('Matemática');
  const [categoria, setCategoria] = useState('MATEMATICA');
  const [cargaHoraria, setCargaHoraria] = useState('');
  const navigate = useNavigate();
  const nivelAcesso = localStorage.getItem('nivelAcesso');
  const userType = nivelAcesso === 'ADMIN' ? 'admin' : 'teacher';

  const handleSubmit = async (e) => {
    e.preventDefault();

    const novoCurso = {
      nome,
      descricao,
      materia,
      categoria,
      duracao: `${cargaHoraria} horas`,
      cargaHoraria: parseInt(cargaHoraria),
      instrutor: localStorage.getItem('userName') || 'Professor',
      dataCriacao: new Date().toISOString().replace('Z', ''),
      statusCurso: true
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
                onChange={(e) => setNome(e.target.value)}
                required
                placeholder="Ex: Matemática Básica - Ensino Fundamental"
              />
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
              <select value={materia} onChange={(e) => setMateria(e.target.value)}>
                <option value="Matemática">Matemática</option>
                <option value="Português">Português</option>
                <option value="História">História</option>
                <option value="Ciências">Ciências</option>
                <option value="Geografia">Geografia</option>
              </select>
            </div>

            <div className="form-group">
              <label>Categoria:</label>
              <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                <option value="MATEMATICA">Matemática</option>
                <option value="PORTUGUES">Português</option>
                <option value="HISTORIA">História</option>
                <option value="CIENCIAS">Ciências</option>
                <option value="GEOGRAFIA">Geografia</option>
              </select>
            </div>

            <div className="form-group">
              <label>Duração (em horas):</label>
              <input
                type="number"
                value={cargaHoraria}
                onChange={(e) => setCargaHoraria(e.target.value)}
                required
                placeholder="Ex: 40"
                min="1"
              />
            </div>

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
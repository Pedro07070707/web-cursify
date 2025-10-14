import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function PublishCourse() {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  //const [materia, setMateria] = useState('Matemática');
  //const [nivel, setNivel] = useState('Fundamental');
  const [duracao, setDuracao] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const novoCurso = {
      nome,
      descricao,
      //materia,
      //nivel,
      duracao: `${duracao} horas`,
      instrutor: localStorage.getItem('userName') || 'Professor',
      dataPublicacao: new Date().toISOString().replace('Z', ''),
      statusCurso: true
    };

    try {
      const response = await axios.post('http://localhost:8080/api/v1/curso', novoCurso);
      alert('Curso publicado com sucesso!');
      console.log('Curso criado:', response.data);

      navigate('/teacher');

      // salva informações básicas no localStorage
      localStorage.setItem('userName', nome);
      localStorage.setItem('userDescricao', descricao);
      localStorage.setItem('nivelDuracao', duracao);

    } catch (error) {
      console.error('Erro ao publicar curso:', error);
      alert('Erro ao publicar o curso. Verifique os dados e tente novamente.');
    }
  };

  return (
    <div>
      <header className="header">
        <div className="logo">
          <img src="/logoCursiFy.png" alt="Web Cursify" />
          Cursify - Publicar Curso
        </div>
        <div className="nav-buttons">
          <button className="btn btn-secondary" onClick={() => navigate('/teacher')}>
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
              <label>Duração (em horas):</label>
              <input
                type="number"
                value={duracao}
                onChange={(e) => setDuracao(e.target.value)}
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

    /*<div className="form-group">
              <label>Matéria:</label>
              <select value={materia} onChange={(e) => setMateria(e.target.value)}>
                <option value="Matemática">Matemática</option>
                <option value="Português">Português</option>
              </select>
            </div>

            <div className="form-group">
              <label>Nível:</label>
              <select value={nivel} onChange={(e) => setNivel(e.target.value)}>
                <option value="Fundamental">Ensino Fundamental</option>
                <option value="Médio">Ensino Médio</option>
              </select>
            </div>*/
  );
}

export default PublishCourse;
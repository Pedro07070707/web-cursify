import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function PublishCourse() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('Matemática');
  const [level, setLevel] = useState('Fundamental');
  const [duration, setDuration] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newCourse = {
      id: Date.now(),
      title,
      description,
      instructor: localStorage.getItem('userName') || 'Professor',
      level,
      subject,
      duration: duration + ' horas',
      enrolled: false,
      videos: []
    };

    const publishedCourses = JSON.parse(localStorage.getItem('publishedCourses') || '[]');
    publishedCourses.push(newCourse);
    localStorage.setItem('publishedCourses', JSON.stringify(publishedCourses));

    alert('Curso publicado com sucesso!');
    navigate('/teacher');
  };

  return (
    <div>
      <header className="header">
        <div className="logo">
          <img src="/folder-icon.svg" alt="Web Cursify" />
          Web Cursify - Publicar Curso
        </div>
        <div className="nav-buttons">
          <button className="btn btn-secondary" onClick={() => navigate('/teacher')}>
            Voltar
          </button>
        </div>
      </header>

      <div className="container">
        <div className="card" style={{maxWidth: '600px', margin: '2rem auto'}}>
          <h2>Publicar Novo Curso</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Título do Curso:</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Ex: Matemática Básica - Ensino Fundamental"
              />
            </div>

            <div className="form-group">
              <label>Descrição:</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                placeholder="Descreva o conteúdo e objetivos do curso..."
                style={{minHeight: '100px', resize: 'vertical'}}
              />
            </div>

            <div className="form-group">
              <label>Matéria:</label>
              <select value={subject} onChange={(e) => setSubject(e.target.value)}>
                <option value="Matemática">Matemática</option>
                <option value="Português">Português</option>
              </select>
            </div>

            <div className="form-group">
              <label>Nível:</label>
              <select value={level} onChange={(e) => setLevel(e.target.value)}>
                <option value="Fundamental">Ensino Fundamental</option>
                <option value="Médio">Ensino Médio</option>
              </select>
            </div>

            <div className="form-group">
              <label>Duração (em horas):</label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                required
                placeholder="Ex: 40"
                min="1"
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{width: '100%'}}>
              📚 Publicar Curso
            </button>
          </form>

          <div style={{marginTop: '2rem', padding: '1rem', background: '#f0f8ff', borderRadius: '5px'}}>
            <h4>💡 Dica:</h4>
            <p>Após publicar o curso, você poderá adicionar vídeo aulas na área de gerenciamento.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PublishCourse;
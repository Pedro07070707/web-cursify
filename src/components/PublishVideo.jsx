import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function PublishVideo() {
  const { courseId } = useParams();
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const navigate = useNavigate();
  const nivelAcesso = localStorage.getItem('nivelAcesso');
  const userType = nivelAcesso === 'ADMIN' ? 'admin' : 'teacher';

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newVideo = {
      id: Date.now(),
      title,
      duration: duration + ' min',
      file: videoFile?.name || 'video.mp4'
    };

    // Em produção, aqui seria feito upload do vídeo
    alert('Vídeo aula publicada com sucesso!');
    navigate(userType === 'admin' ? '/admin' : '/teacher');
  };

  return (
    <div>
      <header className="header">
        <div className="logo">
          <img src="/logoCursiFy.png" alt="Web Cursify" />
          Cursify - Publicar Vídeo Aula
        </div>
        <div className="nav-buttons">
          <button className="btn btn-secondary" onClick={() => navigate(userType === 'admin' ? '/admin' : '/teacher')}>
            Voltar
          </button>
        </div>
      </header>

      <div className="container">
        <div className="card" style={{maxWidth: '600px', margin: '2rem auto'}}>
          <h2>Publicar Vídeo Aula</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Título da Aula:</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Ex: Introdução às Frações"
              />
            </div>

            <div className="form-group">
              <label>Duração (em minutos):</label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                required
                placeholder="Ex: 15"
                min="1"
              />
            </div>

            <div className="form-group">
              <label>Arquivo de Vídeo:</label>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setVideoFile(e.target.files[0])}
                required
                style={{padding: '0.5rem', border: '1px solid #ddd', borderRadius: '5px'}}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{width: '100%'}}>
              🎥 Publicar Vídeo Aula
            </button>
          </form>

          <div style={{marginTop: '2rem', padding: '1rem', background: '#f0f8ff', borderRadius: '5px'}}>
            <h4>📋 Formatos Aceitos:</h4>
            <p>MP4, AVI, MOV, WMV (máximo 500MB)</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PublishVideo;
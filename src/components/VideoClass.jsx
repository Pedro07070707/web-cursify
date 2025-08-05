import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { topicVideos } from '../data/topicVideos';
import { courses } from '../data/courses';

function VideoClass() {
  const { courseId, videoId } = useParams();
  const navigate = useNavigate();
  const [currentVideo, setCurrentVideo] = useState(null);
  const [topicName, setTopicName] = useState('');
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    // Extrair informações do courseId (formato: topic-subject-level-topic)
    if (courseId.startsWith('topic-')) {
      const parts = courseId.replace('topic-', '').split('-');
      const subject = parts[0];
      const level = parts[1];
      const topic = parts.slice(2).join(' ');
      
      // Mapear nomes de tópicos
      const topicMap = {
        'numeros e operacoes': 'Números e Operações',
        'fracoes e decimais': 'Frações e Decimais',
        'geometria basica': 'Geometria Básica',
        'funcoes': 'Funções',
        'literatura brasileira': 'Literatura Brasileira',
        'gramatica basica': 'Gramática Básica'
      };
      
      const mappedTopic = topicMap[topic.toLowerCase()] || topic;
      setTopicName(mappedTopic);
      
      const topicVideoList = topicVideos[mappedTopic] || [];
      setVideos(topicVideoList);
      
      const video = topicVideoList.find(v => v.id === parseInt(videoId));
      setCurrentVideo(video);
    }
  }, [courseId, videoId]);

  if (!currentVideo) return <div>Carregando...</div>;

  return (
    <div>
      <header className="header">
        <div className="logo">
          <img src="/folder-icon.svg" alt="Web Cursify" />
          Web Cursify - Vídeo Aula
        </div>
        <div className="nav-buttons">
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>
            Voltar
          </button>
        </div>
      </header>

      <div className="container">
        <div className="card">
          <h2>{currentVideo.title}</h2>
          <p><strong>Tópico:</strong> {topicName}</p>
          <p><strong>Duração:</strong> {currentVideo.duration}</p>
          
          <div style={{
            background: '#000', 
            height: '400px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'white',
            fontSize: '1.2rem',
            margin: '2rem 0',
            borderRadius: '10px',
            textAlign: 'center'
          }}>
            🎥 Player de Vídeo - {currentVideo.title}
          </div>

          <div style={{marginTop: '2rem'}}>
            <h3>Outras Aulas do Tópico</h3>
            <div className="topic-list">
              {videos.map(video => (
                <div 
                  key={video.id} 
                  className="topic-item"
                  onClick={() => navigate(`/video/${courseId}/${video.id}`)}
                  style={{
                    background: video.id === parseInt(videoId) ? 'var(--verde-muco)' : 'rgba(255, 255, 255, 0.5)',
                    color: video.id === parseInt(videoId) ? 'white' : 'black',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}
                >
                  <span>🎥 {video.title}</span>
                  <span>{video.duration}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{marginTop: '2rem'}}>
            <button className="btn btn-primary" style={{marginRight: '1rem'}}>
              ✅ Marcar como Assistida
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/chat')}>
              💬 Tirar Dúvidas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VideoClass;
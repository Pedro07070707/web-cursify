import { useParams, useNavigate } from 'react-router-dom';
import { courses } from '../data/courses';
import { topicContent } from '../data/topicContent';
import { topicVideos } from '../data/topicVideos';

function CourseView() {
  const { subject, level, topic } = useParams();
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'Aluno';
  const nivelAcesso = localStorage.getItem('nivelAcesso');
  const userType = nivelAcesso === 'ADMIN' ? 'admin' : 'student';

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const courseData = courses[subject];
  const levelData = courseData?.levels[level];
  const content = topicContent[topic] || { description: 'Conteúdo em desenvolvimento', content: 'Descrição não disponível', duration: '4 horas' };
  const videos = topicVideos[topic] || [];

  if (!courseData || !levelData) return <div>Conteúdo não encontrado</div>;

  return (
    <div>
      <header className="header">
        <div className="logo">
          <img src="/logoCursiFy.png" alt="Web Cursify" />
          Cursify - {topic}
        </div>
        <div className="nav-buttons">
          <span style={{color: 'white', marginRight: '1rem'}}>Olá, {userName}!</span>
          <button className="btn btn-secondary" onClick={() => navigate(userType === 'admin' ? '/admin' : `/subject/${subject}/${level}`)}>
            Voltar
          </button>
          <button className="btn btn-primary" onClick={handleLogout}>
            Sair
          </button>
        </div>
      </header>

      <div className="container">
        <div className="card">
          <h2>{topic}</h2>
          <p><strong>Matéria:</strong> {courseData.name}</p>
          <p><strong>Nível:</strong> {levelData.name}</p>
          <p><strong>Duração:</strong> {content.duration}</p>
          
          <div style={{marginTop: '2rem'}}>
            <h3>Descrição</h3>
            <p>{content.description}</p>
          </div>

          <div style={{marginTop: '2rem'}}>
            <h3>Conteúdo do Tópico</h3>
            <p>{content.content}</p>
          </div>

          {videos.length > 0 && (
            <div style={{marginTop: '2rem'}}>
              <h3>Vídeo Aulas ({videos.length})</h3>
              <div className="topic-list">
                {videos.map(video => (
                  <div 
                    key={video.id} 
                    className="topic-item" 
                    onClick={() => navigate(`/video/topic-${subject}-${level}-${topic}/${video.id}`)}
                    style={{display: 'flex', justifyContent: 'space-between', cursor: 'pointer'}}
                  >
                    <span>🎥 {video.title}</span>
                    <span>{video.duration}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{marginTop: '2rem'}}>
            <h3>Atividades</h3>
            <div className="topic-list">
              <div className="topic-item">📚 Leitura do material base</div>
              <div className="topic-item">✏️ Exercícios práticos</div>
              <div className="topic-item">🎯 Atividades de fixação</div>
              <div className="topic-item">📝 Avaliação do módulo</div>
            </div>
          </div>

          <div style={{marginTop: '2rem'}}>
            {videos.length > 0 && (
              <button 
                className="btn btn-primary" 
                onClick={() => navigate(`/video/topic-${subject}-${level}-${topic}/${videos[0].id}`)}
                style={{marginRight: '1rem'}}
              >
                🎥 Assistir Vídeo Aulas
              </button>
            )}
            <button 
              className="btn btn-secondary"
              onClick={() => {
                const progressKey = `${subject}-${level}-${topic}`;
                const currentProgress = JSON.parse(localStorage.getItem('studentProgress') || '{}');
                currentProgress[progressKey] = true;
                localStorage.setItem('studentProgress', JSON.stringify(currentProgress));
                alert('Tópico marcado como concluído!');
              }}
            >
              ✅ Marcar como Concluído
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourseView;
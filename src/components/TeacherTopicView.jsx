import { useParams, useNavigate } from 'react-router-dom';
import { courses, teacherTasks } from '../data/courses';
import { topicContent } from '../data/topicContent';

function TeacherTopicView() {
  const { subject, level, topic } = useParams();
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'Professor';
  const nivelAcesso = localStorage.getItem('nivelAcesso');
  const userType = nivelAcesso === 'ADMIN' ? 'admin' : 'teacher';

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const courseData = courses[subject];
  const levelData = courseData?.levels[level];
  const content = topicContent[topic] || { description: 'Conteúdo em desenvolvimento', content: 'Descrição não disponível', duration: '4 horas' };
  const tasks = teacherTasks[subject]?.[level] || [];

  if (!courseData || !levelData) return <div>Conteúdo não encontrado</div>;

  return (
    <div>
      <header className="header">
        <div className="logo" onClick={() => navigate("/")} style={{cursor: "pointer"}}>
          <img src="/logoCursiFy.png" alt="Web Cursify" />
          Cursify - Detalhes do Tópico
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
            <h3>Descrição do Tópico</h3>
            <p>{content.description}</p>
          </div>

          <div style={{marginTop: '2rem'}}>
            <h3>Conteúdo Detalhado</h3>
            <p>{content.content}</p>
          </div>

          <div style={{marginTop: '2rem'}}>
            <h3>Objetivos de Aprendizagem</h3>
            <ul>
              <li>Compreender os conceitos fundamentais do tópico</li>
              <li>Aplicar conhecimentos em situações práticas</li>
              <li>Desenvolver habilidades de resolução de problemas</li>
              <li>Conectar com conhecimentos prévios e futuros</li>
            </ul>
          </div>

          <div style={{marginTop: '2rem'}}>
            <h3>Recursos Didáticos Sugeridos</h3>
            <div className="topic-list">
              <div className="topic-item">📚 Material de apoio teórico</div>
              <div className="topic-item">🎥 Vídeos explicativos</div>
              <div className="topic-item">📝 Lista de exercícios</div>
              <div className="topic-item">🧮 Atividades práticas</div>
              <div className="topic-item">📊 Avaliações diagnósticas</div>
            </div>
          </div>

          <div style={{marginTop: '2rem'}}>
            <h3>Estratégias de Ensino</h3>
            <div className="course-grid">
              {tasks.filter(task => task.toLowerCase().includes(topic.toLowerCase().split(' ')[0])).map((task, index) => (
                <div key={index} className="card" style={{background: 'rgba(143, 188, 143, 0.1)'}}>
                  <p>{task}</p>
                </div>
              ))}
              {tasks.filter(task => task.toLowerCase().includes(topic.toLowerCase().split(' ')[0])).length === 0 && (
                <div className="card" style={{background: 'rgba(143, 188, 143, 0.1)'}}>
                  <p>Desenvolver atividades específicas para {topic}</p>
                </div>
              )}
            </div>
          </div>

          <div style={{marginTop: '2rem'}}>
            <button className="btn btn-primary" style={{marginRight: '1rem'}} onClick={() => navigate(`/publish-video/topic-${subject}-${level}`)}>
              🎥 Adicionar Vídeo Aula
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/chat')}>
              💬 Chat com Alunos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeacherTopicView;
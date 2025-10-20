import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockChats } from '../data/mockData';

function Chat() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const navigate = useNavigate();
  const nivelAcesso = localStorage.getItem('nivelAcesso');
  const userType = nivelAcesso === 'PROFESSOR' ? 'teacher' : nivelAcesso === 'ADMIN' ? 'admin' : 'student';
  const userName = localStorage.getItem('userName') || 'Usuário';

  useEffect(() => {
    if (selectedChat) {
      // Simula mensagens do chat
      setMessages([
        { id: 1, sender: 'student', text: 'Olá professor, tenho dúvidas sobre frações', time: '10:25' },
        { id: 2, sender: 'teacher', text: 'Olá! Claro, qual é sua dúvida específica?', time: '10:27' },
        { id: 3, sender: 'student', text: 'Como somar frações com denominadores diferentes?', time: '10:30' }
      ]);
    }
  }, [selectedChat]);

  const sendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: Date.now(),
        sender: userType,
        text: message,
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([...messages, newMessage]);
      setMessage('');
    }
  };

  return (
    <div>
      <header className="header">
        <div className="logo">
          <img src="/logoCursiFy.png" alt="Web Cursify" />
          Cursify - Chat {userType === 'teacher' ? 'com Alunos' : 'com Professores'}
        </div>
        <div className="nav-buttons">
          <button className="btn btn-secondary" onClick={() => navigate(userType === 'teacher' ? '/teacher' : userType === 'admin' ? '/admin' : '/student')}>
            Voltar
          </button>
        </div>
      </header>

      <div className="container">
        <div style={{display: 'flex', gap: '1rem', height: '70vh'}}>
          {/* Lista de Chats */}
          <div className="card" style={{flex: '0 0 300px', padding: '1rem'}}>
            <h3>Conversas</h3>
            <div style={{marginTop: '1rem'}}>
              {userType === 'teacher' ? (
                mockChats.map(chat => (
                  <div
                    key={chat.id}
                    className="topic-item"
                    onClick={() => setSelectedChat(chat)}
                    style={{
                      background: selectedChat?.id === chat.id ? 'var(--verde-muco)' : 'rgba(255, 255, 255, 0.5)',
                      color: selectedChat?.id === chat.id ? 'white' : 'black',
                      marginBottom: '0.5rem'
                    }}
                  >
                    <div style={{fontWeight: 'bold'}}>{chat.studentName}</div>
                    <div style={{fontSize: '0.8rem', opacity: 0.8}}>{chat.lastMessage}</div>
                    <div style={{fontSize: '0.7rem', opacity: 0.6}}>{chat.timestamp}</div>
                    {chat.unread && <span style={{color: 'red'}}>●</span>}
                  </div>
                ))
              ) : (
                <div
                  className="topic-item"
                  onClick={() => setSelectedChat({ id: 1, studentName: 'Professor' })}
                  style={{
                    background: selectedChat ? 'var(--verde-muco)' : 'rgba(255, 255, 255, 0.5)',
                    color: selectedChat ? 'white' : 'black'
                  }}
                >
                  <div style={{fontWeight: 'bold'}}>Professor</div>
                  <div style={{fontSize: '0.8rem', opacity: 0.8}}>Matemática Básica</div>
                </div>
              )}
            </div>
          </div>

          {/* Área de Chat */}
          <div className="card" style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
            {selectedChat ? (
              <>
                <div style={{borderBottom: '1px solid #eee', padding: '1rem', background: '#f8f9fa'}}>
                  <h4>{userType === 'teacher' ? selectedChat.studentName : 'Professor'}</h4>
                </div>

                <div style={{flex: 1, padding: '1rem', overflowY: 'auto', maxHeight: '400px'}}>
                  {messages.map(msg => (
                    <div
                      key={msg.id}
                      style={{
                        marginBottom: '1rem',
                        display: 'flex',
                        justifyContent: msg.sender === userType ? 'flex-end' : 'flex-start'
                      }}
                    >
                      <div
                        style={{
                          background: msg.sender === userType ? 'var(--azul-marinho)' : '#e9ecef',
                          color: msg.sender === userType ? 'white' : 'black',
                          padding: '0.5rem 1rem',
                          borderRadius: '15px',
                          maxWidth: '70%'
                        }}
                      >
                        <div>{msg.text}</div>
                        <div style={{fontSize: '0.7rem', opacity: 0.7, marginTop: '0.2rem'}}>
                          {msg.time}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{padding: '1rem', borderTop: '1px solid #eee', display: 'flex', gap: '0.5rem'}}>
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Digite sua mensagem..."
                    style={{flex: 1, padding: '0.5rem', border: '1px solid #ddd', borderRadius: '20px'}}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  />
                  <button className="btn btn-primary" onClick={sendMessage}>
                    Enviar
                  </button>
                </div>
              </>
            ) : (
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%'}}>
                <p>Selecione uma conversa para começar</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;
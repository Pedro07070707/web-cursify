import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Chat() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  const nivelAcesso = localStorage.getItem('nivelAcesso');
  const userType = nivelAcesso === 'PROFESSOR' ? 'teacher' : nivelAcesso === 'ADMIN' ? 'admin' : 'student';
  const userName = localStorage.getItem('userName') || 'Usuário';
  const currentUserId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/v1/usuario');
        const allUsers = response.data;
        
        // Filtra usuários baseado no tipo do usuário atual
        let filteredUsers = [];
        if (userType === 'teacher') {
          // Professor vê estudantes
          filteredUsers = allUsers.filter(user => 
            (user.nivelAcesso === 'ESTUDANTE' || user.nivelAcesso === 'ALUNO') && user.id !== parseInt(currentUserId)
          );
        } else if (userType === 'student') {
          // Estudante vê professores
          filteredUsers = allUsers.filter(user => 
            user.nivelAcesso === 'PROFESSOR' && user.id !== parseInt(currentUserId)
          );
        } else {
          // Admin vê todos
          filteredUsers = allUsers.filter(user => user.id !== parseInt(currentUserId));
        }
        
        setUsers(filteredUsers);
      } catch (error) {
        console.error('Erro ao carregar usuários:', error);
      }
    };

    fetchUsers();
  }, [userType, currentUserId]);

  const fetchMessages = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/v1/chat');
      const allMessages = response.data;
      
      // Ordena por data
      allMessages.sort((a, b) => new Date(a.dataChat) - new Date(b.dataChat));
      
      setMessages(allMessages);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    }
  };

  useEffect(() => {
    if (selectedChat) {
      fetchMessages();
    }
  }, [selectedChat]);

  const sendMessage = async () => {
    if (message.trim()) {
      try {
        const newMessage = {
          mensagem: message,
          dataChat: new Date().toISOString(),
          statusChat: true,
          usuarioId: parseInt(currentUserId),
          destinatarioId: selectedChat.id
        };
        
        console.log('Enviando mensagem:', newMessage);
        const response = await axios.post('http://localhost:8080/api/v1/chat', newMessage);
        console.log('Resposta:', response.data);
        
        setMessage('');
        fetchMessages();
      } catch (error) {
        console.error('Erro ao enviar mensagem:', error.response?.data || error.message);
        alert('Erro ao enviar mensagem');
      }
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
              {users.length > 0 ? (
                users.map(user => (
                  <div
                    key={user.id}
                    className="topic-item"
                    onClick={() => setSelectedChat(user)}
                    style={{
                      background: selectedChat?.id === user.id ? 'var(--verde-muco)' : 'rgba(255, 255, 255, 0.5)',
                      color: selectedChat?.id === user.id ? 'white' : 'black',
                      marginBottom: '0.5rem'
                    }}
                  >
                    <div style={{fontWeight: 'bold'}}>{user.nome}</div>
                    <div style={{fontSize: '0.8rem', opacity: 0.8}}>
                      {user.nivelAcesso === 'PROFESSOR' ? 'Professor' : 
                       user.nivelAcesso === 'ADMIN' ? 'Admin' : 'Estudante'}
                    </div>
                    <div style={{fontSize: '0.8rem', opacity: 0.8}}>{user.email}</div>
                  </div>
                ))
              ) : (
                <div style={{padding: '1rem', textAlign: 'center', color: '#666'}}>
                  Nenhum usuário disponível
                </div>
              )}
            </div>
          </div>

          {/* Área de Chat */}
          <div className="card" style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
            {selectedChat ? (
              <>
                <div style={{borderBottom: '1px solid #eee', padding: '1rem', background: '#f8f9fa'}}>
                  <h4>{selectedChat.nome}</h4>
                  <p style={{margin: 0, fontSize: '0.9rem', color: '#666'}}>
                    {selectedChat.nivelAcesso === 'PROFESSOR' ? 'Professor' : 
                     selectedChat.nivelAcesso === 'ADMIN' ? 'Admin' : 'Estudante'}
                  </p>
                </div>

                <div style={{flex: 1, padding: '1rem', overflowY: 'auto', maxHeight: '400px'}}>
                  {messages.map(msg => (
                    <div
                      key={msg.id}
                      style={{
                        marginBottom: '1rem',
                        display: 'flex',
                        justifyContent: 'flex-start'
                      }}
                    >
                      <div
                        style={{
                          background: '#e9ecef',
                          color: 'black',
                          padding: '0.5rem 1rem',
                          borderRadius: '15px',
                          maxWidth: '70%'
                        }}
                      >
                        <div>Mensagem #{msg.id}</div>
                        <div style={{fontSize: '0.7rem', opacity: 0.7, marginTop: '0.2rem'}}>
                          {new Date(msg.dataChat).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
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
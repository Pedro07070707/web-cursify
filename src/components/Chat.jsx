import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { appendChatMessage, getChatMessages } from '../utils/chatStorage';

function Chat() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  const nivelAcesso = localStorage.getItem('nivelAcesso');
  const userType = nivelAcesso === 'PROFESSOR' ? 'teacher' : nivelAcesso === 'ADMIN' ? 'admin' : 'student';
  const userName = localStorage.getItem('userName') || 'Usuario';
  const currentUserId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/v1/usuario');
        const allUsers = response.data;

        let filteredUsers = [];
        if (userType === 'teacher') {
          filteredUsers = allUsers.filter((user) => (
            (user.nivelAcesso === 'ESTUDANTE' || user.nivelAcesso === 'ALUNO')
            && user.id !== parseInt(currentUserId, 10)
          ));
        } else if (userType === 'student') {
          filteredUsers = allUsers.filter((user) => (
            user.nivelAcesso === 'PROFESSOR' && user.id !== parseInt(currentUserId, 10)
          ));
        } else {
          filteredUsers = allUsers.filter((user) => user.id !== parseInt(currentUserId, 10));
        }

        setUsers(filteredUsers);
      } catch (error) {
        console.error('Erro ao carregar usuarios:', error);
      }
    };

    fetchUsers();
  }, [userType, currentUserId]);

  useEffect(() => {
    if (!selectedChat || !currentUserId) {
      setMessages([]);
      return;
    }

    const storedMessages = getChatMessages(currentUserId, selectedChat.id).sort(
      (a, b) => new Date(a.dataChat) - new Date(b.dataChat),
    );
    setMessages(storedMessages);
  }, [selectedChat, currentUserId]);

  const sendMessage = () => {
    if (!message.trim() || !selectedChat || !currentUserId) return;

    const newMessage = {
      id: `${currentUserId}-${selectedChat.id}-${Date.now()}`,
      mensagem: message.trim(),
      dataChat: new Date().toISOString(),
      statusChat: 'Enviado',
      remetenteId: Number(currentUserId),
      destinatarioId: Number(selectedChat.id),
      remetenteNome: userName,
    };

    const nextMessages = appendChatMessage(currentUserId, selectedChat.id, newMessage).sort(
      (a, b) => new Date(a.dataChat) - new Date(b.dataChat),
    );

    setMessages(nextMessages);
    setMessage('');
  };

  return (
    <div>
      <header className="header">
        <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <img src="/logoCursiFy.png" alt="Web Cursify" />
          Cursify - Chat {userType === 'teacher' ? 'com Alunos' : 'com Professores'}
        </div>
        <div className="nav-buttons">
          <button
            className="btn btn-secondary"
            onClick={() => navigate(userType === 'teacher' ? '/teacher' : userType === 'admin' ? '/admin' : '/student')}
          >
            Voltar
          </button>
        </div>
      </header>

      <div className="container">
        <div style={{ display: 'flex', gap: '1rem', height: '70vh' }}>
          <div className="card" style={{ flex: '0 0 300px', padding: '1rem' }}>
            <h3>Conversas</h3>
            <div style={{ marginTop: '1rem' }}>
              {users.length > 0 ? (
                users.map((user) => (
                  <div
                    key={user.id}
                    className="topic-item"
                    onClick={() => setSelectedChat(user)}
                    style={{
                      background: selectedChat?.id === user.id ? 'var(--verde-muco)' : 'rgba(255, 255, 255, 0.5)',
                      color: selectedChat?.id === user.id ? 'white' : 'black',
                      marginBottom: '0.5rem',
                    }}
                  >
                    <div style={{ fontWeight: 'bold' }}>{user.nome}</div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                      {user.nivelAcesso === 'PROFESSOR' ? 'Professor' :
                        user.nivelAcesso === 'ADMIN' ? 'Admin' : 'Estudante'}
                    </div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>{user.email}</div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '1rem', textAlign: 'center', color: '#666' }}>
                  Nenhum usuario disponivel
                </div>
              )}
            </div>
          </div>

          <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {selectedChat ? (
              <>
                <div style={{ borderBottom: '1px solid #eee', padding: '1rem', background: '#f8f9fa' }}>
                  <h4>{selectedChat.nome}</h4>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>
                    {selectedChat.nivelAcesso === 'PROFESSOR' ? 'Professor' :
                      selectedChat.nivelAcesso === 'ADMIN' ? 'Admin' : 'Estudante'}
                  </p>
                </div>

                <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', maxHeight: '400px' }}>
                  {messages.length > 0 ? (
                    messages.map((msg) => {
                      const isCurrentUserMessage = Number(msg.remetenteId) === Number(currentUserId);

                      return (
                        <div
                          key={msg.id}
                          style={{
                            marginBottom: '1rem',
                            display: 'flex',
                            justifyContent: isCurrentUserMessage ? 'flex-end' : 'flex-start',
                          }}
                        >
                          <div
                            style={{
                              background: isCurrentUserMessage ? 'var(--verde-muco)' : '#e9ecef',
                              color: isCurrentUserMessage ? 'white' : 'black',
                              padding: '0.5rem 1rem',
                              borderRadius: '15px',
                              maxWidth: '70%',
                            }}
                          >
                            <div>{msg.mensagem}</div>
                            <div style={{ fontSize: '0.7rem', opacity: 0.7, marginTop: '0.2rem' }}>
                              {new Date(msg.dataChat).toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ textAlign: 'center', color: '#666', marginTop: '2rem' }}>
                      Nenhuma mensagem nesta conversa ainda.
                    </div>
                  )}
                </div>

                <div style={{ padding: '1rem', borderTop: '1px solid #eee', display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Digite sua mensagem..."
                    style={{ flex: 1, padding: '0.5rem', border: '1px solid #ddd', borderRadius: '20px' }}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  />
                  <button className="btn btn-primary" onClick={sendMessage}>
                    Enviar
                  </button>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <p>Selecione uma conversa para comecar</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;

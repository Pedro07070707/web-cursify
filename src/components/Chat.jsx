import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { appendChatMessage, getChatMessages, getUserConversationPartners } from '../utils/chatStorage';

const getUserRoleLabel = (nivelAcesso) => {
  if (nivelAcesso === 'PROFESSOR') return 'Professor';
  if (nivelAcesso === 'ADMIN') return 'Admin';
  return 'Estudante';
};

function Chat() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const nivelAcesso = localStorage.getItem('nivelAcesso');
  const userType = nivelAcesso === 'PROFESSOR' ? 'teacher' : nivelAcesso === 'ADMIN' ? 'admin' : 'student';
  const userName = localStorage.getItem('userName') || 'Usuario';
  const currentUserId = localStorage.getItem('userId');

  const refreshConversations = (availableUsers) => {
    if (!currentUserId) {
      setConversations([]);
      return;
    }

    setConversations(getUserConversationPartners(currentUserId, availableUsers));
  };

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
        refreshConversations(filteredUsers);
      } catch (error) {
        console.error('Erro ao carregar usuarios:', error);
      }
    };

    fetchUsers();
  }, [userType, currentUserId]);

  useEffect(() => {
    if (!currentUserId || users.length === 0) return undefined;

    const syncConversations = () => {
      refreshConversations(users);
    };

    syncConversations();

    const intervalId = window.setInterval(syncConversations, 1000);
    const handleStorage = (event) => {
      if (!event.key || event.key.startsWith('chatThread:')) {
        syncConversations();
      }
    };

    window.addEventListener('storage', handleStorage);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('storage', handleStorage);
    };
  }, [currentUserId, users]);

  useEffect(() => {
    if (!selectedChat || !currentUserId) {
      setMessages([]);
      return;
    }

    const storedMessages = getChatMessages(currentUserId, selectedChat.id);
    setMessages(storedMessages);
  }, [selectedChat, currentUserId]);

  useEffect(() => {
    if (!selectedChat || !currentUserId) return undefined;

    const syncMessages = () => {
      const storedMessages = getChatMessages(currentUserId, selectedChat.id);
      setMessages(storedMessages);
      refreshConversations(users);
    };

    syncMessages();

    const handleStorage = (event) => {
      if (!event.key || event.key.startsWith('chatThread:')) {
        syncMessages();
      }
    };

    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, [selectedChat, currentUserId, users]);

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

    const nextMessages = appendChatMessage(currentUserId, selectedChat.id, newMessage);

    setMessages(nextMessages);
    refreshConversations(users);
    setMessage('');
  };

  const searchedUsers = users.filter((user) => {
    const normalizedTerm = searchTerm.trim().toLowerCase();
    if (!normalizedTerm) return false;

    return (
      user.nome?.toLowerCase().includes(normalizedTerm)
      || user.email?.toLowerCase().includes(normalizedTerm)
    );
  });

  const handleSelectChat = (user) => {
    setSelectedChat(user);
    setMessages(getChatMessages(currentUserId, user.id));
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
            <h3>Pesquisar usuarios</h3>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Digite nome ou email..."
              style={{
                width: '100%',
                marginTop: '1rem',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '8px',
              }}
            />

            <div style={{ marginTop: '1rem' }}>
              {searchTerm.trim() ? (
                searchedUsers.length > 0 ? (
                  searchedUsers.map((user) => (
                    <div
                      key={user.id}
                      className="topic-item"
                      onClick={() => handleSelectChat(user)}
                      style={{
                        background: selectedChat?.id === user.id ? 'var(--verde-muco)' : 'rgba(255, 255, 255, 0.5)',
                        color: selectedChat?.id === user.id ? 'white' : 'black',
                        marginBottom: '0.5rem',
                      }}
                    >
                      <div style={{ fontWeight: 'bold' }}>{user.nome}</div>
                      <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                        {getUserRoleLabel(user.nivelAcesso)}
                      </div>
                      <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>{user.email}</div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '1rem', textAlign: 'center', color: '#666' }}>
                    Nenhum usuario encontrado.
                  </div>
                )
              ) : (
                <div style={{ padding: '0.5rem 0', color: '#666', fontSize: '0.9rem' }}>
                  Pesquise para iniciar uma nova conversa.
                </div>
              )}
            </div>

            <h3 style={{ marginTop: '2rem' }}>Suas conversas</h3>
            <div style={{ marginTop: '1rem', maxHeight: 'calc(70vh - 220px)', overflowY: 'auto' }}>
              {conversations.length > 0 ? (
                conversations.map((user) => (
                  <div
                    key={user.id}
                    className="topic-item"
                    onClick={() => handleSelectChat(user)}
                    style={{
                      background: selectedChat?.id === user.id ? 'var(--verde-muco)' : 'rgba(255, 255, 255, 0.5)',
                      color: selectedChat?.id === user.id ? 'white' : 'black',
                      marginBottom: '0.5rem',
                    }}
                  >
                    <div style={{ fontWeight: 'bold' }}>{user.nome}</div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                      {getUserRoleLabel(user.nivelAcesso)}
                    </div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                      {user.lastMessage?.mensagem || 'Sem mensagens'}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '1rem', textAlign: 'center', color: '#666' }}>
                  Nenhuma conversa iniciada ainda.
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
                    {getUserRoleLabel(selectedChat.nivelAcesso)}
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

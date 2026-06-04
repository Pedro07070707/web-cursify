import { useState } from 'react';
import { getUserRoleLabel } from '../utils/ui';

function ChatWorkspace({
  selectedChat,
  message,
  onMessageChange,
  onSendMessage,
  messages,
  conversations,
  searchedUsers,
  searchTerm,
  onSearchChange,
  onSelectChat,
  currentUserId,
}) {
  const [activeList, setActiveList] = useState('recentes');

  return (
    <section className="chat-workspace">
      <aside className="chat-sidebar panel-card">
        <div className="section-heading">
          <span className="section-kicker">Chat</span>
          <div className="chat-toggle-tabs">
            <button
              type="button"
              className={`segmented-tab${activeList === 'recentes' ? ' is-active' : ''}`}
              onClick={() => setActiveList('recentes')}
            >
              Recentes
            </button>
            <button
              type="button"
              className={`segmented-tab${activeList === 'pesquisar' ? ' is-active' : ''}`}
              onClick={() => setActiveList('pesquisar')}
            >
              Pesquisar
            </button>
          </div>
        </div>

        {activeList === 'pesquisar' ? (
          <>
            <div className="chat-search">
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Buscar usuarios"
              />
            </div>

            <div className="chat-sidebar-section">
              <div className="chat-list">
                {searchTerm.trim() ? (
                  searchedUsers.length ? (
                    searchedUsers.map((user) => (
                      <button
                        key={`search-user-${user.id}`}
                        type="button"
                        className={`chat-list-item${selectedChat?.id === user.id ? ' is-selected' : ''}`}
                        onClick={() => onSelectChat(user)}
                      >
                        <strong>{user.nome}</strong>
                        <span>{getUserRoleLabel(user.nivelAcesso)}</span>
                        <small>{user.email}</small>
                      </button>
                    ))
                  ) : (
                    <div className="empty-inline">Nenhum usuario encontrado.</div>
                  )
                ) : (
                  <div className="empty-inline">Pesquise para iniciar uma conversa.</div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="chat-sidebar-section">
            <div className="chat-list chat-list-tall">
              {conversations.length ? (
                conversations.map((user) => (
                  <button
                    key={`conversation-${user.id}`}
                    type="button"
                    className={`chat-list-item${selectedChat?.id === user.id ? ' is-selected' : ''}`}
                    onClick={() => onSelectChat(user)}
                  >
                    <strong>{user.nome}</strong>
                    <span>{getUserRoleLabel(user.nivelAcesso)}</span>
                    <small>{user.lastMessage?.mensagem || 'Sem mensagens'}</small>
                  </button>
                ))
              ) : (
                <div className="empty-inline">Nenhuma conversa iniciada ainda.</div>
              )}
            </div>
          </div>
        )}
      </aside>

      <div className="chat-panel panel-card">
        {selectedChat ? (
          <>
            <div className="chat-panel-header">
              <div>
                <h3>{selectedChat.nome}</h3>
                <p>{getUserRoleLabel(selectedChat.nivelAcesso)}</p>
              </div>
            </div>

            <div className="chat-message-area">
              {messages.length ? (
                messages.map((item) => {
                  const isOwnMessage = Number(item.remetenteId) === Number(currentUserId);

                  return (
                    <div
                      key={item.id}
                      className={`chat-message${isOwnMessage ? ' own' : ''}`}
                    >
                      <div className="chat-bubble">
                        <p>{item.mensagem}</p>
                        <small>
                          {new Date(item.dataChat).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </small>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="chat-empty-state">
                  Nenhuma mensagem nesta conversa ainda.
                </div>
              )}
            </div>

            <div className="chat-composer">
              <input
                type="text"
                value={message}
                onChange={(event) => onMessageChange(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') onSendMessage();
                }}
                placeholder="Digite sua mensagem"
              />
              <button type="button" className="btn btn-primary" onClick={onSendMessage}>
                Enviar
              </button>
            </div>
          </>
        ) : (
          <div className="chat-placeholder">
            <div className="empty-state-card">
              <h3>Selecione uma conversa</h3>
              <p>Escolha um usuario na lateral para abrir o chat.</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default ChatWorkspace;

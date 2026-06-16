import { useEffect, useRef, useState } from 'react';
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
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);

  const getInitials = (name = '') => name.trim().split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();

  const handleSearchToggle = () => {
    setSearchOpen((v) => {
      if (v) onSearchChange('');
      return !v;
    });
  };

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    const handleOutside = (e) => {
      if (!searchRef.current?.contains(e.target) && !searchTerm) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [searchTerm]);

  const listToShow = searchTerm.trim() ? searchedUsers : conversations;
  const emptyMsg = searchTerm.trim()
    ? 'Nenhum usuário encontrado.'
    : 'Nenhuma conversa iniciada ainda.';

  return (
    <section className="chat-workspace">
      {/* Sidebar */}
      <aside className="chat-sidebar panel-card">
        <div className="chat-sidebar-top">
          <h3 className="chat-sidebar-title">Mensagens</h3>
          <div className={`chat-sidebar-search${searchOpen ? ' is-open' : ''}`} ref={searchRef}>
            <button
              type="button"
              className="chat-sidebar-search-btn"
              aria-label="Buscar usuário"
              onClick={handleSearchToggle}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </button>
            <div className="chat-sidebar-search-expand">
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Buscar..."
              />
              {searchTerm ? (
                <button
                  type="button"
                  className="chat-sidebar-search-clear"
                  onClick={() => { onSearchChange(''); setSearchOpen(false); }}
                  aria-label="Limpar"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="chat-list chat-list-tall">
          {listToShow.length ? (
            listToShow.map((user) => (
              <button
                key={user.id}
                type="button"
                className={`chat-list-item${selectedChat?.id === user.id ? ' is-selected' : ''}`}
                onClick={() => { onSelectChat(user); onSearchChange(''); setSearchOpen(false); }}
              >
                <div className="chat-item-avatar">{getInitials(user.nome)}</div>
                <div className="chat-item-info">
                  <strong>{user.nome}</strong>
                  <span>{user.lastMessage?.mensagem || getUserRoleLabel(user.nivelAcesso)}</span>
                </div>
              </button>
            ))
          ) : (
            <div className="chat-empty-side">{emptyMsg}</div>
          )}
        </div>
      </aside>

      {/* Painel principal */}
      <div className="chat-panel panel-card">
        {selectedChat ? (
          <>
            <div className="chat-panel-header">
              <div className="chat-panel-avatar">{getInitials(selectedChat.nome)}</div>
              <div>
                <h3>{selectedChat.nome}</h3>
                <p>{getUserRoleLabel(selectedChat.nivelAcesso)}</p>
              </div>
            </div>

            <div className="chat-message-area">
              {messages.length ? (
                messages.map((item) => {
                  const isOwn = Number(item.remetenteId) === Number(currentUserId);
                  return (
                    <div key={item.id} className={`chat-message${isOwn ? ' own' : ''}`}>
                      <div className="chat-bubble">
                        <p>{item.mensagem}</p>
                        <small>
                          {new Date(item.dataChat).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </small>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="chat-messages-empty">
                  <div className="chat-messages-empty-icon">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  </div>
                  <p>Nenhuma mensagem ainda. Diga olá! 👋</p>
                </div>
              )}
            </div>

            <div className="chat-composer">
              <input
                type="text"
                value={message}
                onChange={(event) => onMessageChange(event.target.value)}
                onKeyDown={(event) => { if (event.key === 'Enter') onSendMessage(); }}
                placeholder="Digite sua mensagem..."
              />
              <button type="button" className="btn btn-primary chat-send-btn" onClick={onSendMessage}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                Enviar
              </button>
            </div>
          </>
        ) : (
          <div className="chat-placeholder">
            <div className="chat-placeholder-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </div>
            <h3>Selecione uma conversa</h3>
            <p>Escolha um usuário na lateral para abrir o chat ou use a busca para encontrar alguém.</p>
          </div>
        )}
      </div>
    </section>
  );
}

export default ChatWorkspace;

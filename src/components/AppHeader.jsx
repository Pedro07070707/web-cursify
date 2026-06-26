import { useEffect, useRef, useState } from 'react';

function AppHeader({
  variant = 'default',
  navItems = [],
  actionItems = [],
  brandDetail,
  onBack,
  backLabel = 'Voltar',
  onGoProfile,
  onLogout,
  onLogin,
  onRegister,
  onHome,
  onToggleTheme,
  theme = 'light',
  subtitle,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const isLoggedIn = Boolean(localStorage.getItem('userId'));
  const isAdmin = localStorage.getItem('nivelAcesso') === 'ADMIN';
  const isStudent = localStorage.getItem('nivelAcesso') === 'ALUNO' || localStorage.getItem('nivelAcesso') === 'STUDENT';
  const isTeacher = localStorage.getItem('nivelAcesso') === 'PROFESSOR' || localStorage.getItem('nivelAcesso') === 'TEACHER';

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <header className={`app-header${variant === 'home' ? ' app-header-home' : ''}`}>
      <div className="app-header__brand">
        <button type="button" className="logo logo-button" onClick={onHome}>
          <img src="/logoCursiFy.png" alt="Web Cursify" />
          <span>
            <strong>CursiFy</strong>
            {brandDetail ? <small>{brandDetail}</small> : subtitle ? <small>{subtitle}</small> : null}
          </span>
        </button>
      </div>

      <div className="app-header__nav">
        {onBack ? (
          <button type="button" className="header-back-button" onClick={onBack}>
            {backLabel}
          </button>
        ) : null}

        {actionItems.length ? (
          <div className="nav-cluster nav-cluster-actions">
            {actionItems.map((item) => (
              <button
                key={item.label}
                type="button"
                className={`nav-link-button${item.emphasis ? ' is-emphasis' : ''}`}
                onClick={item.onClick}
              >
                {item.label}
              </button>
            ))}
          </div>
        ) : null}

        <div className="menu-shell" ref={menuRef}>
          <button
            type="button"
            className={`menu-toggle${menuOpen ? ' is-open' : ''}`}
            onClick={() => setMenuOpen((currentValue) => !currentValue)}
            aria-label="Abrir menu"
          >
            <span />
            <span />
            <span />
          </button>

          {menuOpen ? (
            <div className="menu-dropdown">
              {navItems.length ? (
                <div className="menu-section">
                  {navItems.map((item) => (
                    <button
                      key={`menu-${item.label}`}
                      type="button"
                      className="menu-item"
                      onClick={() => {
                        setMenuOpen(false);
                        item.onClick();
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              ) : null}

              {actionItems.length ? (
                <div className="menu-section">
                  {actionItems.map((item) => (
                    <button
                      key={`menu-action-${item.label}`}
                      type="button"
                      className="menu-item"
                      onClick={() => {
                        setMenuOpen(false);
                        item.onClick();
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              ) : null}

              {!isLoggedIn && onLogin ? (
                <button type="button" className="menu-item" onClick={() => {
                  setMenuOpen(false);
                  onLogin();
                }}>
                  Entrar
                </button>
              ) : null}
              {!isLoggedIn && onRegister ? (
                <button type="button" className="menu-item" onClick={() => {
                  setMenuOpen(false);
                  onRegister();
                }}>
                  Cadastrar
                </button>
              ) : null}
              {isLoggedIn && onGoProfile ? (
                <button type="button" className="menu-item" onClick={() => {
                  setMenuOpen(false);
                  onGoProfile();
                }}>
                  Perfil
                </button>
              ) : null}
              {isAdmin ? (
                <button type="button" className="menu-item" onClick={() => {
                  setMenuOpen(false);
                  window.location.href = '/admin';
                }}>
                  Painel Admin
                </button>
              ) : null}
              {isStudent ? (
                <button type="button" className="menu-item" onClick={() => {
                  setMenuOpen(false);
                  window.location.href = '/student';
                }}>
                  Painel do Estudante
                </button>
              ) : null}
              {isTeacher ? (
                <button type="button" className="menu-item" onClick={() => {
                  setMenuOpen(false);
                  window.location.href = '/teacher';
                }}>
                  Painel do Professor
                </button>
              ) : null}
              <button type="button" className="menu-item menu-item-theme" onClick={() => {
                onToggleTheme();
              }}>
                <span>Tema</span>
                <strong>{theme === 'dark' ? 'Escuro' : 'Claro'}</strong>
              </button>
              {isLoggedIn && onLogout ? (
                <button type="button" className="menu-item" onClick={() => {
                  setMenuOpen(false);
                  onLogout();
                }}>
                  Sair
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}

export default AppHeader;

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import AppHeader from './AppHeader';
import InlineAlert from './InlineAlert';
import { clearSessionData } from '../utils/authStorage';
import { getDashboardPathByRole } from '../utils/ui';
import { useTheme } from '../utils/theme';

function ChangePassword() {
  const [users, setUsers] = useState([]);
  const [nome, setNome] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [tipoConta, setTipoConta] = useState(localStorage.getItem('nivelAcesso') || 'ALUNO');
  const [confirmSenha, setConfirmSenha] = useState('');
  const [feedback, setFeedback] = useState({ type: 'info', message: '' });
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const userId = localStorage.getItem('userId');
  const nivelAcesso = localStorage.getItem('nivelAcesso');
  const dashboardPath = getDashboardPathByRole(nivelAcesso);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/usuario');
        const allUsers = response.data || [];
        const currentUser = allUsers.find((item) => Number(item.id) === Number(userId));
        setUsers(allUsers);
        setNome(currentUser?.nome || '');
        setTipoConta(currentUser?.nivelAcesso || 'ALUNO');
      } catch (error) {
        console.error('Erro ao carregar usuarios:', error);
        setFeedback({ type: 'error', message: 'Erro ao carregar os dados da conta.' });
      }
    };

    fetchUsers();
  }, [userId]);

  const currentUser = useMemo(
    () => users.find((item) => Number(item.id) === Number(userId)),
    [users, userId]
  );

  const validatePassword = (password) => {
    if (!password) return true;
    const hasLetters = /[a-zA-Z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const validLength = password.length >= 8 && password.length <= 20;
    return hasLetters && hasNumbers && validLength;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ type: 'info', message: '' });

    if (!currentUser) {
      setFeedback({ type: 'error', message: 'Nao foi possivel localizar os dados do usuario.' });
      return;
    }

    if (!confirmSenha) {
      setFeedback({ type: 'error', message: 'Digite sua senha atual para confirmar a atualização.' });
      return;
    }

    if (!validatePassword(novaSenha)) {
      setFeedback({ type: 'error', message: 'A nova senha deve ter entre 8 e 20 caracteres, incluindo letras e numeros.' });
      return;
    }

    if (novaSenha && novaSenha !== confirmarSenha) {
      setFeedback({ type: 'error', message: 'A nova senha e a confirmacao nao coincidem.' });
      return;
    }

    const nextRole = currentUser.nivelAcesso === 'ADMIN' ? 'ADMIN' : tipoConta;

    try {
      await api.post('/usuario/login', { email: currentUser.email, senha: confirmSenha });
      const payload = {
        ...currentUser,
        nome,
        nivelAcesso: nextRole,
        senha: novaSenha || currentUser.senha,
      };

      const response = await api.put(`/usuario/${userId}`, payload);
      const persistedUser = response.data;

      localStorage.setItem('userName', nome);
      localStorage.setItem('nivelAcesso', persistedUser.nivelAcesso);
      setUsers((currentUsers) => currentUsers.map((item) => (
        Number(item.id) === Number(userId) ? persistedUser : item
      )));
      setNovaSenha('');
      setConfirmarSenha('');
      setConfirmSenha('');
      setFeedback({
        type: nextRole === 'PROFESSOR' && persistedUser.nivelAcesso !== 'PROFESSOR' ? 'info' : 'success',
        message: nextRole === 'PROFESSOR' && persistedUser.nivelAcesso !== 'PROFESSOR'
          ? 'Solicitação enviada. A conta continuará como aluno até a aprovação do administrador.'
          : 'Perfil atualizado.',
      });
      window.setTimeout(() => navigate('/profile'), 800);
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      setFeedback({ type: 'error', message: error.response?.data?.message || 'Senha atual inválida ou não foi possível atualizar o perfil.' });
    }
  };

  return (
    <div className="page-shell">
      <AppHeader
        subtitle="Atualizar perfil"
        onHome={() => navigate('/')}
        navItems={[
          ...(nivelAcesso !== 'ADMIN'
            ? [{ label: 'Meus cursos', onClick: () => navigate(dashboardPath, { state: { section: 'courses' } }) }]
            : [{ label: 'Painel', onClick: () => navigate(dashboardPath, { state: { section: 'panel' } }) }]),
          { label: 'Chat', onClick: () => navigate(dashboardPath, { state: { section: 'chat' } }) },
        ]}
        onGoProfile={() => navigate('/profile')}
        onLogout={() => {
          clearSessionData();
          navigate('/');
        }}
        onToggleTheme={toggleTheme}
        theme={theme}
      />

      <main className="container auth-layout">
        <div className="card auth-card">
          <h2>Atualizar perfil</h2>
          <form onSubmit={handleSubmit}>
            <InlineAlert type={feedback.type} message={feedback.message} />

            <div className="form-group">
              <label>Nome:</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                placeholder="Digite seu nome"
              />
            </div>

            <div className="form-group">
              <label>Email da conta:</label>
              <input type="email" value={currentUser?.email || ''} disabled />
            </div>

            {currentUser?.nivelAcesso !== 'ADMIN' ? (
              <div className="form-group">
                <label>Tipo da conta:</label>
                <div className="choice-toggle">
                  <button
                    type="button"
                    className={`choice-toggle-button${tipoConta === 'ALUNO' ? ' is-active' : ''}`}
                    onClick={() => setTipoConta('ALUNO')}
                  >
                    Aluno
                  </button>
                  <button
                    type="button"
                    className={`choice-toggle-button${tipoConta === 'PROFESSOR' ? ' is-active' : ''}`}
                    onClick={() => setTipoConta('PROFESSOR')}
                  >
                    Professor
                  </button>
                </div>
              </div>
            ) : null}

            <div className="form-group">
              <label>Nova senha:</label>
              <input
                type="password"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                placeholder="Digite a nova senha"
              />
              <small className="field-help">
                Preencha somente se quiser alterar a senha.
              </small>
            </div>

            <div className="form-group">
              <label>Confirmar nova senha:</label>
              <input
                type="password"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                placeholder="Confirme a nova senha"
              />
            </div>

            <div className="form-group">
              <label>Senha atual:</label>
              <input
                type="password"
                value={confirmSenha}
                onChange={(e) => setConfirmSenha(e.target.value)}
                required
                placeholder="Digite sua senha para confirmar"
              />
              <small className="field-help">Sua senha atual é necessária para confirmar a alteração.</small>
            </div>

            <button type="submit" className="btn btn-primary auth-submit">
              Salvar alteracoes
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default ChangePassword;

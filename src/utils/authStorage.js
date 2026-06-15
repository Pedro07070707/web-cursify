const SESSION_KEYS = ['userId', 'userName', 'userEmail', 'nivelAcesso', 'role', 'accessToken', 'refreshToken', 'cursify-auth-session'];
const AUTH_SESSION_KEY = 'cursify-auth-session';

const isChatThreadForUser = (key, userId) => {
  if (!key?.startsWith('chatThread:')) return false;

  const [, firstId, secondId] = key.split(':');
  return String(firstId) === String(userId) || String(secondId) === String(userId);
};

export const clearSessionData = () => {
  SESSION_KEYS.forEach((key) => localStorage.removeItem(key));
};

export const getStoredAuthSession = () => {
  if (typeof window === 'undefined') return null;

  const raw = window.localStorage.getItem(AUTH_SESSION_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const saveAuthSession = (session) => {
  if (typeof window === 'undefined') return;

  const normalizedSession = session?.user
    ? {
        ...session,
        user: {
          ...session.user,
          role: session.user.role || session.user.nivelAcesso || 'USUARIO',
          nivelAcesso: session.user.nivelAcesso || session.user.role || 'USUARIO',
        },
      }
    : session;

  window.localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(normalizedSession));
  window.localStorage.setItem('userId', String(normalizedSession?.user?.id ?? ''));
  window.localStorage.setItem('userName', normalizedSession?.user?.nome || '');
  window.localStorage.setItem('userEmail', normalizedSession?.user?.email || '');
  window.localStorage.setItem('nivelAcesso', normalizedSession?.user?.nivelAcesso || normalizedSession?.user?.role || '');
  window.localStorage.setItem('role', normalizedSession?.user?.role || normalizedSession?.user?.nivelAcesso || '');
  window.localStorage.setItem('accessToken', normalizedSession?.accessToken || '');
  window.localStorage.setItem('refreshToken', normalizedSession?.refreshToken || '');
};

export const clearAuthSession = () => {
  clearSessionData();
};

export const getAccessToken = () => (typeof window === 'undefined' ? null : window.localStorage.getItem('accessToken'));

export const getRefreshToken = () => (typeof window === 'undefined' ? null : window.localStorage.getItem('refreshToken'));

export const getStoredUserRole = () => {
  if (typeof window === 'undefined') return null;
  const session = getStoredAuthSession();
  return (
    session?.user?.role ||
    session?.user?.nivelAcesso ||
    window.localStorage.getItem('role') ||
    window.localStorage.getItem('nivelAcesso') ||
    null
  );
};

export const clearPersistedUserData = (userId) => {
  if (!userId) return;

  localStorage.removeItem(`userCourseState:${userId}`);

  Object.keys(localStorage).forEach((key) => {
    if (isChatThreadForUser(key, userId)) {
      localStorage.removeItem(key);
    }
  });
};

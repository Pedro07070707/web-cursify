const SESSION_KEYS = ['userId', 'userName', 'userEmail', 'nivelAcesso', 'accessToken', 'refreshToken', 'cursify-auth-session'];
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

  window.localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
  window.localStorage.setItem('userId', String(session?.user?.id ?? ''));
  window.localStorage.setItem('userName', session?.user?.nome || '');
  window.localStorage.setItem('userEmail', session?.user?.email || '');
  window.localStorage.setItem('nivelAcesso', session?.user?.nivelAcesso || session?.user?.role || '');
  window.localStorage.setItem('accessToken', session?.accessToken || '');
  window.localStorage.setItem('refreshToken', session?.refreshToken || '');
};

export const clearAuthSession = () => {
  clearSessionData();
};

export const getAccessToken = () => (typeof window === 'undefined' ? null : window.localStorage.getItem('accessToken'));

export const getRefreshToken = () => (typeof window === 'undefined' ? null : window.localStorage.getItem('refreshToken'));

export const clearPersistedUserData = (userId) => {
  if (!userId) return;

  localStorage.removeItem(`userCourseState:${userId}`);

  Object.keys(localStorage).forEach((key) => {
    if (isChatThreadForUser(key, userId)) {
      localStorage.removeItem(key);
    }
  });
};

const SESSION_KEYS = ['userId', 'userName', 'userEmail', 'nivelAcesso'];

const isChatThreadForUser = (key, userId) => {
  if (!key?.startsWith('chatThread:')) return false;

  const [, firstId, secondId] = key.split(':');
  return String(firstId) === String(userId) || String(secondId) === String(userId);
};

export const clearSessionData = () => {
  SESSION_KEYS.forEach((key) => localStorage.removeItem(key));
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

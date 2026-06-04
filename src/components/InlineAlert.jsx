import { useEffect, useState } from 'react';

function InlineAlert({ message, type = 'info' }) {
  const [visible, setVisible] = useState(Boolean(message));

  useEffect(() => {
    if (!message) {
      setVisible(false);
      return undefined;
    }

    setVisible(true);
    const timeoutId = window.setTimeout(() => {
      setVisible(false);
    }, 3500);

    return () => window.clearTimeout(timeoutId);
  }, [message]);

  if (!message || !visible) return null;

  return (
    <div className={`inline-alert inline-alert-${type}`} role="status">
      {message}
    </div>
  );
}

export default InlineAlert;

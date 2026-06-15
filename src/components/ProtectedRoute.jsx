import { Navigate } from 'react-router-dom';
import { useCursiFy } from '../context/CursiFyContext';

function ProtectedRoute({ roles, children }) {
  const { authUser } = useCursiFy();
  const userRole = authUser?.role || authUser?.nivelAcesso;

  if (!authUser) {
    return <Navigate to="/login" replace />;
  }

  if (Array.isArray(roles) && roles.length && !roles.includes(userRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default ProtectedRoute;

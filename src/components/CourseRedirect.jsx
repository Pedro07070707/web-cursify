import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function CourseRedirect() {
  const { id } = useParams();
  const navigate = useNavigate();
  const nivelAcesso = localStorage.getItem('nivelAcesso');

  useEffect(() => {
    if (nivelAcesso === 'PROFESSOR' || nivelAcesso === 'ADMIN') {
      navigate(`/teacher-course/${id}`, { replace: true });
    } else {
      navigate(`/student-course/${id}`, { replace: true });
    }
  }, [id, nivelAcesso, navigate]);

  return <div className="container"><div className="card">Redirecionando...</div></div>;
}

export default CourseRedirect;

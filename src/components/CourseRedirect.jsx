import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function CourseRedirect() {
  const { id } = useParams();
  const navigate = useNavigate();
  const nivelAcesso = localStorage.getItem('nivelAcesso');

  useEffect(() => {
    if (nivelAcesso === 'PROFESSOR' || nivelAcesso === 'ADMIN') {
      navigate(`/teacher-course/${id}`);
    } else {
      navigate(`/student-course/${id}`);
    }
  }, [id, nivelAcesso, navigate]);

  return <div>Redirecionando...</div>;
}

export default CourseRedirect;
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import AppHeader from './AppHeader';
import DirectorySearchSection from './DirectorySearchSection';
import { getUserCourseEntry, removeUserCourseEntry, saveUserCourseEntry } from '../utils/userCourseState';
import { buildSearchResults, getDashboardPathByRole } from '../utils/ui';
import { useTheme } from '../utils/theme';

function SearchCoursePage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [enrolledIds, setEnrolledIds] = useState([]);
  const nivelAcesso = localStorage.getItem('nivelAcesso');
  const currentUserId = Number(localStorage.getItem('userId'));
  const userType = nivelAcesso === 'ADMIN' ? 'admin' : 'student';
  const dashboardPath = getDashboardPathByRole(nivelAcesso);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const coursesResponse = await api.get('/curso');

        const visibleCourses = (coursesResponse.data || []).filter(
          (course) => String(course.cursoAprovado || '').toLowerCase() === 'aprovado'
            && course.statusCurso !== false && course.statusCurso !== 'Inativo'
        );

        const coursesWithEnrollment = await Promise.all(visibleCourses.map(async (course) => {
          try {
            const occupancy = await api.get(`/usuarioCurso/ocupacao/${course.id}`);
            return { ...course, enrolledCount: occupancy.data.matriculados, enrollmentLimit: occupancy.data.limite, courseFull: occupancy.data.cheio };
          } catch {
            return { ...course, enrolledCount: 0, enrollmentLimit: 100, courseFull: false };
          }
        }));
        setCourses(coursesWithEnrollment);
        if (currentUserId) {
          const enrollmentsResponse = await api.get('/usuarioCurso');
          setEnrolledIds((enrollmentsResponse.data || [])
            .filter((row) => Number(row.usuario?.id ?? row.usuario_id) === currentUserId)
            .map((row) => Number(row.curso?.id ?? row.curso_id)));
        }
      } catch (error) {
        console.error('Erro ao carregar dados da busca:', error);
        alert('Erro ao carregar os dados da busca. Verifique a API.');
      }
    };

    fetchData();
  }, [currentUserId]);

  const results = useMemo(
    () => buildSearchResults(courses, searchTerm),
    [courses, searchTerm]
  );

  const handleToggleCourse = async (course) => {
    const existingEntry = getUserCourseEntry(currentUserId, course.id);
    try {
      if (existingEntry?.enrolled) {
        await api.delete(`/usuarioCurso/inscrever/${currentUserId}/${course.id}`);
        removeUserCourseEntry(currentUserId, course.id);
        setEnrolledIds((items) => items.filter((id) => id !== Number(course.id)));
      } else {
        await api.post(`/usuarioCurso/inscrever/${currentUserId}/${course.id}`);
        saveUserCourseEntry(currentUserId, course.id, { enrolled: true, status: 'Em progresso' });
        setEnrolledIds((items) => items.includes(Number(course.id)) ? items : [...items, Number(course.id)]);
      }
      setCourses((currentCourses) => [...currentCourses]);
    } catch (error) {
      alert(error.response?.data?.message || 'Não foi possível atualizar a matrícula.');
    }
  };

  return (
    <div className="page-shell">
      <AppHeader
        subtitle="Pesquisar"
        onHome={() => navigate('/')}
        navItems={[
          ...(nivelAcesso !== 'ADMIN'
            ? [{ label: 'Meus cursos', onClick: () => navigate(dashboardPath, { state: { section: 'courses' } }) }]
            : [{ label: 'Painel', onClick: () => navigate(dashboardPath, { state: { section: 'panel' } }) }]),
          { label: 'Chat', onClick: () => navigate(dashboardPath, { state: { section: 'chat' } }) },
        ]}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchResults={results}
        onSelectCourse={(course) => navigate(`/course-view/${course.id}`)}
        onGoProfile={() => navigate('/profile')}
        onLogout={() => {
          localStorage.clear();
          navigate('/');
        }}
        onToggleTheme={toggleTheme}
        theme={theme}
      />

      <main className="container dashboard-layout">
        <DirectorySearchSection
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          results={results}
          courseActionLabel={userType === 'student' ? 'Adicionar aos meus cursos' : undefined}
          onCourseAction={userType === 'student' ? handleToggleCourse : undefined}
          isCourseSelected={(course) => enrolledIds.includes(Number(course.id))}
          onOpenCourse={(course) => navigate(`/course-view/${course.id}`)}
        />
      </main>
    </div>
  );
}

export default SearchCoursePage;

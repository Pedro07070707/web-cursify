import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AppHeader from './AppHeader';
import DirectorySearchSection from './DirectorySearchSection';
import { getUserCourseEntry, removeUserCourseEntry, saveUserCourseEntry } from '../utils/userCourseState';
import { buildSearchResults, getDashboardPathByRole } from '../utils/ui';
import { useTheme } from '../utils/theme';

function SearchCoursePage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const nivelAcesso = localStorage.getItem('nivelAcesso');
  const currentUserId = Number(localStorage.getItem('userId'));
  const userType = nivelAcesso === 'ADMIN' ? 'admin' : 'student';
  const dashboardPath = getDashboardPathByRole(nivelAcesso);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesResponse, usersResponse] = await Promise.all([
          axios.get('http://localhost:8080/api/v1/curso'),
          axios.get('http://localhost:8080/api/v1/usuario'),
        ]);

        const visibleCourses = (coursesResponse.data || []).filter(
          (course) => course.statusCurso !== false && course.statusCurso !== 'Inativo'
        );
        const visibleUsers = (usersResponse.data || []).filter((user) => Number(user.id) !== currentUserId);

        setCourses(visibleCourses);
        setUsers(visibleUsers);
      } catch (error) {
        console.error('Erro ao carregar dados da busca:', error);
        alert('Erro ao carregar os dados da busca. Verifique a API.');
      }
    };

    fetchData();
  }, [currentUserId]);

  const results = useMemo(
    () => buildSearchResults(courses, users, searchTerm),
    [courses, users, searchTerm]
  );

  const handleToggleCourse = (course) => {
    const existingEntry = getUserCourseEntry(currentUserId, course.id);

    if (existingEntry?.enrolled) {
      removeUserCourseEntry(currentUserId, course.id);
      setCourses((currentCourses) => [...currentCourses]);
      return;
    }

    saveUserCourseEntry(currentUserId, course.id, {
      enrolled: true,
      status: 'Em progresso',
    });
    setCourses((currentCourses) => [...currentCourses]);
  };

  return (
    <div className="page-shell">
      <AppHeader
        subtitle="Pesquisar"
        navItems={[
          { label: 'Pagina inicial', onClick: () => navigate(dashboardPath) },
          ...(nivelAcesso !== 'ADMIN'
            ? [{ label: 'Meus cursos', onClick: () => navigate(dashboardPath, { state: { section: 'courses' } }) }]
            : [{ label: 'Painel', onClick: () => navigate(dashboardPath, { state: { section: 'panel' } }) }]),
          { label: 'Chat', onClick: () => navigate(dashboardPath, { state: { section: 'chat' } }) },
        ]}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchResults={results}
        onSelectCourse={(course) => navigate(`/course-view/${course.id}`)}
        onSelectUser={() => navigate('/profile')}
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
          title="Pesquisar cursos e usuarios"
          description="Veja os resultados separados em Cursos e Usuarios, como solicitado para a barra de pesquisa."
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          results={results}
          courseActionLabel={userType === 'student' ? 'Adicionar aos meus cursos' : undefined}
          onCourseAction={userType === 'student' ? handleToggleCourse : undefined}
          isCourseSelected={(course) => Boolean(getUserCourseEntry(currentUserId, course.id)?.enrolled)}
          onOpenCourse={(course) => navigate(`/course-view/${course.id}`)}
          onUserAction={() => navigate('/profile')}
        />
      </main>
    </div>
  );
}

export default SearchCoursePage;

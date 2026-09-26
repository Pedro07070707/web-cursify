import { NIVEIS, formatCourseDuration } from '../utils/ui';

function DirectorySearchSection({
  searchTerm,
  onSearchChange,
  results,
  courseActionLabel,
  onCourseAction,
  isCourseSelected,
  onOpenCourse,
  minimal = false,
}) {
  const hasQuery = searchTerm.trim().length > 0;

  return (
    <section className={`panel-card search-section${minimal ? ' search-section-minimal' : ''}`}>
      <input
        className="search-hero-input"
        type="text"
        value={searchTerm}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Pesquise cursos"
      />

      {hasQuery ? (
        <div className="result-column single-result-column">
          <div className="result-column-header">
            <h4>Cursos</h4>
            <span>{results.courses.length}</span>
          </div>

          {results.courses.length ? (
            results.courses.map((course) => (
              <article key={course.id} className="result-card">
                <div>
                  <h5>{course.nome || course.titulo}</h5>
                  <p>{course.descricao}</p>
                  <small>Matriculados: {course.enrolledCount ?? course.numeroAlunos ?? 0}/{course.enrollmentLimit ?? 100}</small>
                  <small>{NIVEIS[course.categoria] || course.categoria} • {formatCourseDuration(course)}</small>
                </div>

                <div className="result-card-actions">
                  <button type="button" className="btn btn-ghost" onClick={() => onOpenCourse(course)}>
                    Abrir
                  </button>
                  {courseActionLabel && onCourseAction && (isCourseSelected?.(course) || !(course.courseFull ?? (Number(course.numeroAlunos) >= 100))) ? (
                    <button type="button" className="btn btn-primary" onClick={() => onCourseAction(course)}>
                      {isCourseSelected?.(course) ? '✓ Adicionado aos meus cursos' : courseActionLabel}
                    </button>
                  ) : null}
                  {(course.courseFull ?? (Number(course.numeroAlunos) >= 100)) ? <small>Curso cheio</small> : null}
                </div>
              </article>
            ))
          ) : (
            <div className="empty-state-card compact">
              <p>Nenhum curso encontrado.</p>
            </div>
          )}
        </div>
      ) : minimal ? null : (
        <div className="empty-state-card">
          <h4>Resultados de cursos</h4>
          <p>Digite um termo para ver apenas cursos relacionados.</p>
        </div>
      )}
    </section>
  );
}

export default DirectorySearchSection;

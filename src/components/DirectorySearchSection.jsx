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
      {!minimal ? null : <div className="search-top-spacer" />}

      <div className="search-hero-input">
        <input
          type="text"
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Pesquise cursos"
        />
      </div>

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
                  <small>{NIVEIS[course.categoria] || course.categoria} • {formatCourseDuration(course)}</small>
                </div>

                <div className="result-card-actions">
                  <button type="button" className="btn btn-ghost" onClick={() => onOpenCourse(course)}>
                    Abrir
                  </button>
                  {courseActionLabel && onCourseAction ? (
                    <button type="button" className="btn btn-primary" onClick={() => onCourseAction(course)}>
                      {isCourseSelected?.(course) ? `Remover` : courseActionLabel}
                    </button>
                  ) : null}
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

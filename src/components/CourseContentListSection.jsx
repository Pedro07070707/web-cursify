function CourseContentListSection({ title, items, typeKey, emptyMessage }) {
  return (
    <div style={{ marginTop: '2rem' }}>
      <h3>{title}</h3>
      {items.length === 0 ? (
        <div className="topic-item">{emptyMessage}</div>
      ) : (
        <div className="topic-list">
          {items.map((item, index) => (
            <div key={`${typeKey}-${item.id || index}`} className="topic-item">
              {(typeKey === 'atividades' || typeKey === 'avaliacoes') ? (
                <>
                  <strong>{index + 1}. {item.enunciado}</strong>
                  <div style={{ marginTop: '0.5rem' }}>Alternativa / resposta: {item.alternativa}</div>
                  {typeKey !== 'avaliacoes' ? (
                    <div style={{ marginTop: '0.25rem' }}>Status: {item.status}%</div>
                  ) : null}
                </>
              ) : (
                <>
                  <strong>{item.titulo}</strong>
                  {item.subtitulo ? <div style={{ marginTop: '0.5rem' }}>{item.subtitulo}</div> : null}
                  {item.conteudo ? <div style={{ marginTop: '0.5rem' }}>{item.conteudo}</div> : null}
                  {item.link ? (
                    <a href={item.link} target="_blank" rel="noreferrer" style={{ display: 'inline-block', marginTop: '0.5rem' }}>
                      Abrir link complementar
                    </a>
                  ) : null}
                  <div style={{ marginTop: '0.25rem' }}>Status: {item.status}</div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CourseContentListSection;

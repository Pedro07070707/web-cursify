import { useState } from 'react';

function ExerciseItem({ item, index, onResolved, locked }) {
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);
  const alternatives = Array.isArray(item.alternativas) ? item.alternativas.filter(Boolean) : [];
  const submit = () => {
    if (selected === null || result) return;
    const selectedAnswer = alternatives[selected];
    const correct = selectedAnswer?.trim().toLowerCase() === String(item.respostaCorreta || '').trim().toLowerCase()
      || String(selected) === String(item.respostaCorreta);
    setResult({ correct, points: correct ? Number(item.pontos) || 1 : 0 });
    onResolved?.(item.id, correct ? Number(item.pontos) || 1 : 0);
  };

  return (
    <div className="topic-item">
      <strong>{index + 1}. {item.enunciado || item.conteudo}</strong>
      <div style={{ marginTop: '0.75rem', display: 'grid', gap: '0.5rem' }}>
        {alternatives.map((alternative, alternativeIndex) => (
          <label key={`${item.id}-${alternativeIndex}`} style={{ cursor: 'pointer' }}>
            <input type="radio" name={`exercise-${item.id}`} checked={selected === alternativeIndex} disabled={locked} onChange={() => setSelected(alternativeIndex)} />{' '}
            {String.fromCharCode(65 + alternativeIndex)}) {alternative}
          </label>
        ))}
      </div>
      <button type="button" className="btn btn-primary" style={{ marginTop: '0.75rem' }} onClick={submit} disabled={locked || selected === null}>
        Enviar resposta
      </button>
      {result ? <div style={{ marginTop: '0.5rem' }}>{result.correct ? 'Resposta correta!' : 'Resposta incorreta.'}{item.explicacao ? ` ${item.explicacao}` : ''}</div> : null}
    </div>
  );
}

function CourseContentListSection({ title, items, typeKey, emptyMessage, onResolved, onViewed, locked = false }) {
  return (
    <div style={{ marginTop: '2rem' }}>
      <h3>{title}</h3>
      {items.length === 0 ? (
        <div className="topic-item">{emptyMessage}</div>
      ) : (
        <div className="topic-list">
          {items.map((item, index) => (
            <div key={`${typeKey}-${item.id || index}`} onClick={typeKey === 'material' ? () => onViewed?.(item.id) : undefined}>
              {typeKey === 'exercicios' ? <ExerciseItem item={item} index={index} onResolved={onResolved} locked={locked} /> : <div className="topic-item">
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
                </>
              )}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CourseContentListSection;

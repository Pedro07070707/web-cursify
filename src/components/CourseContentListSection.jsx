import { useState } from 'react';

function ExerciseItem({ item, index, onResolved, locked }) {
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);
  const alternatives = Array.isArray(item.alternativas) ? item.alternativas.filter(Boolean) : [];
  const submit = () => {
    if (selected === null || result?.correct) return;
    const selectedAnswer = alternatives[selected];
    const correct = selectedAnswer?.trim().toLowerCase() === String(item.respostaCorreta || '').trim().toLowerCase()
      || String(selected) === String(item.respostaCorreta);
    setResult({ correct, points: correct ? Number(item.pontos) || 1 : 0 });
    if (correct) onResolved?.(item.id, Number(item.pontos) || 1);
  };
  return <div className="topic-item"><strong>{index + 1}. {item.enunciado || item.conteudo}</strong><div style={{ marginTop: '0.75rem', display: 'grid', gap: '0.5rem' }}>{alternatives.map((alternative, alternativeIndex) => <label key={`${item.id}-${alternativeIndex}`} style={{ cursor: 'pointer' }}><input type="radio" name={`exercise-${item.id}`} checked={selected === alternativeIndex} disabled={locked} onChange={() => setSelected(alternativeIndex)} /> {String.fromCharCode(65 + alternativeIndex)}) {alternative}</label>)}</div><button type="button" className="btn btn-primary" style={{ marginTop: '0.75rem' }} onClick={submit} disabled={locked || selected === null}>Enviar resposta</button>{result ? <div style={{ marginTop: '0.5rem' }}>{result.correct ? 'Resposta correta!' : 'Resposta incorreta. Tente novamente.'}{item.explicacao ? ` ${item.explicacao}` : ''}</div> : null}</div>;
}

function MaterialItem({ item, index, onViewed, locked }) {
  const [opened, setOpened] = useState(false);
  const openMaterial = () => {
    if (locked || opened) return;
    setOpened(true);
    onViewed?.(item.id);
  };
  return <article className="topic-item"><strong>{index + 1}. {item.titulo}</strong>{item.subtitulo ? <div style={{ marginTop: '0.5rem' }}>{item.subtitulo}</div> : null}{!opened ? <button type="button" className="btn btn-ghost" style={{ marginTop: '0.75rem' }} onClick={openMaterial} disabled={locked}>Abrir material</button> : <div style={{ marginTop: '0.75rem' }}>{item.conteudo ? <div>{item.conteudo}</div> : null}{item.link ? <a href={item.link} target="_blank" rel="noreferrer" style={{ display: 'inline-block', marginTop: '0.5rem' }}>Abrir link complementar</a> : null}</div>}</article>;
}

function CourseContentListSection({ title, items, typeKey, emptyMessage, onResolved, onViewed, locked = false }) {
  return <div style={{ marginTop: '2rem' }}><h3>{title}</h3>{items.length === 0 ? <div className="topic-item">{emptyMessage}</div> : <div className="topic-list">{items.map((item, index) => <div key={`${typeKey}-${item.id || index}`}>{typeKey === 'exercicios' ? <ExerciseItem item={item} index={index} onResolved={onResolved} locked={locked} /> : typeKey === 'material' ? <MaterialItem item={item} index={index} onViewed={onViewed} locked={locked} /> : <div className="topic-item"><strong>{item.enunciado}</strong></div>}</div>)}</div>}</div>;
}

export default CourseContentListSection;
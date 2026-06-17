import { useState } from 'react';
import { createEmptyEntry } from './courseContentConfig';

const SECTION_ICONS = {
  material: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  ),
  exercicios: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
  avaliacoes: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
};

const ITEM_LABEL = { material: 'Material', exercicios: 'Exercício', avaliacoes: 'Avaliação' };

function CourseContentEditorSection({ config, items, onChange }) {
  const [collapsed, setCollapsed] = useState(false);

  const handleAdd = () => onChange([...items, createEmptyEntry(config.key)]);
  const handleRemove = (index) => onChange(items.filter((_, i) => i !== index));
  const handleItemChange = (index, field, value) => onChange(
    items.map((item, i) => i === index ? { ...item, [field]: value } : item)
  );

  const iconColor = config.key === 'exercicios' ? 'feature-icon-green' : 'feature-icon-blue';

  return (
    <div className="content-editor-section">
      <div className="content-editor-header">
        <div className="content-editor-title">
          <div className={`feature-icon-wrap ${iconColor}`}>{SECTION_ICONS[config.key]}</div>
          <div>
            <h3>{config.title}</h3>
            <span className="content-editor-count">{items.length} {items.length === 1 ? 'item' : 'itens'}</span>
          </div>
        </div>
        <div className="content-editor-actions">
          <button type="button" className="btn btn-ghost content-editor-toggle" onClick={() => setCollapsed((v) => !v)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              {collapsed ? <polyline points="6 9 12 15 18 9"/> : <polyline points="18 15 12 9 6 15"/>}
            </svg>
          </button>
          <button type="button" className="btn btn-primary content-editor-add" onClick={handleAdd}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Adicionar
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="content-editor-body">
          {items.length === 0 ? (
            <div className="content-editor-empty">
              <p>Nenhum item adicionado nesta seção.</p>
            </div>
          ) : (
            <div className="content-editor-items">
              {items.map((item, index) => (
                <div key={`${config.key}-${index}`} className="content-editor-item">
                  <div className="content-editor-item-header">
                    <span className="content-editor-item-label">
                      {ITEM_LABEL[config.key] || config.title} {index + 1}
                    </span>
                    <button type="button" className="btn btn-danger content-editor-remove" onClick={() => handleRemove(index)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      Remover
                    </button>
                  </div>

                  {config.key === 'avaliacoes' ? (
                    <>
                      <div className="form-group">
                        <label>Enunciado</label>
                        <textarea
                          value={item.enunciado}
                          onChange={(e) => handleItemChange(index, 'enunciado', e.target.value)}
                          rows={3}
                          placeholder="Digite o enunciado..."
                          className="publish-textarea"
                        />
                      </div>
                      <div className="form-group">
                        <label>Alternativa / Resposta</label>
                        <div className="input-icon-wrap">
                          <svg className="input-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                          <input type="text" value={item.alternativa} onChange={(e) => handleItemChange(index, 'alternativa', e.target.value)} placeholder="Resposta correta" />
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="publish-form-row">
                        <div className="form-group">
                          <label>Título</label>
                          <div className="input-icon-wrap">
                            <svg className="input-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/></svg>
                            <input type="text" value={item.titulo} onChange={(e) => handleItemChange(index, 'titulo', e.target.value)} placeholder="Ex: Introdução" />
                          </div>
                        </div>
                        <div className="form-group">
                          <label>Subtítulo</label>
                          <div className="input-icon-wrap">
                            <svg className="input-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="11" y2="12"/></svg>
                            <input type="text" value={item.subtitulo} onChange={(e) => handleItemChange(index, 'subtitulo', e.target.value)} placeholder="Ex: Conceitos iniciais" />
                          </div>
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Conteúdo</label>
                        <textarea
                          value={item.conteudo}
                          onChange={(e) => handleItemChange(index, 'conteudo', e.target.value)}
                          rows={3}
                          placeholder="Descreva o conteúdo..."
                          className="publish-textarea"
                        />
                      </div>
                      <div className="form-group">
                        <label>Link</label>
                        <div className="input-icon-wrap">
                          <svg className="input-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                          <input type="url" value={item.link} onChange={(e) => handleItemChange(index, 'link', e.target.value)} placeholder="https://..." />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CourseContentEditorSection;

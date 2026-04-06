import { createEmptyEntry } from './courseContentConfig';

const CONTENT_ITEM_LABELS = {
  material: 'Material',
  exercicios: 'Exercicio',
  atividades: 'Atividade',
  avaliacoes: 'Avaliacao',
};

function CourseContentEditorSection({ config, items, onChange }) {
  const handleAdd = () => {
    onChange([...items, createEmptyEntry(config.key)]);
  };

  const handleRemove = (index) => {
    onChange(items.filter((_, itemIndex) => itemIndex !== index));
  };

  const handleItemChange = (index, field, value) => {
    onChange(items.map((item, itemIndex) => (
      itemIndex === index ? { ...item, [field]: value } : item
    )));
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0 }}>{config.title}</h3>
        <button type="button" className="btn btn-secondary" onClick={handleAdd}>
          Adicionar
        </button>
      </div>

      {items.length === 0 && (
        <div className="card" style={{ backgroundColor: '#f8f9fa' }}>
          <p>Nenhum item adicionado nesta secao.</p>
        </div>
      )}

      {items.map((item, index) => (
        <div key={`${config.key}-${index}`} className="card" style={{ marginBottom: '1rem', backgroundColor: '#fafafa' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <strong>{CONTENT_ITEM_LABELS[config.key] || config.title} {index + 1}</strong>
            <button
              type="button"
              onClick={() => handleRemove(index)}
              style={{
                padding: '6px 10px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Remover
            </button>
          </div>

          {(config.key === 'atividades' || config.key === 'avaliacoes') ? (
            <>
              <div className="form-group">
                <label>Enunciado:</label>
                <textarea
                  value={item.enunciado}
                  onChange={(e) => handleItemChange(index, 'enunciado', e.target.value)}
                  rows={4}
                  placeholder="Digite o enunciado..."
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
              </div>

              <div className="form-group">
                <label>Alternativa / Resposta:</label>
                <input
                  type="text"
                  value={item.alternativa}
                  onChange={(e) => handleItemChange(index, 'alternativa', e.target.value)}
                  placeholder="Digite a alternativa correta ou resposta"
                />
              </div>

              <div className="form-group">
                <label>Status (%):</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={item.status}
                  onChange={(e) => handleItemChange(index, 'status', e.target.value)}
                  placeholder="0"
                />
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label>Titulo:</label>
                <input
                  type="text"
                  value={item.titulo}
                  onChange={(e) => handleItemChange(index, 'titulo', e.target.value)}
                  placeholder="Ex: Introducao"
                />
              </div>

              <div className="form-group">
                <label>Subtitulo:</label>
                <input
                  type="text"
                  value={item.subtitulo}
                  onChange={(e) => handleItemChange(index, 'subtitulo', e.target.value)}
                  placeholder="Ex: Conceitos iniciais"
                />
              </div>

              <div className="form-group">
                <label>Conteudo:</label>
                <textarea
                  value={item.conteudo}
                  onChange={(e) => handleItemChange(index, 'conteudo', e.target.value)}
                  rows={4}
                  placeholder="Descreva o conteudo..."
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
              </div>

              <div className="form-group">
                <label>Link:</label>
                <input
                  type="url"
                  value={item.link}
                  onChange={(e) => handleItemChange(index, 'link', e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div className="form-group">
                <label>Status:</label>
                <select value={item.status} onChange={(e) => handleItemChange(index, 'status', e.target.value)}>
                  <option value="Nao concluido">Nao concluido</option>
                  <option value="Concluido">Concluido</option>
                </select>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

export default CourseContentEditorSection;

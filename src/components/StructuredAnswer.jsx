/** Render structured interview answers with ## section headers */
export default function StructuredAnswer({ text }) {
  if (!text || !text.includes('## Interview Answer')) {
    return (
      <p className="q-desc-text" style={{ whiteSpace: 'pre-wrap' }}>
        {text}
      </p>
    );
  }

  const sections = text.split(/\n(?=## )/).filter(Boolean);

  return (
    <div className="structured-answer">
      {sections.map((block) => {
        const lines = block.trim().split('\n');
        const title = lines[0]?.replace(/^## /, '') || '';
        const body = lines.slice(1).join('\n').trim();
        return (
          <div key={title} className="structured-answer-section">
            <h4 className="structured-answer-heading">{title}</h4>
            <div className="structured-answer-body">{body}</div>
          </div>
        );
      })}
    </div>
  );
}

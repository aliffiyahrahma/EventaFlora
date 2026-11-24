export default function LearningScene({ region, onStartQuestions, onBackToMap }) {
  return (
    <div className="screen scene-box">
      <div className="scene-header">
        <span className="level-tag">{region.name} — Learning Scene</span>
        <button className="btn btn-small btn-secondary" onClick={onBackToMap}>Peta</button>
      </div>

      <div className="learning-card">
        <h2>{region.learning_title}</h2>
        <p className="learning-content">{region.learning_content}</p>
      </div>

      <div className="dialogue-controls">
        <button className="btn btn-primary" onClick={onStartQuestions}>
          Mulai Tantangan Soal
        </button>
      </div>
    </div>
  );
}
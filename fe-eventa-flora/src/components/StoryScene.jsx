import { useState } from 'react';

export default function StoryScene({ region, stories, onNextToLearning, onBackToMap }) {
  const [index, setIndex] = useState(0);

  if (!stories || stories.length === 0) {
    return (
      <div className="screen scene-box">
        <h2>{region?.name}</h2>
        <p>Belum ada dialog cerita untuk wilayah ini.</p>
        <button className="btn btn-primary" onClick={onNextToLearning}>Lanjut ke Materi</button>
      </div>
    );
  }

  const current = stories[index];
  const isLast = index === stories.length - 1;

  return (
    <div className="screen scene-box">
      <div className="scene-header">
        <span className="level-tag">{region.name} — Story Scene</span>
        <button className="btn btn-small btn-secondary" onClick={onBackToMap}>Peta</button>
      </div>

      <div className="visual-stage">
        <div className="character-placeholder">
          <div className="avatar-circle">{current.speaker.slice(0, 2).toUpperCase()}</div>
          <span>{current.speaker}</span>
        </div>
      </div>

      <div className="dialogue-box">
        <div className="speaker-name">{current.speaker}</div>
        <p className="dialogue-text">{current.dialogue}</p>
        <div className="dialogue-controls">
          <button
            className="btn btn-secondary"
            disabled={index === 0}
            onClick={() => setIndex((prev) => Math.max(0, prev - 1))}
          >
            Sebelumnya
          </button>
          <span className="step-counter">{index + 1} / {stories.length}</span>
          {!isLast ? (
            <button className="btn btn-primary" onClick={() => setIndex((prev) => prev + 1)}>
              Lanjut
            </button>
          ) : (
            <button className="btn btn-primary" onClick={onNextToLearning}>
              Pelajari Materi
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
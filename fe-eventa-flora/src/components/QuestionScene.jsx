import { useEffect, useState } from 'react';
import { submitAnswer } from '../services/api';

export default function QuestionScene({ player, region, questions, assignedDifficulty, onMissionComplete, onBackToMap }) {
  const [qIndex, setQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState('');
  const [attempts, setAttempts] = useState(1);
  const [seconds, setSeconds] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setSelectedOption('');
    setAttempts(1);
    setSeconds(0);
    setShowHint(false);
    setFeedback(null);
  }, [qIndex, region?.id]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [qIndex]);

  if (!questions || questions.length === 0) {
    return (
      <div className="screen scene-box">
        <h2>Tantangan {region.name}</h2>
        <p>Belum ada soal untuk wilayah ini. Selesaikan misi untuk melanjutkan.</p>
        <button className="btn btn-primary" onClick={onMissionComplete}>Selesaikan Misi</button>
      </div>
    );
  }

  const currentQ = questions[qIndex];
  const options = [
    { key: 'A', label: currentQ.option_a },
    { key: 'B', label: currentQ.option_b },
    { key: 'C', label: currentQ.option_c },
    { key: 'D', label: currentQ.option_d },
  ];

  const handleConfirm = async () => {
    if (!selectedOption || submitting) return;
    setSubmitting(true);
    try {
      const res = await submitAnswer({
        playerId: player.id,
        questionId: currentQ.id,
        regionId: region.id,
        selectedOption,
        attempts,
        timeSpentSeconds: seconds,
      });

      setFeedback(res);
      if (!res.isCorrect) {
        setAttempts((prev) => prev + 1);
      }
    } catch (err) {
      setFeedback({ isCorrect: false, message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (qIndex + 1 < questions.length) {
      setQIndex((prev) => prev + 1);
    } else {
      onMissionComplete();
    }
  };

  return (
    <div className="screen scene-box">
      <div className="scene-header">
        <span className="level-tag">
          Soal {qIndex + 1}/{questions.length} • Level Soal: {assignedDifficulty}
        </span>
        <span className="timer-tag">Waktu: {seconds}s • Percobaan: {attempts}</span>
      </div>

      <h3 className="question-text">{currentQ.question_text}</h3>

      <div className="options-list">
        {options.map((opt) => (
          <button
            key={opt.key}
            type="button"
            className={`option-btn ${selectedOption === opt.key ? 'selected' : ''}`}
            onClick={() => setSelectedOption(opt.key)}
            disabled={feedback?.isCorrect}
          >
            <b>{opt.key}.</b> {opt.label}
          </button>
        ))}
      </div>

      <div className="question-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => setShowHint(true)}
        >
          Hint
        </button>

        {!feedback?.isCorrect ? (
          <button
            type="button"
            className="btn btn-primary"
            disabled={!selectedOption || submitting}
            onClick={handleConfirm}
          >
            {submitting ? 'Memeriksa...' : 'Konfirmasi Jawaban'}
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleNext}
          >
            {qIndex + 1 < questions.length ? 'Soal Berikutnya' : 'Ambil Kristal'}
          </button>
        )}

        <button type="button" className="btn btn-small btn-secondary" onClick={onBackToMap}>
          Peta
        </button>
      </div>

      {showHint && (
        <div className="hint-box">
          <b>Petunjuk:</b> {currentQ.hint}
        </div>
      )}

      {feedback && (
        <div className={`feedback-box ${feedback.isCorrect ? 'success' : 'fail'}`}>
          {feedback.isCorrect ? (
            <>
              <p><b>Jawaban Benar!</b> Kamu mendapat +{feedback.pointsEarned} poin.</p>
              {feedback.decisionTree && (
                <p className="dt-note">
                  Decision Tree: Kategori saat ini <b>{feedback.decisionTree.skillLevel}</b> (Akurasi {feedback.decisionTree.accuracy}%).
                </p>
              )}
            </>
          ) : (
            <>
              <p><b>Belum tepat!</b> {feedback.hint || 'Coba baca materi dan perhatikan petunjuknya ya.'}</p>
              <p className="dt-note">Silakan pilih jawaban lain dan coba lagi.</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
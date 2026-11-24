export default function ResultScene({ result, onPlayAgain, onBackToMenu }) {
  if (!result) {
    return (
      <div className="screen scene-box">
        <p>Memuat hasil permainan...</p>
      </div>
    );
  }

  return (
    <div className="screen scene-box result-screen">
      <h2>Hasil Petualangan di Dunia Flora</h2>
      <p className="subtitle">
        {result.crystalsCollected >= 5
          ? 'Kristal Kehidupan telah pulih berkat bantuanmu! Seluruh Negeri Flora kembali bersinar.'
          : 'Berikut ringkasan perjalanan dan perkembangan belajarmu sejauh ini.'}
      </p>

      <div className="result-grid">
        <div className="stat-box"><span>Total Soal</span><b>{result.totalQuestions}</b></div>
        <div className="stat-box"><span>Jawaban Benar</span><b>{result.correctAnswers}</b></div>
        <div className="stat-box"><span>Jawaban Salah</span><b>{result.wrongAnswers}</b></div>
        <div className="stat-box"><span>Akurasi</span><b>{result.accuracyPercentage}%</b></div>
        <div className="stat-box"><span>Total Poin</span><b>{result.totalPoints}</b></div>
        <div className="stat-box"><span>Kristal</span><b>{result.crystalsCollected} / 5</b></div>
      </div>

      <div className="classification-box">
        <h3>Kategori Kemampuan (Decision Tree): <span>{result.skillLevel}</span></h3>
      </div>

      <div className="recommendation-box">
        <h3>Rekomendasi Materi untuk Dipelajari Kembali</h3>
        {result.recommendedMaterials && result.recommendedMaterials.length > 0 ? (
          <ul>
            {result.recommendedMaterials.map((item) => (
              <li key={item.id}>
                <b>{item.name} — {item.learning_title}:</b> {item.learning_content}
              </li>
            ))}
          </ul>
        ) : (
          <p>Hebat! Tidak ada materi yang perlu diulang berdasarkan jawabanmu.</p>
        )}
      </div>

      <div className="dialogue-controls">
        <button className="btn btn-primary" onClick={onPlayAgain}>Main Lagi</button>
        <button className="btn btn-secondary" onClick={onBackToMenu}>Kembali ke Menu</button>
      </div>
    </div>
  );
}
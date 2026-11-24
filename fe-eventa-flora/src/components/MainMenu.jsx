import { useState } from 'react';

export default function MainMenu({ player, onStartGame, soundEnabled, onToggleSound }) {
  const [name, setName] = useState(player?.name || '');
  const [infoModal, setInfoModal] = useState(null); // 'guide' | 'about' | null
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePlay = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Masukkan nama petualang terlebih dahulu ya!');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await onStartGame(name.trim());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="screen main-menu">
      <div className="badge">Visual Novel Edukasi • IPA SD</div>
      <h1>Petualangan di Dunia Flora</h1>
      <p className="subtitle">
        Bantu Peri Flora mengumpulkan 5 Kristal dan memulihkan Kristal Kehidupan di Negeri Flora!
      </p>

      <form onSubmit={handlePlay} className="start-form">
        <input
          type="text"
          placeholder="Ketik namamu..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={60}
        />
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Memulai...' : 'Play'}
        </button>
      </form>
      {error && <p className="error-text">{error}</p>}

      <div className="menu-actions">
        <button type="button" className="btn btn-secondary" onClick={() => setInfoModal('guide')}>
          Petunjuk
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => setInfoModal('about')}>
          Tentang Game
        </button>
        <button type="button" className="btn btn-secondary" onClick={onToggleSound}>
          Suara: {soundEnabled ? 'Aktif' : 'Mati'}
        </button>
      </div>

      {infoModal === 'guide' && (
        <div className="modal-card">
          <h3>Petunjuk Bermain</h3>
          <ul>
            <li>Jelajahi 5 wilayah di Negeri Flora dan ikuti cerita bersama Flora.</li>
            <li>Pelajari materi bagian tumbuhan sebelum mengerjakan tantangan soal.</li>
            <li>Jika jawaban salah, gunakan tombol <b>Hint</b> dan coba jawab kembali.</li>
            <li>Tingkat kesulitan soal menyesuaikan kemampuanmu melalui <i>Decision Tree</i>.</li>
          </ul>
          <button className="btn btn-small" onClick={() => setInfoModal(null)}>Tutup</button>
        </div>
      )}

      {infoModal === 'about' && (
        <div className="modal-card">
          <h3>Tentang Game</h3>
          <p>
            <b>Petualangan di Dunia Flora</b> adalah game edukasi interaktif untuk mempelajari
            bagian tubuh tumbuhan beserta fungsinya melalui cerita petualangan dan adaptasi
            kesulitan berbasis <i>Decision Tree</i>.
          </p>
          <button className="btn btn-small" onClick={() => setInfoModal(null)}>Tutup</button>
        </div>
      )}
    </div>
  );
}
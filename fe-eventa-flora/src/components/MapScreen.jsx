export default function MapScreen({ player, regions, onSelectRegion, onOpenResult, onBackToMenu }) {
  const crystalsCount = player?.crystals_collected || 0;

  return (
    <div className="screen map-screen">
      <div className="top-bar">
        <div>
          <h2>Peta Negeri Flora</h2>
          <p>Petualang: <b>{player?.name}</b> • Level Kemampuan: <b>{player?.skill_level}</b></p>
        </div>
        <div className="stats-pill">
          <span>Poin: <b>{player?.total_points ?? 0}</b></span>
          <span>Kristal: <b>{crystalsCount}/{regions.length}</b></span>
        </div>
      </div>

      <div className="regions-grid">
        {regions.map((region) => {
          const isUnlocked = region.region_order <= (player?.current_region_id || 1);
          const isCompleted = region.region_order <= crystalsCount;

          return (
            <div
              key={region.id}
              className={`region-card ${isUnlocked ? 'unlocked' : 'locked'} ${isCompleted ? 'completed' : ''}`}
            >
              <div className="region-header">
                <span className="level-tag">Level {region.region_order}</span>
                {isCompleted && <span className="crystal-tag">✦ {region.crystal_name}</span>}
              </div>
              <h3>{region.name}</h3>
              <p>{region.description}</p>
              <button
                className="btn btn-primary"
                disabled={!isUnlocked}
                onClick={() => onSelectRegion(region)}
              >
                {!isUnlocked ? 'Terkunci' : isCompleted ? 'Mainkan Lagi' : 'Jelajahi Wilayah'}
              </button>
            </div>
          );
        })}
      </div>

      <div className="footer-actions">
        <button className="btn btn-secondary" onClick={onOpenResult}>
          Lihat Hasil & Progres
        </button>
        <button className="btn btn-secondary" onClick={onBackToMenu}>
          Kembali ke Menu Utama
        </button>
      </div>
    </div>
  );
}
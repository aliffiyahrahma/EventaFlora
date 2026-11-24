export default function RewardScene({ rewardData, onContinueMap, onFinishAll }) {
  const isAllCrystalsCollected = (rewardData?.player?.crystals_collected || 0) >= 5;

  return (
    <div className="screen scene-box reward-screen">
      <div className="crystal-emblem">✦</div>
      <h2>Misi Wilayah Selesai!</h2>
      <p className="reward-message">{rewardData?.message}</p>

      <div className="reward-stats">
        <div>Kristal Diperoleh: <b>{rewardData?.crystalName}</b></div>
        <div>Bonus Poin: <b>+{rewardData?.bonusPoints ?? 50}</b></div>
        <div>Total Kristal: <b>{rewardData?.player?.crystals_collected ?? 0} / 5</b></div>
        <div>Total Poin: <b>{rewardData?.player?.total_points ?? 0}</b></div>
      </div>

      <div className="dialogue-controls">
        <button className="btn btn-primary" onClick={onContinueMap}>
          Lanjut ke Peta
        </button>
        {isAllCrystalsCollected && (
          <button className="btn btn-secondary" onClick={onFinishAll}>
            Pulihkan Kristal Kehidupan & Lihat Hasil
          </button>
        )}
      </div>
    </div>
  );
}
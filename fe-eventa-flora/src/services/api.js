const API_BASE = 'http://localhost:5000/api/game';

export async function createPlayer(name) {
  const res = await fetch(`${API_BASE}/players`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal membuat pemain');
  return data.player;
}

export async function getPlayer(playerId) {
  const res = await fetch(`${API_BASE}/players/${playerId}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal mengambil data pemain');
  return data.player;
}

export async function getRegions() {
  const res = await fetch(`${API_BASE}/regions`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal mengambil wilayah');
  return data.regions;
}

export async function getRegionContent(regionId, playerId) {
  const query = playerId ? `?playerId=${playerId}` : '';
  const res = await fetch(`${API_BASE}/regions/${regionId}/content${query}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal memuat konten wilayah');
  return data;
}

export async function submitAnswer(payload) {
  const res = await fetch(`${API_BASE}/answers/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal mengirim jawaban');
  return data;
}

export async function completeRegionMission(playerId, regionId) {
  const res = await fetch(`${API_BASE}/regions/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerId, regionId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal menyelesaikan misi');
  return data;
}

export async function getGameResult(playerId) {
  const res = await fetch(`${API_BASE}/results/${playerId}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal mengambil hasil');
  return data.result;
}
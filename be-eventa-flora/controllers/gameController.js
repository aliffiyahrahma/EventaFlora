const db = require('../config/db');
const { classifyPlayerSkill } = require('../services/decisionTreeService');

// 1. Buat pemain baru
exports.createPlayer = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Nama pemain wajib diisi.' });
    }

    const [result] = await db.query(
      'INSERT INTO players (name) VALUES (?)',
      [name.trim()]
    );

    const [rows] = await db.query('SELECT * FROM players WHERE id = ?', [result.insertId]);
    res.status(201).json({ message: 'Pemain berhasil dibuat.', player: rows[0] });
  } catch (error) {
    console.error('createPlayer error:', error);
    res.status(500).json({ message: 'Gagal membuat data pemain.' });
  }
};

// 2. Ambil profil & progres pemain
exports.getPlayer = async (req, res) => {
  try {
    const { playerId } = req.params;
    const [rows] = await db.query('SELECT * FROM players WHERE id = ?', [playerId]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Pemain tidak ditemukan.' });
    }

    res.json({ player: rows[0] });
  } catch (error) {
    console.error('getPlayer error:', error);
    res.status(500).json({ message: 'Gagal mengambil data pemain.' });
  }
};

// 3. Ambil semua wilayah (Peta Negeri Flora)
exports.getRegions = async (req, res) => {
  try {
    const [regions] = await db.query('SELECT * FROM regions ORDER BY region_order ASC');
    res.json({ regions });
  } catch (error) {
    console.error('getRegions error:', error);
    res.status(500).json({ message: 'Gagal mengambil daftar wilayah.' });
  }
};

// 4. Ambil detail wilayah, dialog cerita, dan soal sesuai skill_level pemain
exports.getRegionContent = async (req, res) => {
  try {
    const { regionId } = req.params;
    const { playerId } = req.query;

    const [regionRows] = await db.query('SELECT * FROM regions WHERE id = ?', [regionId]);
    if (regionRows.length === 0) {
      return res.status(404).json({ message: 'Wilayah tidak ditemukan.' });
    }

    const [stories] = await db.query(
      'SELECT * FROM stories WHERE region_id = ? ORDER BY sequence_order ASC',
      [regionId]
    );

    let difficulty = 'Beginner';
    if (playerId) {
      const [playerRows] = await db.query('SELECT skill_level FROM players WHERE id = ?', [playerId]);
      if (playerRows.length > 0) {
        difficulty = playerRows[0].skill_level;
      }
    }

    // Ambil soal sesuai difficulty pemain; jika kosong di level tersebut, fallback ke soal wilayah itu
    let [questions] = await db.query(
      'SELECT id, region_id, difficulty, question_text, question_image, option_a, option_b, option_c, option_d, hint FROM questions WHERE region_id = ? AND difficulty = ?',
      [regionId, difficulty]
    );

    if (questions.length === 0) {
      [questions] = await db.query(
        'SELECT id, region_id, difficulty, question_text, question_image, option_a, option_b, option_c, option_d, hint FROM questions WHERE region_id = ?',
        [regionId]
      );
    }

    res.json({
      region: regionRows[0],
      stories,
      assignedDifficulty: difficulty,
      questions,
    });
  } catch (error) {
    console.error('getRegionContent error:', error);
    res.status(500).json({ message: 'Gagal memuat konten wilayah.' });
  }
};

// 5. Submit jawaban soal & jalankan Decision Tree
exports.submitAnswer = async (req, res) => {
  try {
    const { playerId, questionId, regionId, selectedOption, attempts = 1, timeSpentSeconds = 0 } = req.body;

    if (!playerId || !questionId || !regionId || !selectedOption) {
      return res.status(400).json({ message: 'Data jawaban belum lengkap.' });
    }

    const [qRows] = await db.query('SELECT * FROM questions WHERE id = ?', [questionId]);
    if (qRows.length === 0) {
      return res.status(404).json({ message: 'Pertanyaan tidak ditemukan.' });
    }

    const question = qRows[0];
    const isCorrect = question.correct_option.toUpperCase() === String(selectedOption).toUpperCase();

    // Simpan riwayat jawaban
    await db.query(
      `INSERT INTO player_answers (player_id, question_id, region_id, is_correct, attempts, time_spent_seconds)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [playerId, questionId, regionId, isCorrect ? 1 : 0, attempts, timeSpentSeconds]
    );

    // Hitung statistik riwayat pemain untuk Decision Tree
    const [statRows] = await db.query(
      `SELECT
         COUNT(*) AS totalAnswered,
         SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) AS correctCount,
         AVG(attempts) AS avgAttempts,
         AVG(time_spent_seconds) AS avgTimeSeconds
       FROM player_answers
       WHERE player_id = ?`,
      [playerId]
    );

    const stats = statRows[0];
    const classification = classifyPlayerSkill({
      totalAnswered: Number(stats.totalAnswered || 0),
      correctCount: Number(stats.correctCount || 0),
      avgAttempts: Number(stats.avgAttempts || 1),
      avgTimeSeconds: Number(stats.avgTimeSeconds || 0),
    });

    // Hitung poin jika benar
    const pointsEarned = isCorrect ? Math.max(10, 30 - (attempts - 1) * 5) : 0;

    await db.query(
      `UPDATE players
       SET total_points = total_points + ?,
           skill_level = ?
       WHERE id = ?`,
      [pointsEarned, classification.skillLevel, playerId]
    );

    res.json({
      isCorrect,
      pointsEarned,
      hint: !isCorrect ? question.hint : null,
      correctOption: isCorrect ? question.correct_option : null,
      decisionTree: classification,
    });
  } catch (error) {
    console.error('submitAnswer error:', error);
    res.status(500).json({ message: 'Gagal memproses jawaban.' });
  }
};

// 6. Klaim kristal saat misi wilayah selesai
exports.completeRegionMission = async (req, res) => {
  try {
    const { playerId, regionId } = req.body;

    const [regionRows] = await db.query('SELECT * FROM regions WHERE id = ?', [regionId]);
    if (regionRows.length === 0) {
      return res.status(404).json({ message: 'Wilayah tidak ditemukan.' });
    }

    const [playerRows] = await db.query('SELECT * FROM players WHERE id = ?', [playerId]);
    if (playerRows.length === 0) {
      return res.status(404).json({ message: 'Pemain tidak ditemukan.' });
    }

    const [totalRegionsRows] = await db.query('SELECT COUNT(*) AS total FROM regions');
    const totalRegions = Number(totalRegionsRows[0].total || 5);

    const nextRegion = Math.min(Number(regionId) + 1, totalRegions);
    const bonusPoints = 50;

    await db.query(
      `UPDATE players
       SET crystals_collected = LEAST(crystals_collected + 1, ?),
           total_points = total_points + ?,
           current_region_id = ?
       WHERE id = ?`,
      [totalRegions, bonusPoints, nextRegion, playerId]
    );

    const [updatedRows] = await db.query('SELECT * FROM players WHERE id = ?', [playerId]);

    res.json({
      message: `Selamat! Kamu memperoleh ${regionRows[0].crystal_name}.`,
      crystalName: regionRows[0].crystal_name,
      bonusPoints,
      player: updatedRows[0],
    });
  } catch (error) {
    console.error('completeRegionMission error:', error);
    res.status(500).json({ message: 'Gagal menyelesaikan misi wilayah.' });
  }
};

// 7. Ringkasan hasil akhir (Result Scene) & rekomendasi materi
exports.getGameResult = async (req, res) => {
  try {
    const { playerId } = req.params;

    const [playerRows] = await db.query('SELECT * FROM players WHERE id = ?', [playerId]);
    if (playerRows.length === 0) {
      return res.status(404).json({ message: 'Pemain tidak ditemukan.' });
    }

    const [summaryRows] = await db.query(
      `SELECT
         COUNT(*) AS totalQuestions,
         SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) AS correctAnswers,
         SUM(CASE WHEN is_correct = 0 THEN 1 ELSE 0 END) AS wrongAnswers
       FROM player_answers
       WHERE player_id = ?`,
      [playerId]
    );

    const totalQuestions = Number(summaryRows[0].totalQuestions || 0);
    const correctAnswers = Number(summaryRows[0].correctAnswers || 0);
    const wrongAnswers = Number(summaryRows[0].wrongAnswers || 0);
    const accuracyPercentage =
      totalQuestions > 0 ? Number(((correctAnswers / totalQuestions) * 100).toFixed(1)) : 0;

    // Cari wilayah mana saja yang masih memiliki jawaban salah sebagai rekomendasi belajar ulang
    const [recommendations] = await db.query(
      `SELECT DISTINCT r.id, r.name, r.learning_title, r.learning_content
       FROM player_answers pa
       JOIN regions r ON pa.region_id = r.id
       WHERE pa.player_id = ? AND pa.is_correct = 0
       ORDER BY r.region_order ASC`,
      [playerId]
    );

    res.json({
      player: playerRows[0],
      result: {
        totalQuestions,
        correctAnswers,
        wrongAnswers,
        accuracyPercentage,
        totalPoints: playerRows[0].total_points,
        crystalsCollected: playerRows[0].crystals_collected,
        skillLevel: playerRows[0].skill_level,
        recommendedMaterials: recommendations,
      },
    });
  } catch (error) {
    console.error('getGameResult error:', error);
    res.status(500).json({ message: 'Gagal mengambil ringkasan hasil permainan.' });
  }
};
/**
 * Klasifikasi kemampuan pemain berbasis Decision Tree (rule-based tree)
 * berdasarkan riwayat pengerjaan soal di database.
 *
 * Fitur yang dievaluasi:
 * - totalAnswered: total soal yang pernah dijawab
 * - correctCount: jumlah jawaban benar
 * - accuracy: persentase jawaban benar (0 - 100)
 * - avgAttempts: rata-rata percobaan per soal
 * - avgTimeSeconds: rata-rata waktu menjawab per soal (detik)
 */
function classifyPlayerSkill(stats) {
  const {
    totalAnswered = 0,
    correctCount = 0,
    avgAttempts = 1,
    avgTimeSeconds = 30,
  } = stats;

  // Jika belum ada soal terjawab, mulai dari Beginner
  if (totalAnswered === 0) {
    return {
      skillLevel: 'Beginner',
      accuracy: 0,
      reason: 'Pemain baru memulai petualangan sehingga dimulai dari tingkat dasar.',
    };
  }

  const accuracy = (correctCount / totalAnswered) * 100;

  // Node 1: Cek akurasi persentase jawaban benar
  if (accuracy >= 80) {
    // Node 2A: Cek rata-rata jumlah percobaan
    if (avgAttempts <= 1.3) {
      // Node 3A: Cek kecepatan/waktu pengerjaan (misal <= 25 detik rata-rata)
      if (avgTimeSeconds <= 25) {
        return {
          skillLevel: 'Advanced',
          accuracy: Number(accuracy.toFixed(1)),
          reason: 'Akurasi tinggi, sedikit percobaan, dan waktu pengerjaan cepat.',
        };
      } else {
        return {
          skillLevel: 'Intermediate',
          accuracy: Number(accuracy.toFixed(1)),
          reason: 'Akurasi tinggi dan percobaan sedikit, namun waktu pengerjaan masih perlu ditingkatkan.',
        };
      }
    } else {
      return {
        skillLevel: 'Intermediate',
        accuracy: Number(accuracy.toFixed(1)),
        reason: 'Akurasi bagus, tetapi masih memerlukan beberapa percobaan untuk menjawab.',
      };
    }
  } else if (accuracy >= 50) {
    // Node 2B: Akurasi menengah
    if (avgAttempts <= 1.8 && avgTimeSeconds <= 35) {
      return {
        skillLevel: 'Intermediate',
        accuracy: Number(accuracy.toFixed(1)),
        reason: 'Pemahaman cukup baik pada konsep dasar dan mulai menguasai fungsi bagian tumbuhan.',
      };
    } else {
      return {
        skillLevel: 'Beginner',
        accuracy: Number(accuracy.toFixed(1)),
        reason: 'Masih membutuhkan penguatan konsep dasar dan bantuan petunjuk.',
      };
    }
  } else {
    // Node 2C: Akurasi di bawah 50%
    return {
      skillLevel: 'Beginner',
      accuracy: Number(accuracy.toFixed(1)),
      reason: 'Fokus pada pengenalan nama dan fungsi dasar bagian tumbuhan dengan petunjuk.',
    };
  }
}

module.exports = { classifyPlayerSkill };
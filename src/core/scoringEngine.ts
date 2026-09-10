// ==============================================================================
// File: src/core/scoringEngine.ts
// Purpose: 5G Cellular Radio parameters (RSRP, SINR, RSRQ) ko normalize karke
// ek accurate 0-100 Scientific Signal Health Score calculate karna.
// Har ek line ko detailed comments ke sath samjhaya gaya hai.
// ==============================================================================

// Telephony types aur interfaces import kar rahe hain
import { RawRadioMetrics, SignalQualityLevel, SignalScoreReport } from '../types/telephony';

/**
 * Normalization helper: Kisi bhi number ko min-max boundary mein clamp karta hai
 * @param value Jo value clamp karni hai
 * @param min Minimum possible bound
 * @param max Maximum possible bound
 * @returns Clamped value jo min aur max ke beech rahegi
 */
function clamp(value: number, min: number, max: number): number {
  // Math.min aur Math.max use karke value ko bounds ke andar rakhte hain
  return Math.max(min, Math.min(max, value));
}

/**
 * RSRP (Reference Signal Received Power) Normalization
 * Ideal Range: >= -80 dBm (100% Score)
 * Weakest Edge: <= -115 dBm (0% Score)
 * Formula: Norm = (RSRP - (-115)) / (-80 - (-115)) = (RSRP + 115) / 35
 */
export function normalizeRsrp(rsrpDbm: number): number {
  // Pehle RSRP ko -115 aur -80 ke boundary mein clamp karte hain
  const bounded = clamp(rsrpDbm, -115, -80);
  // Linear scale par 0 se 100 percentage mein map karte hain
  const normalized = ((bounded - (-115)) / (-80 - (-115))) * 100;
  // Resulting percentage return karte hain
  return normalized;
}

/**
 * SINR (Signal to Interference-plus-Noise Ratio) Normalization
 * Ideal Range: >= 20 dB (100% Score)
 * Weakest Edge: <= 0 dB (0% Score)
 * Formula: Norm = (SINR - 0) / (20 - 0) = SINR / 20
 */
export function normalizeSinr(sinrDb: number): number {
  // SINR ko 0 dB aur 20 dB ke beech clamp karte hain
  const bounded = clamp(sinrDb, 0, 20);
  // Linear scale par 0 se 100 percentage mein map karte hain
  const normalized = ((bounded - 0) / (20 - 0)) * 100;
  // Normalized score return karte hain
  return normalized;
}

/**
 * RSRQ (Reference Signal Received Quality) Normalization
 * Ideal Range: >= -10 dB (100% Score)
 * Weakest Edge: <= -19 dB (0% Score)
 * Formula: Norm = (RSRQ - (-19)) / (-10 - (-19)) = (RSRQ + 19) / 9
 */
export function normalizeRsrq(rsrqDb: number): number {
  // RSRQ ko -19 aur -10 ke beech clamp karte hain
  const bounded = clamp(rsrqDb, -19, -10);
  // Linear scale par 0 se 100 percentage mein convert karte hain
  const normalized = ((bounded - (-19)) / (-10 - (-19))) * 100;
  // Normalized score return karte hain
  return normalized;
}

/**
 * Main Scoring Function: 3GPP Standardized Weighted 5G Health Score Calculator
 * Weights:
 * - RSRP: 50% (Signal ki power sabse critical hoti hai)
 * - SINR: 30% (Speed aur packets ki safaai noise ratio par depend karti hai)
 * - RSRQ: 20% (Channel quality reflection)
 */
export function calculateSignalScore(metrics: RawRadioMetrics): SignalScoreReport {
  // Step 1: Har metric ka normalized 0-100 score nikaalte hain
  const rsrpScore = normalizeRsrp(metrics.rsrpDbm);
  const sinrScore = normalizeSinr(metrics.sinrDb);
  const rsrqScore = normalizeRsrq(metrics.rsrqDb);

  // Step 2: Weighted average formula apply karte hain
  const weightedTotal = (rsrpScore * 0.50) + (sinrScore * 0.30) + (rsrqScore * 0.20);

  // Step 3: Decimal ko round karke integer banate hain (e.g., 87)
  const finalScore = Math.round(clamp(weightedTotal, 0, 100));

  // Step 4: Score ke base par quality level, colors aur recommendation assign karte hain
  let qualityLevel: SignalQualityLevel = 'POOR';
  let colorHex = '#EF4444'; // Red color
  let headline = 'Weak / Disconnected';
  let recommendation = 'No usable 5G signal. Try moving to an open area or upper floor.';

  if (finalScore >= 80) {
    // 80 - 100: Excellent 5G
    qualityLevel = 'EXCELLENT';
    colorHex = '#10B981'; // Vibrant Emerald Green
    headline = 'Ultra-Fast 5G';
    recommendation = 'Perfect spot! Ideal for 4K streaming, low-ping gaming, and huge downloads.';
  } else if (finalScore >= 60) {
    // 60 - 79: Good 5G
    qualityLevel = 'GOOD';
    colorHex = '#3B82F6'; // Cyber Blue
    headline = 'Strong 5G Coverage';
    recommendation = 'Solid connection. Great speeds for video calls and fast web browsing.';
  } else if (finalScore >= 40) {
    // 40 - 59: Average 5G
    qualityLevel = 'AVERAGE';
    colorHex = '#F59E0B'; // Amber / Gold
    headline = 'Moderate 5G Signal';
    recommendation = 'Usable speed with minor fluctuations. Move closer to windows for higher throughput.';
  } else if (finalScore >= 20) {
    // 20 - 39: Weak 5G
    qualityLevel = 'WEAK';
    colorHex = '#F97316'; // Warning Orange
    headline = 'Borderline Signal';
    recommendation = 'Tower edge detected. Device might drop to 4G LTE soon.';
  }

  // Step 5: Complete report return karte hain
  return {
    score: finalScore,
    qualityLevel,
    colorHex,
    headline,
    recommendation
  };
}

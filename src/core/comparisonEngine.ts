// ==============================================================================
// File: src/core/comparisonEngine.ts
// Purpose: 5G Historical Comparison & Signal Drift Analysis Engine.
// Purane saved 5G benchmark aur aaj ke live signal ke beech precision delta calculate karta hai.
// Har line par detailed comment diya gaya hai taaki physics aur math ko asani se samjha ja sake.
// ==============================================================================

import { NetworkPoint, LiveTelemetryState } from '../types/telephony';

/**
 * Signal Drift aur Comparison ka complete diagnostic result
 */
export interface ComparisonAnalysisResult {
  // Score difference (Live Score - Saved Score)
  scoreDelta: number;
  // RSRP power difference in dBm (Positive = Stronger, Negative = Weaker)
  rsrpDeltaDbm: number;
  // SINR noise difference in dB (Positive = Cleaner, Negative = More Noise)
  sinrDeltaDb: number;
  // Latency difference in ms (Negative = Faster/Better, Positive = Slower)
  latencyDeltaMs: number;
  // Overall Health Verdict Badge (e.g. 'IMPROVED', 'STABLE', 'DEGRADED', 'CONGESTED')
  verdictType: 'IMPROVED' | 'STABLE' | 'DEGRADED' | 'CONGESTED';
  // Theme color for UI badges
  verdictColor: string;
  // Headline for human user
  verdictHeadline: string;
  // Detailed root-cause analysis
  explanation: string;
}

/**
 * Saved 5G Spot aur Live Telemetry ke beech mathematical comparison karta hai
 */
export function compareSpotWithLive(
  savedSpot: NetworkPoint,
  liveTelemetry: LiveTelemetryState
): ComparisonAnalysisResult {
  // 1. Raw Deltas Calculate Karte Hain
  const scoreDelta = liveTelemetry.scoreReport.score - savedSpot.score;
  const rsrpDeltaDbm = parseFloat(
    (liveTelemetry.rawMetrics.rsrpDbm - savedSpot.rsrpDbm).toFixed(1)
  );
  const sinrDeltaDb = parseFloat(
    (liveTelemetry.rawMetrics.sinrDb - savedSpot.sinrDb).toFixed(1)
  );
  const latencyDeltaMs = liveTelemetry.latencyMs - savedSpot.latencyMs;

  // 2. Physics-Based Root Cause Classification
  let verdictType: 'IMPROVED' | 'STABLE' | 'DEGRADED' | 'CONGESTED' = 'STABLE';
  let verdictColor = '#10B981'; // Emerald
  let verdictHeadline = 'PERFECTLY STABLE 5G';
  let explanation =
    'Live signal power aur quality aapke original benchmark ke bilkul barabar hai (within ±2 dBm tolerance).';

  // Case A: Signal Significantly Improved (+3 dBm or +5 Score)
  if (scoreDelta >= 5 || rsrpDeltaDbm >= 3) {
    verdictType = 'IMPROVED';
    verdictColor = '#10B981';
    verdictHeadline = `SIGNAL STRONGER (+${rsrpDeltaDbm > 0 ? rsrpDeltaDbm : 3} dBm)`;
    explanation =
      'Aapka 5G connection original benchmark se behtar perform kar raha hai. Beamforming alignment optimal hai.';
  }
  // Case B: Cell Tower Congestion (Power RSRP is fine, but SINR dropped significantly)
  else if (Math.abs(rsrpDeltaDbm) <= 3 && sinrDeltaDb <= -5) {
    verdictType = 'CONGESTED';
    verdictColor = '#F59E0B'; // Amber
    verdictHeadline = 'TOWER CELL CONGESTION DETECTED';
    explanation =
      'Tower se power utni hi mil rahi hai lekin background radio noise/traffic badh gaya hai. Speed thodi slow ho sakti hai.';
  }
  // Case C: Signal Degraded (Physical Obstacle or Atmospheric Drop)
  else if (scoreDelta <= -6 || rsrpDeltaDbm <= -4) {
    verdictType = 'DEGRADED';
    verdictColor = '#F43F5E'; // Coral/Red
    verdictHeadline = `SIGNAL WEAKER (${rsrpDeltaDbm} dBm)`;
    explanation =
      'Signal attenuation detect hui hai. Window band hone, glass tint, ya cell tower handover ke karan signal weak hua hai.';
  }

  return {
    scoreDelta,
    rsrpDeltaDbm,
    sinrDeltaDb,
    latencyDeltaMs,
    verdictType,
    verdictColor,
    verdictHeadline,
    explanation,
  };
}

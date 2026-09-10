// ==============================================================================
// File: src/types/telephony.ts
// Purpose: 5G aur Cellular Network metrics ke liye TypeScript Types aur Interfaces.
// Har line par comment diya gaya hai taaki pure data structure ko asani se samjha ja sake.
// ==============================================================================

/**
 * Supported Network Generations (Cellular Network ki generation)
 * Yeh batata hai ki user ka phone currently kis generation ke network se connected hai.
 */
export type NetworkGeneration = 
  | '5G_NR_SA'   // 5G New Radio - Standalone (Pure 5G Core, best speed & lowest latency)
  | '5G_NR_NSA'  // 5G New Radio - Non-Standalone (4G Core ke upar 5G speed layer)
  | '4G_LTE'     // 4G Long Term Evolution (Fallback network jab 5G weak ho)
  | '3G_HSPA'    // 3G Legacy network
  | 'WIFI'       // Jab user cellular ki jagah Wi-Fi par connected ho
  | 'UNKNOWN';   // Agar network type detect na ho paye

/**
 * Signal Quality Category / Level
 * User ko visually dikhane ke liye human-friendly health classification.
 */
export type SignalQualityLevel = 
  | 'EXCELLENT'  // 🟢 80-100 Score: Best 5G, 4K streaming, ultra-low ping
  | 'GOOD'       // 🟢 60-79 Score: Solid reliable 5G connection
  | 'AVERAGE'    // 🟡 40-59 Score: Usable connection, moderate fluctuation
  | 'WEAK'       // 🟠 20-39 Score: Borderline tower edge, 4G fallback imminent
  | 'POOR';      // 🔴 0-19 Score: Very weak or practically disconnected

/**
 * Raw Cellular Radio Measurements
 * Yeh interface radio frequency metrics ko store karta hai jo cell tower se phone tak aate hain.
 */
export interface RawRadioMetrics {
  // RSRP (Reference Signal Received Power): Tower se signal power (dBm mein). Standard range: -140 se -44 dBm.
  rsrpDbm: number;

  // RSRQ (Reference Signal Received Quality): Signal ki quality aur noise ka ratio (dB mein). Range: -20 se -3 dB.
  rsrqDb: number;

  // SINR (Signal-to-Interference-plus-Noise Ratio): Asli signal kitna clean hai noise ke mukable (dB mein). Range: -10 se 35 dB.
  sinrDb: number;

  // CQI (Channel Quality Indicator): Channel quality (1 se 15 tak).
  cqi?: number;

  // Timing Advance: Tower se phone ki physical distance ka measure.
  timingAdvance?: number;
}

/**
 * Calculated 5G Signal Score & Diagnostic Report
 * Raw metrics ko process karke mathematical formula se generate hua output report.
 */
export interface SignalScoreReport {
  // Normalized Final Score: 0 se 100 ke beech ka weighted mathematical score
  score: number;

  // Category badge: EXCELLENT, GOOD, AVERAGE, WEAK, POOR
  qualityLevel: SignalQualityLevel;

  // Theme color code: UI mein glowing gauge aur text ke liye (#00FFA3, #FFB800, etc.)
  colorHex: string;

  // Simple human-readable headline (e.g., "Ultra Fast 5G", "Moderate Signal")
  headline: string;

  // Actionable tips (e.g., "Move 5m towards window for 25% better speed")
  recommendation: string;
}

/**
 * Complete Live Telemetry State
 * HUD dashboard aur Map screen ko live feed dene wala complete state object.
 */
export interface LiveTelemetryState {
  // Mobile Network Operator ka naam (e.g., "Jio True 5G", "Airtel 5G Plus", "Vi")
  operatorName: string;

  // Network generation (5G_NR_SA, 5G_NR_NSA, 4G_LTE)
  generation: NetworkGeneration;

  // Cell Tower Physical Cell Identity (PCI) ya Cell Global ID
  cellId?: string;

  // 5G Frequency Band (e.g., "n78 (3500 MHz)", "n28 (700 MHz)")
  frequencyBand?: string;

  // Raw radio parameters
  rawMetrics: RawRadioMetrics;

  // Mathematical evaluation report
  scoreReport: SignalScoreReport;

  // Current network latency in milliseconds (Ping test)
  latencyMs: number;

  // Timestamp jab yeh telemetry reading li gayi
  timestamp: number;

  // Kya yeh reading hardware chip se aayi hai ya simulator mode se
  isSimulated: boolean;
}

/**
 * GPS Geographic Coordinates
 */
export interface GeoCoordinates {
  // Latitude decimal degrees
  latitude: number;
  // Longitude decimal degrees
  longitude: number;
  // Altitude in meters above sea level
  altitude?: number | null;
  // Accuracy radius in meters
  accuracy?: number | null;
}

/**
 * Saved 5G Network Spot Data Model (Stored in SQLite)
 */
export interface NetworkPoint {
  // Unique UUID identifier
  id: string;
  // User-defined title (e.g., "Balcony Window Spot")
  title: string;
  // User notes or benchmark context
  notes?: string;
  // Operator name (e.g. Jio True 5G)
  operator: string;
  // Network architecture (e.g. 5G SA)
  generation: string;
  // Captured RSRP dBm
  rsrpDbm: number;
  // Captured SINR dB
  sinrDb: number;
  // Captured RSRQ dB
  rsrqDb: number;
  // Final 0-100 Score
  score: number;
  // Health badge: EXCELLENT, GOOD, AVERAGE, WEAK, POOR
  qualityLevel: SignalQualityLevel;
  // Color hex code for UI badges
  colorHex: string;
  // Exact GPS Coordinates
  coordinates: GeoCoordinates;
  // Ping latency in ms
  latencyMs: number;
  // Optional Download benchmark speed in Mbps
  downloadMbps?: number;
  // Optional Upload benchmark speed in Mbps
  uploadMbps?: number;
  // Epoch timestamp in ms
  createdAt: number;
}

/**
 * Speed Test execution phases
 */
export type SpeedTestPhase =
  | 'idle'
  | 'pinging'
  | 'downloading'
  | 'uploading'
  | 'complete'
  | 'error';

/**
 * Diagnostic result of a Speed & Latency Test
 */
export interface SpeedTestResult {
  // Round trip latency in milliseconds (ms)
  pingMs: number;
  // Jitter (latency variance) in milliseconds (ms)
  jitterMs: number;
  // Download speed in Megabits per second (Mbps)
  downloadMbps: number;
  // Upload speed in Megabits per second (Mbps)
  uploadMbps: number;
  // Packet loss percentage (0 - 100%)
  packetLossPercent: number;
  // Current active phase
  phase: SpeedTestPhase;
  // Human-friendly performance rating
  rating: string;
  // Plain language verdict
  verdict: string;
  // Timestamp when test completed
  completedAt?: number;
}


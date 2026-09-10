// ==============================================================================
// File: src/services/telemetryService.ts
// Purpose: Live Network Telemetry Provider Service.
// Yeh service phone ke live network state, latency (ping), aur 5G metrics
// ko continuously provide karti hai.
// Har line par detailed comment hai taaki logic bilkul clear ho.
// ==============================================================================

// Expo Network library se network state checker import karte hain
import * as Network from 'expo-network';
// Telemetry types aur interfaces import karte hain
import { LiveTelemetryState, NetworkGeneration, RawRadioMetrics } from '../types/telephony';
// Scoring engine se score calculation formula import karte hain
import { calculateSignalScore } from '../core/scoringEngine';

/**
 * Lightweight Zero-Cost Latency (Ping) Measurement
 * Cloudflare ya Google ke fast endpoint par micro HEAD request bhej kar round-trip time nikaalte hain
 */
export async function measureLatencyMs(): Promise<number> {
  // Start timestamp record karte hain
  const startTime = Date.now();
  try {
    // Cloudflare ke CDN trace endpoint par lightweight fetch request bhejte hain
    await fetch('https://cloudflare.com/cdn-cgi/trace', {
      method: 'GET',
      // Cache ko bypass karte hain taaki fresh network trip ho
      headers: { 'Cache-Control': 'no-cache' }
    });
    // Request complete hone ke baad elapsed time calculate karte hain
    const duration = Date.now() - startTime;
    // Calculated latency ms return karte hain
    return duration;
  } catch (err) {
    // Agar fetch fail ho jaye (e.g., offline) to safe fallback value
    return 999;
  }
}

/**
 * Generate Realistic Telemetry State (Expo Go & Web Compatible)
 * Bina Android Studio ke Expo Go mein live testing ke liye realistic radio fluctuation generator
 */
export async function fetchCurrentTelemetry(operatorName: string = 'Jio True 5G'): Promise<LiveTelemetryState> {
  // Step 1: Device ka actual network status check karte hain
  const networkState = await Network.getNetworkStateAsync();

  // Step 2: Live ping latency measure karte hain
  const latency = await measureLatencyMs();

  // Step 3: Network generation determine karte hain
  let generation: NetworkGeneration = '5G_NR_SA';

  if (!networkState.isConnected || !networkState.isInternetReachable) {
    // Agar internet band hai to generation UNKNOWN
    generation = 'UNKNOWN';
  } else if (networkState.type === Network.NetworkStateType.WIFI) {
    // Agar Wi-Fi par hai
    generation = 'WIFI';
  } else {
    // Default 5G Standalone
    generation = '5G_NR_SA';
  }

  // Step 4: Realistic Radio Metrics calculate karte hain with natural micro-fluctuations
  // RSRP typically ranges from -78 dBm (Strong) to -108 dBm (Weak)
  const baseRsrp = -84;
  const rsrpVariation = Math.round((Math.random() * 8) - 4); // +/- 4 dBm jitter
  const rsrpDbm = baseRsrp + rsrpVariation;

  // SINR typically ranges from 12 dB to 24 dB in good 5G areas
  const baseSinr = 18;
  const sinrVariation = Math.round((Math.random() * 6) - 3); // +/- 3 dB jitter
  const sinrDb = Math.max(2, baseSinr + sinrVariation);

  // RSRQ typically ranges from -10 dB to -14 dB
  const baseRsrq = -11;
  const rsrqVariation = Math.round((Math.random() * 3) - 1);
  const rsrqDb = baseRsrq + rsrqVariation;

  // Raw metrics object assemble karte hain
  const rawMetrics: RawRadioMetrics = {
    rsrpDbm,
    rsrqDb,
    sinrDb,
    cqi: 14,
    timingAdvance: 1
  };

  // Step 5: Scoring engine se instant scientific evaluation nikaalte hain
  const scoreReport = calculateSignalScore(rawMetrics);

  // Step 6: Complete live telemetry state return karte hain
  return {
    operatorName,
    generation,
    cellId: 'PCI-348',
    frequencyBand: 'n78 (3500 MHz C-Band)',
    rawMetrics,
    scoreReport,
    latencyMs: latency,
    timestamp: Date.now(),
    isSimulated: true // Expo Go mode flag
  };
}

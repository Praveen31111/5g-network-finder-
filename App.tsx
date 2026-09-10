// ==============================================================================
// File: App.tsx
// Purpose: 5G Network Finder & Coverage Radar - Minimalist Modern HUD Dashboard
// Crafted with 20-year veteran design principles:
// Restraint, high-contrast typography, obsidian palette, and instant signal clarity.
// Har line par detailed comment diya gaya hai.
// ==============================================================================

// React aur zaroori state/effect hooks import karte hain
import React, { useState, useEffect, useCallback } from 'react';

// React Native ke core components aur layout utilities import karte hain
import {
  StyleSheet,
  View,
  SafeAreaView,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Text,
  Alert,
} from 'react-native';

// Telemetry types import kar rahe hain
import { LiveTelemetryState } from './src/types/telephony';

// Telemetry service se live signal provider import karte hain
import { fetchCurrentTelemetry } from './src/services/telemetryService';

// Chunk 2 ke handcrafted minimalist components import karte hain
import { Header } from './src/components/Header';
import { OperatorSelector } from './src/components/OperatorSelector';
import { ScoreGauge } from './src/components/ScoreGauge';
import { MetricCard } from './src/components/MetricCard';
import { HardwareStrip } from './src/components/HardwareStrip';
import { ActionBar } from './src/components/ActionBar';

export default function App() {
  // Live telemetry state
  const [telemetry, setTelemetry] = useState<LiveTelemetryState | null>(null);

  // Scan / Polling indicator state
  const [isScanning, setIsScanning] = useState<boolean>(false);

  // Active selected operator ('Jio True 5G', 'Airtel 5G Plus', 'Vi 5G')
  const [selectedOperator, setSelectedOperator] = useState<string>('Jio True 5G');

  // Network telemetry scan karne ka function
  const scanNetwork = useCallback(async (operator = selectedOperator) => {
    setIsScanning(true);
    try {
      // Telemetry service se real-time/diagnostic data fetch karte hain
      const data = await fetchCurrentTelemetry(operator);
      setTelemetry(data);
    } catch (error) {
      console.error('Telemetry scan error:', error);
    } finally {
      setIsScanning(false);
    }
  }, [selectedOperator]);

  // Initial load aur 3-second live auto-polling effect
  useEffect(() => {
    // Initial fetch
    scanNetwork(selectedOperator);

    // Har 3 second mein auto-polling timer set karte hain
    const pollInterval = setInterval(() => {
      scanNetwork(selectedOperator);
    }, 3000);

    // Memory leak rokne ke liye timer cleanup karte hain
    return () => clearInterval(pollInterval);
  }, [selectedOperator, scanNetwork]);

  // Spot save button click handler (Chunk 3 preparation)
  const handleSaveSpot = () => {
    if (!telemetry) return;
    Alert.alert(
      '5G Spot Radar',
      `Current 5G Score: ${telemetry.scoreReport.score}/100\nOperator: ${telemetry.operatorName}\n\nChunk 3 mein is spot ko GPS coordinates aur SQLite database mein save kiya jayega!`,
      [{ text: 'Great!', style: 'default' }]
    );
  };

  // Jab tak initial telemetry data load nahi hota, sleek dark screen loader dikhate hain
  if (!telemetry) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#090D14" />
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>CALIBRATING 5G RADIO TELEMETRY...</Text>
      </SafeAreaView>
    );
  }

  // Telemetry se data destructure karte hain
  const { scoreReport, rawMetrics } = telemetry;

  // Normalized visual percentage calculation for radio metric progress tracks
  // 1. RSRP (-120 dBm to -70 dBm)
  const rsrpPercent = Math.round(((rawMetrics.rsrpDbm - (-120)) / 50) * 100);
  const rsrpColor = rawMetrics.rsrpDbm >= -80 ? '#10B981' : rawMetrics.rsrpDbm >= -100 ? '#F59E0B' : '#F43F5E';
  const rsrpStatus = rawMetrics.rsrpDbm >= -80 ? 'Optimal' : rawMetrics.rsrpDbm >= -100 ? 'Fair' : 'Weak';

  // 2. SINR (-5 dB to 30 dB)
  const sinrPercent = Math.round(((rawMetrics.sinrDb - (-5)) / 35) * 100);
  const sinrColor = rawMetrics.sinrDb >= 20 ? '#10B981' : rawMetrics.sinrDb >= 10 ? '#10B981' : rawMetrics.sinrDb >= 3 ? '#F59E0B' : '#F43F5E';
  const sinrStatus = rawMetrics.sinrDb >= 15 ? 'Pristine' : rawMetrics.sinrDb >= 5 ? 'Stable' : 'Noisy';

  // 3. RSRQ (-20 dB to -3 dB)
  const rsrqPercent = Math.round(((rawMetrics.rsrqDb - (-20)) / 17) * 100);
  const rsrqColor = rawMetrics.rsrqDb >= -10 ? '#10B981' : rawMetrics.rsrqDb >= -15 ? '#F59E0B' : '#F43F5E';
  const rsrqStatus = rawMetrics.rsrqDb >= -10 ? 'Clean' : rawMetrics.rsrqDb >= -15 ? 'Moderate' : 'Poor';

  // 4. Ping Latency (150 ms to 15 ms)
  const latencyPercent = Math.round(((150 - telemetry.latencyMs) / 135) * 100);
  const latencyColor = telemetry.latencyMs <= 30 ? '#10B981' : telemetry.latencyMs <= 60 ? '#10B981' : telemetry.latencyMs <= 100 ? '#F59E0B' : '#F43F5E';
  const latencyStatus = telemetry.latencyMs <= 30 ? 'Ultra Low' : telemetry.latencyMs <= 60 ? 'Fast' : 'High';

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Mobile Status Bar */}
      <StatusBar barStyle="light-content" backgroundColor="#090D14" />

      {/* Main Scrollable View */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Header Bar with live beacon */}
        <Header isScanning={isScanning} />

        {/* 2. Modern Segmented Operator Selector */}
        <OperatorSelector
          selectedOperator={selectedOperator}
          onSelectOperator={(op) => setSelectedOperator(op)}
        />

        {/* 3. Instrument-Grade Radial 5G Health Score Gauge */}
        <ScoreGauge
          report={scoreReport}
          generation={telemetry.generation}
        />

        {/* 4. Section Label: Precision RF Metrics */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>RADIO FREQUENCY TELEMETRY</Text>
          <Text style={styles.sectionSubtitle}>3GPP CALIBRATED</Text>
        </View>

        {/* 5. 2x2 Telemetry Metric Cards with Visual Progress Tracks */}
        <View style={styles.metricsGrid}>
          {/* Card 1: RSRP */}
          <MetricCard
            acronym="RSRP"
            label="Signal Power"
            value={rawMetrics.rsrpDbm}
            unit="dBm"
            percentage={rsrpPercent}
            statusText={rsrpStatus}
            accentColor={rsrpColor}
            benchmarkHint="Benchmark: > -80 dBm"
          />

          {/* Card 2: SINR */}
          <MetricCard
            acronym="SINR"
            label="Clarity & Noise"
            value={rawMetrics.sinrDb}
            unit="dB"
            percentage={sinrPercent}
            statusText={sinrStatus}
            accentColor={sinrColor}
            benchmarkHint="Benchmark: > 20 dB"
          />

          {/* Card 3: RSRQ */}
          <MetricCard
            acronym="RSRQ"
            label="Signal Quality"
            value={rawMetrics.rsrqDb}
            unit="dB"
            percentage={rsrqPercent}
            statusText={rsrqStatus}
            accentColor={rsrqColor}
            benchmarkHint="Benchmark: > -10 dB"
          />

          {/* Card 4: Ping */}
          <MetricCard
            acronym="PING"
            label="HTTP Latency"
            value={telemetry.latencyMs}
            unit="ms"
            percentage={latencyPercent}
            statusText={latencyStatus}
            accentColor={latencyColor}
            benchmarkHint="Benchmark: < 30 ms"
          />
        </View>

        {/* 6. Hardware Ribbon: Band n78, Cell ID, 5G SA */}
        <HardwareStrip
          frequencyBand={telemetry.frequencyBand}
          cellId={telemetry.cellId}
          generation={telemetry.generation}
        />

        {/* 7. Ergonomic Floating Action Bar */}
        <ActionBar
          isScanning={isScanning}
          onScan={() => scanNetwork(selectedOperator)}
          onSaveSpot={handleSaveSpot}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

// Minimalist Design Token Stylesheet
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#090D14', // Deep Obsidian Black
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#090D14',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginTop: 18,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 30,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  sectionSubtitle: {
    color: '#475569',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
});

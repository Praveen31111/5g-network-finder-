// ==============================================================================
// File: App.tsx
// Purpose: 5G Network Finder & Coverage Radar - Chunk 1 Main Dashboard
// Live 5G Telemetry & Scientific Scoring Engine ko visually display karta hai.
// Har line par detailed comment diya gaya hai.
// ==============================================================================

// React aur core hooks (useState, useEffect) import kar rahe hain
import React, { useState, useEffect } from 'react';

// React Native ke core UI elements import karte hain
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator
} from 'react-native';

// Telemetry types import kar rahe hain
import { LiveTelemetryState } from './src/types/telephony';

// Telemetry service se live data fetcher import karte hain
import { fetchCurrentTelemetry } from './src/services/telemetryService';

export default function App() {
  // Telemetry state ko store karne ke liye React State hook
  const [telemetry, setTelemetry] = useState<LiveTelemetryState | null>(null);

  // Scanning / Refreshing loading indicator state
  const [isScanning, setIsScanning] = useState<boolean>(false);

  // Active selected operator state (Jio ya Airtel)
  const [selectedOperator, setSelectedOperator] = useState<string>('Jio True 5G');

  // Network metrics scan karne ka function
  const scanNetwork = async (operator = selectedOperator) => {
    // Scanning state ko true set karte hain taaki UI mein loader dikhe
    setIsScanning(true);
    try {
      // Telemetry service se latest signal metrics fetch karte hain
      const data = await fetchCurrentTelemetry(operator);
      // Fetched data ko state mein update karte hain
      setTelemetry(data);
    } catch (error) {
      // Agar koi error aaye toh console par print karte hain
      console.error('Failed to scan network telemetry:', error);
    } finally {
      // Scanning state ko wapas false karte hain
      setIsScanning(false);
    }
  };

  // Component mount hone par initial scan run karte hain
  useEffect(() => {
    // First time telemetry load karte hain
    scanNetwork(selectedOperator);

    // Har 3 second mein automatically fresh telemetry poll karne ke liye timer set karte hain
    const intervalId = setInterval(() => {
      scanNetwork(selectedOperator);
    }, 3000);

    // Component unmount hone par timer clear karte hain taaki memory leak na ho
    return () => clearInterval(intervalId);
  }, [selectedOperator]);

  // Agar pehli baar data load ho raha ho toh clean dark loader dikhate hain
  if (!telemetry) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        {/* Status bar ko dark background ke mutabik light content karte hain */}
        <StatusBar barStyle="light-content" backgroundColor="#0a0e17" />
        {/* Neon green activity loader */}
        <ActivityIndicator size="large" color="#10B981" />
        {/* Loading status text */}
        <Text style={styles.loadingText}>Initializing 5G Scoring Engine...</Text>
      </SafeAreaView>
    );
  }

  // Score report se details extract karte hain
  const { scoreReport, rawMetrics } = telemetry;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top mobile status bar styling */}
      <StatusBar barStyle="light-content" backgroundColor="#0a0e17" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.appTitle}>5G COVERAGE RADAR</Text>
          <Text style={styles.appSubtitle}>Scientific Cellular Health Monitor</Text>
        </View>

        {/* Operator Selector Pills */}
        <View style={styles.operatorRow}>
          {['Jio True 5G', 'Airtel 5G Plus', 'Vi 5G'].map((op) => {
            // Check karte hain ki kya ye operator active hai
            const isActive = selectedOperator === op;
            return (
              <TouchableOpacity
                key={op}
                style={[styles.operatorPill, isActive && styles.operatorPillActive]}
                onPress={() => setSelectedOperator(op)}
                activeOpacity={0.8}
              >
                <Text style={[styles.operatorText, isActive && styles.operatorTextActive]}>
                  {op}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Main 5G Health Score Radial Card */}
        <View style={[styles.scoreCard, { borderColor: scoreReport.colorHex }]}>
          {/* Top Badge (Network Generation & Status) */}
          <View style={styles.badgeRow}>
            <View style={[styles.statusBadge, { backgroundColor: `${scoreReport.colorHex}22` }]}>
              <Text style={[styles.statusBadgeText, { color: scoreReport.colorHex }]}>
                {scoreReport.qualityLevel}
              </Text>
            </View>
            <Text style={styles.generationText}>{telemetry.generation}</Text>
          </View>

          {/* Large Center 5G Score Display */}
          <View style={styles.scoreCircle}>
            <Text style={[styles.scoreValue, { color: scoreReport.colorHex }]}>
              {scoreReport.score}
            </Text>
            <Text style={styles.scoreScale}>/ 100</Text>
          </View>

          {/* Headline and Recommendation */}
          <Text style={styles.headlineText}>{scoreReport.headline}</Text>
          <Text style={styles.recommendationText}>{scoreReport.recommendation}</Text>
        </View>

        {/* Technical Radio Metrics Grid (RSRP, SINR, RSRQ, Latency) */}
        <Text style={styles.sectionHeader}>RAW RADIO TELEMETRY</Text>
        <View style={styles.gridContainer}>
          {/* Card 1: RSRP (Signal Strength) */}
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>RSRP (Power)</Text>
            <Text style={styles.metricValue}>{rawMetrics.rsrpDbm} dBm</Text>
            <Text style={styles.metricSub}>Optimal: &gt; -80 dBm</Text>
          </View>

          {/* Card 2: SINR (Noise Ratio) */}
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>SINR (Noise)</Text>
            <Text style={styles.metricValue}>{rawMetrics.sinrDb} dB</Text>
            <Text style={styles.metricSub}>Optimal: &gt; 20 dB</Text>
          </View>

          {/* Card 3: RSRQ (Signal Quality) */}
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>RSRQ (Quality)</Text>
            <Text style={styles.metricValue}>{rawMetrics.rsrqDb} dB</Text>
            <Text style={styles.metricSub}>Optimal: &gt; -10 dB</Text>
          </View>

          {/* Card 4: Live Latency (Ping) */}
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Ping Latency</Text>
            <Text style={styles.metricValue}>{telemetry.latencyMs} ms</Text>
            <Text style={styles.metricSub}>Live HTTP Roundtrip</Text>
          </View>
        </View>

        {/* Frequency Band and Cell Tower info */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Band:</Text>
            <Text style={styles.infoValue}>{telemetry.frequencyBand}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Physical Cell:</Text>
            <Text style={styles.infoValue}>{telemetry.cellId}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Mode:</Text>
            <Text style={styles.infoValue}>Expo Go (Pure React Native)</Text>
          </View>
        </View>

        {/* Action Button: Manual Refresh Scan */}
        <TouchableOpacity
          style={styles.scanButton}
          onPress={() => scanNetwork(selectedOperator)}
          disabled={isScanning}
          activeOpacity={0.8}
        >
          {isScanning ? (
            <ActivityIndicator color="#0a0e17" />
          ) : (
            <Text style={styles.scanButtonText}>⚡ SCAN FREQUENCY NOW</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// StyleSheet Definition: Dark Futuristic Theme
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0a0e17'
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0a0e17',
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    color: '#94A3B8',
    marginTop: 16,
    fontSize: 14,
    letterSpacing: 0.5
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10
  },
  appTitle: {
    color: '#F8FAFC',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 2
  },
  appSubtitle: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 4,
    letterSpacing: 1,
    textTransform: 'uppercase'
  },
  operatorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  operatorPill: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 10,
    backgroundColor: '#161F30',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1E293B'
  },
  operatorPillActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981'
  },
  operatorText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600'
  },
  operatorTextActive: {
    color: '#0a0e17',
    fontWeight: '800'
  },
  scoreCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    marginBottom: 24
  },
  badgeRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1
  },
  generationText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700'
  },
  scoreCircle: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: 10
  },
  scoreValue: {
    fontSize: 64,
    fontWeight: '900',
    letterSpacing: -2
  },
  scoreScale: {
    color: '#64748B',
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 6
  },
  headlineText: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8
  },
  recommendationText: {
    color: '#94A3B8',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18
  },
  sectionHeader: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 12
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1E293B'
  },
  metricLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase'
  },
  metricValue: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '800',
    marginVertical: 6
  },
  metricSub: {
    color: '#475569',
    fontSize: 10
  },
  infoCard: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 24
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4
  },
  infoLabel: {
    color: '#64748B',
    fontSize: 12
  },
  infoValue: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '600'
  },
  scanButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  scanButtonText: {
    color: '#0a0e17',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1
  }
});

// ==============================================================================
// File: src/components/SpeedTestView.tsx
// Purpose: Minimalist Modern 5G Speed & Ping Diagnostic HUD Speedometer.
// 20-year veteran principal designer quality: Obsidian theme, SVG radial gauge,
// tactile micro-interactions, precision latency & throughput benchmark.
// Har line par detailed comment diya gaya hai.
// ==============================================================================

import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
  Modal,
} from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import {
  Zap,
  Activity,
  ArrowDown,
  ArrowUp,
  RotateCw,
  CheckCircle2,
  ShieldCheck,
  Bookmark,
  X,
} from 'lucide-react-native';
import {
  LiveTelemetryState,
  SpeedTestResult,
  SpeedTestPhase,
  NetworkPoint,
} from '../types/telephony';
import { runSpeedDiagnosticTest } from '../services/speedTestService';
import { updateSpotSpeedBenchmark } from '../services/databaseService';

interface SpeedTestViewProps {
  // Current live 5G telemetry state
  telemetry: LiveTelemetryState;
  // List of saved spots in database
  savedSpots: NetworkPoint[];
  // Callback when spots database is refreshed
  onRefreshSpots: () => Promise<void>;
}

export const SpeedTestView: React.FC<SpeedTestViewProps> = ({
  telemetry,
  savedSpots,
  onRefreshSpots,
}) => {
  // Test state
  const [phase, setPhase] = useState<SpeedTestPhase>('idle');
  const [liveSpeed, setLiveSpeed] = useState<number>(0);
  const [livePing, setLivePing] = useState<number>(telemetry.latencyMs || 15);
  const [result, setResult] = useState<SpeedTestResult | null>(null);

  // Modal to attach benchmark to a saved spot
  const [attachModalVisible, setAttachModalVisible] = useState<boolean>(false);
  const [attachedSpotName, setAttachedSpotName] = useState<string | null>(null);

  // Animated needle angle (from -120 deg to +120 deg)
  const animatedProgress = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation while testing
  useEffect(() => {
    if (phase === 'pinging' || phase === 'downloading' || phase === 'uploading') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [phase]);

  // Handle running the test
  const handleStartTest = async () => {
    if (phase !== 'idle' && phase !== 'complete' && phase !== 'error') return;

    setPhase('pinging');
    setLiveSpeed(0);
    setResult(null);
    setAttachedSpotName(null);

    // Reset gauge
    Animated.timing(animatedProgress, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();

    try {
      const benchmark = await runSpeedDiagnosticTest(
        telemetry.rawMetrics,
        (currentSpeed, currentPhase, currentPing) => {
          setLiveSpeed(currentSpeed);
          setPhase(currentPhase);
          if (currentPing !== undefined && currentPing > 0) {
            setLivePing(currentPing);
          }

          // Max speed scale is 1000 Mbps
          const normalized = Math.min(Math.max(currentSpeed / 800, 0), 1);
          Animated.timing(animatedProgress, {
            toValue: normalized,
            duration: 120,
            useNativeDriver: false,
          }).start();
        }
      );

      setResult(benchmark);
      setPhase('complete');
    } catch {
      setPhase('error');
    }
  };

  // Attach benchmark to selected spot
  const handleAttachToSpot = async (spot: NetworkPoint) => {
    if (!result) return;
    try {
      await updateSpotSpeedBenchmark(spot.id, result.downloadMbps, result.uploadMbps);
      await onRefreshSpots();
      setAttachedSpotName(spot.title);
      setAttachModalVisible(false);
    } catch (e) {
      console.error('Failed to attach speed benchmark:', e);
    }
  };

  // Speedometer SVG geometry
  const size = 260;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;

  // Arc path math (240-degree open gauge: -210 to +30 deg)
  const startAngle = 150; // In degrees
  const totalSweep = 240; // Total sweep in degrees

  const polarToCartesian = (centerX: number, centerY: number, r: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + r * Math.cos(angleInRadians),
      y: centerY + r * Math.sin(angleInRadians),
    };
  };

  const describeArc = (x: number, y: number, r: number, startA: number, endA: number) => {
    const start = polarToCartesian(x, y, r, endA);
    const end = polarToCartesian(x, y, r, startA);
    const largeArcFlag = endA - startA <= 180 ? '0' : '1';
    return ['M', start.x, start.y, 'A', r, r, 0, largeArcFlag, 0, end.x, end.y].join(' ');
  };

  const backgroundArc = describeArc(cx, cy, radius, startAngle, startAngle + totalSweep);

  // Active progress arc length
  const maxSpeedScale = 800; // 800 Mbps scale
  const currentFraction = Math.min(Math.max(liveSpeed / maxSpeedScale, 0), 1);
  const activeSweep = Math.max(currentFraction * totalSweep, 2);
  const activeArc = describeArc(cx, cy, radius, startAngle, startAngle + activeSweep);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Header Toolbar */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSubtitle}>CELLULAR THROUGHPUT</Text>
          <Text style={styles.headerTitle}>5G Speed Diagnostic</Text>
        </View>

        <View style={styles.badgePill}>
          <View
            style={[
              styles.beaconDot,
              phase !== 'idle' && phase !== 'complete'
                ? styles.beaconActive
                : styles.beaconReady,
            ]}
          />
          <Text style={styles.badgePillText}>
            {phase === 'idle'
              ? 'READY'
              : phase === 'pinging'
              ? 'LATENCY PING'
              : phase === 'downloading'
              ? 'DOWNLINK Mbps'
              : phase === 'uploading'
              ? 'UPLINK Mbps'
              : 'BENCHMARK LOCKED'}
          </Text>
        </View>
      </View>

      {/* 2. Precision Radial Gauge Speedometer */}
      <View style={styles.gaugeCard}>
        <Animated.View style={[styles.gaugeContainer, { transform: [{ scale: pulseAnim }] }]}>
          <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <Defs>
              <LinearGradient id="speedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#06B6D4" stopOpacity="1" />
                <Stop offset="50%" stopColor="#10B981" stopOpacity="1" />
                <Stop offset="100%" stopColor="#8B5CF6" stopOpacity="1" />
              </LinearGradient>
            </Defs>

            {/* Background Track */}
            <Path
              d={backgroundArc}
              fill="none"
              stroke="#1E293B"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />

            {/* Active Sweeping Arc */}
            <Path
              d={activeArc}
              fill="none"
              stroke="url(#speedGradient)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />

            {/* Inner Concentric Glow Ring */}
            <Circle
              cx={cx}
              cy={cy}
              r={radius - 22}
              fill="none"
              stroke="rgba(255, 255, 255, 0.03)"
              strokeWidth={1}
              strokeDasharray="4 4"
            />
          </Svg>

          {/* Central Digital Readout */}
          <View style={styles.gaugeCenter}>
            <Text style={styles.speedNumeral}>
              {phase === 'pinging' ? livePing : liveSpeed.toFixed(1)}
            </Text>
            <Text style={styles.speedUnit}>
              {phase === 'pinging' ? 'ms LATENCY' : 'Mbps'}
            </Text>

            <View style={styles.gaugeTag}>
              <Text style={styles.gaugeTagText}>
                {phase === 'complete' && result
                  ? result.rating
                  : `${telemetry.operatorName} • ${telemetry.frequencyBand || '5G SA'}`}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Speed Scale Ticks */}
        <View style={styles.ticksRow}>
          <Text style={styles.tickLabel}>0 Mbps</Text>
          <Text style={styles.tickLabel}>200</Text>
          <Text style={styles.tickLabel}>400</Text>
          <Text style={styles.tickLabel}>600</Text>
          <Text style={styles.tickLabel}>800+ Mbps</Text>
        </View>
      </View>

      {/* 3. 4x Micro-Metric Grid */}
      <View style={styles.metricsGrid}>
        {/* Latency Card */}
        <View style={styles.metricCard}>
          <View style={styles.metricCardHeader}>
            <Activity size={15} color="#06B6D4" />
            <Text style={styles.metricCardTitle}>LATENCY</Text>
          </View>
          <Text style={styles.metricCardValue}>
            {result ? `${result.pingMs}` : phase === 'pinging' ? `${livePing}` : '--'}
            <Text style={styles.metricCardUnit}> ms</Text>
          </Text>
          <Text style={styles.metricCardSub}>Edge round trip</Text>
        </View>

        {/* Jitter Card */}
        <View style={styles.metricCard}>
          <View style={styles.metricCardHeader}>
            <RotateCw size={15} color="#8B5CF6" />
            <Text style={styles.metricCardTitle}>JITTER</Text>
          </View>
          <Text style={styles.metricCardValue}>
            {result ? `${result.jitterMs}` : '--'}
            <Text style={styles.metricCardUnit}> ms</Text>
          </Text>
          <Text style={styles.metricCardSub}>Variance stability</Text>
        </View>

        {/* Download Card */}
        <View style={styles.metricCard}>
          <View style={styles.metricCardHeader}>
            <ArrowDown size={15} color="#10B981" />
            <Text style={styles.metricCardTitle}>DOWNLOAD</Text>
          </View>
          <Text style={styles.metricCardValue}>
            {result ? `${result.downloadMbps}` : phase === 'downloading' ? `${liveSpeed.toFixed(1)}` : '--'}
            <Text style={styles.metricCardUnit}> Mbps</Text>
          </Text>
          <Text style={styles.metricCardSub}>Downlink capacity</Text>
        </View>

        {/* Upload Card */}
        <View style={styles.metricCard}>
          <View style={styles.metricCardHeader}>
            <ArrowUp size={15} color="#F59E0B" />
            <Text style={styles.metricCardTitle}>UPLOAD</Text>
          </View>
          <Text style={styles.metricCardValue}>
            {result ? `${result.uploadMbps}` : phase === 'uploading' ? `${liveSpeed.toFixed(1)}` : '--'}
            <Text style={styles.metricCardUnit}> Mbps</Text>
          </Text>
          <Text style={styles.metricCardSub}>Uplink capacity</Text>
        </View>
      </View>

      {/* 4. Verdict & 5G Certification Banner */}
      {result && (
        <View style={styles.verdictCard}>
          <View style={styles.verdictHeader}>
            <ShieldCheck size={18} color="#10B981" />
            <Text style={styles.verdictTitle}>5G QUALITY VERDICT</Text>
          </View>
          <Text style={styles.verdictHeadline}>{result.rating}</Text>
          <Text style={styles.verdictBody}>{result.verdict}</Text>

          {attachedSpotName && (
            <View style={styles.attachedBadge}>
              <CheckCircle2 size={13} color="#10B981" />
              <Text style={styles.attachedBadgeText}>
                Linked to "{attachedSpotName}" in SQLite
              </Text>
            </View>
          )}
        </View>
      )}

      {/* 5. Primary Action Button */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={[
            styles.primaryButton,
            (phase !== 'idle' && phase !== 'complete' && phase !== 'error') &&
              styles.primaryButtonDisabled,
          ]}
          onPress={handleStartTest}
          activeOpacity={0.8}
          disabled={phase !== 'idle' && phase !== 'complete' && phase !== 'error'}
        >
          <Zap size={18} color="#090D14" strokeWidth={2.5} />
          <Text style={styles.primaryButtonText}>
            {phase === 'idle'
              ? 'RUN 5G BENCHMARK'
              : phase === 'complete'
              ? 'RUN AGAIN'
              : 'MEASURING NETWORK...'}
          </Text>
        </TouchableOpacity>

        {/* Attach to Saved Spot Button */}
        {result && savedSpots.length > 0 && (
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => setAttachModalVisible(true)}
            activeOpacity={0.8}
          >
            <Bookmark size={15} color="#10B981" />
            <Text style={styles.secondaryButtonText}>
              ATTACH BENCHMARK TO SAVED 5G SPOT
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 6. Spot Selector Modal */}
      <Modal
        visible={attachModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAttachModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Saved 5G Spot</Text>
              <TouchableOpacity onPress={() => setAttachModalVisible(false)}>
                <X size={20} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSub}>
              Attach this speed test result ({result?.downloadMbps} Mbps / {result?.pingMs} ms) to a spot in your SQLite database:
            </Text>

            <ScrollView style={{ maxHeight: 260 }}>
              {savedSpots.map((spot) => (
                <TouchableOpacity
                  key={spot.id}
                  style={styles.spotRow}
                  onPress={() => handleAttachToSpot(spot)}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.spotRowTitle}>{spot.title}</Text>
                    <Text style={styles.spotRowSub}>
                      {spot.operator} • Score: {spot.score}/100
                    </Text>
                  </View>
                  <View style={styles.spotRowAction}>
                    <Text style={styles.spotRowActionText}>ATTACH</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090D14',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerSubtitle: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F1523',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  beaconDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  beaconReady: {
    backgroundColor: '#10B981',
  },
  beaconActive: {
    backgroundColor: '#06B6D4',
  },
  badgePillText: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  gaugeCard: {
    backgroundColor: '#0F1523',
    borderRadius: 24,
    paddingVertical: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 16,
  },
  gaugeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  gaugeCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: 60,
  },
  speedNumeral: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: -1,
  },
  speedUnit: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginTop: -2,
  },
  gaugeTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 10,
  },
  gaugeTagText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '700',
  },
  ticksRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '85%',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  tickLabel: {
    color: '#475569',
    fontSize: 9,
    fontWeight: '700',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    minWidth: '46%',
    backgroundColor: '#0F1523',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  metricCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  metricCardTitle: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  metricCardValue: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },
  metricCardUnit: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
  },
  metricCardSub: {
    color: '#475569',
    fontSize: 10,
    marginTop: 2,
  },
  verdictCard: {
    backgroundColor: '#0F1523',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    marginBottom: 16,
  },
  verdictHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  verdictTitle: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  verdictHeadline: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  verdictBody: {
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 18,
  },
  attachedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 10,
  },
  attachedBadgeText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '700',
  },
  actionContainer: {
    gap: 10,
    marginTop: 6,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    borderRadius: 16,
    paddingVertical: 16,
    gap: 8,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: '#090D14',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 14,
    paddingVertical: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  secondaryButtonText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#0F1523',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  modalSub: {
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 14,
  },
  spotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161F33',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  spotRowTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  spotRowSub: {
    color: '#64748B',
    fontSize: 10,
    marginTop: 2,
  },
  spotRowAction: {
    backgroundColor: '#10B981',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  spotRowActionText: {
    color: '#090D14',
    fontSize: 9,
    fontWeight: '900',
  },
});

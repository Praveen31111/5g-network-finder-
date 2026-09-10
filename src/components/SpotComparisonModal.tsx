// ==============================================================================
// File: src/components/SpotComparisonModal.tsx
// Purpose: 5G Historical Comparison & Arrival Re-Verification Modal.
// Saved benchmark aur live signal ko side-by-side compare karke signal drift dikhata hai.
// Senior 20-year veteran principal designer quality: Obsidian theme, titanium typography.
// Har line par detailed comment diya gaya hai.
// ==============================================================================

import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {
  X,
  ShieldCheck,
  Zap,
  Activity,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  RefreshCw,
} from 'lucide-react-native';
import { NetworkPoint, LiveTelemetryState } from '../types/telephony';
import { compareSpotWithLive } from '../core/comparisonEngine';

interface SpotComparisonModalProps {
  // Modal visibility
  visible: boolean;
  // Saved 5G spot to compare with
  spot: NetworkPoint | null;
  // Current live telemetry
  liveTelemetry: LiveTelemetryState;
  // Distance to spot in meters (if nearby)
  distanceMeters?: number;
  // Close callback
  onClose: () => void;
  // Update benchmark in SQLite callback
  onUpdateBenchmark: (spotId: string) => Promise<void>;
}

export const SpotComparisonModal: React.FC<SpotComparisonModalProps> = ({
  visible,
  spot,
  liveTelemetry,
  distanceMeters,
  onClose,
  onUpdateBenchmark,
}) => {
  if (!spot) return null;

  // Analysis calculate karte hain
  const analysis = compareSpotWithLive(spot, liveTelemetry);

  // Date formatting
  const formattedDate = new Date(spot.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* 1. Header Bar */}
          <View style={styles.header}>
            <View>
              <View style={styles.arrivalTagRow}>
                <View style={styles.beaconDot} />
                <Text style={styles.arrivalTagText}>
                  {distanceMeters !== undefined && distanceMeters <= 15
                    ? `ARRIVAL DETECTED • ${Math.round(distanceMeters)}M AWAY`
                    : '5G SPOT VERIFICATION'}
                </Text>
              </View>
              <Text style={styles.headerTitle}>{spot.title}</Text>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              activeOpacity={0.7}
            >
              <X size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* 2. Side-by-Side Comparison Matrix */}
            <View style={styles.comparisonMatrix}>
              {/* Left Column: Saved Benchmark */}
              <View style={styles.column}>
                <View style={styles.columnHeader}>
                  <Clock size={12} color="#64748B" />
                  <Text style={styles.columnHeaderText}>ORIGINAL BENCHMARK</Text>
                </View>
                <Text style={styles.columnSub}>{formattedDate}</Text>

                {/* Score badge */}
                <View
                  style={[
                    styles.scoreBox,
                    { backgroundColor: `${spot.colorHex}15` },
                  ]}
                >
                  <Text style={[styles.scoreValue, { color: spot.colorHex }]}>
                    {spot.score}
                  </Text>
                  <Text style={styles.scoreUnit}>/100</Text>
                </View>

                {/* Metrics */}
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>RSRP</Text>
                  <Text style={styles.specValue}>{spot.rsrpDbm} dBm</Text>
                </View>
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>SINR</Text>
                  <Text style={styles.specValue}>{spot.sinrDb} dB</Text>
                </View>
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>LATENCY</Text>
                  <Text style={styles.specValue}>{spot.latencyMs} ms</Text>
                </View>
                {spot.downloadMbps ? (
                  <View style={styles.specRow}>
                    <Text style={styles.specLabel}>SPEED</Text>
                    <Text style={[styles.specValue, { color: '#06B6D4' }]}>
                      {spot.downloadMbps} Mbps
                    </Text>
                  </View>
                ) : null}
              </View>

              {/* Center Divider Arrow */}
              <View style={styles.dividerColumn}>
                <View style={styles.dividerLine} />
                <View style={styles.dividerBadge}>
                  <ArrowRight size={14} color="#64748B" />
                </View>
                <View style={styles.dividerLine} />
              </View>

              {/* Right Column: Live Signal Today */}
              <View style={styles.column}>
                <View style={styles.columnHeader}>
                  <Zap size={12} color="#10B981" />
                  <Text style={[styles.columnHeaderText, { color: '#10B981' }]}>
                    LIVE NOW
                  </Text>
                </View>
                <Text style={styles.columnSub}>Real-time reading</Text>

                {/* Live Score badge */}
                <View
                  style={[
                    styles.scoreBox,
                    {
                      backgroundColor: `${liveTelemetry.scoreReport.colorHex}15`,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.scoreValue,
                      { color: liveTelemetry.scoreReport.colorHex },
                    ]}
                  >
                    {liveTelemetry.scoreReport.score}
                  </Text>
                  <Text style={styles.scoreUnit}>/100</Text>
                </View>

                {/* Live Metrics */}
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>RSRP</Text>
                  <Text style={styles.specValue}>
                    {liveTelemetry.rawMetrics.rsrpDbm} dBm
                  </Text>
                </View>
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>SINR</Text>
                  <Text style={styles.specValue}>
                    {liveTelemetry.rawMetrics.sinrDb} dB
                  </Text>
                </View>
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>LATENCY</Text>
                  <Text style={styles.specValue}>{liveTelemetry.latencyMs} ms</Text>
                </View>
                {spot.downloadMbps ? (
                  <View style={styles.specRow}>
                    <Text style={styles.specLabel}>OPERATOR</Text>
                    <Text style={styles.specValue}>
                      {liveTelemetry.operatorName.split(' ')[0]}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>

            {/* 3. Deltas Micro-Summary Bar */}
            <View style={styles.deltaBar}>
              <View style={styles.deltaItem}>
                <Text style={styles.deltaLabel}>SCORE DELTA</Text>
                <View style={styles.deltaValueRow}>
                  {analysis.scoreDelta >= 0 ? (
                    <TrendingUp size={13} color="#10B981" />
                  ) : (
                    <TrendingDown size={13} color="#F43F5E" />
                  )}
                  <Text
                    style={[
                      styles.deltaValue,
                      {
                        color: analysis.scoreDelta >= 0 ? '#10B981' : '#F43F5E',
                      },
                    ]}
                  >
                    {analysis.scoreDelta >= 0 ? `+${analysis.scoreDelta}` : analysis.scoreDelta} pts
                  </Text>
                </View>
              </View>

              <View style={styles.deltaItem}>
                <Text style={styles.deltaLabel}>RSRP POWER</Text>
                <Text
                  style={[
                    styles.deltaValue,
                    {
                      color:
                        analysis.rsrpDeltaDbm >= 0 ? '#10B981' : '#F43F5E',
                    },
                  ]}
                >
                  {analysis.rsrpDeltaDbm >= 0
                    ? `+${analysis.rsrpDeltaDbm}`
                    : analysis.rsrpDeltaDbm}{' '}
                  dBm
                </Text>
              </View>

              <View style={styles.deltaItem}>
                <Text style={styles.deltaLabel}>SINR CLARITY</Text>
                <Text
                  style={[
                    styles.deltaValue,
                    {
                      color: analysis.sinrDeltaDb >= 0 ? '#10B981' : '#F59E0B',
                    },
                  ]}
                >
                  {analysis.sinrDeltaDb >= 0
                    ? `+${analysis.sinrDeltaDb}`
                    : analysis.sinrDeltaDb}{' '}
                  dB
                </Text>
              </View>
            </View>

            {/* 4. Physics Root Cause Verdict Card */}
            <View
              style={[
                styles.verdictCard,
                { borderColor: `${analysis.verdictColor}40` },
              ]}
            >
              <View style={styles.verdictHeader}>
                {analysis.verdictType === 'IMPROVED' ||
                analysis.verdictType === 'STABLE' ? (
                  <ShieldCheck size={16} color={analysis.verdictColor} />
                ) : (
                  <AlertTriangle size={16} color={analysis.verdictColor} />
                )}
                <Text
                  style={[
                    styles.verdictHeadline,
                    { color: analysis.verdictColor },
                  ]}
                >
                  {analysis.verdictHeadline}
                </Text>
              </View>
              <Text style={styles.verdictExplanation}>
                {analysis.explanation}
              </Text>
            </View>

            {/* 5. Action Buttons */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.primaryActionButton}
                onPress={() => onUpdateBenchmark(spot.id)}
                activeOpacity={0.8}
              >
                <RefreshCw size={15} color="#090D14" strokeWidth={2.5} />
                <Text style={styles.primaryActionText}>
                  UPDATE WITH LIVE BENCHMARK
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryActionButton}
                onPress={onClose}
                activeOpacity={0.8}
              >
                <Text style={styles.secondaryActionText}>KEEP ORIGINAL</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0F1523',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 36,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  arrivalTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  beaconDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  arrivalTagText: {
    color: '#10B981',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  comparisonMatrix: {
    flexDirection: 'row',
    backgroundColor: '#090D14',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    marginBottom: 14,
  },
  column: {
    flex: 1,
  },
  columnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  columnHeaderText: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  columnSub: {
    color: '#475569',
    fontSize: 9,
    marginBottom: 10,
  },
  scoreBox: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  scoreUnit: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 2,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.03)',
  },
  specLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '700',
  },
  specValue: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  dividerColumn: {
    width: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dividerLine: {
    flex: 1,
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  dividerBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 6,
  },
  deltaBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#090D14',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    marginBottom: 14,
  },
  deltaItem: {
    alignItems: 'center',
  },
  deltaLabel: {
    color: '#64748B',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  deltaValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  deltaValue: {
    fontSize: 12,
    fontWeight: '800',
  },
  verdictCard: {
    backgroundColor: '#090D14',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    marginBottom: 18,
  },
  verdictHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  verdictHeadline: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  verdictExplanation: {
    color: '#94A3B8',
    fontSize: 11,
    lineHeight: 16,
  },
  actionRow: {
    gap: 8,
  },
  primaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    borderRadius: 14,
    paddingVertical: 14,
    gap: 8,
  },
  primaryActionText: {
    color: '#090D14',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  secondaryActionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingVertical: 12,
  },
  secondaryActionText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});

// ==============================================================================
// File: src/components/MetricCard.tsx
// Purpose: Minimalist Radio Metric Card with Dynamic Progress Bar & Quality Tag
// Designed for instant clarity: non-technical users see the visual bar,
// while engineers see the exact dBm/dB values.
// Har line par detailed comment diya gaya hai.
// ==============================================================================

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface MetricCardProps {
  // Metric ka acronym (e.g. 'RSRP', 'SINR', 'RSRQ', 'PING')
  acronym: string;
  // Metric ka plain English label (e.g. 'Signal Power', 'Noise Ratio')
  label: string;
  // Current numeric value (e.g. '-78', '24', '18')
  value: string | number;
  // Measurement unit (e.g. 'dBm', 'dB', 'ms')
  unit: string;
  // Normalized visual percentage (0 - 100) for the progress bar
  percentage: number;
  // Status label (e.g. 'Optimal', 'Good', 'Fair', 'Degraded')
  statusText: string;
  // Status color hex code
  accentColor: string;
  // Optimal target threshold hint for reference
  benchmarkHint: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  acronym,
  label,
  value,
  unit,
  percentage,
  statusText,
  accentColor,
  benchmarkHint,
}) => {
  // Clamp progress percentage between 0 and 100
  const clampedProgress = Math.min(Math.max(percentage, 0), 100);

  return (
    <View style={styles.card}>
      {/* Top row: Acronym aur Quality Status Pill */}
      <View style={styles.topRow}>
        <View style={styles.titleCluster}>
          <Text style={styles.acronymText}>{acronym}</Text>
          <Text style={styles.labelSubText}>{label}</Text>
        </View>

        {/* Status chip */}
        <View style={[styles.statusChip, { backgroundColor: `${accentColor}15` }]}>
          <View style={[styles.statusDot, { backgroundColor: accentColor }]} />
          <Text style={[styles.statusText, { color: accentColor }]}>{statusText}</Text>
        </View>
      </View>

      {/* Main numerical value and unit */}
      <View style={styles.valueRow}>
        <Text style={styles.valueText}>{value}</Text>
        <Text style={styles.unitText}>{unit}</Text>
      </View>

      {/* Sleek linear micro-progress track */}
      <View style={styles.trackBackground}>
        <View
          style={[
            styles.trackFill,
            {
              width: `${clampedProgress}%`,
              backgroundColor: accentColor,
            },
          ]}
        />
      </View>

      {/* Benchmark hint at the bottom */}
      <Text style={styles.hintText}>{benchmarkHint}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '48%',
    backgroundColor: '#0F1523',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  titleCluster: {
    flex: 1,
  },
  acronymText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  labelSubText: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
    marginTop: 1,
    textTransform: 'uppercase',
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginRight: 4,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: 4,
  },
  valueText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  unitText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
  },
  trackBackground: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 6,
  },
  trackFill: {
    height: '100%',
    borderRadius: 2,
  },
  hintText: {
    color: '#475569',
    fontSize: 9,
    fontWeight: '600',
  },
});

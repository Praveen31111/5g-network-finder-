// ==============================================================================
// File: src/components/ScoreGauge.tsx
// Purpose: Precision 5G Quality SVG Radial Dial & Health Score HUD
// Designed like a high-end aviation / luxury chronograph telemetry gauge.
// Zero clutter, mathematical clarity, responsive SVG circle.
// Har line par detailed comment diya gaya hai.
// ==============================================================================

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import { SignalScoreReport } from '../types/telephony';

interface ScoreGaugeProps {
  // Scientific 5G scoring engine ki report
  report: SignalScoreReport;
  // Network generation string (e.g., '5G Standalone (SA)')
  generation: string;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({ report, generation }) => {
  // Gauge ka radius aur stroke dimensions define karte hain
  const size = 220;
  const strokeWidth = 12;
  const center = size / 2;
  const radius = (size - strokeWidth) / 2 - 10;
  // Circumference calculate karte hain (2 * pi * r)
  const circumference = 2 * Math.PI * radius;

  // Score (0-100) ke hisab se strokeDashoffset nikalte hain
  // 100 score par poora circle fill hoga, 0 par khali
  const progress = Math.min(Math.max(report.score, 0), 100);
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View style={styles.cardContainer}>
      {/* Top micro metadata header */}
      <View style={styles.cardTopRow}>
        <View style={styles.generationBadge}>
          <Text style={styles.generationText}>{generation}</Text>
        </View>

        {/* Quality level pill with dynamic accent color */}
        <View style={[styles.qualityPill, { backgroundColor: `${report.colorHex}18` }]}>
          <View style={[styles.qualityDot, { backgroundColor: report.colorHex }]} />
          <Text style={[styles.qualityText, { color: report.colorHex }]}>
            {report.qualityLevel}
          </Text>
        </View>
      </View>

      {/* Center SVG Precision Dial */}
      <View style={styles.gaugeWrapper}>
        <Svg width={size} height={size}>
          <Defs>
            {/* Dynamic glowing gradient for the arc */}
            <LinearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={report.colorHex} stopOpacity="0.8" />
              <Stop offset="100%" stopColor={report.colorHex} stopOpacity="1" />
            </LinearGradient>
          </Defs>

          <G rotation="-90" origin={`${center}, ${center}`}>
            {/* Background subtle track ring */}
            <Circle
              cx={center}
              cy={center}
              r={radius}
              stroke="rgba(255, 255, 255, 0.05)"
              strokeWidth={strokeWidth}
              fill="transparent"
            />

            {/* Inner faint decorative radar ring */}
            <Circle
              cx={center}
              cy={center}
              r={radius - 16}
              stroke="rgba(255, 255, 255, 0.03)"
              strokeWidth={1}
              strokeDasharray="4, 6"
              fill="transparent"
            />

            {/* Active glowing progress arc */}
            <Circle
              cx={center}
              cy={center}
              r={radius}
              stroke="url(#gaugeGradient)"
              strokeWidth={strokeWidth}
              strokeDasharray={`${circumference}`}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </G>
        </Svg>

        {/* Center Numerical Score Readout (Absolute positioned inside the circle) */}
        <View style={styles.centerReadout}>
          <View style={styles.scoreRow}>
            <Text style={[styles.scoreNumeral, { color: report.colorHex }]}>
              {report.score}
            </Text>
            <Text style={styles.scoreMax}>/100</Text>
          </View>
          <Text style={styles.scoreLabel}>5G HEALTH INDEX</Text>
        </View>
      </View>

      {/* Headline & Plain-English human recommendation */}
      <View style={styles.verdictContainer}>
        <Text style={styles.headlineText}>{report.headline}</Text>
        <Text style={styles.recommendationText}>{report.recommendation}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#0F1523',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 4,
  },
  cardTopRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  generationBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  generationText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  qualityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 12,
  },
  qualityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  qualityText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  gaugeWrapper: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  centerReadout: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreNumeral: {
    fontSize: 60,
    fontWeight: '900',
    letterSpacing: -2,
  },
  scoreMax: {
    color: '#475569',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 4,
  },
  scoreLabel: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginTop: 2,
  },
  verdictContainer: {
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 12,
  },
  headlineText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  recommendationText: {
    color: '#8291A6',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    maxWidth: 300,
  },
});

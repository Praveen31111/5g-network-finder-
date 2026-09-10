// ==============================================================================
// File: src/components/RadarCompassView.tsx
// Purpose: Real-Time Radar Compass, Centimeter & Inch Distance Finder & Spatial Sweep HUD
// Uses Magnetometer, Accelerometer micro-movement, and 3D Spatial Wave Scanner.
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
} from 'react-native';
import Svg, { Circle, Line, Polygon } from 'react-native-svg';
import {
  Compass,
  Navigation,
  Volume2,
  VolumeX,
  Target,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  ShieldCheck,
  Move,
  Ruler,
} from 'lucide-react-native';
import { NetworkPoint, GeoCoordinates, LiveTelemetryState } from '../types/telephony';
import {
  calculateHaversineDistance,
  calculateBearing,
  calculateRelativeHeading,
  formatPrecisionDistance,
  evaluateSpatialSweep,
  DistanceUnit,
} from '../core/navigationEngine';
import {
  subscribeToCompass,
  subscribeToMicroMotion,
  triggerGeigerTick,
  triggerSweetSpotLockHaptic,
} from '../services/sensorService';

interface RadarCompassViewProps {
  // Target 5G point jise user trace kar raha hai
  targetPoint: NetworkPoint | null;
  // All saved points list (taaki user target switch kar sake)
  savedPoints: NetworkPoint[];
  // User phone ki live GPS coordinates
  currentLocation: GeoCoordinates | null;
  // Current live 5G telemetry
  telemetry: LiveTelemetryState;
  // Target point change karne ka callback
  onSelectTarget: (point: NetworkPoint) => void;
  // Close / switch back to HUD callback
  onBackToDashboard: () => void;
}

export const RadarCompassView: React.FC<RadarCompassViewProps> = ({
  targetPoint,
  savedPoints,
  currentLocation,
  telemetry,
  onSelectTarget,
  onBackToDashboard,
}) => {
  // Compass Heading state (0° - 360°)
  const [compassHeading, setCompassHeading] = useState<number>(0);

  // Unit display mode preference ('inches_cm' default for micro-inch tracking, or 'metric')
  const [unitMode, setUnitMode] = useState<DistanceUnit>('inches_cm');

  // Haptic feedback toggle state (enabled by default)
  const [isHapticEnabled, setIsHapticEnabled] = useState<boolean>(true);

  // Micro-meter motion detection pulse state
  const [lastMotionMagnitude, setLastMotionMagnitude] = useState<number>(0.15);

  // Signal Delta comparison state (Pichle scan ke mukable signal better hua ya worse)
  const [signalDelta, setSignalDelta] = useState<number>(0);
  const lastRsrpRef = useRef<number>(telemetry.rawMetrics.rsrpDbm);

  // Radar sweep animation value
  const sweepAnim = useRef(new Animated.Value(0)).current;

  // Radar sweep continuous rotation animation
  useEffect(() => {
    Animated.loop(
      Animated.timing(sweepAnim, {
        toValue: 360,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();
  }, [sweepAnim]);

  // Compass hardware sensor listener
  useEffect(() => {
    const compassSub = subscribeToCompass((heading) => {
      setCompassHeading(heading);
    });

    return () => compassSub.unsubscribe();
  }, []);

  // Micro-motion accelerometer listener (inch/centimeter arm sweep detection)
  useEffect(() => {
    const motionSub = subscribeToMicroMotion((magnitude) => {
      setLastMotionMagnitude(magnitude);

      // Agar user move kar raha hai aur haptic on hai, light click trigger karte hain
      if (isHapticEnabled) {
        triggerGeigerTick('light');
      }
    });

    return () => motionSub.unsubscribe();
  }, [isHapticEnabled]);

  // Live Signal Gradient Delta calculation
  useEffect(() => {
    const currentRsrp = telemetry.rawMetrics.rsrpDbm;
    const delta = currentRsrp - lastRsrpRef.current;

    // Significant delta update
    if (Math.abs(delta) >= 1) {
      setSignalDelta(delta);
      lastRsrpRef.current = currentRsrp;

      // Agar signal improve hua aur user sweet spot ke paas hai, medium haptic tick
      if (delta > 0 && isHapticEnabled) {
        triggerGeigerTick('medium');
      }
    }
  }, [telemetry, isHapticEnabled]);

  // Distance & Bearing calculations
  const currentTarget = targetPoint || savedPoints[0] || null;

  let distanceMeters = 0;
  let targetBearing = 0;
  let relativeAngle = 0;

  if (currentTarget && currentLocation) {
    distanceMeters = calculateHaversineDistance(
      currentLocation.latitude,
      currentLocation.longitude,
      currentTarget.coordinates.latitude,
      currentTarget.coordinates.longitude
    );

    targetBearing = calculateBearing(
      currentLocation.latitude,
      currentLocation.longitude,
      currentTarget.coordinates.latitude,
      currentTarget.coordinates.longitude
    );

    relativeAngle = calculateRelativeHeading(targetBearing, compassHeading);
  }

  // Precision distance formatting (Inches / CM / Feet / Meters)
  const distanceInfo = formatPrecisionDistance(distanceMeters, unitMode);

  // 3D Spatial Arm Wave evaluation (Khade hokar 4-10 inch hath hilane par)
  const spatialSweep = evaluateSpatialSweep(
    lastMotionMagnitude,
    signalDelta,
    telemetry.rawMetrics.rsrpDbm
  );

  // Sweet spot locked condition: Distance <= 1 meter YA score >= 92
  const isSweetSpotLocked =
    (currentTarget && distanceMeters <= 1.2) || telemetry.scoreReport.score >= 92;

  // Trigger special success haptic on sweet spot lock
  useEffect(() => {
    if (isSweetSpotLocked && isHapticEnabled) {
      triggerSweetSpotLockHaptic();
    }
  }, [isSweetSpotLocked, isHapticEnabled]);

  // Interpolated rotation for radar sweep line
  const sweepInterpolate = sweepAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* 1. Header Bar with Unit Switcher & Haptic Button */}
      <View style={styles.topHeader}>
        <View style={styles.headerLeft}>
          <View style={styles.iconCircle}>
            <Navigation size={18} color="#10B981" />
          </View>
          <View>
            <Text style={styles.headerTitle}>5G VECTOR RADAR</Text>
            <Text style={styles.headerSubtitle}>
              INCH, CM & SPATIAL SWEEP
            </Text>
          </View>
        </View>

        {/* Unit Mode & Haptic Action Cluster */}
        <View style={styles.headerActions}>
          {/* Unit Toggle Pill (INCH/CM vs METRIC) */}
          <TouchableOpacity
            style={styles.unitToggle}
            onPress={() =>
              setUnitMode(unitMode === 'inches_cm' ? 'metric' : 'inches_cm')
            }
            activeOpacity={0.7}
          >
            <Ruler size={13} color="#10B981" />
            <Text style={styles.unitToggleText}>
              {unitMode === 'inches_cm' ? 'INCH / CM' : 'METERS'}
            </Text>
          </TouchableOpacity>

          {/* Sound / Haptic Geiger Toggle Button */}
          <TouchableOpacity
            style={[styles.hapticToggle, isHapticEnabled && styles.hapticToggleActive]}
            onPress={() => setIsHapticEnabled(!isHapticEnabled)}
            activeOpacity={0.7}
          >
            {isHapticEnabled ? (
              <Volume2 size={16} color="#10B981" />
            ) : (
              <VolumeX size={16} color="#64748B" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. Sweet Spot Locked Alert Banner */}
      {isSweetSpotLocked && (
        <View style={styles.sweetSpotBanner}>
          <ShieldCheck size={18} color="#10B981" strokeWidth={2.5} />
          <View style={styles.sweetSpotTextStack}>
            <Text style={styles.sweetSpotTitle}>
              PEAK 5G SWEET SPOT LOCKED!
            </Text>
            <Text style={styles.sweetSpotSub}>
              Maximum radio throughput & lowest noise detected at this exact position.
            </Text>
          </View>
        </View>
      )}

      {/* 3. Instant 3D Spatial Wave Scanner (Arm Motion Detector) */}
      <View style={styles.spatialCard}>
        <View style={styles.spatialCardHeader}>
          <View style={styles.spatialTitleCluster}>
            <Move size={14} color="#10B981" />
            <Text style={styles.spatialTitle}>3D SPATIAL WAVE SCANNER</Text>
          </View>
          <View style={styles.displacementChip}>
            <Text style={styles.displacementText}>
              {spatialSweep.displacementInches} IN ({spatialSweep.displacementCm} CM)
            </Text>
          </View>
        </View>

        <Text style={styles.spatialRecommendation}>
          {spatialSweep.recommendation}
        </Text>

        <View style={styles.spatialFooter}>
          <Text style={styles.spatialHint}>
            Gently wave your phone 4-6 inches forward or towards the window.
          </Text>
        </View>
      </View>

      {/* 4. Signal Gradient Vector (Hot / Cold Indicator) */}
      <View
        style={[
          styles.gradientBanner,
          signalDelta > 0
            ? styles.gradientImproving
            : signalDelta < 0
            ? styles.gradientDropping
            : styles.gradientStable,
        ]}
      >
        <View style={styles.gradientLeft}>
          {signalDelta > 0 ? (
            <ArrowUp size={16} color="#10B981" strokeWidth={3} />
          ) : signalDelta < 0 ? (
            <ArrowDown size={16} color="#EF4444" strokeWidth={3} />
          ) : (
            <Target size={16} color="#94A3B8" />
          )}
          <Text style={styles.gradientText}>
            {signalDelta > 0
              ? `SIGNAL IMPROVING (+${signalDelta} dBm)`
              : signalDelta < 0
              ? `SIGNAL DROPPING (${signalDelta} dBm)`
              : 'SIGNAL STABLE'}
          </Text>
        </View>

        <Text style={styles.gradientHint}>
          {signalDelta > 0
            ? 'Keep moving this way!'
            : signalDelta < 0
            ? 'Step back 4 inches'
            : 'Hold position'}
        </Text>
      </View>

      {/* 5. Central Circular Radar Compass HUD */}
      <View style={styles.radarContainer}>
        {/* SVG Radar Grid & Directional Needle */}
        <View style={styles.radarGraphicWrapper}>
          <Svg width={260} height={260} viewBox="0 0 260 260">
            {/* Outer Ring */}
            <Circle
              cx={130}
              cy={130}
              r={120}
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth={2}
              fill="transparent"
            />

            {/* Intermediate Distance Rings */}
            <Circle
              cx={130}
              cy={130}
              r={85}
              stroke="rgba(16, 185, 129, 0.15)"
              strokeWidth={1}
              strokeDasharray="4, 4"
              fill="transparent"
            />
            <Circle
              cx={130}
              cy={130}
              r={50}
              stroke="rgba(16, 185, 129, 0.25)"
              strokeWidth={1}
              fill="transparent"
            />
            <Circle
              cx={130}
              cy={130}
              r={18}
              stroke="#10B981"
              strokeWidth={1.5}
              fill="rgba(16, 185, 129, 0.10)"
            />

            {/* Crosshair Axes */}
            <Line
              x1={130}
              y1={10}
              x2={130}
              y2={250}
              stroke="rgba(255, 255, 255, 0.05)"
              strokeWidth={1}
            />
            <Line
              x1={10}
              y1={130}
              x2={250}
              y2={130}
              stroke="rgba(255, 255, 255, 0.05)"
              strokeWidth={1}
            />
          </Svg>

          {/* Animated Sweeping Radar Scan Line */}
          <Animated.View
            style={[
              styles.radarSweepLine,
              { transform: [{ rotate: sweepInterpolate }] },
            ]}
          />

          {/* Rotating Directional Needle (Points to Target Spot) */}
          <View
            style={[
              styles.directionalNeedleContainer,
              { transform: [{ rotate: `${relativeAngle}deg` }] },
            ]}
          >
            <Svg width={140} height={140} viewBox="0 0 140 140">
              {/* Futuristic Polygon Arrow */}
              <Polygon
                points="70,12 80,48 70,40 60,48"
                fill="#10B981"
                stroke="#10B981"
                strokeWidth={1}
              />
            </Svg>
          </View>

          {/* Center Distance Readout with Dual Unit Support */}
          <View style={styles.centerDistanceBadge}>
            <View style={styles.distanceValueRow}>
              <Text style={styles.centerDistanceValue}>{distanceInfo.value}</Text>
              <Text style={styles.centerDistanceUnit}>{distanceInfo.unit}</Text>
            </View>
            {distanceInfo.secondaryText && (
              <Text style={styles.centerDistanceSecondary}>
                {distanceInfo.secondaryText}
              </Text>
            )}
          </View>
        </View>

        {/* Azimuth Heading & Distance Banner */}
        <View style={styles.azimuthRow}>
          <View style={styles.azimuthPill}>
            <Compass size={12} color="#94A3B8" />
            <Text style={styles.azimuthText}>HEADING: {compassHeading}°</Text>
          </View>
          <View style={styles.azimuthPill}>
            <Target size={12} color="#10B981" />
            <Text style={styles.azimuthText}>
              BEARING: {Math.round(targetBearing)}°
            </Text>
          </View>
        </View>
      </View>

      {/* 6. Target Spot Information Card */}
      {currentTarget ? (
        <View style={styles.targetCard}>
          <View style={styles.targetCardTop}>
            <View>
              <Text style={styles.targetCardSub}>CURRENT TRACKED 5G SPOT</Text>
              <Text style={styles.targetCardTitle}>{currentTarget.title}</Text>
              <Text style={styles.targetCardOperator}>
                {currentTarget.operator} • {currentTarget.generation}
              </Text>
            </View>

            <View
              style={[
                styles.targetScoreBadge,
                { backgroundColor: `${currentTarget.colorHex}18` },
              ]}
            >
              <Text
                style={[
                  styles.targetScoreNumber,
                  { color: currentTarget.colorHex },
                ]}
              >
                {currentTarget.score}
              </Text>
              <Text style={styles.targetScoreMax}>/100</Text>
            </View>
          </View>

          {/* Micro-metrics comparisons */}
          <View style={styles.targetMetricsRow}>
            <Text style={styles.metricText}>
              Benchmark: {currentTarget.rsrpDbm} dBm
            </Text>
            <Text style={styles.metricText}>
              Live: {telemetry.rawMetrics.rsrpDbm} dBm
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.noTargetCard}>
          <Text style={styles.noTargetTitle}>No Saved 5G Spot Selected</Text>
          <Text style={styles.noTargetSubtitle}>
            Save a spot first using "SAVE SPOT" on the dashboard, then track it here!
          </Text>
        </View>
      )}

      {/* 7. Switch Tracked Spot Carousel */}
      {savedPoints.length > 1 && (
        <View style={styles.switchContainer}>
          <Text style={styles.switchHeader}>SWITCH TARGET SPOT</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {savedPoints.map((pt) => {
              const isSelected = currentTarget?.id === pt.id;
              return (
                <TouchableOpacity
                  key={pt.id}
                  style={[styles.switchChip, isSelected && styles.switchChipActive]}
                  onPress={() => onSelectTarget(pt)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.switchChipText,
                      isSelected && styles.switchChipTextActive,
                    ]}
                  >
                    {pt.title} ({pt.score})
                  </Text>
                  <ChevronRight
                    size={12}
                    color={isSelected ? '#10B981' : '#64748B'}
                  />
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090D14',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 30,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
  headerSubtitle: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  unitToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  unitToggleText: {
    color: '#10B981',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  hapticToggle: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#0F1523',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  hapticToggleActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#10B981',
  },
  sweetSpotBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#10B981',
    marginBottom: 12,
    gap: 10,
  },
  sweetSpotTextStack: {
    flex: 1,
  },
  sweetSpotTitle: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  sweetSpotSub: {
    color: '#CBD5E1',
    fontSize: 10,
    marginTop: 2,
    lineHeight: 14,
  },
  spatialCard: {
    backgroundColor: '#0F1523',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    marginBottom: 12,
  },
  spatialCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  spatialTitleCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  spatialTitle: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  displacementChip: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  displacementText: {
    color: '#10B981',
    fontSize: 9,
    fontWeight: '800',
  },
  spatialRecommendation: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
    marginBottom: 6,
  },
  spatialFooter: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingTop: 6,
  },
  spatialHint: {
    color: '#64748B',
    fontSize: 10,
  },
  gradientBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  gradientImproving: {
    backgroundColor: 'rgba(16, 185, 129, 0.10)',
    borderColor: 'rgba(16, 185, 129, 0.30)',
  },
  gradientDropping: {
    backgroundColor: 'rgba(239, 68, 68, 0.10)',
    borderColor: 'rgba(239, 68, 68, 0.30)',
  },
  gradientStable: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  gradientLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  gradientText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  gradientHint: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '700',
  },
  radarContainer: {
    backgroundColor: '#0F1523',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    marginBottom: 18,
  },
  radarGraphicWrapper: {
    width: 260,
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  radarSweepLine: {
    position: 'absolute',
    width: 240,
    height: 2,
    backgroundColor: 'rgba(16, 185, 129, 0.40)',
  },
  directionalNeedleContainer: {
    position: 'absolute',
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerDistanceBadge: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  distanceValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  centerDistanceValue: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -1,
  },
  centerDistanceUnit: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    marginLeft: 4,
  },
  centerDistanceSecondary: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 1,
  },
  azimuthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 14,
    gap: 8,
  },
  azimuthPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#161F30',
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  azimuthText: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: '800',
  },
  targetCard: {
    backgroundColor: '#0F1523',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    marginBottom: 16,
  },
  targetCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  targetCardSub: {
    color: '#64748B',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1,
  },
  targetCardTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    marginTop: 2,
  },
  targetCardOperator: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  targetScoreBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  targetScoreNumber: {
    fontSize: 16,
    fontWeight: '900',
  },
  targetScoreMax: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 2,
  },
  targetMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingTop: 8,
  },
  metricText: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '600',
  },
  noTargetCard: {
    backgroundColor: '#0F1523',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    marginBottom: 16,
  },
  noTargetTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },
  noTargetSubtitle: {
    color: '#64748B',
    fontSize: 11,
    textAlign: 'center',
  },
  switchContainer: {
    marginTop: 4,
  },
  switchHeader: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
  },
  switchChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161F30',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    gap: 4,
    marginRight: 8,
  },
  switchChipActive: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.10)',
  },
  switchChipText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
  },
  switchChipTextActive: {
    color: '#10B981',
  },
});

// ==============================================================================
// File: App.tsx
// Purpose: 5G Network Finder & Coverage Radar - Master Multi-View Dashboard
// Crafted with 20-year veteran design principles:
// Restraint, high-contrast typography, obsidian palette, and instant signal clarity.
// Chunk 4: Interactive 5G Coverage Map & Ergonomic Bottom Nav integrated.
// Har line par detailed comment diya gaya hai.
// ==============================================================================

// React aur zaroori state/effect hooks import karte hain
import React, { useState, useEffect, useCallback } from 'react';

// React Native ke core components aur layout utilities import karte hain
import {
  StyleSheet,
  View,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Text,
  Alert,
  TouchableOpacity,
} from 'react-native';

// Professional notch/island-safe layout provider
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { MapPin, Activity, ArrowRight } from 'lucide-react-native';

// Telemetry types import kar rahe hain
import {
  LiveTelemetryState,
  NetworkPoint,
  GeoCoordinates,
} from './src/types/telephony';

// Telemetry service se live signal provider import karte hain
import { fetchCurrentTelemetry } from './src/services/telemetryService';

// GPS Location service import karte hain
import { getCurrentCoordinates } from './src/services/locationService';

// Trigonometric distance calculator import karte hain
import { calculateHaversineDistance } from './src/core/navigationEngine';

// SQLite database service functions import karte hain
import {
  fetchAllNetworkPoints,
  insertNetworkPoint,
  deleteNetworkPoint,
  updateSpotBenchmarkMetrics,
} from './src/services/databaseService';

// Handcrafted minimalist UI components import karte hain
import { Header } from './src/components/Header';
import { OperatorSelector } from './src/components/OperatorSelector';
import { ScoreGauge } from './src/components/ScoreGauge';
import { MetricCard } from './src/components/MetricCard';
import { HardwareStrip } from './src/components/HardwareStrip';
import { ActionBar } from './src/components/ActionBar';
import { SaveSpotModal } from './src/components/SaveSpotModal';
import { SavedSpotsList } from './src/components/SavedSpotsList';
import { CoverageMap } from './src/components/CoverageMap';
import { RadarCompassView } from './src/components/RadarCompassView';
import { SpeedTestView } from './src/components/SpeedTestView';
import { SpotComparisonModal } from './src/components/SpotComparisonModal';
import { BottomNavBar, AppTab } from './src/components/BottomNavBar';

export default function App() {
  // Live telemetry state
  const [telemetry, setTelemetry] = useState<LiveTelemetryState | null>(null);

  // Scan / Polling indicator state
  const [isScanning, setIsScanning] = useState<boolean>(false);

  // Active selected operator ('Jio True 5G', 'Airtel 5G Plus', 'Vi 5G')
  const [selectedOperator, setSelectedOperator] = useState<string>('Jio True 5G');

  // Active bottom navigation tab ('hud' | 'map' | 'spots')
  const [activeTab, setActiveTab] = useState<AppTab>('hud');

  // SQLite me saved network points state
  const [savedPoints, setSavedPoints] = useState<NetworkPoint[]>([]);

  // Phone ki current GPS coordinates state
  const [userLocation, setUserLocation] = useState<GeoCoordinates | null>(null);

  // "Save 5G Spot" modal sheet open/close state
  const [isSaveModalOpen, setIsSaveModalOpen] = useState<boolean>(false);

  // "Saved Spots" list drawer open/close state
  const [isSavedListOpen, setIsSavedListOpen] = useState<boolean>(false);

  // Target 5G spot jise Compass Radar trace kar raha hai
  const [selectedRadarTarget, setSelectedRadarTarget] = useState<NetworkPoint | null>(null);

  // Re-verification aur Historical Comparison modal state
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState<boolean>(false);
  const [comparisonSpot, setComparisonSpot] = useState<NetworkPoint | null>(null);

  // Nearest spot detection (< 15 meters auto-arrival beacon)
  const nearbySpotInfo = React.useMemo(() => {
    if (!userLocation || savedPoints.length === 0) return null;

    let closestSpot: NetworkPoint | null = null;
    let minDistance = Infinity;

    for (const pt of savedPoints) {
      const dist = calculateHaversineDistance(
        userLocation.latitude,
        userLocation.longitude,
        pt.coordinates.latitude,
        pt.coordinates.longitude
      );
      if (dist < minDistance) {
        minDistance = dist;
        closestSpot = pt;
      }
    }

    if (closestSpot && minDistance <= 15) {
      return { spot: closestSpot, distanceMeters: minDistance };
    }
    return null;
  }, [userLocation, savedPoints]);

  // SQLite database se saved points load karne ka function
  const loadSavedPoints = useCallback(async () => {
    try {
      const points = await fetchAllNetworkPoints();
      setSavedPoints(points);
    } catch (error) {
      console.error('Failed to load saved points from SQLite:', error);
    }
  }, []);

  // GPS location refresh karne ka function
  const refreshLocation = useCallback(async () => {
    try {
      const coords = await getCurrentCoordinates();
      setUserLocation(coords);
    } catch (error) {
      console.warn('Could not refresh GPS location:', error);
    }
  }, []);

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

  // Initial load: Telemetry scan, GPS capture, SQLite load, aur 3-second auto-polling loop
  useEffect(() => {
    // Database initialize & saved spots load
    loadSavedPoints();

    // User GPS location fetch
    refreshLocation();

    // Initial signal fetch
    scanNetwork(selectedOperator);

    // Har 3 second mein auto-polling timer set karte hain
    const pollInterval = setInterval(() => {
      scanNetwork(selectedOperator);
    }, 3000);

    // Memory leak rokne ke liye timer cleanup karte hain
    return () => clearInterval(pollInterval);
  }, [selectedOperator, scanNetwork, loadSavedPoints, refreshLocation]);

  // Naya 5G Spot SQLite database me save karne ka handler
  const handleConfirmSave = async (
    title: string,
    notes: string,
    coords: GeoCoordinates
  ) => {
    if (!telemetry) return;

    // Unique 5G network point model create karte hain
    const newPoint: NetworkPoint = {
      id: `spot_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title,
      notes: notes || undefined,
      operator: telemetry.operatorName,
      generation: telemetry.generation,
      rsrpDbm: telemetry.rawMetrics.rsrpDbm,
      sinrDb: telemetry.rawMetrics.sinrDb,
      rsrqDb: telemetry.rawMetrics.rsrqDb,
      score: telemetry.scoreReport.score,
      qualityLevel: telemetry.scoreReport.qualityLevel,
      colorHex: telemetry.scoreReport.colorHex,
      coordinates: coords,
      latencyMs: telemetry.latencyMs,
      createdAt: Date.now(),
    };

    try {
      // SQLite database me insert karte hain
      await insertNetworkPoint(newPoint);
      // Saved points state reload karte hain
      await loadSavedPoints();

      Alert.alert(
        '5G Spot Saved!',
        `"${title}" has been safely bookmarked in your offline radar database. Score: ${newPoint.score}/100.`
      );
    } catch (error) {
      console.error('Failed to save 5G spot to SQLite:', error);
      Alert.alert('Save Failed', 'Could not write to local database. Please try again.');
    }
  };

  // Kisi saved 5G spot ko delete karne ka handler
  const handleDeletePoint = async (id: string) => {
    try {
      await deleteNetworkPoint(id);
      await loadSavedPoints();
    } catch (error) {
      console.error('Failed to delete 5G spot:', error);
    }
  };

  // Saved 5G spot ka benchmark live reading se overwrite karne ka handler
  const handleUpdateBenchmark = async (spotId: string) => {
    if (!telemetry) return;
    try {
      await updateSpotBenchmarkMetrics(spotId, {
        rsrpDbm: telemetry.rawMetrics.rsrpDbm,
        sinrDb: telemetry.rawMetrics.sinrDb,
        rsrqDb: telemetry.rawMetrics.rsrqDb,
        score: telemetry.scoreReport.score,
        qualityLevel: telemetry.scoreReport.qualityLevel,
        colorHex: telemetry.scoreReport.colorHex,
        latencyMs: telemetry.latencyMs,
      });
      await loadSavedPoints();
      setIsComparisonModalOpen(false);
      Alert.alert(
        '5G Benchmark Updated!',
        'New RF radio baseline and health score have been safely recorded in SQLite.'
      );
    } catch (e) {
      console.error('Failed to update benchmark:', e);
      Alert.alert('Update Failed', 'Could not update local database.');
    }
  };

  // Map ya Saved List se radar navigation ke liye point select hone par
  const handleSelectTargetForRadar = (point: NetworkPoint) => {
    setSelectedRadarTarget(point);
    setActiveTab('radar');
  };

  // Jab tak initial telemetry data load nahi hota, sleek dark screen loader dikhate hain
  if (!telemetry) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.loadingContainer}>
          <StatusBar barStyle="light-content" backgroundColor="#090D14" />
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>CALIBRATING 5G RADIO TELEMETRY...</Text>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  // Telemetry se data destructure karte hain
  const { scoreReport, rawMetrics } = telemetry;

  // Normalized visual percentage calculation for radio metric progress tracks
  const rsrpPercent = Math.round(((rawMetrics.rsrpDbm - (-120)) / 50) * 100);
  const rsrpColor = rawMetrics.rsrpDbm >= -80 ? '#10B981' : rawMetrics.rsrpDbm >= -100 ? '#F59E0B' : '#F43F5E';
  const rsrpStatus = rawMetrics.rsrpDbm >= -80 ? 'Optimal' : rawMetrics.rsrpDbm >= -100 ? 'Fair' : 'Weak';

  const sinrPercent = Math.round(((rawMetrics.sinrDb - (-5)) / 35) * 100);
  const sinrColor = rawMetrics.sinrDb >= 20 ? '#10B981' : rawMetrics.sinrDb >= 10 ? '#10B981' : rawMetrics.sinrDb >= 3 ? '#F59E0B' : '#F43F5E';
  const sinrStatus = rawMetrics.sinrDb >= 15 ? 'Pristine' : rawMetrics.sinrDb >= 5 ? 'Stable' : 'Noisy';

  const rsrqPercent = Math.round(((rawMetrics.rsrqDb - (-20)) / 17) * 100);
  const rsrqColor = rawMetrics.rsrqDb >= -10 ? '#10B981' : rawMetrics.rsrqDb >= -15 ? '#F59E0B' : '#F43F5E';
  const rsrqStatus = rawMetrics.rsrqDb >= -10 ? 'Clean' : rawMetrics.rsrqDb >= -15 ? 'Moderate' : 'Poor';

  const latencyPercent = Math.round(((150 - telemetry.latencyMs) / 135) * 100);
  const latencyColor = telemetry.latencyMs <= 30 ? '#10B981' : telemetry.latencyMs <= 60 ? '#10B981' : telemetry.latencyMs <= 100 ? '#F59E0B' : '#F43F5E';
  const latencyStatus = telemetry.latencyMs <= 30 ? 'Ultra Low' : telemetry.latencyMs <= 60 ? 'Fast' : 'High';

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
        {/* Top Mobile Status Bar */}
        <StatusBar barStyle="light-content" backgroundColor="#090D14" />

        {/* View 1: Live HUD Radar View */}
        {activeTab === 'hud' && (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header Bar with live beacon & saved spots count button */}
            <Header
              isScanning={isScanning}
              savedCount={savedPoints.length}
              onOpenSaved={() => setIsSavedListOpen(true)}
            />

            {/* Modern Segmented Operator Selector */}
            <OperatorSelector
              selectedOperator={selectedOperator}
              onSelectOperator={(op) => setSelectedOperator(op)}
            />

            {/* Proactive Arrival Re-Verification Banner */}
            {nearbySpotInfo && (
              <TouchableOpacity
                style={styles.arrivalBanner}
                onPress={() => {
                  setComparisonSpot(nearbySpotInfo.spot);
                  setIsComparisonModalOpen(true);
                }}
                activeOpacity={0.8}
              >
                <View style={styles.arrivalBannerLeft}>
                  <View style={styles.arrivalPulseDot} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.arrivalBannerTitle}>
                      ARRIVED AT "{nearbySpotInfo.spot.title.toUpperCase()}" ({Math.round(nearbySpotInfo.distanceMeters)}M)
                    </Text>
                    <Text style={styles.arrivalBannerSub}>
                      Original 5G: {nearbySpotInfo.spot.score}/100 • Tap to compare drift
                    </Text>
                  </View>
                </View>
                <ArrowRight size={15} color="#10B981" />
              </TouchableOpacity>
            )}

            {/* Instrument-Grade Radial 5G Health Score Gauge */}
            <ScoreGauge
              report={scoreReport}
              generation={telemetry.generation}
            />

            {/* Section Label: Precision RF Metrics */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>RADIO FREQUENCY TELEMETRY</Text>
              <Text style={styles.sectionSubtitle}>3GPP CALIBRATED</Text>
            </View>

            {/* 2x2 Telemetry Metric Cards with Visual Progress Tracks */}
            <View style={styles.metricsGrid}>
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

            {/* Hardware Ribbon: Band n78, Cell ID, 5G SA */}
            <HardwareStrip
              frequencyBand={telemetry.frequencyBand}
              cellId={telemetry.cellId}
              generation={telemetry.generation}
            />

            {/* Ergonomic Action Bar */}
            <ActionBar
              isScanning={isScanning}
              onScan={() => scanNetwork(selectedOperator)}
              onSaveSpot={() => setIsSaveModalOpen(true)}
            />
          </ScrollView>
        )}

        {/* View 2: Real-Time Radar Compass & Centimeter Sweep */}
        {activeTab === 'radar' && (
          <View style={styles.radarContainer}>
            <RadarCompassView
              targetPoint={selectedRadarTarget}
              savedPoints={savedPoints}
              currentLocation={userLocation}
              telemetry={telemetry}
              onSelectTarget={(pt) => setSelectedRadarTarget(pt)}
              onBackToDashboard={() => setActiveTab('hud')}
            />
          </View>
        )}

        {/* View 3: Interactive 5G Coverage Map */}
        {activeTab === 'map' && (
          <View style={styles.mapContainer}>
            <CoverageMap
              savedPoints={savedPoints}
              currentLocation={userLocation}
              onSelectTargetForRadar={handleSelectTargetForRadar}
              onClose={() => setActiveTab('hud')}
            />
          </View>
        )}

        {/* View 4: Zero-Cost 5G Speed & Ping Diagnostic Test */}
        {activeTab === 'speed' && (
          <View style={styles.speedContainer}>
            <SpeedTestView
              telemetry={telemetry}
              savedSpots={savedPoints}
              onRefreshSpots={loadSavedPoints}
            />
          </View>
        )}

        {/* View 5: Saved Spots Modal Sheet / Drawer */}
        <SavedSpotsList
          visible={isSavedListOpen || activeTab === 'spots'}
          points={savedPoints}
          onClose={() => {
            setIsSavedListOpen(false);
            if (activeTab === 'spots') setActiveTab('hud');
          }}
          onDeletePoint={handleDeletePoint}
          onComparePoint={(point) => {
            setComparisonSpot(point);
            setIsComparisonModalOpen(true);
          }}
        />

        {/* 5G Historical Comparison & Re-Verification Modal */}
        <SpotComparisonModal
          visible={isComparisonModalOpen}
          spot={comparisonSpot}
          liveTelemetry={telemetry}
          distanceMeters={nearbySpotInfo?.distanceMeters}
          onClose={() => setIsComparisonModalOpen(false)}
          onUpdateBenchmark={handleUpdateBenchmark}
        />

        {/* Save Spot Modal Sheet */}
        <SaveSpotModal
          visible={isSaveModalOpen}
          telemetry={telemetry}
          onClose={() => setIsSaveModalOpen(false)}
          onSave={handleConfirmSave}
        />

        {/* Ergonomic Floating Bottom Navigation Bar */}
        <BottomNavBar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            if (tab === 'spots') {
              setIsSavedListOpen(true);
            } else {
              setActiveTab(tab);
            }
          }}
          savedCount={savedPoints.length}
        />
      </SafeAreaView>
    </SafeAreaProvider>
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
    paddingBottom: 20,
  },
  mapContainer: {
    flex: 1,
  },
  radarContainer: {
    flex: 1,
  },
  speedContainer: {
    flex: 1,
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
  arrivalBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0F1523',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.35)',
    marginBottom: 12,
  },
  arrivalBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  arrivalPulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  arrivalBannerTitle: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  arrivalBannerSub: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
});

// ==============================================================================
// File: src/components/CoverageMap.tsx
// Purpose: Interactive 5G Coverage Map with Custom Dark Styling & Signal Pins
// Color-coded signal markers (Green/Yellow/Red), operator filters, and detail card.
// Har line par detailed comment diya gaya hai.
// ==============================================================================

import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import {
  Radio,
  Crosshair,
  Compass,
  X,
  Zap,
  Activity,
  Filter,
} from 'lucide-react-native';
import { NetworkPoint, GeoCoordinates } from '../types/telephony';
import { MAP_DARK_STYLE } from '../styles/mapDarkStyle';

interface CoverageMapProps {
  // SQLite me saved network points
  savedPoints: NetworkPoint[];
  // User ke phone ki current live coordinates
  currentLocation: GeoCoordinates | null;
  // Radar navigation ke liye target point select karne ka callback (Chunk 5)
  onSelectTargetForRadar?: (point: NetworkPoint) => void;
  // Close map / switch view callback
  onClose?: () => void;
}

// Filter presets
const OPERATOR_FILTERS = ['ALL', 'Jio', 'Airtel', 'HIGH SPEED (≥80)'];

export const CoverageMap: React.FC<CoverageMapProps> = ({
  savedPoints,
  currentLocation,
  onSelectTargetForRadar,
  onClose,
}) => {
  // Map reference for programmatic camera movements
  const mapRef = useRef<MapView | null>(null);

  // Active filter state
  const [activeFilter, setActiveFilter] = useState('ALL');

  // Currently tapped/selected 5G spot
  const [selectedPoint, setSelectedPoint] = useState<NetworkPoint | null>(null);

  // Initial map center coordinates
  const initialRegion = {
    latitude: currentLocation?.latitude || (savedPoints[0]?.coordinates.latitude ?? 28.6315),
    longitude: currentLocation?.longitude || (savedPoints[0]?.coordinates.longitude ?? 77.2167),
    latitudeDelta: 0.015,
    longitudeDelta: 0.015,
  };

  // Filter logic
  const filteredPoints = savedPoints.filter((pt) => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'HIGH SPEED (≥80)') return pt.score >= 80;
    return pt.operator.toLowerCase().includes(activeFilter.toLowerCase());
  });

  // User location par map ko recenter karne ka function
  const handleRecenter = () => {
    if (currentLocation && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        800
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* 1. Main Dark-Mode Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        customMapStyle={MAP_DARK_STYLE}
        initialRegion={initialRegion}
        showsUserLocation
        showsCompass={false}
        showsMyLocationButton={false}
      >
        {/* Saved 5G Spot Markers */}
        {filteredPoints.map((point) => {
          const isSelected = selectedPoint?.id === point.id;

          return (
            <Marker
              key={point.id}
              coordinate={{
                latitude: point.coordinates.latitude,
                longitude: point.coordinates.longitude,
              }}
              onPress={() => setSelectedPoint(point)}
            >
              {/* Custom High-Tech Pin Marker */}
              <View style={styles.markerWrapper}>
                <View
                  style={[
                    styles.markerPill,
                    {
                      backgroundColor: isSelected ? '#FFFFFF' : '#0F1523',
                      borderColor: point.colorHex,
                    },
                  ]}
                >
                  <View
                    style={[styles.markerDot, { backgroundColor: point.colorHex }]}
                  />
                  <Text
                    style={[
                      styles.markerScoreText,
                      { color: isSelected ? '#090D14' : point.colorHex },
                    ]}
                  >
                    {point.score}
                  </Text>
                </View>
                {/* Pointer arrow tip */}
                <View
                  style={[
                    styles.markerTip,
                    { borderTopColor: point.colorHex },
                  ]}
                />
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* 2. Top Floating Header & Filter Bar */}
      <View style={styles.topOverlay}>
        <View style={styles.topHeader}>
          <View style={styles.topHeaderLeft}>
            <View style={styles.iconCircle}>
              <Radio size={16} color="#10B981" />
            </View>
            <View>
              <Text style={styles.mapTitle}>5G COVERAGE MAP</Text>
              <Text style={styles.mapSubtitle}>
                {filteredPoints.length} OF {savedPoints.length} SPOTS VISIBLE
              </Text>
            </View>
          </View>

          {onClose && (
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Chips Horizontal Scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {OPERATOR_FILTERS.map((f) => {
            const isActive = activeFilter === f;
            return (
              <TouchableOpacity
                key={f}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                onPress={() => setActiveFilter(f)}
                activeOpacity={0.7}
              >
                {f === 'ALL' && <Filter size={10} color={isActive ? '#090D14' : '#64748B'} />}
                <Text
                  style={[
                    styles.filterChipText,
                    isActive && styles.filterChipTextActive,
                  ]}
                >
                  {f}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 3. Floating Recenter GPS Button */}
      <TouchableOpacity
        style={styles.recenterButton}
        onPress={handleRecenter}
        activeOpacity={0.8}
      >
        <Crosshair size={20} color="#10B981" />
      </TouchableOpacity>

      {/* 4. Bottom Selected Spot Detail Card */}
      {selectedPoint && (
        <View style={styles.detailCard}>
          <View style={styles.detailTop}>
            <View style={styles.detailTitleArea}>
              <Text style={styles.detailTitle}>{selectedPoint.title}</Text>
              <Text style={styles.detailOperator}>
                {selectedPoint.operator} • {selectedPoint.generation}
              </Text>
            </View>

            {/* Score Pill */}
            <View
              style={[
                styles.detailScoreBadge,
                { backgroundColor: `${selectedPoint.colorHex}20` },
              ]}
            >
              <Text
                style={[
                  styles.detailScoreNumber,
                  { color: selectedPoint.colorHex },
                ]}
              >
                {selectedPoint.score}
              </Text>
              <Text style={styles.detailScoreMax}>/100</Text>
            </View>

            <TouchableOpacity
              onPress={() => setSelectedPoint(null)}
              style={styles.detailClose}
            >
              <X size={16} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Metrics summary */}
          <View style={styles.detailMetricsRow}>
            <View style={styles.detailMetric}>
              <Zap size={12} color="#64748B" />
              <Text style={styles.detailMetricText}>{selectedPoint.rsrpDbm} dBm</Text>
            </View>
            <View style={styles.detailMetric}>
              <Activity size={12} color="#64748B" />
              <Text style={styles.detailMetricText}>{selectedPoint.sinrDb} dB SINR</Text>
            </View>
            <View style={styles.detailMetric}>
              <Text style={styles.detailMetricText}>{selectedPoint.latencyMs} ms</Text>
            </View>
          </View>

          {/* Action button: Navigate to this spot with Compass Radar */}
          {onSelectTargetForRadar && (
            <TouchableOpacity
              style={styles.radarNavBtn}
              onPress={() => {
                onSelectTargetForRadar(selectedPoint);
                setSelectedPoint(null);
              }}
              activeOpacity={0.8}
            >
              <Compass size={16} color="#090D14" strokeWidth={2.5} />
              <Text style={styles.radarNavBtnText}>TRACK WITH 5G RADAR</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090D14',
  },
  map: {
    ...StyleSheet.absoluteFill,
  },
  markerWrapper: {
    alignItems: 'center',
  },
  markerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  markerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  markerScoreText: {
    fontSize: 11,
    fontWeight: '900',
  },
  markerTip: {
    width: 0,
    height: 0,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderTopWidth: 5,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  topOverlay: {
    position: 'absolute',
    top: 10,
    left: 14,
    right: 14,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(15, 21, 35, 0.92)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 8,
  },
  topHeaderLeft: {
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
  mapTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
  },
  mapSubtitle: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 1,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  filterScroll: {
    gap: 6,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F1523',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 4,
  },
  filterChipActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  filterChipText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  filterChipTextActive: {
    color: '#090D14',
  },
  recenterButton: {
    position: 'absolute',
    right: 16,
    bottom: 30,
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#0F1523',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  detailCard: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 24,
    backgroundColor: '#0F1523',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 6,
  },
  detailTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailTitleArea: {
    flex: 1,
  },
  detailTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  detailOperator: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  detailScoreBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginRight: 6,
  },
  detailScoreNumber: {
    fontSize: 16,
    fontWeight: '900',
  },
  detailScoreMax: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 2,
  },
  detailClose: {
    padding: 4,
  },
  detailMetricsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    marginVertical: 6,
  },
  detailMetric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailMetricText: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '600',
  },
  radarNavBtn: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 10,
    gap: 6,
  },
  radarNavBtnText: {
    color: '#090D14',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
});

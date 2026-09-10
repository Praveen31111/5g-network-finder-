// ==============================================================================
// File: src/components/ActionBar.tsx
// Purpose: Minimalist Ergonomic Action Bar (Scan Trigger & Save Spot Button)
// Bottom thumb-friendly layout designed for seamless one-handed operation.
// Har line par detailed comment diya gaya hai.
// ==============================================================================

import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { RefreshCw, MapPin } from 'lucide-react-native';

interface ActionBarProps {
  // Kya currently scanning in progress hai
  isScanning: boolean;
  // Manual scan initiate karne ka function
  onScan: () => void;
  // Spot save karne ka function (Chunk 3 preparation)
  onSaveSpot?: () => void;
}

export const ActionBar: React.FC<ActionBarProps> = ({
  isScanning,
  onScan,
  onSaveSpot,
}) => {
  return (
    <View style={styles.container}>
      {/* Secondary Action: Save 5G Spot (Future-ready for Chunk 3) */}
      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={onSaveSpot}
        activeOpacity={0.7}
      >
        <MapPin size={16} color="#94A3B8" />
        <Text style={styles.secondaryButtonText}>SAVE SPOT</Text>
      </TouchableOpacity>

      {/* Primary Action: High-Priority Scan Frequency Button */}
      <TouchableOpacity
        style={[styles.primaryButton, isScanning && styles.primaryButtonDisabled]}
        onPress={onScan}
        disabled={isScanning}
        activeOpacity={0.8}
      >
        {isScanning ? (
          <View style={styles.buttonContent}>
            <ActivityIndicator size="small" color="#090D14" />
            <Text style={styles.primaryButtonText}>PROBING 5G...</Text>
          </View>
        ) : (
          <View style={styles.buttonContent}>
            <RefreshCw size={16} color="#090D14" strokeWidth={2.5} />
            <Text style={styles.primaryButtonText}>SCAN LIVE SIGNAL</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    gap: 10,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: '#0F1523',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 6,
  },
  secondaryButtonText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  primaryButtonDisabled: {
    backgroundColor: '#059669',
    opacity: 0.8,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: '#090D14',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
});

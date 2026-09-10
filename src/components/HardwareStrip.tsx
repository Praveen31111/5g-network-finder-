// ==============================================================================
// File: src/components/HardwareStrip.tsx
// Purpose: Minimalist Ribbon Display for Cell Tower & Radio Hardware Telemetry
// Frequency Band, Physical Cell ID (PCI), aur Network Architecture ko clean dikhata hai.
// Har line par detailed comment diya gaya hai.
// ==============================================================================

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Cpu, TowerControl as Antenna, Shield } from 'lucide-react-native';

interface HardwareStripProps {
  // 5G Radio Frequency Band (e.g., 'Band n78 (3500 MHz)')
  frequencyBand?: string;
  // Physical Cell Identity number (PCI)
  cellId?: string | number;
  // Network generation / architecture mode
  generation: string;
}

export const HardwareStrip: React.FC<HardwareStripProps> = ({
  frequencyBand,
  cellId,
  generation,
}) => {
  return (
    <View style={styles.container}>
      {/* Title */}
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>RADIO HARDWARE & TOPOLOGY</Text>
        <Text style={styles.chipMode}>EXPO NATIVE BRIDGE</Text>
      </View>

      {/* Grid of technical parameters */}
      <View style={styles.itemsContainer}>
        {/* Item 1: Band */}
        <View style={styles.item}>
          <Antenna size={14} color="#64748B" />
          <View style={styles.textStack}>
            <Text style={styles.itemLabel}>BAND</Text>
            <Text style={styles.itemValue}>{frequencyBand || 'n78 (3500 MHz)'}</Text>
          </View>
        </View>

        {/* Vertical Divider */}
        <View style={styles.divider} />

        {/* Item 2: Physical Cell ID */}
        <View style={styles.item}>
          <Cpu size={14} color="#64748B" />
          <View style={styles.textStack}>
            <Text style={styles.itemLabel}>CELL ID (PCI)</Text>
            <Text style={styles.itemValue}>#{cellId || '241'}</Text>
          </View>
        </View>

        {/* Vertical Divider */}
        <View style={styles.divider} />

        {/* Item 3: Architecture Mode */}
        <View style={styles.item}>
          <Shield size={14} color="#64748B" />
          <View style={styles.textStack}>
            <Text style={styles.itemLabel}>NR CORE</Text>
            <Text style={styles.itemValue}>
              {generation.includes('Standalone') ? '5G SA' : '5G NSA'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0F1523',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    marginBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerTitle: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  chipMode: {
    color: '#10B981',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
    backgroundColor: 'rgba(16, 185, 129, 0.10)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  itemsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  textStack: {
    marginLeft: 8,
  },
  itemLabel: {
    color: '#475569',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  itemValue: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 1,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginHorizontal: 8,
  },
});

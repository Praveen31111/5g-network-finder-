// ==============================================================================
// File: src/components/Header.tsx
// Purpose: Minimalist Top Bar with Live Telemetry Indicator & Brand Mark
// Designed with 20-year veteran design restraint: balanced whitespace, clean typography.
// Har line par detailed comment diya gaya hai.
// ==============================================================================

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Radio } from 'lucide-react-native';

interface HeaderProps {
  // Kya currently network scan/refresh chal raha hai
  isScanning: boolean;
}

export const Header: React.FC<HeaderProps> = ({ isScanning }) => {
  return (
    <View style={styles.container}>
      {/* Brand title aur icon ka horizontal cluster */}
      <View style={styles.brandRow}>
        {/* Sleek emerald radio tower icon */}
        <View style={styles.iconWrapper}>
          <Radio size={18} color="#10B981" strokeWidth={2.5} />
        </View>
        {/* App Title with tracking / letter-spacing for premium modern look */}
        <View>
          <Text style={styles.brandTitle}>RADAR 5G</Text>
          <Text style={styles.brandSubtitle}>CELLULAR TELEMETRY</Text>
        </View>
      </View>

      {/* Live status badge with pulsating green beacon */}
      <View style={styles.statusPill}>
        {/* Green pulse dot indicator */}
        <View style={[styles.beaconDot, isScanning && styles.beaconDotScanning]} />
        <Text style={styles.statusPillText}>
          {isScanning ? 'POLLING...' : 'LIVE SENSORS'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 4,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.20)',
  },
  brandTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  brandSubtitle: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 1,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  beaconDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  beaconDotScanning: {
    backgroundColor: '#06B6D4',
  },
  statusPillText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
});

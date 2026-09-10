// ==============================================================================
// File: src/components/OperatorSelector.tsx
// Purpose: Minimalist Segmented Control for Operator Selection (Jio, Airtel, Vi)
// Designed with ultra-clean iOS segmented style: high contrast, zero clutter.
// Har line par detailed comment diya gaya hai.
// ==============================================================================

import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

interface OperatorSelectorProps {
  // Currently active selected operator string
  selectedOperator: string;
  // Operator change karne ka callback
  onSelectOperator: (operator: string) => void;
}

// Supported 5G network operators
const OPERATORS = [
  { id: 'Jio True 5G', label: 'Jio 5G', badge: 'SA' },
  { id: 'Airtel 5G Plus', label: 'Airtel 5G+', badge: 'NSA' },
  { id: 'Vi 5G', label: 'Vi 5G', badge: 'TRIAL' },
];

export const OperatorSelector: React.FC<OperatorSelectorProps> = ({
  selectedOperator,
  onSelectOperator,
}) => {
  return (
    <View style={styles.container}>
      {OPERATORS.map((op) => {
        // Check karte hain ki kya ye operator active hai
        const isActive = selectedOperator === op.id;

        return (
          <TouchableOpacity
            key={op.id}
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={() => onSelectOperator(op.id)}
            activeOpacity={0.7}
          >
            {/* Operator name */}
            <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
              {op.label}
            </Text>

            {/* Micro badge (SA / NSA) */}
            <View style={[styles.badge, isActive && styles.badgeActive]}>
              <Text style={[styles.badgeText, isActive && styles.badgeTextActive]}>
                {op.badge}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#0F1523',
    borderRadius: 12,
    padding: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 9,
  },
  tabActive: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  badge: {
    marginLeft: 5,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  badgeActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  badgeText: {
    color: '#475569',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  badgeTextActive: {
    color: '#10B981',
  },
});

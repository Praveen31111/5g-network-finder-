// ==============================================================================
// File: src/components/BottomNavBar.tsx
// Purpose: Minimalist Floating Tab Switcher (HUD Radar vs Coverage Map vs Saved Spots)
// Crafted with 20-year veteran design ergonomics: thumb-friendly, tactile feedback.
// Har line par detailed comment diya gaya hai.
// ==============================================================================

import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Gauge, Map, Bookmark } from 'lucide-react-native';

export type AppTab = 'hud' | 'map' | 'spots';

interface BottomNavBarProps {
  // Currently active tab
  activeTab: AppTab;
  // Tab switch callback
  onSelectTab: (tab: AppTab) => void;
  // Total saved spots count for badge
  savedCount: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onSelectTab,
  savedCount,
}) => {
  return (
    <View style={styles.floatingContainer}>
      <View style={styles.navBar}>
        {/* Tab 1: Live HUD Radar */}
        <TouchableOpacity
          style={[styles.tab, activeTab === 'hud' && styles.tabActive]}
          onPress={() => onSelectTab('hud')}
          activeOpacity={0.7}
        >
          <Gauge
            size={18}
            color={activeTab === 'hud' ? '#10B981' : '#64748B'}
            strokeWidth={activeTab === 'hud' ? 2.5 : 2}
          />
          <Text
            style={[styles.tabText, activeTab === 'hud' && styles.tabTextActive]}
          >
            HUD RADAR
          </Text>
        </TouchableOpacity>

        {/* Tab 2: Coverage Map */}
        <TouchableOpacity
          style={[styles.tab, activeTab === 'map' && styles.tabActive]}
          onPress={() => onSelectTab('map')}
          activeOpacity={0.7}
        >
          <Map
            size={18}
            color={activeTab === 'map' ? '#10B981' : '#64748B'}
            strokeWidth={activeTab === 'map' ? 2.5 : 2}
          />
          <Text
            style={[styles.tabText, activeTab === 'map' && styles.tabTextActive]}
          >
            5G MAP
          </Text>
        </TouchableOpacity>

        {/* Tab 3: Saved Spots */}
        <TouchableOpacity
          style={[styles.tab, activeTab === 'spots' && styles.tabActive]}
          onPress={() => onSelectTab('spots')}
          activeOpacity={0.7}
        >
          <View style={styles.iconWithBadge}>
            <Bookmark
              size={18}
              color={activeTab === 'spots' ? '#10B981' : '#64748B'}
              strokeWidth={activeTab === 'spots' ? 2.5 : 2}
            />
            {savedCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{savedCount}</Text>
              </View>
            )}
          </View>
          <Text
            style={[styles.tabText, activeTab === 'spots' && styles.tabTextActive]}
          >
            SAVED
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  floatingContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    paddingTop: 6,
    backgroundColor: '#090D14',
  },
  navBar: {
    flexDirection: 'row',
    backgroundColor: '#0F1523',
    borderRadius: 18,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 14,
    gap: 6,
  },
  tabActive: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.30)',
  },
  tabText: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  iconWithBadge: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#10B981',
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  badgeText: {
    color: '#090D14',
    fontSize: 8,
    fontWeight: '900',
  },
});

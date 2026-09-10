// ==============================================================================
// File: src/components/SavedSpotsList.tsx
// Purpose: Minimalist Modern Modal/Drawer for Viewing & Managing Saved 5G Spots
// Displays SQLite data with score badges, RF metrics, GPS coords, and delete actions.
// Har line par detailed comment diya gaya hai.
// ==============================================================================

import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import {
  MapPin,
  X,
  Trash2,
  Calendar,
  Compass,
  Zap,
  Activity,
} from 'lucide-react-native';
import { NetworkPoint } from '../types/telephony';

interface SavedSpotsListProps {
  // Modal visibility
  visible: boolean;
  // SQLite se fetch kiye gaye saved network points
  points: NetworkPoint[];
  // Close modal callback
  onClose: () => void;
  // Spot delete karne ka callback
  onDeletePoint: (id: string) => Promise<void>;
}

export const SavedSpotsList: React.FC<SavedSpotsListProps> = ({
  visible,
  points,
  onClose,
  onDeletePoint,
}) => {
  // Spot delete confirmation alert
  const confirmDelete = (point: NetworkPoint) => {
    Alert.alert(
      'Delete 5G Spot',
      `Are you sure you want to remove "${point.title}" from your saved radar spots?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDeletePoint(point.id),
        },
      ]
    );
  };

  // Date formatting helper
  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return `${d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.sheetContainer}>
          {/* Top handle bar */}
          <View style={styles.handleBar} />

          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerTitleRow}>
              <View style={styles.iconWrapper}>
                <MapPin size={16} color="#10B981" />
              </View>
              <Text style={styles.headerTitle}>SAVED 5G SPOTS</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{points.length}</Text>
              </View>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Points list or Empty state */}
          {points.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <MapPin size={32} color="#475569" />
              </View>
              <Text style={styles.emptyTitle}>No Saved 5G Spots Yet</Text>
              <Text style={styles.emptySubtitle}>
                Walk around your home or office, find the highest 5G score, and tap "SAVE SPOT" to bookmark it here!
              </Text>
            </View>
          ) : (
            <FlatList
              data={points}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => (
                <View style={styles.card}>
                  {/* Card Top Row: Title, Operator, Score Badge */}
                  <View style={styles.cardTop}>
                    <View style={styles.titleArea}>
                      <Text style={styles.cardTitle}>{item.title}</Text>
                      <Text style={styles.operatorText}>{item.operator}</Text>
                    </View>

                    {/* Score Badge */}
                    <View
                      style={[
                        styles.scoreBadge,
                        { backgroundColor: `${item.colorHex}18` },
                      ]}
                    >
                      <Text style={[styles.scoreNumber, { color: item.colorHex }]}>
                        {item.score}
                      </Text>
                      <Text style={styles.scoreScale}>/100</Text>
                    </View>
                  </View>

                  {/* Notes if available */}
                  {item.notes ? (
                    <Text style={styles.notesText}>{item.notes}</Text>
                  ) : null}

                  {/* Telemetry Metrics Row */}
                  <View style={styles.metricsRow}>
                    <View style={styles.metricItem}>
                      <Zap size={11} color="#64748B" />
                      <Text style={styles.metricItemText}>{item.rsrpDbm} dBm</Text>
                    </View>

                    <View style={styles.metricItem}>
                      <Activity size={11} color="#64748B" />
                      <Text style={styles.metricItemText}>{item.sinrDb} dB SINR</Text>
                    </View>

                    <View style={styles.metricItem}>
                      <Text style={styles.metricItemText}>{item.latencyMs} ms</Text>
                    </View>

                    {item.downloadMbps ? (
                      <View style={[styles.metricItem, { backgroundColor: 'rgba(6, 182, 212, 0.15)' }]}>
                        <Zap size={11} color="#06B6D4" />
                        <Text style={[styles.metricItemText, { color: '#06B6D4', fontWeight: '800' }]}>
                          {item.downloadMbps} Mbps
                        </Text>
                      </View>
                    ) : null}
                  </View>

                  {/* Card Bottom: Coordinates, Date, and Delete Button */}
                  <View style={styles.cardBottom}>
                    <View style={styles.metaCluster}>
                      <View style={styles.metaRow}>
                        <Compass size={11} color="#64748B" />
                        <Text style={styles.metaText}>
                          {item.coordinates.latitude.toFixed(4)}°, {item.coordinates.longitude.toFixed(4)}°
                        </Text>
                      </View>

                      <View style={styles.metaRow}>
                        <Calendar size={11} color="#64748B" />
                        <Text style={styles.metaText}>{formatDate(item.createdAt)}</Text>
                      </View>
                    </View>

                    {/* Delete button */}
                    <TouchableOpacity
                      onPress={() => confirmDelete(item)}
                      style={styles.deleteButton}
                      activeOpacity={0.7}
                    >
                      <Trash2 size={15} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#0F1523',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 12,
    height: '80%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.20)',
    alignSelf: 'center',
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 8,
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
  countBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '800',
  },
  closeButton: {
    padding: 6,
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 6,
  },
  emptySubtitle: {
    color: '#64748B',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  card: {
    backgroundColor: '#161F30',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  titleArea: {
    flex: 1,
    marginRight: 10,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  operatorText: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  scoreNumber: {
    fontSize: 18,
    fontWeight: '900',
  },
  scoreScale: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 2,
  },
  notesText: {
    color: '#94A3B8',
    fontSize: 11,
    marginVertical: 4,
    fontStyle: 'italic',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    marginVertical: 6,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricItemText: {
    color: '#CBD5E1',
    fontSize: 10,
    fontWeight: '600',
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  metaCluster: {
    flexDirection: 'row',
    gap: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: '#64748B',
    fontSize: 10,
  },
  deleteButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.10)',
  },
});

// ==============================================================================
// File: src/components/SaveSpotModal.tsx
// Purpose: Minimalist Modern Bottom Sheet Modal to Save Current 5G Spot
// Captures title, notes, GPS coordinates, and signal score into SQLite.
// Har line par detailed comment diya gaya hai.
// ==============================================================================

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { MapPin, X, Check, Radio, Compass } from 'lucide-react-native';
import { LiveTelemetryState, GeoCoordinates } from '../types/telephony';
import { getCurrentCoordinates } from '../services/locationService';

interface SaveSpotModalProps {
  // Modal visibility flag
  visible: boolean;
  // Live telemetry snapshot to freeze and save
  telemetry: LiveTelemetryState;
  // Close modal callback
  onClose: () => void;
  // Save confirmed callback
  onSave: (title: string, notes: string, coords: GeoCoordinates) => Promise<void>;
}

// Quick title chips for 1-tap naming
const SUGGESTIONS = [
  'Balcony Window',
  'Office Desk',
  'Terrace Top',
  'Living Room Corner',
  'Study Table',
];

export const SaveSpotModal: React.FC<SaveSpotModalProps> = ({
  visible,
  telemetry,
  onClose,
  onSave,
}) => {
  // User input states
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [coords, setCoords] = useState<GeoCoordinates | null>(null);
  const [isLoadingCoords, setIsLoadingCoords] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Modal open hote hi fresh GPS location grab karte hain
  useEffect(() => {
    if (visible) {
      setTitle('');
      setNotes('');
      setIsLoadingCoords(true);

      getCurrentCoordinates()
        .then((location) => setCoords(location))
        .finally(() => setIsLoadingCoords(false));
    }
  }, [visible]);

  // Save button press handler
  const handleSavePress = async () => {
    const spotTitle = title.trim() || `${telemetry.operatorName} Spot`;
    const finalCoords = coords || { latitude: 28.6315, longitude: 77.2167 };

    setIsSaving(true);
    try {
      await onSave(spotTitle, notes.trim(), finalCoords);
      onClose();
    } catch (error) {
      console.error('Error saving 5G spot:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <View style={styles.sheetContainer}>
          {/* Top handle bar */}
          <View style={styles.handleBar} />

          {/* Modal Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerTitleRow}>
              <View style={styles.headerIconWrapper}>
                <MapPin size={16} color="#10B981" />
              </View>
              <Text style={styles.headerTitle}>SAVE 5G RADAR SPOT</Text>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Frozen Telemetry Snapshot Card */}
            <View style={styles.snapshotCard}>
              <View style={styles.snapshotTop}>
                <View style={styles.operatorCluster}>
                  <Radio size={14} color="#10B981" />
                  <Text style={styles.operatorText}>{telemetry.operatorName}</Text>
                </View>
                <View
                  style={[
                    styles.scorePill,
                    { backgroundColor: `${telemetry.scoreReport.colorHex}22` },
                  ]}
                >
                  <Text
                    style={[
                      styles.scorePillText,
                      { color: telemetry.scoreReport.colorHex },
                    ]}
                  >
                    SCORE: {telemetry.scoreReport.score}/100
                  </Text>
                </View>
              </View>

              {/* GPS coordinates readout */}
              <View style={styles.coordsRow}>
                <Compass size={12} color="#64748B" />
                {isLoadingCoords ? (
                  <Text style={styles.coordsLoading}>Acquiring GPS Satellite Lock...</Text>
                ) : (
                  <Text style={styles.coordsText}>
                    {coords?.latitude.toFixed(5)}°N, {coords?.longitude.toFixed(5)}°E
                    {coords?.accuracy ? ` (±${Math.round(coords.accuracy)}m)` : ''}
                  </Text>
                )}
              </View>
            </View>

            {/* Quick Suggestion Chips */}
            <Text style={styles.inputLabel}>QUICK PRESETS</Text>
            <View style={styles.chipsRow}>
              {SUGGESTIONS.map((sug) => (
                <TouchableOpacity
                  key={sug}
                  style={[styles.chip, title === sug && styles.chipActive]}
                  onPress={() => setTitle(sug)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.chipText, title === sug && styles.chipTextActive]}>
                    {sug}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Spot Title Input */}
            <Text style={styles.inputLabel}>SPOT NAME</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Master Bedroom Balcony"
              placeholderTextColor="#475569"
              value={title}
              onChangeText={setTitle}
              maxLength={40}
            />

            {/* Notes Input */}
            <Text style={styles.inputLabel}>OPTIONAL NOTES</Text>
            <TextInput
              style={[styles.textInput, styles.notesInput]}
              placeholder="e.g. Strong 5G SA connection, best for downloads"
              placeholderTextColor="#475569"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={2}
              maxLength={120}
            />

            {/* Save Button */}
            <TouchableOpacity
              style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
              onPress={handleSavePress}
              disabled={isSaving}
              activeOpacity={0.8}
            >
              {isSaving ? (
                <ActivityIndicator color="#090D14" />
              ) : (
                <View style={styles.saveContent}>
                  <Check size={18} color="#090D14" strokeWidth={2.5} />
                  <Text style={styles.saveButtonText}>CONFIRM & SAVE SPOT</Text>
                </View>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
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
    maxHeight: '85%',
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
  headerIconWrapper: {
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
  closeButton: {
    padding: 6,
  },
  snapshotCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    marginBottom: 18,
  },
  snapshotTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  operatorCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  operatorText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  scorePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  scorePillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  coordsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  coordsLoading: {
    color: '#94A3B8',
    fontSize: 10,
    fontStyle: 'italic',
  },
  coordsText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  inputLabel: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 4,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  chipActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#10B981',
  },
  chipText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#10B981',
    fontWeight: '700',
  },
  textInput: {
    backgroundColor: '#161F30',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 14,
  },
  notesInput: {
    height: 60,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    backgroundColor: '#059669',
    opacity: 0.7,
  },
  saveContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  saveButtonText: {
    color: '#090D14',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
});

// ==============================================================================
// File: src/components/SettingsModal.tsx
// Purpose: Minimalist Modern Settings, App Preferences & Data Backup/Restore Modal.
// 20-year veteran principal designer aesthetic: Obsidian theme, titanium typography,
// JSON/CSV export, backup restore, unit switcher, and database management.
// Har line par detailed comment diya gaya hai.
// ==============================================================================

import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import {
  X,
  Settings,
  Share2,
  FileSpreadsheet,
  Download,
  Trash2,
  Sliders,
  Check,
  Smartphone,
  Shield,
  Layers,
} from 'lucide-react-native';
import { NetworkPoint } from '../types/telephony';
import {
  exportPointsToJson,
  exportPointsToCsv,
  importPointsFromJsonString,
} from '../services/backupService';
import { clearAllNetworkPoints } from '../services/databaseService';

interface SettingsModalProps {
  // Modal visibility
  visible: boolean;
  // All saved 5G points in database
  savedPoints: NetworkPoint[];
  // Close modal callback
  onClose: () => void;
  // Reload database points callback
  onRefreshPoints: () => Promise<void>;
  // Unit mode state & setter
  distanceUnit: 'inches_cm' | 'metric';
  onToggleDistanceUnit: (mode: 'inches_cm' | 'metric') => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  visible,
  savedPoints,
  onClose,
  onRefreshPoints,
  distanceUnit,
  onToggleDistanceUnit,
}) => {
  // Import JSON input box state
  const [isImportOpen, setIsImportOpen] = useState<boolean>(false);
  const [jsonInput, setJsonInput] = useState<string>('');

  // Handle Export JSON
  const handleExportJson = async () => {
    await exportPointsToJson(savedPoints);
  };

  // Handle Export CSV
  const handleExportCsv = async () => {
    await exportPointsToCsv(savedPoints);
  };

  // Handle Import JSON
  const handleImportJson = async () => {
    if (!jsonInput.trim()) {
      Alert.alert('Empty Input', 'Kripya pehle JSON backup data paste karein.');
      return;
    }

    const count = await importPointsFromJsonString(
      jsonInput,
      savedPoints,
      onRefreshPoints
    );

    if (count > 0) {
      setJsonInput('');
      setIsImportOpen(false);
    }
  };

  // Handle Clear Database
  const handleClearDatabase = () => {
    if (savedPoints.length === 0) {
      Alert.alert('Database Empty', 'Delete karne ke liye koi spots nahi hain.');
      return;
    }

    Alert.alert(
      'Reset All 5G Spots?',
      `Aapke SQLite database me se sabhi ${savedPoints.length} saved 5G spots permanently delete ho jayenge. Kya aap sure hain?`,
      [
        { text: 'CANCEL', style: 'cancel' },
        {
          text: 'DELETE ALL',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllNetworkPoints();
              await onRefreshPoints();
              Alert.alert('Database Cleared', 'Saare saved 5G spots successfully delete ho gaye.');
            } catch (e) {
              console.error('Failed to clear database:', e);
            }
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* 1. Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Settings size={18} color="#10B981" />
              <Text style={styles.headerTitle}>App Preferences & Backup</Text>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              activeOpacity={0.7}
            >
              <X size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* 2. Unit & Navigation Preferences */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>MEASUREMENT UNITS</Text>

              <View style={styles.card}>
                <View style={styles.preferenceRow}>
                  <View>
                    <Text style={styles.preferenceTitle}>Spatial Range Units</Text>
                    <Text style={styles.preferenceSub}>
                      Micro-sweep and radar distance scale
                    </Text>
                  </View>

                  {/* Segmented Switcher */}
                  <View style={styles.segmentedControl}>
                    <TouchableOpacity
                      style={[
                        styles.segmentButton,
                        distanceUnit === 'inches_cm' && styles.segmentButtonActive,
                      ]}
                      onPress={() => onToggleDistanceUnit('inches_cm')}
                    >
                      <Text
                        style={[
                          styles.segmentText,
                          distanceUnit === 'inches_cm' && styles.segmentTextActive,
                        ]}
                      >
                        INCH / CM
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.segmentButton,
                        distanceUnit === 'metric' && styles.segmentButtonActive,
                      ]}
                      onPress={() => onToggleDistanceUnit('metric')}
                    >
                      <Text
                        style={[
                          styles.segmentText,
                          distanceUnit === 'metric' && styles.segmentTextActive,
                        ]}
                      >
                        METERS / FT
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>

            {/* 3. Data Backup & Export Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionLabel}>DATA BACKUP & SHARING</Text>
                <Text style={styles.savedBadgeText}>
                  {savedPoints.length} SPOTS IN SQLITE
                </Text>
              </View>

              <View style={styles.card}>
                {/* Export JSON */}
                <TouchableOpacity
                  style={styles.actionRow}
                  onPress={handleExportJson}
                  activeOpacity={0.7}
                >
                  <View style={styles.actionLeft}>
                    <View style={[styles.iconCircle, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
                      <Share2 size={16} color="#10B981" />
                    </View>
                    <View>
                      <Text style={styles.actionTitle}>Export Spots (JSON)</Text>
                      <Text style={styles.actionSub}>
                        Full backup to WhatsApp, Drive or Email
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.actionLinkText}>SHARE</Text>
                </TouchableOpacity>

                {/* Export CSV */}
                <TouchableOpacity
                  style={[styles.actionRow, styles.borderTop]}
                  onPress={handleExportCsv}
                  activeOpacity={0.7}
                >
                  <View style={styles.actionLeft}>
                    <View style={[styles.iconCircle, { backgroundColor: 'rgba(6, 182, 212, 0.12)' }]}>
                      <FileSpreadsheet size={16} color="#06B6D4" />
                    </View>
                    <View>
                      <Text style={styles.actionTitle}>Export Spreadsheet (CSV)</Text>
                      <Text style={styles.actionSub}>
                        Open 5G RF metrics in Excel or Sheets
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.actionLinkText, { color: '#06B6D4' }]}>
                    EXPORT
                  </Text>
                </TouchableOpacity>

                {/* Import JSON Toggle */}
                <TouchableOpacity
                  style={[styles.actionRow, styles.borderTop]}
                  onPress={() => setIsImportOpen(!isImportOpen)}
                  activeOpacity={0.7}
                >
                  <View style={styles.actionLeft}>
                    <View style={[styles.iconCircle, { backgroundColor: 'rgba(139, 92, 246, 0.12)' }]}>
                      <Download size={16} color="#8B5CF6" />
                    </View>
                    <View>
                      <Text style={styles.actionTitle}>Import 5G Spots</Text>
                      <Text style={styles.actionSub}>
                        Paste JSON backup text to restore
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.actionLinkText, { color: '#8B5CF6' }]}>
                    {isImportOpen ? 'HIDE' : 'RESTORE'}
                  </Text>
                </TouchableOpacity>

                {/* Expandable Import Input Box */}
                {isImportOpen && (
                  <View style={styles.importBox}>
                    <TextInput
                      style={styles.importInput}
                      placeholder="Paste JSON backup text here..."
                      placeholderTextColor="#475569"
                      multiline
                      numberOfLines={4}
                      value={jsonInput}
                      onChangeText={setJsonInput}
                    />

                    <TouchableOpacity
                      style={styles.importConfirmButton}
                      onPress={handleImportJson}
                    >
                      <Check size={14} color="#090D14" strokeWidth={2.5} />
                      <Text style={styles.importConfirmText}>CONFIRM IMPORT</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>

            {/* 4. Diagnostic Engine Specs */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>SYSTEM SPECIFICATIONS</Text>

              <View style={styles.card}>
                <View style={styles.specRow}>
                  <View style={styles.specLabelRow}>
                    <Shield size={13} color="#64748B" />
                    <Text style={styles.specLabel}>Radio Standard</Text>
                  </View>
                  <Text style={styles.specVal}>3GPP Release 16 (NR-SA/NSA)</Text>
                </View>

                <View style={[styles.specRow, styles.borderTop]}>
                  <View style={styles.specLabelRow}>
                    <Layers size={13} color="#64748B" />
                    <Text style={styles.specLabel}>Persistence</Text>
                  </View>
                  <Text style={styles.specVal}>Offline SQLite WAL Mode</Text>
                </View>

                <View style={[styles.specRow, styles.borderTop]}>
                  <View style={styles.specLabelRow}>
                    <Smartphone size={13} color="#64748B" />
                    <Text style={styles.specLabel}>Runtime Stack</Text>
                  </View>
                  <Text style={styles.specVal}>Expo SDK 57 • React 19</Text>
                </View>
              </View>
            </View>

            {/* 5. Danger Zone */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: '#F43F5E' }]}>
                DANGER ZONE
              </Text>

              <View style={[styles.card, { borderColor: 'rgba(244, 63, 94, 0.25)' }]}>
                <TouchableOpacity
                  style={styles.actionRow}
                  onPress={handleClearDatabase}
                  activeOpacity={0.7}
                >
                  <View style={styles.actionLeft}>
                    <View style={[styles.iconCircle, { backgroundColor: 'rgba(244, 63, 94, 0.12)' }]}>
                      <Trash2 size={16} color="#F43F5E" />
                    </View>
                    <View>
                      <Text style={[styles.actionTitle, { color: '#F43F5E' }]}>
                        Reset Database
                      </Text>
                      <Text style={styles.actionSub}>
                        Permanently wipe all saved 5G spots
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.actionLinkText, { color: '#F43F5E' }]}>
                    CLEAR
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0F1523',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 36,
    maxHeight: '92%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  sectionLabel: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  savedBadgeText: {
    color: '#10B981',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#090D14',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  preferenceTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  preferenceSub: {
    color: '#64748B',
    fontSize: 10,
    marginTop: 2,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#0F1523',
    borderRadius: 10,
    padding: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  segmentButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  segmentButtonActive: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  segmentText: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  segmentTextActive: {
    color: '#10B981',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  actionSub: {
    color: '#64748B',
    fontSize: 10,
    marginTop: 2,
  },
  actionLinkText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  borderTop: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.04)',
  },
  importBox: {
    paddingTop: 10,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  importInput: {
    backgroundColor: '#0F1523',
    borderRadius: 12,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 11,
    minHeight: 80,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 10,
  },
  importConfirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    borderRadius: 10,
    paddingVertical: 10,
    gap: 6,
  },
  importConfirmText: {
    color: '#090D14',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  specLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  specLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  specVal: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});

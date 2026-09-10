// ==============================================================================
// File: src/services/backupService.ts
// Purpose: 5G Spots Backup, JSON/CSV Export and Import Engine.
// Pure React Native & Expo Go compatible: Zero native build dependencies.
// Har line par detailed comment diya gaya hai taaki pure logic ko asani se samjha ja sake.
// ==============================================================================

import { Share, Alert } from 'react-native';
import { NetworkPoint } from '../types/telephony';
import { insertNetworkPoint } from './databaseService';

/**
 * Saare saved 5G network points ko formatted JSON string me convert karke share karta hai
 */
export async function exportPointsToJson(points: NetworkPoint[]): Promise<boolean> {
  if (points.length === 0) {
    Alert.alert('No Data to Export', 'Aapke paas abhi koi saved 5G spots nahi hain.');
    return false;
  }

  try {
    const exportPayload = {
      app: '5G Network Finder & Coverage Radar',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      totalSpots: points.length,
      spots: points,
    };

    const jsonString = JSON.stringify(exportPayload, null, 2);

    await Share.share({
      title: '5G_Radar_Backup.json',
      message: jsonString,
    });

    return true;
  } catch (error) {
    console.error('Failed to share JSON backup:', error);
    Alert.alert('Export Failed', 'Backup share karte waqt error aaya.');
    return false;
  }
}

/**
 * Saare saved 5G network points ko Excel / Spreadsheet compatible CSV format me export karta hai
 */
export async function exportPointsToCsv(points: NetworkPoint[]): Promise<boolean> {
  if (points.length === 0) {
    Alert.alert('No Data to Export', 'Aapke paas abhi koi saved 5G spots nahi hain.');
    return false;
  }

  try {
    // CSV Header row
    const headers = [
      'Title',
      'Operator',
      'Generation',
      'Score',
      'QualityLevel',
      'RSRP_dBm',
      'SINR_dB',
      'RSRQ_dB',
      'Latency_ms',
      'Download_Mbps',
      'Latitude',
      'Longitude',
      'Notes',
      'CreatedAt',
    ];

    // CSV Rows
    const rows = points.map((p) => {
      const escape = (val: any) => `"${String(val ?? '').replace(/"/g, '""')}"`;
      return [
        escape(p.title),
        escape(p.operator),
        escape(p.generation),
        p.score,
        escape(p.qualityLevel),
        p.rsrpDbm,
        p.sinrDb,
        p.rsrqDb,
        p.latencyMs,
        p.downloadMbps ?? '',
        p.coordinates.latitude,
        p.coordinates.longitude,
        escape(p.notes || ''),
        escape(new Date(p.createdAt).toISOString()),
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');

    await Share.share({
      title: '5G_Radar_Report.csv',
      message: csvContent,
    });

    return true;
  } catch (error) {
    console.error('Failed to export CSV report:', error);
    Alert.alert('Export Failed', 'CSV file generate karte waqt error aaya.');
    return false;
  }
}

/**
 * JSON text string ko parse karke naye 5G spots ko SQLite me import karta hai
 */
export async function importPointsFromJsonString(
  jsonString: string,
  existingPoints: NetworkPoint[],
  onSuccess: () => Promise<void>
): Promise<number> {
  try {
    const parsed = JSON.parse(jsonString.trim());
    const incomingSpots: any[] = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed?.spots)
      ? parsed.spots
      : [];

    if (incomingSpots.length === 0) {
      Alert.alert('Invalid Format', 'JSON file me koi valid 5G spots nahi mile.');
      return 0;
    }

    const existingIds = new Set(existingPoints.map((p) => p.id));
    let importedCount = 0;

    for (const item of incomingSpots) {
      // Basic schema validation
      if (!item.title || item.score === undefined || !item.coordinates) {
        continue;
      }

      // Unique ID guarantee
      const id = existingIds.has(item.id) || !item.id
        ? `spot_imp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
        : item.id;

      const point: NetworkPoint = {
        id,
        title: item.title,
        notes: item.notes || 'Imported via backup',
        operator: item.operator || 'Jio True 5G',
        generation: item.generation || '5G_NR_SA',
        rsrpDbm: typeof item.rsrpDbm === 'number' ? item.rsrpDbm : -85,
        sinrDb: typeof item.sinrDb === 'number' ? item.sinrDb : 15,
        rsrqDb: typeof item.rsrqDb === 'number' ? item.rsrqDb : -11,
        score: typeof item.score === 'number' ? item.score : 80,
        qualityLevel: item.qualityLevel || 'GOOD',
        colorHex: item.colorHex || '#10B981',
        coordinates: {
          latitude: Number(item.coordinates.latitude) || 0,
          longitude: Number(item.coordinates.longitude) || 0,
          altitude: item.coordinates.altitude ?? null,
          accuracy: item.coordinates.accuracy ?? null,
        },
        latencyMs: typeof item.latencyMs === 'number' ? item.latencyMs : 20,
        downloadMbps: item.downloadMbps ? Number(item.downloadMbps) : undefined,
        uploadMbps: item.uploadMbps ? Number(item.uploadMbps) : undefined,
        createdAt: typeof item.createdAt === 'number' ? item.createdAt : Date.now(),
      };

      await insertNetworkPoint(point);
      existingIds.add(id);
      importedCount++;
    }

    await onSuccess();

    Alert.alert(
      'Import Successful!',
      `${importedCount} naye 5G spots aapke local SQLite radar database me add ho gaye hain.`
    );

    return importedCount;
  } catch (error) {
    console.error('Failed to import JSON points:', error);
    Alert.alert('Import Failed', 'JSON parsing error. Kripya valid JSON text paste karein.');
    return 0;
  }
}

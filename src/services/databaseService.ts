// ==============================================================================
// File: src/services/databaseService.ts
// Purpose: Offline SQLite Database Persistence Layer for 5G Network Points
// 100% offline-first: App band hone ke baad bhi saare saved 5G spots safe rahenge.
// Har line par detailed comment diya gaya hai.
// ==============================================================================

import * as SQLite from 'expo-sqlite';
import { NetworkPoint } from '../types/telephony';

// Database instance reference
let dbInstance: SQLite.SQLiteDatabase | null = null;

/**
 * Database connection initialize karta hai aur network_points table banata hai
 */
export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  // Agar pehle se open hai toh wahi instance return karte hain
  if (dbInstance) {
    return dbInstance;
  }

  // Modern Expo SQLite async connection open karte hain
  dbInstance = await SQLite.openDatabaseAsync('5g_radar.db');

  // network_points table create karte hain agar exist na karti ho
  await dbInstance.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS network_points (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      notes TEXT,
      operator TEXT NOT NULL,
      generation TEXT NOT NULL,
      rsrp_dbm REAL NOT NULL,
      sinr_db REAL NOT NULL,
      rsrq_db REAL NOT NULL,
      score INTEGER NOT NULL,
      quality_level TEXT NOT NULL,
      color_hex TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      altitude REAL,
      accuracy REAL,
      latency_ms REAL NOT NULL,
      download_mbps REAL,
      upload_mbps REAL,
      created_at INTEGER NOT NULL
    );
  `);

  // Safe backward compatibility migrations for existing SQLite databases
  try {
    await dbInstance.execAsync(`ALTER TABLE network_points ADD COLUMN download_mbps REAL;`);
  } catch {}
  try {
    await dbInstance.execAsync(`ALTER TABLE network_points ADD COLUMN upload_mbps REAL;`);
  } catch {}

  return dbInstance;
}

/**
 * Naya 5G Signal Point SQLite database me insert karta hai
 */
export async function insertNetworkPoint(point: NetworkPoint): Promise<void> {
  const db = await getDatabase();

  await db.runAsync(
    `INSERT INTO network_points (
      id, title, notes, operator, generation, rsrp_dbm, sinr_db, rsrq_db,
      score, quality_level, color_hex, latitude, longitude, altitude, accuracy,
      latency_ms, download_mbps, upload_mbps, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      point.id,
      point.title,
      point.notes || '',
      point.operator,
      point.generation,
      point.rsrpDbm,
      point.sinrDb,
      point.rsrqDb,
      point.score,
      point.qualityLevel,
      point.colorHex,
      point.coordinates.latitude,
      point.coordinates.longitude,
      point.coordinates.altitude ?? null,
      point.coordinates.accuracy ?? null,
      point.latencyMs,
      point.downloadMbps ?? null,
      point.uploadMbps ?? null,
      point.createdAt,
    ]
  );
}

/**
 * Saare saved 5G network points fetch karta hai (newest first)
 */
export async function fetchAllNetworkPoints(): Promise<NetworkPoint[]> {
  const db = await getDatabase();

  const rows = await db.getAllAsync<any>(
    `SELECT * FROM network_points ORDER BY created_at DESC;`
  );

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    notes: row.notes,
    operator: row.operator,
    generation: row.generation,
    rsrpDbm: row.rsrp_dbm,
    sinrDb: row.sinr_db,
    rsrqDb: row.rsrq_db,
    score: row.score,
    qualityLevel: row.quality_level,
    colorHex: row.color_hex,
    coordinates: {
      latitude: row.latitude,
      longitude: row.longitude,
      altitude: row.altitude,
      accuracy: row.accuracy,
    },
    latencyMs: row.latency_ms,
    downloadMbps: row.download_mbps ?? undefined,
    uploadMbps: row.upload_mbps ?? undefined,
    createdAt: row.created_at,
  }));
}

/**
 * Kisi specific 5G point ko database se delete karta hai
 */
export async function deleteNetworkPoint(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(`DELETE FROM network_points WHERE id = ?;`, [id]);
}

/**
 * Saved 5G spot par speed test benchmark metrics attach karta hai
 */
export async function updateSpotSpeedBenchmark(
  id: string,
  downloadMbps: number,
  uploadMbps: number
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE network_points SET download_mbps = ?, upload_mbps = ? WHERE id = ?;`,
    [downloadMbps, uploadMbps, id]
  );
}

/**
 * Saved 5G spot ko live re-verification metrics ke sath update karta hai
 */
export async function updateSpotBenchmarkMetrics(
  id: string,
  metrics: {
    rsrpDbm: number;
    sinrDb: number;
    rsrqDb: number;
    score: number;
    qualityLevel: string;
    colorHex: string;
    latencyMs: number;
  }
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE network_points SET
      rsrp_dbm = ?,
      sinr_db = ?,
      rsrq_db = ?,
      score = ?,
      quality_level = ?,
      color_hex = ?,
      latency_ms = ?,
      created_at = ?
    WHERE id = ?;`,
    [
      metrics.rsrpDbm,
      metrics.sinrDb,
      metrics.rsrqDb,
      metrics.score,
      metrics.qualityLevel,
      metrics.colorHex,
      metrics.latencyMs,
      Date.now(),
      id,
    ]
  );
}

/**
 * Highest 5G score wala best spot retrieve karta hai
 */
export async function fetchBest5GPoint(): Promise<NetworkPoint | null> {
  const db = await getDatabase();

  const row = await db.getFirstAsync<any>(
    `SELECT * FROM network_points ORDER BY score DESC LIMIT 1;`
  );

  if (!row) return null;

  return {
    id: row.id,
    title: row.title,
    notes: row.notes,
    operator: row.operator,
    generation: row.generation,
    rsrpDbm: row.rsrp_dbm,
    sinrDb: row.sinr_db,
    rsrqDb: row.rsrq_db,
    score: row.score,
    qualityLevel: row.quality_level,
    colorHex: row.color_hex,
    coordinates: {
      latitude: row.latitude,
      longitude: row.longitude,
      altitude: row.altitude,
      accuracy: row.accuracy,
    },
    latencyMs: row.latency_ms,
    downloadMbps: row.download_mbps ?? undefined,
    uploadMbps: row.upload_mbps ?? undefined,
    createdAt: row.created_at,
  };
}


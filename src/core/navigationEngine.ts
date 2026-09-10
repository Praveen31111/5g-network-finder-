// ==============================================================================
// File: src/core/navigationEngine.ts
// Purpose: Mathematical Trigonometry & Geodesic Navigation Engine
// Calculates Haversine distance down to centimeters, Bearing angles, and Compass heading.
// Har line par detailed comment diya gaya hai.
// ==============================================================================

/**
 * Degrees ko Radians me convert karta hai
 */
function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Radians ko Degrees me convert karta hai
 */
function toDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

/**
 * Haversine Formula: Do GPS coordinates ke beech ka exact distance (meters me) nikalta hai
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  // Earth radius in meters (WGS-84 standard)
  const R = 6371000;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

/**
 * Point 1 se Point 2 tak ka compass bearing angle calculate karta hai (0° to 360°)
 */
export function calculateBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const phi1 = toRadians(lat1);
  const phi2 = toRadians(lat2);
  const deltaLambda = toRadians(lon2 - lon1);

  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);

  const theta = Math.atan2(y, x);
  const bearing = (toDegrees(theta) + 360) % 360;

  return bearing;
}

/**
 * Target bearing aur device compass heading ke beech ka relative rotation angle nikalta hai
 */
export function calculateRelativeHeading(
  targetBearing: number,
  compassHeading: number
): number {
  return (targetBearing - compassHeading + 360) % 360;
}

export type DistanceUnit = 'metric' | 'inches_cm';

/**
 * Distance ko Inches, Centimeters, Feet, aur Meters me convert karta hai
 */
export function formatPrecisionDistance(
  meters: number,
  unitMode: DistanceUnit = 'inches_cm'
): {
  value: string;
  unit: string;
  secondaryText?: string;
  isCloseRange: boolean;
  isCentimeterRange: boolean;
  isInchRange: boolean;
} {
  // Agar user ne Inches/CM mode select kiya ho aur distance 1 meter se kam ho
  if (unitMode === 'inches_cm' && meters < 1) {
    const totalInches = Math.max(Math.round(meters * 39.3701), 2);
    const cm = Math.max(Math.round(meters * 100), 5);

    return {
      value: `${totalInches}`,
      unit: 'in',
      secondaryText: `${cm} cm`,
      isCloseRange: true,
      isCentimeterRange: true,
      isInchRange: true,
    };
  }

  // 1 meter se 3 meter ke beech (Feet & Meters display)
  if (unitMode === 'inches_cm' && meters < 3) {
    const feet = (meters * 3.28084).toFixed(1);
    return {
      value: feet,
      unit: 'ft',
      secondaryText: `${meters.toFixed(1)} m`,
      isCloseRange: true,
      isCentimeterRange: false,
      isInchRange: false,
    };
  }

  // Standard Metric formatting
  if (meters < 1) {
    const cm = Math.max(Math.round(meters * 100), 5);
    const inches = Math.round(cm / 2.54);
    return {
      value: `${cm}`,
      unit: 'cm',
      secondaryText: `${inches} in`,
      isCloseRange: true,
      isCentimeterRange: true,
      isInchRange: false,
    };
  } else if (meters < 10) {
    return {
      value: meters.toFixed(1),
      unit: 'm',
      secondaryText: `${(meters * 3.28084).toFixed(1)} ft`,
      isCloseRange: true,
      isCentimeterRange: false,
      isInchRange: false,
    };
  } else if (meters < 1000) {
    return {
      value: `${Math.round(meters)}`,
      unit: 'm',
      isCloseRange: false,
      isCentimeterRange: false,
      isInchRange: false,
    };
  } else {
    return {
      value: (meters / 1000).toFixed(2),
      unit: 'km',
      isCloseRange: false,
      isCentimeterRange: false,
      isInchRange: false,
    };
  }
}

/**
 * 3D Spatial Arm Wave Sweep result structure
 */
export interface SpatialSweepResult {
  displacementInches: number;
  displacementCm: number;
  directionLabel: string;
  isPeakDetected: boolean;
  recommendation: string;
}

/**
 * Khade hokar hath se phone 4-10 inch hilane par spatial signal evaluation karta hai
 */
export function evaluateSpatialSweep(
  accelMagnitude: number,
  deltaRsrp: number,
  currentRsrp: number
): SpatialSweepResult {
  // Accelerometer movement magnitude to approximate inches (4 to 12 inches)
  const displacementCm = Math.min(Math.max(Math.round(accelMagnitude * 20), 4), 30);
  const displacementInches = Math.max(Math.round(displacementCm / 2.54), 2);

  const isPeak = currentRsrp >= -80 || deltaRsrp >= 3;

  let recommendation = '';
  if (deltaRsrp >= 2) {
    recommendation = `Aapke aage ${displacementInches} inch (${displacementCm} cm) par signal best hai (+${deltaRsrp} dBm)!`;
  } else if (deltaRsrp <= -2) {
    recommendation = `Aage ${displacementInches} inch par signal weak hai (${deltaRsrp} dBm). Peeche hato.`;
  } else {
    recommendation = `Is ${displacementInches}-inch zone me signal steady hai. Window ki taraf 4 inch badhao.`;
  }

  return {
    displacementInches,
    displacementCm,
    directionLabel: deltaRsrp >= 0 ? 'FORWARD (WINDOW)' : 'BACKWARD (NOISY)',
    isPeakDetected: isPeak,
    recommendation,
  };
}

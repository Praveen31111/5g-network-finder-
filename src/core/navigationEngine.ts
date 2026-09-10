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

/**
 * Distance ko human-friendly format me convert karta hai (Centimeters, Meters, Kilometers)
 */
export function formatPrecisionDistance(meters: number): {
  value: string;
  unit: string;
  isCloseRange: boolean;
  isCentimeterRange: boolean;
} {
  if (meters < 1) {
    // 1 meter se kam par centimeters dikhate hain!
    const cm = Math.max(Math.round(meters * 100), 5);
    return {
      value: `${cm}`,
      unit: 'cm',
      isCloseRange: true,
      isCentimeterRange: true,
    };
  } else if (meters < 10) {
    // 10 meter se kam par exact 1 decimal point meter
    return {
      value: meters.toFixed(1),
      unit: 'm',
      isCloseRange: true,
      isCentimeterRange: false,
    };
  } else if (meters < 1000) {
    return {
      value: `${Math.round(meters)}`,
      unit: 'm',
      isCloseRange: false,
      isCentimeterRange: false,
    };
  } else {
    // 1 km se zyada par kilometers
    return {
      value: (meters / 1000).toFixed(2),
      unit: 'km',
      isCloseRange: false,
      isCentimeterRange: false,
    };
  }
}

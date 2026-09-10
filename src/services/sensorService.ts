// ==============================================================================
// File: src/services/sensorService.ts
// Purpose: Hardware Sensors Integration (Magnetometer Compass, Motion, and Haptics)
// Powers the live rotating compass needle and centimeter-level Geiger counter feedback.
// Har line par detailed comment diya gaya hai.
// ==============================================================================

import { Magnetometer, Accelerometer } from 'expo-sensors';
import * as Haptics from 'expo-haptics';

/**
 * Phone ke Magnetometer sensor se live compass azimuth heading listen karta hai (0° to 360°)
 */
export function subscribeToCompass(
  onHeadingChange: (heading: number) => void
): { unsubscribe: () => void } {
  // Update interval 100ms set karte hain for buttery smooth needle rotation
  Magnetometer.setUpdateInterval(100);

  const subscription = Magnetometer.addListener((data) => {
    let { x, y } = data;
    // Compass angle formula in degrees
    let angle = Math.atan2(y, x) * (180 / Math.PI);

    // Normalize angle to 0° - 360° range
    if (angle < 0) {
      angle = angle + 360;
    }

    onHeadingChange(Math.round(angle));
  });

  return {
    unsubscribe: () => subscription.remove(),
  };
}

/**
 * Phone ke Accelerometer sensor se indoor micro-displacement / steps listen karta hai
 */
export function subscribeToMicroMotion(
  onMotionDelta: (displacementMagnitude: number) => void
): { unsubscribe: () => void } {
  // Motion sampling interval
  Accelerometer.setUpdateInterval(150);

  let lastX = 0,
    lastY = 0,
    lastZ = 0;

  const subscription = Accelerometer.addListener((data) => {
    const deltaX = Math.abs(data.x - lastX);
    const deltaY = Math.abs(data.y - lastY);
    const deltaZ = Math.abs(data.z - lastZ);

    const magnitude = deltaX + deltaY + deltaZ;

    lastX = data.x;
    lastY = data.y;
    lastZ = data.z;

    // Sirf meaningful movement pass karte hain
    if (magnitude > 0.05) {
      onMotionDelta(magnitude);
    }
  });

  return {
    unsubscribe: () => subscription.remove(),
  };
}

/**
 * Geiger Counter Haptic Feedback trigger karta hai
 */
export async function triggerGeigerTick(intensity: 'light' | 'medium' | 'heavy' = 'light'): Promise<void> {
  try {
    if (intensity === 'heavy') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } else if (intensity === 'medium') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  } catch (error) {
    // Haptics not supported on web/emulator, ignore gracefully
  }
}

/**
 * Peak 5G Sweet Spot Lock notification haptic
 */
export async function triggerSweetSpotLockHaptic(): Promise<void> {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch (error) {
    // Ignore gracefully
  }
}

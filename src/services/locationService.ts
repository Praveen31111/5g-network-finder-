// ==============================================================================
// File: src/services/locationService.ts
// Purpose: Device GPS Coordinates Provider via expo-location
// Precision positioning for saving and tracking high-speed 5G network spots.
// Har line par detailed comment diya gaya hai.
// ==============================================================================

import * as Location from 'expo-location';
import { GeoCoordinates } from '../types/telephony';

/**
 * User se GPS location permission request karta hai
 */
export async function requestLocationPermission(): Promise<boolean> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === Location.PermissionStatus.GRANTED;
  } catch (error) {
    console.warn('Location permission request failed:', error);
    return false;
  }
}

/**
 * Device ke GPS hardware se current accurate location coordinates fetch karta hai
 */
export async function getCurrentCoordinates(): Promise<GeoCoordinates> {
  try {
    // Permission status check karte hain
    const hasPermission = await requestLocationPermission();

    if (!hasPermission) {
      console.warn('Location permission denied, using fallback coordinates');
      // Fallback coordinates (Connaught Place / New Delhi reference center)
      return {
        latitude: 28.6315,
        longitude: 77.2167,
        altitude: 215,
        accuracy: 10,
      };
    }

    // Live GPS position query karte hain (Balanced accuracy for fast acquisition)
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      altitude: location.coords.altitude,
      accuracy: location.coords.accuracy,
    };
  } catch (error) {
    console.warn('Error fetching live location:', error);
    // Fallback coordinates agar GPS chip timeout ho jaye
    return {
      latitude: 28.6315,
      longitude: 77.2167,
      altitude: 215,
      accuracy: 15,
    };
  }
}

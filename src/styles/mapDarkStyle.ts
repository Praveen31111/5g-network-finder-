// ==============================================================================
// File: src/styles/mapDarkStyle.ts
// Purpose: Minimalist Obsidian / Cyber Dark Theme JSON for react-native-maps
// Removes bright visual clutter and creates a luxury dark-mode telemetry aesthetic.
// Har line par detailed comment diya gaya hai.
// ==============================================================================

export const MAP_DARK_STYLE = [
  {
    elementType: 'geometry',
    stylers: [{ color: '#0B0F19' }],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ color: '#8F9CAE' }],
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#0B0F19' }],
  },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#CBD5E1' }],
  },
  {
    featureType: 'poi',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#161F30' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1E293B' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#64748B' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#1E293B' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#090D14' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#111827' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#060910' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#334155' }],
  },
];

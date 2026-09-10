// ==============================================================================
// File: index.ts
// Purpose: Application ka primary entry point jo React Native / Expo runtime ko
// App component ke sath bind karta hai.
// Har line par comment diya gaya hai.
// ==============================================================================

// Expo package se root component registration function import karte hain
import { registerRootComponent } from 'expo';

// Hamara main App component import karte hain
import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// Yeh ensure karta hai ki chahe app Expo Go mein chale ya standalone APK mein,
// environment properly initialize ho jaye.
registerRootComponent(App);

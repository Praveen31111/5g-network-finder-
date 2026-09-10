# 📡 5G Network Finder & Coverage Radar — Master Step-by-Step Plan

Yeh document is pure project ka **Master Step-by-Step Implementation Guide** hai. Isme aapki har ek requirement aur guideline shamil hai taaki hum step-by-step bina kisi confusion ke kaam kar sakein.

---

## 🔒 Rules & Constraints (Jo Hamesha Follow Honge)

1. **🚫 Zero Unauthorized Browser**: Koi bhi browser window ya browser tool bina aapki direct permission ke kabhi open nahi hoga.
2. **📝 100% Line-by-Line Code Comments**: Har ek file ke andar likha gaya code detailed comments ke sath hoga, taaki aap asani se samajh sakein ki har ek line kya kaam kar rahi hai.
3. **💻 Zero Local Android Studio Setup**: Computer par Android Studio ya kisi heavy software ki koi zaroorat nahi hai. Hum **Pure React Native (Expo SDK 54)** par kaam karenge. 
   - Testing ke liye aapke phone mein sirf **Expo Go** app chalegi via terminal QR code.
   - APK ke liye **Expo EAS Cloud Build** use hoga jo 1 terminal command se cloud par APK banata hai.
4. **🚀 Terminal-First GitHub Workflow**: Code ko aap apne terminal se hi GitHub par push karenge. Har step par exact git commands bataye jayenge.

---

## 🐙 Terminal Se GitHub Par Code Push Karne Ka Step-by-Step Guide

Aap apne terminal mein ye commands run karke code ko GitHub par bhej sakte hain:

### Step 1: Git Status Check Karein
```powershell
git status
```
*(Yeh check karega ki kaun-kaun si nayi files add hui hain ya change hui hain).*

### Step 2: Git Repository Initialize Karein (Agar pehli bar kar rahe hain)
```powershell
git init
```

### Step 3: Sari Files Ko Stage Karein
```powershell
git add .
```

### Step 4: Commit Karein
```powershell
git commit -m "feat: setup project structure and step-by-step plan"
```

### Step 5: Default Branch 'main' Set Karein
```powershell
git branch -M main
```

### Step 6: GitHub Remote Repository Link Karein
*(GitHub.com par jakar ek new empty repository banayein jaise `5g-network-finder`, fir uska link yahan dalein):*
```powershell
git remote add origin https://github.com/<YOUR_USERNAME>/<YOUR_REPOSITORY_NAME>.git
```

### Step 7: GitHub Par Code Push Karein
```powershell
git push -u origin main
```

*(Agli bar jab bhi code push karna hoga, sirf `git add .`, `git commit -m "your message"`, aur `git push` karna hoga).*

---

## 🏗️ Step-by-Step Chunk Roadmap & Progress Tracker

- [x] **Chunk 1: Project Foundation, Expo Setup & 5G Scoring Engine**
  - Project config (`package.json`, `app.json`, `tsconfig.json`, `.gitignore`).
  - Strict TypeScript interfaces for 5G metrics (`RSRP`, `RSRQ`, `SINR`, `Operator`).
  - Mathematical 5G Scoring Engine (`0 - 100` score calculator).
  - Cross-platform 5G Telemetry Provider (Expo Go live sensor & diagnostic mode + Native bridge config).
  - *Verification*: Terminal typecheck (`npx tsc --noEmit`) PASSED with 0 errors!

- [x] **Chunk 2: Minimalist Modern HUD Dashboard (Senior Designer Polish)**
  - Precision SVG circular 5G health gauge with dynamic multi-color arc (`ScoreGauge.tsx`).
  - Seamless iOS-style segmented operator switcher with SA/NSA badge (`OperatorSelector.tsx`).
  - 2x2 Precision radio cards with linear micro-progress tracks for RSRP, SINR, RSRQ, and Latency (`MetricCard.tsx`).
  - Radio hardware ribbon displaying Frequency Band n78, Cell ID (PCI), and 5G SA Core (`HardwareStrip.tsx`).
  - Minimalist top bar with live emerald beacon pulse (`Header.tsx`).
  - Bottom thumb-friendly action bar (`ActionBar.tsx`).
  - *Verification*: Terminal typecheck (`npx tsc --noEmit`) PASSED with 0 errors!

- [x] **Chunk 3: SQLite Persistence Layer & "Save 5G Point" Flow**
  - Local `expo-sqlite` database (`network_points` table) with WAL mode (`databaseService.ts`).
  - GPS Coordinate grabber via `expo-location` (`locationService.ts`).
  - "Save 5G Radar Spot" Bottom Sheet modal with presets (`SaveSpotModal.tsx`).
  - "Saved 5G Spots" list modal with score badges, RF metrics & delete actions (`SavedSpotsList.tsx`).
  - Top header "SPOTS (N)" count badge and ActionBar button wired.
  - *Verification*: Terminal typecheck (`npx tsc --noEmit`) PASSED with 0 errors!

- [x] **Chunk 4: Interactive 5G Coverage Map**
  - High-contrast obsidian dark theme JSON (`mapDarkStyle.ts`).
  - Interactive MapView with custom color-coded 5G score pins (`CoverageMap.tsx`).
  - Operator filter chips (ALL, Jio, Airtel, High-Speed ≥80).
  - Floating detail card with 5G RF metrics, GPS coords, and "Track with Radar" CTA.
  - Minimalist floating bottom navigation bar (`BottomNavBar.tsx` - HUD / MAP / SAVED).
  - *Verification*: Terminal typecheck (`npx tsc --noEmit`) PASSED with 0 errors!

- [x] **Chunk 5: Real-Time Radar, Compass & Micro-Meter/Centimeter 5G Sweep**
  - Haversine distance calculator down to centimeters (`navigationEngine.ts`).
  - Bearing & Azimuth trigonometric calculations with Magnetometer compass heading (`sensorService.ts`).
  - Rotating neon directional arrow pointing directly to saved 5G spot (`RadarCompassView.tsx`).
  - **⚡ Micro-Meter / Centimeter 5G Sweep (Geiger Counter Mode)**:
    - Accelerometer & motion tracking for indoor movement (10cm - 1m micro-steps).
    - Real-time Signal Gradient Vector (🟢 "Signal Improving +X dBm" vs 🔴 "Signal Dropping").
    - Audio/Haptic Pulsing Beacon with `expo-haptics` (vibrations get faster as you approach peak 5G).
    - "Target Peak 5G Sweet Spot Locked" banner and haptic notification when best spot reached.
  - *Verification*: Terminal typecheck (`npx tsc --noEmit`) PASSED with 0 errors!

- [x] **Chunk 6: Zero-Cost Speed & Ping Diagnostic Test**
  - Zero-cost HTTP latency & jitter tester via Edge CDN endpoints (`speedTestService.ts`).
  - Realistic 3GPP RF modulation physics download/upload throughput calculation.
  - Minimalist Luxury Speedometer HUD with dynamic SVG radial arc and digital Mbps counter (`SpeedTestView.tsx`).
  - 4x Metric cards: Ping, Jitter, Download, and Upload.
  - Ability to attach speed test benchmark directly to saved 5G point in SQLite.
  - *Verification*: Terminal typecheck (`npx tsc --noEmit`) PASSED with 0 errors!

- [x] **Chunk 7: Historical Comparison & Arrival Re-Verification**
  - Auto-arrival detection when walking near a saved spot ($\le 15\text{m}$) with proactive HUD beacon banner (`App.tsx`).
  - Mathematical 5G drift analysis engine (`comparisonEngine.ts`) calculating $\Delta$ Score, $\Delta$ RSRP, $\Delta$ SINR, and Latency.
  - Side-by-side comparison modal with physics root-cause diagnosis (Obstacle attenuation, Congestion, or Perfect stability) (`SpotComparisonModal.tsx`).
  - Ability to overwrite and update SQLite baseline with live reading (`databaseService.ts`).
  - "COMPARE" button added to each spot in `SavedSpotsList.tsx`.
  - *Verification*: Terminal typecheck (`npx tsc --noEmit`) PASSED with 0 errors!

- [ ] **Chunk 8: Data Backup, Settings & Export/Import**
  - Export all saved 5G spots to JSON / CSV.
  - Import points to share with friends.
  - Distance unit switcher (Meters / Feet).
  - Sensitivity threshold configurations.
  - *Verification*: Verify exported JSON file.

---

## 🧮 5G Signal Quality Formula Reference

$$\text{Final 5G Score} = (0.50 \times \text{Norm}(RSRP)) + (0.30 \times \text{Norm}(SINR)) + (0.20 \times \text{Norm}(RSRQ))$$

| Metric | Full Form | Good Target | Poor Threshold | Weight in Score |
| :--- | :--- | :--- | :--- | :--- |
| **RSRP** | Reference Signal Received Power | $\ge -80\text{ dBm}$ | $\le -115\text{ dBm}$ | **50%** |
| **SINR** | Signal to Interference & Noise Ratio | $\ge 20\text{ dB}$ | $\le 0\text{ dB}$ | **30%** |
| **RSRQ** | Reference Signal Received Quality | $\ge -10\text{ dB}$ | $\le -19\text{ dB}$ | **20%** |

---

*Is document ko har step par update kiya jayega taaki aapko pata rahe ki kitna kaam ho chuka hai aur aage kya hona hai.*

# 5G Network Finder & Coverage Radar — Expo SDK 54 Architecture & Roadmap

Ek **Senior Mobile Application Architect** ke nazariye se yeh pure app ka ₹0-Cost, High-Performance, Scalable Architecture aur Step-by-Step Chunked Implementation Roadmap hai.

---

## 1. High-Level Technical Architecture & Design Decisions

```
┌────────────────────────────────────────────────────────────────────────┐
│                          PRESENTATION LAYER                            │
│   Expo Router / React Native (TypeScript) + Lucide Icons + Glassmorphism│
│   ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌────────────┐ │
│   │ Live HUD/Radar│ │ InteractiveMap│ │  Saved Points │ │ Navigation │ │
│   └───────┬───────┘ └───────┬───────┘ └───────┬───────┘ └──────┬─────┘ │
└───────────┼─────────────────┼─────────────────┼────────────────┼───────┘
            │                 │                 │                │
┌───────────┴─────────────────┴─────────────────┴────────────────┴───────┐
│                      DOMAIN / BUSINESS LOGIC LAYER                     │
│  ┌─────────────────────────┐  ┌──────────────────────────────────────┐ │
│  │ 5G Scoring Engine       │  │ Geo & Bearing Navigation Engine      │ │
│  │ (RSRP + SINR + RSRQ)    │  │ (Haversine Formula + Azimuth Sensor) │ │
│  └─────────────────────────┘  └──────────────────────────────────────┘ │
│  ┌─────────────────────────┐  ┌──────────────────────────────────────┐ │
│  │ State Store (Zustand)   │  │ Free Ping/Speed Engine (Zero-Cost)   │ │
│  └─────────────────────────┘  └──────────────────────────────────────┘ │
└───────────────────────────┬────────────────────────────────────────────┘
                            │
┌───────────────────────────┴────────────────────────────────────────────┐
│                       DATA & HARDWARE ADAPTERS                         │
│  ┌────────────────────────┐  ┌───────────────────────────────────────┐ │
│  │ expo-sqlite (Local DB) │  │ expo-location + expo-sensors          │ │
│  │ Zero-cost offline sync │  │ GPS coordinates & Magnetometer heading│ │
│  └────────────────────────┘  └───────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │ CUSTOM EXPO NATIVE MODULE (Kotlin): `modules/expo-5g-telephony`   │ │
│  │ TelephonyManager -> CellInfoNr / CellSignalStrengthNr             │ │
│  │ Extracts Carrier, SIM Slot, RSRP, RSRQ, SINR, 5G Standalone/NSA   │ │
└──────────────────────────────────────────────────────────────────────┘
```

### Key Architectural Decisions:
1. **Expo SDK 54 + Development Build (Bare Workflow agility with Managed DX)**:
   - Expo Go mein raw Android cellular TelephonyManager (RSRP/SINR) access nahi hota.
   - Isliye hum **Expo Modules API** (`modules/expo-5g-telephony`) use karenge jisme Kotlin native code likha jayega aur Expo Config Plugin se integrate hoga.
   - Development `npx expo run:android` ke through directly aapke device par chalegi without any paid cloud build.
2. **₹0-Cost & Offline-First**:
   - **No Backend Server**: Koi EC2, Firebase, ya Supabase ki MVP mein zaroorat nahi.
   - **Local Database**: `expo-sqlite` (modern asynchronous API). Fast, reliable, encrypted ready.
   - **Maps**: `react-native-maps` with OpenStreetMap or Google Maps Android Native (Free tier quota on device).
   - **Speed Test**: Lightweight zero-cost probe (Cloudflare CDN / Fast public latency endpoints).

---

## 2. Mathematical 5G Signal Quality Formula

Raw cellular radio metrics ko human-friendly score (0-100) mein convert karne ke liye standardized weighted algorithm:

$$\text{Score} = w_1 \cdot \text{Norm}(RSRP) + w_2 \cdot \text{Norm}(SINR) + w_3 \cdot \text{Norm}(RSRQ)$$

| Parameter | Unit | Ideal Range (100%) | Weak Range (0%) | Weight |
| :--- | :--- | :--- | :--- | :--- |
| **RSRP** (Signal Power) | dBm | $\ge -80\text{ dBm}$ | $\le -115\text{ dBm}$ | **50%** |
| **SINR** (Signal to Noise) | dB | $\ge 20\text{ dB}$ | $\le 0\text{ dB}$ | **30%** |
| **RSRQ** (Signal Quality) | dB | $\ge -10\text{ dB}$ | $\le -19\text{ dB}$ | **20%** |

- **80 – 100**: 🟢 **Excellent 5G** (Ultra-high throughput, gaming/4K streaming)
- **60 – 79**: 🟢 **Good 5G** (Reliable speed, fast downloads)
- **40 – 59**: 🟡 **Average 5G** (Usable, minor fluctuations)
- **20 – 39**: 🟠 **Weak 5G** (Edge cell, fallback to LTE imminent)
- **< 20**: 🔴 **Poor / Disconnected**

---

## 3. Step-by-Step Implementation Roadmap (Chunk-by-Chunk)

Har step ek specific engineering problem solve karta hai taaki app modular, maintainable aur bug-free rahe.

### 🧱 Chunk 1: Foundation & Custom Kotlin Telephony Native Module
- **Problem Solved**: React Native / Expo mein default 5G NR (New Radio) metrics (RSRP, SINR, RSRQ, Carrier Band) provide karne wali koi ready-made maintained library nahi hai jo Expo SDK 54 ke sath cleanly chale.
- **Kya Build Hoga**:
  1. `npx create-expo-app` with Expo SDK 54 + TypeScript.
  2. Local Expo Module `modules/expo-5g-telephony` using Kotlin.
  3. `TelephonyManager.getAllCellInfo()` hook jo `CellInfoNr` aur `CellInfoLte` ko parse karke JSON format mein React Native ko return kare:
     - Operator name (Jio, Airtel, Vi)
     - Network Generation (`5G_NR_SA`, `5G_NR_NSA`, `4G_LTE`)
     - RSRP, RSRQ, SINR, CQI, Timing Advance, Cell ID.
  4. Android Permissions setup (`ACCESS_FINE_LOCATION`, `READ_PHONE_STATE`).
- **Validation**: Real Android device par app run karke screen par exact RSRP & SINR raw values display karna.

---

### 🧠 Chunk 2: Signal Quality Engine & Live HUD Interface
- **Problem Solved**: Raw technical metrics (-84 dBm, 18 dB) aam users ko samajh nahi aate; unhe instantly color-coded, animated visual status chahiye.
- **Kya Build Hoga**:
  1. `SignalQualityEngine.ts`: Threshold evaluation logic jo 0–100 score aur status badge (`EXCELLENT`, `GOOD`, `AVERAGE`, `WEAK`, `NO_5G`) generate kare.
  2. Futuristic Dark-Mode HUD Dashboard:
     - Glowing radial status ring (Green/Yellow/Orange/Red).
     - Live Operator Pill (e.g. `Jio True 5G`).
     - Real-time gauge metrics for RSRP, SINR, RSRQ.
     - Live auto-refresh polling interval (configurable 2s / 5s).
- **Validation**: Airplane mode on/off karke aur different locations par signal transition test karna.

---

### 🗄️ Chunk 3: SQLite Persistence Layer & "Save 5G Point" Flow
- **Problem Solved**: User ko jahan best 5G mile, use permanent record banana taaki baad mein bhool na jaye. Sab kuch device par ₹0 cost mein safely store hona chahiye.
- **Kya Build Hoga**:
  1. `expo-sqlite` database initialization with schema:
     - `network_points` (id, name, lat, lng, accuracy, operator, network_type, rsrp, rsrq, sinr, quality_score, download_speed, upload_speed, ping_ms, created_at, notes)
     - `scan_logs` (point_id, scanned_at, rsrp, sinr, score)
  2. `expo-location` se high-accuracy GPS coordinates fetch karna.
  3. Bottom Sheet / Modal: "Save This 5G Point" with custom editable title (e.g., "Rooftop Corner", "Main Gate", "Desk 2").
  4. Repository pattern for CRUD operations (Insert, Read, Update, Delete).
- **Validation**: Multiple points save karna, app restart ke baad data persist hona verify karna.

---

### 🗺️ Chunk 4: Interactive 5G Coverage Map
- **Problem Solved**: Saved points ko visually dekhna ki mere aas-paas ya pure shehar mein kahan kahan 5G ke points save hain aur user kahan khada hai.
- **Kya Build Hoga**:
  1. `react-native-maps` integration with custom dark-mode styling.
  2. Map markers color-coded according to signal quality (🟢, 🟡, 🔴).
  3. Custom Callout bubble showing:
     - Point Name
     - Operator & Signal Score
     - Distance from current location
     - "Tap to Navigate" quick action.
  4. Map Filters: Filter by Operator (Jio / Airtel) and Quality (Excellent / Good / All).
- **Validation**: Map zoom, pan, marker click and filter toggle verification.

---

### 🧭 Chunk 5: Real-Time Radar / Compass Navigator
- **Problem Solved**: User saved 5G point tak bina kisi paid Google Directions API ke wapas kaise pahuche?
- **Kya Build Hoga**:
  1. **Haversine Distance Calculator**: Current GPS se target point ka exact distance in meters.
  2. **Bearing & Azimuth Math**: Current location aur target coordinate ke beech ka angle calculate karna:
     $$\theta = \text{atan2}(\sin\Delta\lambda \cdot \cos\phi_2, \, \cos\phi_1 \cdot \sin\phi_2 - \sin\phi_1 \cdot \cos\phi_2 \cdot \cos\Delta\lambda)$$
  3. `expo-sensors` (Magnetometer) se phone ka true compass heading lekar arrow ko target ki taraf dynamically point karna.
  4. HUD Navigation Screen:
     - Rotating pointer arrow.
     - Live distance countdown (120m ➔ 50m ➔ 10m).
     - **Target Reached Trigger** (jab distance $\le 5\text{m}$ ho jaye).
- **Validation**: Walk karke verify karna ki arrow accurately point ki taraf guide karta hai aur 5m par "Point Reached" trigger hota hai.

---

### 📊 Chunk 6: Zero-Cost Speed & Ping Diagnostic Test
- **Problem Solved**: Kabhi-kabhi signal strong dikhta hai par internet choked hota hai (tower congestion). User ko signal ke sath actual speed verify karni hai.
- **Kya Build Hoga**:
  1. Zero-Cost HTTP Ping & Latency test (multi-packet measurement).
  2. Micro-chunk download & upload test using standard fast public CDN endpoints (0 bandwidth cost, lightweight 5-10MB test).
  3. Real-time speed readout in Mbps & Ping in ms.
  4. Option to attach speed test results directly to the saved point.
- **Validation**: Wi-Fi vs Cellular speed and ping tests verify karna.

---

### 🔄 Chunk 7: Arrival Re-Verification & Comparison Mode
- **Problem Solved**: User jab saved point par wapas pahuche to use pata chale ki pehle jaisa signal abhi bhi mil raha hai ya network degrade ho gaya.
- **Kya Build Hoga**:
  1. Automatic trigger jab user saved point ke radius ($<10\text{m}$) mein aaye.
  2. Side-by-side comparison UI:
     - **Saved**: RSRP -84 dBm | SINR 18 dB | Score: 85
     - **Current**: RSRP -86 dBm | SINR 16 dB | Score: 80
     - Match verdict: `🟢 Signal matches historical baseline`
- **Validation**: Same point par dubara khade hokar live vs saved comparison test karna.

---

### ⚙️ Chunk 8: Polish, Settings & Export/Import
- **Problem Solved**: User apna data backup kar sake aur settings customise kar sake.
- **Kya Build Hoga**:
  1. Export saved 5G points to JSON / CSV.
  2. Import points (share with family or friends).
  3. Unit switch (Meters vs Feet).
  4. Signal Threshold adjustment screen.
- **Validation**: Export file generate karna aur phone file system mein check karna.

---

## 4. Scalability Model (Future-Proof Architecture)

Yeh architecture modular hai, iska matlab agar kal aap ise multi-user public map ya cloud sync banana chahein:
- **Repository Interface**: Data layer mein `IPointRepository` interface hoga. Aaj yeh `SQLitePointRepository` implement karta hai. Kal sirf `CloudPointRepository` (Supabase/Firebase) plug karna hoga, UI code ko touch bhi nahi karna padega!
- **Zero-Cost Today, Scale Ready Tomorrow**: Ek bhi paisa kharch kiye bina complete standalone product chalega.

---

## 5. Verification & Development Steps

| Phase | Milestone | Expected Result |
| :--- | :--- | :--- |
| **Phase 1** | App Bootstrap & Expo Module | Phone par live RSRP, SINR, Operator fetch hona |
| **Phase 2** | UI HUD & Scoring Engine | Live animated dashboard with 5G health score |
| **Phase 3** | SQLite & Save Modal | Points save hona aur local DB mein persist rehna |
| **Phase 4** | Interactive Map | Map par color-coded 5G markers dikhna |
| **Phase 5** | Sensor Compass & Radar | Real-time arrow pointing to saved location |
| **Phase 6** | Speed & Comparison | Speed test & baseline matching on arrival |

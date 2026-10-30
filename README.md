# Executive Six-Block KPI Performance Board

A centralized Key Performance Indicator (KPI) static display board application built with Nuxt 4, Vue 3, and Nitro. The board displays six key performance indicator blocks designed for wall monitors, static screens, and executive overviews, with centralized updates and live synchronization.

---

## Features

### 1. Six-Block KPI Display
- Displays exactly six high-visibility performance indicators in a responsive grid.
- Fullscreen / TV display board kiosk mode for wall mounted displays.
- Real-time auto-synchronization across all viewing screens.

### 2. Five Essential Components per KPI
Every KPI block includes:
1. **Type of Indicator**: Categorized into one of five standard types:
   - 🛡️ **Safety**
   - ⭐ **Quality**
   - 💬 **Experience**
   - 💰 **Value**
   - 👥 **People**
2. **Date of Last Update**: Clearly visible timestamp/date of the latest metric change.
3. **Title of the Metric**: Crisp, executive-level metric title.
4. **Current Measure / Number**: Prominent numerical measurement with target reference.
5. **Goal Comparison**: Clear color-coded status badge:
   - 🟢 **Meeting Goal (Green)**: Performance meets or exceeds target.
   - 🔴 **Not Meeting Goal (Red)**: Performance is below target / requires attention.

### 3. Centralized Update & Management
- **Central Update Panel**: Update all 6 KPIs or edit specific cards in real time.
- **Persistent Server Storage**: Centralized REST API endpoints (`/api/kpis`) backed by persistent server storage.
- **Live Background Sync**: Automatically polls and updates all display boards without requiring browser reloads.

---

## Development & Usage

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

### 3. Run Automated Tests
```bash
npm test
```

### 4. Build for Production
```bash
npm run build
```

### 5. Preview Production Build
```bash
npm run preview
```

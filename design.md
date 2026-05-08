# LifeScenario AI — Interface Design

## Brand Identity

**App Name:** LifeScenario AI  
**Tagline:** Your day, designed by AI  
**Personality:** Calm, premium, intelligent, personal  

### Color Palette

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `primary` | `#6C63FF` | `#8B85FF` | Accent, CTAs, active states |
| `background` | `#F8F7FF` | `#0F0E1A` | Screen backgrounds |
| `surface` | `#FFFFFF` | `#1A1928` | Cards, elevated surfaces |
| `foreground` | `#1A1730` | `#F0EEFF` | Primary text |
| `muted` | `#7B7A8E` | `#9B9AAE` | Secondary text, labels |
| `border` | `#E8E6F5` | `#2A2840` | Dividers, card borders |
| `success` | `#22C55E` | `#4ADE80` | Success states |
| `warning` | `#F59E0B` | `#FBBF24` | Warnings |
| `error` | `#EF4444` | `#F87171` | Errors |
| `accent` | `#FF6B9D` | `#FF8FB3` | Secondary accent (energy, mood) |

---

## Screen List

1. **Home** — Main hub with current scenario, Daily scenario, Mini Routes, Smart Triggers
2. **Create Scenario** — Multi-step parameter selection wizard (time, energy, mood, budget, type, social mode)
3. **Scenario Detail** — Full scenario view with step-by-step route, map, and actions
4. **Explore** — Discover new scenarios, curated collections, popular routes
5. **Profile** — User interests, history, preferences, statistics
6. **Onboarding** — First-time setup: city, interests, preferences

---

## Primary Content & Functionality

### Home Screen
- **Header:** City name + weather widget (temperature, condition icon)
- **Daily Scenario Card:** Large hero card with scenario name, time estimate, mood tag, "Start" CTA
- **Mini Routes Section:** Horizontal scroll of 10–40 min quick routes
- **Smart Triggers Banner:** Contextual AI suggestion (weather-based, time-based)
- **Quick Create Button:** Floating action button to open Create Scenario

### Create Scenario Screen
- **Step 1 — Duration:** Pill selector (15–30m, 30–60m, 1–2h, 2–4h, Half day)
- **Step 2 — Time of Day:** Icon+label selector (Morning, Afternoon, Evening, Night)
- **Step 3 — Energy Level:** 5-point slider or button row (Very Tired → Max Energy)
- **Step 4 — Mood/State:** Grid of mood chips (Recover, Explore, Calm, New Emotions, Cozy, Productive, Cultural)
- **Step 5 — Budget:** Pill selector (Free, Cheap, Medium, Comfortable, Premium) + optional amount input
- **Step 6 — Scenario Type:** Icon grid (Walk, Food, Explore, Culture, Activity, Rest, Mixed)
- **Step 7 — Social Mode:** Icon+label row (Solo, Friends, Partner, Family, Random)
- **Generate Button:** Large CTA at bottom, triggers AI generation with loading animation

### Scenario Detail Screen
- **Hero Section:** Scenario title, mood tag, duration, weather suitability badge
- **Step Cards:** Numbered list of steps with place name, duration, description, budget estimate
- **Map View:** Embedded map showing route between locations
- **Action Bar:** Save, Share, Start Navigation buttons

### Explore Screen
- **Search Bar:** Find scenarios by keyword or city
- **Category Chips:** Filter by scenario type
- **Featured Collection:** Large card with editorial picks
- **Popular Routes:** Vertical list of scenario cards with ratings

### Profile Screen
- **User Header:** Avatar, name, city
- **Stats Row:** Scenarios completed, total time, cities explored
- **Interests Grid:** Editable tags (Culture, Food, Nature, Art, etc.)
- **History List:** Past scenarios with date and rating
- **Preferences Section:** Default budget, energy level, social mode

---

## Key User Flows

### Flow 1: Generate a Scenario
1. User opens app → sees Home with Daily Scenario
2. Taps "Create" FAB → Create Scenario wizard opens
3. Selects parameters across 7 steps (swipeable or scrollable)
4. Taps "Generate Scenario" → loading animation (3–5s)
5. Scenario Detail screen appears with full route
6. User taps "Start" → navigation begins

### Flow 2: Quick Mini Route
1. User sees Mini Routes section on Home
2. Taps a route card → Scenario Detail opens
3. Taps "Start" → immediate navigation

### Flow 3: Smart Trigger Response
1. App detects good weather / free time
2. Smart Trigger banner appears on Home
3. User taps banner → pre-filled Create Scenario opens
4. One tap "Generate" → scenario ready

### Flow 4: Explore & Save
1. User opens Explore tab
2. Browses curated collections
3. Taps scenario card → Detail view
4. Taps heart icon → saved to profile history

---

## Visual Design Principles

- **Cards:** 16px border radius, subtle shadow, 1px border
- **Typography:** SF Pro / System font; 32px hero, 20px section headers, 15px body, 12px labels
- **Spacing:** 16px base unit; 24px section gaps; 12px inner padding
- **Animations:** 250ms ease-out transitions; gentle spring on card press (scale 0.97)
- **Icons:** SF Symbols (iOS) / Material Icons (Android) — consistent weight
- **Gradients:** Subtle purple-to-indigo on hero cards; dark overlay on scenario images

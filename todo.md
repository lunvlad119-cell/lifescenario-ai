# LifeScenario AI — TODO

## Branding & Setup
- [x] Generate app logo and update app.config.ts
- [x] Update theme colors (purple/indigo palette)
- [x] Configure tab bar icons

## Screens
- [x] Home screen: Daily Scenario hero card, Mini Routes, Smart Triggers
- [x] Create Scenario wizard: 7-step parameter selection
- [x] Scenario Detail screen: step cards, map placeholder, action bar
- [x] Explore screen: search, categories, featured, popular routes
- [x] Profile screen: stats, interests, history, preferences

## AI Integration
- [x] Backend tRPC route for AI scenario generation
- [x] LLM prompt engineering for scenario creation
- [x] Weather context integration (mock/simulated)
- [x] Loading animation during AI generation

## Data & Persistence
- [x] AsyncStorage for user preferences and history
- [x] Scenario history tracking
- [x] Saved scenarios functionality

## UI Polish
- [x] Smooth tab transitions
- [x] Card press animations
- [x] Loading states and skeletons
- [x] Empty states for all screens


## Weather Integration (Complete)
- [x] Set up OpenWeatherMap API key
- [x] Create weather service module
- [x] Fetch real weather on Home screen
- [x] Update AI prompt with weather context
- [x] Handle weather API errors gracefully
- [x] Test weather-based scenario generation


## UX Refactoring (Complete)
- [x] Simplify Home screen: remove clutter, keep Daily Scenario + Mini Routes + Smart Suggestion + Create button
- [x] Simplify Explore screen: show only curated collections (Cozy Evening, Rainy Walk, Explore City)
- [x] Improve Create flow: update energy levels to 4 tiers (Very Low, Low, Normal, High)
- [x] Add budget display with euro amounts (Free/5-15€/15-40€/40€+)
- [x] Create atmospheric loading experience with pulsing animations
- [x] Add rotating loading messages (Analyzing weather, Finding spots, Matching mood, etc.)
- [x] Enhance AI prompts for weather-aware, concise, atmospheric scenarios
- [x] Improve scenario format: short blocks with emoji, title, price, time, atmosphere
- [x] Test all flows end-to-end
- [x] Polish spacing, typography, and transitions

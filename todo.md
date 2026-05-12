# LifeScenario AI — TODO

## Onboarding Flow (In Progress)
- [ ] Add onboarding state to ScenarioContext (hasCompletedOnboarding flag)
- [ ] Create OnboardingScreen with 3 steps: City, Budget, Interests
- [ ] Build City selection step with popular cities
- [ ] Build Budget selection step with visual indicators
- [ ] Build Interests selection step with 6+ interest options
- [ ] Add completion button that saves to AsyncStorage
- [ ] Integrate onboarding into root layout with conditional rendering
- [ ] Test onboarding flow end-to-end

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
- [x] Add budget display with euro amounts (Free/5–15€/15–40€/40€+)
- [x] Create atmospheric loading experience with pulsing animations
- [x] Add rotating loading messages (Analyzing weather, Finding spots, Matching mood, etc.)
- [x] Enhance AI prompts for weather-aware, concise, atmospheric scenarios
- [x] Improve scenario format: short blocks with emoji, title, price, time, atmosphere
- [x] Test all flows end-to-end
- [x] Polish spacing, typography, and transitions

## Premium Refactoring (In Progress)

### Phase 1: Internationalization (i18n)
- [ ] Install i18next and react-i18next
- [ ] Create translation files (en.json, ru.json)
- [ ] Translate all UI strings (buttons, labels, tabs, onboarding, loading phrases)
- [ ] Create language selector in Profile/Settings
- [ ] Persist language preference to AsyncStorage
- [ ] Test language switching globally

### Phase 2: Theme System (Light/Dark Mode)
- [ ] Update theme.config.js with light and dark mode colors
- [ ] Create theme selector in Profile/Settings
- [ ] Implement system theme detection
- [ ] Persist theme preference to AsyncStorage
- [ ] Update all components to use theme colors
- [ ] Test light and dark modes on all screens
- [ ] Ensure premium, calm aesthetic in both modes

### Phase 3: City Selection UX
- [ ] Add recent cities list to onboarding/settings
- [ ] Add popular cities list
- [ ] Improve city search UX
- [ ] Add city emoji/icon
- [ ] Make city selection feel premium and smooth
- [ ] Update weather intro with city context

### Phase 4: Weather Integration Enhancement
- [ ] Add weather intro block before scenario (city + temp + description)
- [ ] Adapt AI pacing based on weather (rain = cozy, sunny = outdoor, cold = warm)
- [ ] Change route structure based on weather
- [ ] Update place recommendations based on conditions
- [ ] Make weather feel "alive" in the app

### Phase 5: AI Scenario Quality
- [ ] Improve AI prompts for less generic, more atmospheric scenarios
- [ ] Ensure each step has emoji, title, description, price, time, atmosphere
- [ ] Make scenarios more city-specific and realistic
- [ ] Reduce GPT-like language, increase personality
- [ ] Test scenario generation with various weather conditions

### Phase 6: Loading Experience
- [ ] Add fake AI thinking stages (Analyzing weather, Understanding city vibe, Finding calm places, Building your route)
- [ ] Create animated loading cards
- [ ] Add rotating messages with smooth transitions
- [ ] Improve progress feeling
- [ ] Add subtle motion and animations

### Phase 7: Home Screen Refinement
- [ ] Clean up visual noise
- [ ] Focus on current scenario, create button, mini routes, weather
- [ ] Improve spacing and visual hierarchy
- [ ] Make it feel calm and focused

### Phase 8: Profile Enhancement
- [ ] Add recent scenarios list
- [ ] Add saved routes
- [ ] Add favorite moods
- [ ] Add favorite cities
- [ ] Add basic stats (scenarios created, etc.)
- [ ] Make Profile feel like part of the product

### Phase 9: Visual Consistency
- [ ] Ensure consistent spacing across all screens
- [ ] Unify card border radius
- [ ] Clean up shadows
- [ ] Improve typography hierarchy
- [ ] Better section spacing
- [ ] Soft, clean, atmospheric, modern, premium-light feel

### Phase 10: Future Architecture Prep
- [ ] Add place metadata (coordinates, distances)
- [ ] Prepare route IDs and structure
- [ ] Set up scenario persistence
- [ ] Prepare for Google Maps integration
- [ ] Structure premium feature architecture (not implemented yet)

## Testing & Deployment
- [ ] Run all tests and verify passing
- [ ] Test onboarding flow end-to-end
- [ ] Test language switching
- [ ] Test theme switching
- [ ] Test all screens in both languages and themes
- [ ] Verify weather integration works
- [ ] Save checkpoint before deployment


## Bug Fixes & UI Improvements (Complete)
- [x] Translate all screens to English and Russian with i18n
- [x] Improve language selector UI design (match app aesthetic)
- [x] Improve theme selector UI design (match app aesthetic)
- [x] Fix onboarding city input bug - add Next button after city input
- [x] Ensure language changes persist globally across all screens
- [x] Test language switching on all screens
- [x] Test theme switching on all screens

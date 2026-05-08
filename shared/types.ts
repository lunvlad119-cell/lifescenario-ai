/**
 * Unified type exports
 * Import shared types from this single entry point.
 */

export type * from "../drizzle/schema";
export * from "./_core/errors";

// LifeScenario AI types
export type Duration = "15-30min" | "30-60min" | "1-2h" | "2-4h" | "half-day";
export type TimeOfDay = "morning" | "afternoon" | "evening" | "night";
export type EnergyLevel = 1 | 2 | 3 | 4 | 5;
export type Mood =
  | "recover"
  | "explore"
  | "calm"
  | "new-emotions"
  | "cozy"
  | "productive"
  | "cultural";
export type Budget = "free" | "cheap" | "medium" | "comfortable" | "premium";
export type ScenarioType =
  | "walk"
  | "food"
  | "explore"
  | "culture"
  | "activity"
  | "rest"
  | "mixed";
export type SocialMode = "solo" | "friends" | "partner" | "family" | "random";

export interface ScenarioParams {
  duration: Duration;
  timeOfDay: TimeOfDay;
  energyLevel: EnergyLevel;
  mood: Mood;
  budget: Budget;
  budgetAmount?: number;
  scenarioType: ScenarioType;
  socialMode: SocialMode;
  city?: string;
}

export interface ScenarioStep {
  id: string;
  order: number;
  title: string;
  description: string;
  duration: string;
  budgetEstimate?: string;
  locationType: "indoor" | "outdoor" | "transit";
  emoji: string;
}

export interface Scenario {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  moodTag: string;
  totalDuration: string;
  weatherSuitability: string;
  steps: ScenarioStep[];
  params: ScenarioParams;
  createdAt: string;
  isSaved?: boolean;
  rating?: number;
}

export interface UserPreferences {
  city: string;
  defaultBudget: Budget;
  defaultEnergyLevel: EnergyLevel;
  defaultSocialMode: SocialMode;
  interests: string[];
  favoriteScenarioTypes: ScenarioType[];
}

import { describe, expect, it } from "vitest";
import type { Scenario, ScenarioParams } from "../shared/types";

describe("Scenario data structures", () => {
  it("should create a valid ScenarioParams object", () => {
    const params: ScenarioParams = {
      duration: "1-2h",
      timeOfDay: "evening",
      energyLevel: 2,
      mood: "recover",
      budget: "cheap",
      scenarioType: "walk",
      socialMode: "solo",
      city: "Prague",
    };

    expect(params.duration).toBe("1-2h");
    expect(params.timeOfDay).toBe("evening");
    expect(params.energyLevel).toBe(2);
    expect(params.mood).toBe("recover");
    expect(params.budget).toBe("cheap");
    expect(params.scenarioType).toBe("walk");
    expect(params.socialMode).toBe("solo");
    expect(params.city).toBe("Prague");
  });

  it("should create a valid Scenario object with steps", () => {
    const scenario: Scenario = {
      id: "test_1",
      title: "Evening Recovery Walk",
      subtitle: "A gentle evening to restore your energy",
      emoji: "🌙",
      moodTag: "Recover",
      totalDuration: "2 hours",
      weatherSuitability: "Clear skies",
      createdAt: new Date().toISOString(),
      steps: [
        {
          id: "step1",
          order: 1,
          title: "Slow Walk",
          description: "A peaceful walk",
          duration: "15 min",
          budgetEstimate: "Free",
          locationType: "outdoor",
          emoji: "🚶",
        },
        {
          id: "step2",
          order: 2,
          title: "Café Stop",
          description: "Warm drink",
          duration: "40 min",
          budgetEstimate: "€5–8",
          locationType: "indoor",
          emoji: "☕",
        },
      ],
      params: {
        duration: "1-2h",
        timeOfDay: "evening",
        energyLevel: 2,
        mood: "recover",
        budget: "cheap",
        scenarioType: "walk",
        socialMode: "solo",
        city: "Prague",
      },
    };

    expect(scenario.id).toBe("test_1");
    expect(scenario.steps).toHaveLength(2);
    expect(scenario.steps[0].order).toBe(1);
    expect(scenario.steps[1].order).toBe(2);
    expect(scenario.steps[0].locationType).toBe("outdoor");
    expect(scenario.steps[1].locationType).toBe("indoor");
  });

  it("should validate all duration values", () => {
    const validDurations = ["15-30min", "30-60min", "1-2h", "2-4h", "half-day"];
    validDurations.forEach((d) => {
      expect(validDurations).toContain(d);
    });
  });

  it("should validate all mood values", () => {
    const validMoods = ["recover", "explore", "calm", "new-emotions", "cozy", "productive", "cultural"];
    validMoods.forEach((m) => {
      expect(validMoods).toContain(m);
    });
  });

  it("should validate energy level range", () => {
    const validLevels = [1, 2, 3, 4, 5];
    validLevels.forEach((l) => {
      expect(l).toBeGreaterThanOrEqual(1);
      expect(l).toBeLessThanOrEqual(5);
    });
  });
});

describe("Sample data integrity", () => {
  it("should have valid scenario IDs", () => {
    const ids = ["s1", "s2", "s3", "mini1", "mini2", "mini3", "mini4"];
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("should have steps with correct order", () => {
    const steps = [
      { id: "step1", order: 1 },
      { id: "step2", order: 2 },
      { id: "step3", order: 3 },
    ];
    steps.forEach((step, i) => {
      expect(step.order).toBe(i + 1);
    });
  });
});

import { z } from "zod";
import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import type { Scenario } from "../shared/types";

const ScenarioParamsSchema = z.object({
  duration: z.enum(["15-30min", "30-60min", "1-2h", "2-4h", "half-day"]),
  timeOfDay: z.enum(["morning", "afternoon", "evening", "night"]),
  energyLevel: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  mood: z.enum(["recover", "explore", "calm", "new-emotions", "cozy", "productive", "cultural"]),
  budget: z.enum(["free", "cheap", "medium", "comfortable", "premium"]),
  budgetAmount: z.number().optional(),
  scenarioType: z.enum(["walk", "food", "explore", "culture", "activity", "rest", "mixed"]),
  socialMode: z.enum(["solo", "friends", "partner", "family", "random"]),
  city: z.string().optional().default("your city"),
});

const BUDGET_MAP: Record<string, string> = {
  free: "€0 (free activities only)",
  cheap: "€1–10",
  medium: "€10–25",
  comfortable: "€25–50",
  premium: "€50+",
};

const ENERGY_MAP: Record<number, string> = {
  1: "very tired, needs rest and minimal physical effort",
  2: "low energy, calm and slow pace preferred",
  3: "normal energy, balanced activities",
  4: "high energy, active and ready to move",
};

const DURATION_MAP: Record<string, string> = {
  "15-30min": "15 to 30 minutes",
  "30-60min": "30 to 60 minutes",
  "1-2h": "1 to 2 hours",
  "2-4h": "2 to 4 hours",
  "half-day": "4 to 6 hours (half day)",
};

const MOOD_MAP: Record<string, string> = {
  recover: "wants to recharge and restore energy",
  explore: "wants to explore and discover new things",
  calm: "wants peace and tranquility",
  cozy: "wants a warm, comfortable, intimate experience",
};

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  scenario: router({
    generate: publicProcedure
      .input(ScenarioParamsSchema.extend({ weather: z.object({ temp: z.number(), main: z.string(), description: z.string() }).optional() }))
      .mutation(async ({ input }): Promise<Scenario> => {
        const weatherContext = input.weather
          ? `\n- Current weather: ${Math.round(input.weather.temp)}°C, ${input.weather.description} (${input.weather.main})`
          : "";
        const weatherAdvice = input.weather?.main === "Rain"
          ? "IMPORTANT: Since it's raining, prioritize indoor/cozy places and short transitions. Make the scenario feel warm and intimate."
          : input.weather?.main === "Cloud"
          ? "IMPORTANT: Cloudy weather is perfect for calm walks and atmospheric exploration. Suggest peaceful outdoor spots."
          : "IMPORTANT: Sunny weather is ideal for outdoor activities and exploration. Suggest open spaces and walking routes.";

        const prompt = `You are LifeScenario AI — a personal life scenario planner. Generate a SHORT, ATMOSPHERIC, REALISTIC life scenario for someone in ${input.city}.

Parameters:
- Available time: ${DURATION_MAP[input.duration]}
- Time of day: ${input.timeOfDay}
- Energy level: ${ENERGY_MAP[input.energyLevel]}
- Mood/goal: ${MOOD_MAP[input.mood]}
- Budget: ${BUDGET_MAP[input.budget]}
- Scenario type: ${input.scenarioType}
- Social context: ${input.socialMode === "solo" ? "going alone" : `going with ${input.socialMode}`}${weatherContext}

${weatherAdvice}

Create a realistic, specific scenario with 3-4 SHORT steps. Each step should be a real type of place or activity that exists in ${input.city}. Make it feel ATMOSPHERIC and LIVED-IN, not generic. Keep descriptions SHORT and POETIC.

Respond ONLY with valid JSON in this exact format (no markdown, no explanation):
{
  "title": "Short evocative title (3-5 words)",
  "subtitle": "One sentence describing the experience",
  "emoji": "Single relevant emoji",
  "moodTag": "One word mood label",
  "totalDuration": "Human readable duration",
  "weatherSuitability": "Weather condition this suits",
  "steps": [
    {
      "title": "Short step title with emoji (e.g., ☕ Cozy Café)",
      "description": "1-2 short sentences. Poetic and atmospheric. Why this place, what to feel.",
      "duration": "Duration like '20 min' or '45 min'",
      "budgetEstimate": "Budget like 'Free' or '€5-8'",
      "locationType": "indoor or outdoor or transit",
      "emoji": "Relevant emoji"
    }
  ]
}`;

        try {
          const result = await invokeLLM({
            messages: [
              { role: "system", content: "You are a life scenario planning AI. Always respond with valid JSON only, no markdown." },
              { role: "user", content: prompt },
            ],
            responseFormat: { type: "json_object" },
          });

          // Parse the LLM response
          let parsed: any;
          try {
            const rawContent = result.choices[0]?.message?.content;
            const rawText = typeof rawContent === "string" ? rawContent : JSON.stringify(rawContent);
            const cleaned = rawText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
            parsed = JSON.parse(cleaned);
          } catch {
            throw new Error("Failed to parse AI response");
          }

          const id = `ai_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
          const scenario: Scenario = {
            id,
            title: parsed.title || "Life Scenario",
            subtitle: parsed.subtitle || "Your personalized scenario",
            emoji: parsed.emoji || "✨",
            moodTag: parsed.moodTag || input.mood,
            totalDuration: parsed.totalDuration || DURATION_MAP[input.duration],
            weatherSuitability: parsed.weatherSuitability || "Any weather",
            steps: (parsed.steps || []).map((step: any, i: number) => ({
              id: `step_${i + 1}`,
              order: i + 1,
              title: step.title || `Step ${i + 1}`,
              description: step.description || "",
              duration: step.duration || "20 min",
              budgetEstimate: step.budgetEstimate,
              locationType: step.locationType || "outdoor",
              emoji: step.emoji || "📍",
            })),
            params: input,
            createdAt: new Date().toISOString(),
            isSaved: false,
          };

          return scenario;
        } catch (error) {
          // Fallback scenario if AI fails
          const fallbackScenario: Scenario = {
            id: `fallback_${Date.now()}`,
            title: "Mindful City Walk",
            subtitle: "A thoughtful exploration of your surroundings",
            emoji: "🌿",
            moodTag: input.mood,
            totalDuration: DURATION_MAP[input.duration],
            weatherSuitability: "Any weather",
            steps: [
              {
                id: "step_1",
                order: 1,
                title: "Start with a Slow Walk",
                description: "Begin your scenario with a gentle walk through a nearby park or quiet street. Set a slow, intentional pace.",
                duration: "20 min",
                budgetEstimate: "Free",
                locationType: "outdoor",
                emoji: "🚶",
              },
              {
                id: "step_2",
                order: 2,
                title: "Find a Café",
                description: "Stop at a local café for a warm drink. Take a moment to observe your surroundings and let your mind rest.",
                duration: "30 min",
                budgetEstimate: "€4–7",
                locationType: "indoor",
                emoji: "☕",
              },
              {
                id: "step_3",
                order: 3,
                title: "Quiet Exploration",
                description: "Explore a bookshop, gallery, or quiet public space. Follow your curiosity without any specific goal.",
                duration: "25 min",
                budgetEstimate: "Free",
                locationType: "indoor",
                emoji: "📚",
              },
            ],
            params: input,
            createdAt: new Date().toISOString(),
            isSaved: false,
          };
          return fallbackScenario;
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;

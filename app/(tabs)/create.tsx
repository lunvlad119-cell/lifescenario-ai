import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { AtmosphericLoader } from "@/components/atmospheric-loader";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useScenario } from "@/lib/scenario-context";
import { trpc } from "@/lib/trpc";
import type { Duration, TimeOfDay, EnergyLevel, Mood, Budget, ScenarioType, SocialMode, ScenarioParams } from "@/shared/types";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

const STEPS = ["Duration", "Time", "Energy", "Mood", "Budget", "Type", "Social"];

// Step 1: Duration
const DURATIONS: { value: Duration; label: string; icon: string }[] = [
  { value: "15-30min", label: "15–30 min", icon: "⚡" },
  { value: "30-60min", label: "30–60 min", icon: "🕐" },
  { value: "1-2h", label: "1–2 hours", icon: "🕑" },
  { value: "2-4h", label: "2–4 hours", icon: "🕒" },
  { value: "half-day", label: "Full Day", icon: "🌅" },
];

// Step 2: Time of Day
const TIMES: { value: TimeOfDay; label: string; icon: string }[] = [
  { value: "morning", label: "Morning", icon: "🌅" },
  { value: "afternoon", label: "Afternoon", icon: "☀️" },
  { value: "evening", label: "Evening", icon: "🌆" },
  { value: "night", label: "Night", icon: "🌙" },
];

// Step 3: Energy (4 levels instead of 5)
const ENERGIES: { value: EnergyLevel; label: string; icon: string; desc: string }[] = [
  { value: 1, label: "Very Low", icon: "😴", desc: "Need rest" },
  { value: 2, label: "Low", icon: "😌", desc: "Calm pace" },
  { value: 3, label: "Normal", icon: "🙂", desc: "Balanced" },
  { value: 4, label: "High", icon: "🔥", desc: "Let's go!" },
];

// Step 4: Mood
const MOODS: { value: Mood; label: string; icon: string }[] = [
  { value: "recover", label: "Recharge", icon: "💆" },
  { value: "cozy", label: "Cozy", icon: "🏠" },
  { value: "explore", label: "Explore", icon: "🗺️" },
  { value: "calm", label: "Calm", icon: "🧘" },
];

// Step 5: Budget
const BUDGETS: { value: Budget; label: string; icon: string; desc: string }[] = [
  { value: "free", label: "Free", icon: "🆓", desc: "0€" },
  { value: "cheap", label: "Cheap", icon: "💚", desc: "5–15€" },
  { value: "medium", label: "Medium", icon: "💛", desc: "15–40€" },
  { value: "comfortable", label: "Premium", icon: "💜", desc: "40€+" },
];

// Step 6: Scenario Type
const TYPES: { value: ScenarioType; label: string; icon: string }[] = [
  { value: "walk", label: "Walk", icon: "🚶" },
  { value: "food", label: "Food", icon: "🍽️" },
  { value: "explore", label: "Explore", icon: "🗺️" },
  { value: "culture", label: "Culture", icon: "🎨" },
  { value: "activity", label: "Activity", icon: "⚽" },
  { value: "rest", label: "Rest", icon: "😌" },
];

// Step 7: Social Mode
const SOCIAL_MODES: { value: SocialMode; label: string; icon: string }[] = [
  { value: "solo", label: "Solo", icon: "🧍" },
  { value: "friends", label: "Friends", icon: "👥" },
  { value: "partner", label: "Partner", icon: "💑" },
  { value: "family", label: "Family", icon: "👨‍👩‍👧" },
];

function PillOption<T extends string | number>({
  value,
  selected,
  label,
  icon,
  desc,
  onPress,
  colors,
}: {
  value: T;
  selected: boolean;
  label: string;
  icon: string;
  desc?: string;
  onPress: (v: T) => void;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.pill,
        {
          backgroundColor: selected ? colors.primary : colors.surface,
          borderColor: selected ? colors.primary : colors.border,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
      onPress={() => {
        if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress(value);
      }}
    >
      <Text style={styles.pillIcon}>{icon}</Text>
      <Text style={[styles.pillLabel, { color: selected ? "#FFFFFF" : colors.foreground }]}>{label}</Text>
      {desc && <Text style={[styles.pillDesc, { color: selected ? "rgba(255,255,255,0.75)" : colors.muted }]}>{desc}</Text>}
    </Pressable>
  );
}

function GridOption<T extends string | number>({
  value,
  selected,
  label,
  icon,
  onPress,
  colors,
}: {
  value: T;
  selected: boolean;
  label: string;
  icon: string;
  onPress: (v: T) => void;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.gridItem,
        {
          backgroundColor: selected ? colors.primary : colors.surface,
          borderColor: selected ? colors.primary : colors.border,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
      onPress={() => {
        if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress(value);
      }}
    >
      <Text style={styles.gridIcon}>{icon}</Text>
      <Text style={[styles.gridLabel, { color: selected ? "#FFFFFF" : colors.foreground }]}>{label}</Text>
    </Pressable>
  );
}

export default function CreateScreen() {
  const colors = useColors();
  const router = useRouter();
  const { state, addToHistory, setDailyScenario } = useScenario();

  const [step, setStep] = useState(0);
  const [params, setParams] = useState<Partial<ScenarioParams>>({
    city: state.preferences.city,
    energyLevel: state.preferences.defaultEnergyLevel,
    budget: state.preferences.defaultBudget,
    socialMode: state.preferences.defaultSocialMode,
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const generateMutation = trpc.scenario.generate.useMutation();

  const set = <K extends keyof ScenarioParams>(key: K, value: ScenarioParams[K]) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  };

  const canProceed = () => {
    switch (step) {
      case 0: return !!params.duration;
      case 1: return !!params.timeOfDay;
      case 2: return !!params.energyLevel;
      case 3: return !!params.mood;
      case 4: return !!params.budget;
      case 5: return !!params.scenarioType;
      case 6: return !!params.socialMode;
      default: return false;
    }
  };

  const handleGenerate = async () => {
    if (!canProceed()) return;
    setIsGenerating(true);
    try {
      const paramsWithWeather = {
        ...params,
        weather: state.weather ? {
          temp: state.weather.temp,
          main: state.weather.main,
          description: state.weather.description,
        } : undefined,
      } as any;
      const scenario = await generateMutation.mutateAsync(paramsWithWeather);
      addToHistory(scenario);
      setDailyScenario(scenario);
      router.push({ pathname: "/scenario/[id]" as any, params: { id: scenario.id, data: JSON.stringify(scenario) } });
    } catch (err) {
      console.error("Generation failed:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <View style={styles.stepContent}>
            <Text style={[styles.stepQuestion, { color: colors.foreground }]}>How much time do you have?</Text>
            <View style={styles.pillsColumn}>
              {DURATIONS.map((d) => (
                <PillOption key={d.value} value={d.value} selected={params.duration === d.value} label={d.label} icon={d.icon} onPress={(v) => set("duration", v)} colors={colors} />
              ))}
            </View>
          </View>
        );
      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={[styles.stepQuestion, { color: colors.foreground }]}>What time of day?</Text>
            <View style={styles.pillsGrid}>
              {TIMES.map((t) => (
                <GridOption key={t.value} value={t.value} selected={params.timeOfDay === t.value} label={t.label} icon={t.icon} onPress={(v) => set("timeOfDay", v)} colors={colors} />
              ))}
            </View>
          </View>
        );
      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={[styles.stepQuestion, { color: colors.foreground }]}>Your energy level?</Text>
            <View style={styles.pillsColumn}>
              {ENERGIES.map((e) => (
                <PillOption key={e.value} value={e.value} selected={params.energyLevel === e.value} label={e.label} icon={e.icon} desc={e.desc} onPress={(v) => set("energyLevel", v)} colors={colors} />
              ))}
            </View>
          </View>
        );
      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={[styles.stepQuestion, { color: colors.foreground }]}>What's your mood?</Text>
            <View style={styles.pillsGrid}>
              {MOODS.map((m) => (
                <GridOption key={m.value} value={m.value} selected={params.mood === m.value} label={m.label} icon={m.icon} onPress={(v) => set("mood", v)} colors={colors} />
              ))}
            </View>
          </View>
        );
      case 4:
        return (
          <View style={styles.stepContent}>
            <Text style={[styles.stepQuestion, { color: colors.foreground }]}>Budget?</Text>
            <View style={styles.pillsColumn}>
              {BUDGETS.map((b) => (
                <PillOption key={b.value} value={b.value} selected={params.budget === b.value} label={b.label} icon={b.icon} desc={b.desc} onPress={(v) => set("budget", v)} colors={colors} />
              ))}
            </View>
          </View>
        );
      case 5:
        return (
          <View style={styles.stepContent}>
            <Text style={[styles.stepQuestion, { color: colors.foreground }]}>What type?</Text>
            <View style={styles.pillsGrid}>
              {TYPES.map((t) => (
                <GridOption key={t.value} value={t.value} selected={params.scenarioType === t.value} label={t.label} icon={t.icon} onPress={(v) => set("scenarioType", v)} colors={colors} />
              ))}
            </View>
          </View>
        );
      case 6:
        return (
          <View style={styles.stepContent}>
            <Text style={[styles.stepQuestion, { color: colors.foreground }]}>Going with?</Text>
            <View style={styles.pillsGrid}>
              {SOCIAL_MODES.map((s) => (
                <GridOption key={s.value} value={s.value} selected={params.socialMode === s.value} label={s.label} icon={s.icon} onPress={(v) => set("socialMode", v)} colors={colors} />
              ))}
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <ScreenContainer containerClassName="bg-background">
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Progress */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${((step + 1) / STEPS.length) * 100}%`, backgroundColor: colors.primary }]} />
          </View>
          <Text style={[styles.progressText, { color: colors.muted }]}>
            {step + 1} of {STEPS.length}
          </Text>
        </View>

        {/* Step Content */}
        {isGenerating ? (
          <AtmosphericLoader />
        ) : (
          renderStep()
        )}

        {/* Navigation */}
        {!isGenerating && (
          <View style={styles.navigation}>
            <Pressable
              style={({ pressed }) => [
                styles.navButton,
                { backgroundColor: colors.surface, opacity: pressed ? 0.8 : 1, borderColor: colors.border, borderWidth: 1 },
              ]}
              onPress={() => step > 0 && setStep(step - 1)}
              disabled={step === 0}
            >
              <Text style={[styles.navButtonText, { color: step === 0 ? colors.muted : colors.foreground }]}>Back</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.navButton,
                { backgroundColor: canProceed() ? colors.primary : colors.surface, opacity: pressed ? 0.9 : 1 },
              ]}
              onPress={() => {
                if (step < STEPS.length - 1) {
                  setStep(step + 1);
                } else {
                  handleGenerate();
                }
              }}
              disabled={!canProceed()}
            >
              <Text style={[styles.navButtonText, { color: canProceed() ? "#FFFFFF" : colors.muted }]}>
                {step === STEPS.length - 1 ? "Generate" : "Next"}
              </Text>
            </Pressable>
          </View>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16 },
  progressContainer: { marginBottom: 28 },
  progressBar: {
    height: 4,
    backgroundColor: "rgba(0,0,0,0.1)",
    borderRadius: 2,
    marginBottom: 8,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 2 },
  progressText: { fontSize: 12, fontWeight: "500" },
  stepContent: { marginBottom: 32 },
  stepQuestion: { fontSize: 22, fontWeight: "700", marginBottom: 20, lineHeight: 28 },
  pillsColumn: { gap: 10 },
  pillsGrid: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  pillIcon: { fontSize: 20 },
  pillLabel: { fontSize: 15, fontWeight: "600" },
  pillDesc: { fontSize: 12, fontWeight: "400" },
  gridItem: {
    flex: 1,
    minWidth: "45%",
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    gap: 6,
  },
  gridIcon: { fontSize: 24 },
  gridLabel: { fontSize: 13, fontWeight: "600", textAlign: "center" },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    gap: 16,
  },
  loadingText: { fontSize: 15, fontWeight: "500" },
  navigation: {
    flexDirection: "row",
    gap: 12,
    marginTop: 32,
  },
  navButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  navButtonText: { fontSize: 15, fontWeight: "700" },
});

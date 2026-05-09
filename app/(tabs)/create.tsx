import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useScenario } from "@/lib/scenario-context";
import { trpc } from "@/lib/trpc";
import type { Duration, TimeOfDay, EnergyLevel, Mood, Budget, ScenarioType, SocialMode, ScenarioParams } from "@/shared/types";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

const STEPS = ["Duration", "Time of Day", "Energy", "Mood", "Budget", "Type", "Social"];

// Step 1: Duration
const DURATIONS: { value: Duration; label: string; icon: string }[] = [
  { value: "15-30min", label: "15–30 min", icon: "⚡" },
  { value: "30-60min", label: "30–60 min", icon: "🕐" },
  { value: "1-2h", label: "1–2 hours", icon: "🕑" },
  { value: "2-4h", label: "2–4 hours", icon: "🕒" },
  { value: "half-day", label: "Half day", icon: "🌅" },
];

// Step 2: Time of Day
const TIMES: { value: TimeOfDay; label: string; icon: string }[] = [
  { value: "morning", label: "Morning", icon: "🌅" },
  { value: "afternoon", label: "Afternoon", icon: "☀️" },
  { value: "evening", label: "Evening", icon: "🌆" },
  { value: "night", label: "Night", icon: "🌙" },
];

// Step 3: Energy
const ENERGIES: { value: EnergyLevel; label: string; icon: string; desc: string }[] = [
  { value: 1, label: "Very Tired", icon: "😴", desc: "Need rest" },
  { value: 2, label: "Low Energy", icon: "😌", desc: "Calm pace" },
  { value: 3, label: "Normal", icon: "🙂", desc: "Balanced" },
  { value: 4, label: "Active", icon: "😊", desc: "Ready to move" },
  { value: 5, label: "Max Energy", icon: "🔥", desc: "Let's go!" },
];

// Step 4: Mood
const MOODS: { value: Mood; label: string; icon: string }[] = [
  { value: "recover", label: "Recover", icon: "💆" },
  { value: "explore", label: "Explore", icon: "🗺️" },
  { value: "calm", label: "Calm", icon: "🧘" },
  { value: "new-emotions", label: "New Emotions", icon: "✨" },
  { value: "cozy", label: "Cozy Day", icon: "🏠" },
  { value: "productive", label: "Productive", icon: "💼" },
  { value: "cultural", label: "Cultural", icon: "🎭" },
];

// Step 5: Budget
const BUDGETS: { value: Budget; label: string; icon: string; desc: string }[] = [
  { value: "free", label: "Free", icon: "🆓", desc: "€0" },
  { value: "cheap", label: "Cheap", icon: "💚", desc: "€1–10" },
  { value: "medium", label: "Medium", icon: "💛", desc: "€10–25" },
  { value: "comfortable", label: "Comfortable", icon: "🧡", desc: "€25–50" },
  { value: "premium", label: "Premium", icon: "💜", desc: "€50+" },
];

// Step 6: Scenario Type
const TYPES: { value: ScenarioType; label: string; icon: string }[] = [
  { value: "walk", label: "Walk", icon: "🚶" },
  { value: "food", label: "Food", icon: "🍽️" },
  { value: "explore", label: "Explore", icon: "🗺️" },
  { value: "culture", label: "Culture", icon: "🎨" },
  { value: "activity", label: "Activity", icon: "⚽" },
  { value: "rest", label: "Rest", icon: "😌" },
  { value: "mixed", label: "Mixed", icon: "🔀" },
];

// Step 7: Social Mode
const SOCIAL_MODES: { value: SocialMode; label: string; icon: string }[] = [
  { value: "solo", label: "Solo", icon: "🧍" },
  { value: "friends", label: "Friends", icon: "👥" },
  { value: "partner", label: "Partner", icon: "💑" },
  { value: "family", label: "Family", icon: "👨‍👩‍👧" },
  { value: "random", label: "Random", icon: "🎲" },
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
            <Text style={[styles.stepQuestion, { color: colors.foreground }]}>What time of day is it?</Text>
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
            <Text style={[styles.stepQuestion, { color: colors.foreground }]}>How's your energy level?</Text>
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
            <Text style={[styles.stepQuestion, { color: colors.foreground }]}>What's your budget?</Text>
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
            <Text style={[styles.stepQuestion, { color: colors.foreground }]}>What type of scenario?</Text>
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
            <Text style={[styles.stepQuestion, { color: colors.foreground }]}>Who are you going with?</Text>
            <View style={styles.pillsGrid}>
              {SOCIAL_MODES.map((s) => (
                <GridOption key={s.value} value={s.value} selected={params.socialMode === s.value} label={s.label} icon={s.icon} onPress={(v) => set("socialMode", v)} colors={colors} />
              ))}
            </View>
            {/* City input */}
            <View style={[styles.cityInput, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <IconSymbol name="location.fill" size={16} color={colors.primary} />
              <TextInput
                style={[styles.cityInputText, { color: colors.foreground }]}
                value={params.city}
                onChangeText={(v) => set("city", v)}
                placeholder="Your city"
                placeholderTextColor={colors.muted}
                returnKeyType="done"
              />
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <ScreenContainer containerClassName="bg-background">
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Create Scenario</Text>
        <View style={[styles.aiBadge, { backgroundColor: colors.primary + "18" }]}>
          <IconSymbol name="sparkles" size={12} color={colors.primary} />
          <Text style={[styles.aiBadgeText, { color: colors.primary }]}>AI Powered</Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
        <View style={[styles.progressFill, { backgroundColor: colors.primary, width: `${((step + 1) / STEPS.length) * 100}%` }]} />
      </View>
      <View style={styles.stepIndicator}>
        <Text style={[styles.stepLabel, { color: colors.muted }]}>Step {step + 1} of {STEPS.length}</Text>
        <Text style={[styles.stepName, { color: colors.primary }]}>{STEPS[step]}</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {renderStep()}
        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Bottom navigation */}
      <View style={[styles.bottomNav, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        {step > 0 && (
          <Pressable
            style={({ pressed }) => [styles.backBtn, { backgroundColor: colors.background, borderColor: colors.border, opacity: pressed ? 0.7 : 1 }]}
            onPress={() => setStep((s) => s - 1)}
          >
            <IconSymbol name="chevron.left" size={20} color={colors.foreground} />
          </Pressable>
        )}
        {step < STEPS.length - 1 ? (
          <Pressable
            style={({ pressed }) => [
              styles.nextBtn,
              { backgroundColor: canProceed() ? colors.primary : colors.border, opacity: pressed ? 0.9 : 1 },
            ]}
            onPress={() => canProceed() && setStep((s) => s + 1)}
          >
            <Text style={[styles.nextBtnText, { color: canProceed() ? "#FFFFFF" : colors.muted }]}>Next</Text>
            <IconSymbol name="chevron.right" size={18} color={canProceed() ? "#FFFFFF" : colors.muted} />
          </Pressable>
        ) : (
          <Pressable
            style={({ pressed }) => [
              styles.generateBtn,
              { backgroundColor: canProceed() ? colors.primary : colors.border, opacity: pressed ? 0.9 : 1 },
            ]}
            onPress={handleGenerate}
            disabled={isGenerating || !canProceed()}
          >
            {isGenerating ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <IconSymbol name="sparkles" size={18} color={canProceed() ? "#FFFFFF" : colors.muted} />
                <Text style={[styles.generateBtnText, { color: canProceed() ? "#FFFFFF" : colors.muted }]}>Generate Scenario</Text>
              </>
            )}
          </Pressable>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerTitle: { fontSize: 22, fontWeight: "800" },
  aiBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  aiBadgeText: { fontSize: 12, fontWeight: "700" },
  progressBar: { height: 3, marginHorizontal: 20, borderRadius: 2 },
  progressFill: { height: 3, borderRadius: 2 },
  stepIndicator: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  stepLabel: { fontSize: 13 },
  stepName: { fontSize: 13, fontWeight: "700" },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20 },
  stepContent: { paddingTop: 8, gap: 12 },
  stepQuestion: { fontSize: 20, fontWeight: "700", lineHeight: 28, marginBottom: 8 },
  pillsColumn: { gap: 10 },
  pillsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  pillIcon: { fontSize: 22 },
  pillLabel: { fontSize: 15, fontWeight: "600", flex: 1 },
  pillDesc: { fontSize: 12 },
  gridItem: {
    width: "47%",
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 6,
  },
  gridIcon: { fontSize: 28 },
  gridLabel: { fontSize: 13, fontWeight: "600" },
  cityInput: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    marginTop: 8,
  },
  cityInputText: { flex: 1, fontSize: 15 },
  bottomNav: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    borderTopWidth: 0.5,
  },
  backBtn: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  nextBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 50,
    borderRadius: 14,
  },
  nextBtnText: { fontSize: 16, fontWeight: "700" },
  generateBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 50,
    borderRadius: 14,
  },
  generateBtnText: { fontSize: 16, fontWeight: "700" },
});

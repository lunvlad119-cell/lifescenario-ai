import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, View, Pressable, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useScenario } from "@/lib/scenario-context";
import type { Scenario, ScenarioStep } from "@/shared/types";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

function StepCard({ step, index, colors }: { step: ScenarioStep; index: number; colors: ReturnType<typeof useColors> }) {
  return (
    <View style={[styles.stepCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.stepLeft}>
        <View style={[styles.stepNumber, { backgroundColor: colors.primary + "18" }]}>
          <Text style={[styles.stepNumberText, { color: colors.primary }]}>{index + 1}</Text>
        </View>
        {index < 10 && <View style={[styles.stepLine, { backgroundColor: colors.border }]} />}
      </View>
      <View style={styles.stepContent}>
        <View style={styles.stepHeader}>
          <Text style={styles.stepEmoji}>{step.emoji}</Text>
          <View style={[styles.locationBadge, { backgroundColor: step.locationType === "outdoor" ? "#22C55E18" : "#6C63FF18" }]}>
            <Text style={[styles.locationBadgeText, { color: step.locationType === "outdoor" ? "#22C55E" : "#6C63FF" }]}>
              {step.locationType}
            </Text>
          </View>
        </View>
        <Text style={[styles.stepTitle, { color: colors.foreground }]}>{step.title}</Text>
        <Text style={[styles.stepDescription, { color: colors.muted }]}>{step.description}</Text>
        <View style={styles.stepMeta}>
          <View style={styles.metaChip}>
            <IconSymbol name="clock.fill" size={12} color={colors.muted} />
            <Text style={[styles.metaChipText, { color: colors.muted }]}>{step.duration}</Text>
          </View>
          {step.budgetEstimate && (
            <View style={styles.metaChip}>
              <IconSymbol name="dollarsign.circle.fill" size={12} color={colors.muted} />
              <Text style={[styles.metaChipText, { color: colors.muted }]}>{step.budgetEstimate}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

export default function ScenarioDetailScreen() {
  const colors = useColors();
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string; data: string }>();
  const { saveScenario, unsaveScenario, isSaved, addToHistory } = useScenario();

  let scenario: Scenario | null = null;
  try {
    if (params.data) {
      scenario = JSON.parse(params.data) as Scenario;
    }
  } catch {
    scenario = null;
  }

  if (!scenario) {
    return (
      <ScreenContainer>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.muted }]}>Scenario not found</Text>
          <Pressable style={[styles.backBtn, { backgroundColor: colors.primary }]} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>Go Back</Text>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  const saved = isSaved(scenario.id);

  const handleSave = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (saved) {
      unsaveScenario(scenario!.id);
    } else {
      saveScenario(scenario!);
    }
  };

  const handleStart = () => {
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addToHistory(scenario!);
    Alert.alert("Scenario Started!", "Your life scenario is ready. Enjoy your journey! 🗺️", [
      { text: "Let's go!", style: "default" },
    ]);
  };

  return (
    <ScreenContainer containerClassName="bg-background">
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.heroCard, { backgroundColor: colors.primary }]}>
          <View style={styles.heroNav}>
            <Pressable
              style={({ pressed }) => [styles.navBtn, { backgroundColor: "rgba(255,255,255,0.2)", opacity: pressed ? 0.7 : 1 }]}
              onPress={() => router.back()}
            >
              <IconSymbol name="chevron.left" size={20} color="#FFFFFF" />
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.navBtn, { backgroundColor: "rgba(255,255,255,0.2)", opacity: pressed ? 0.7 : 1 }]}
              onPress={handleSave}
            >
              <IconSymbol name={saved ? "bookmark.fill" : "bookmark"} size={20} color="#FFFFFF" />
            </Pressable>
          </View>
          <Text style={styles.heroEmoji}>{scenario.emoji}</Text>
          <View style={[styles.moodTag, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
            <Text style={styles.moodTagText}>{scenario.moodTag}</Text>
          </View>
          <Text style={styles.heroTitle}>{scenario.title}</Text>
          <Text style={styles.heroSubtitle}>{scenario.subtitle}</Text>
          <View style={styles.heroMeta}>
            <View style={styles.metaItem}>
              <IconSymbol name="clock.fill" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.metaText}>{scenario.totalDuration}</Text>
            </View>
            <View style={styles.metaItem}>
              <IconSymbol name="location.fill" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.metaText}>{scenario.steps.length} stops</Text>
            </View>
            <View style={styles.metaItem}>
              <IconSymbol name="sun.max.fill" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.metaText}>{scenario.weatherSuitability}</Text>
            </View>
          </View>
        </View>

        {/* Steps */}
        <View style={styles.stepsSection}>
          <Text style={[styles.stepsTitle, { color: colors.foreground }]}>Your Route</Text>
          <View style={styles.stepsList}>
            {scenario.steps.map((step, index) => (
              <StepCard key={step.id} step={step} index={index} colors={colors} />
            ))}
          </View>
        </View>

        {/* Params summary */}
        <View style={[styles.paramsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.paramsTitle, { color: colors.foreground }]}>Scenario Parameters</Text>
          <View style={styles.paramsGrid}>
            {[
              { label: "Duration", value: scenario.params.duration },
              { label: "Time", value: scenario.params.timeOfDay },
              { label: "Budget", value: scenario.params.budget },
              { label: "Type", value: scenario.params.scenarioType },
              { label: "Social", value: scenario.params.socialMode },
              { label: "Energy", value: `${scenario.params.energyLevel}/5` },
            ].map((param) => (
              <View key={param.label} style={[styles.paramChip, { backgroundColor: colors.background }]}>
                <Text style={[styles.paramLabel, { color: colors.muted }]}>{param.label}</Text>
                <Text style={[styles.paramValue, { color: colors.foreground }]}>{param.value}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={[styles.actionBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <Pressable
          style={({ pressed }) => [styles.shareBtn, { backgroundColor: colors.background, borderColor: colors.border, opacity: pressed ? 0.7 : 1 }]}
          onPress={() => {}}
        >
          <IconSymbol name="square.and.arrow.up" size={20} color={colors.primary} />
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.startBtn, { backgroundColor: colors.primary, opacity: pressed ? 0.9 : 1 }]}
          onPress={handleStart}
        >
          <IconSymbol name="play.fill" size={18} color="#FFFFFF" />
          <Text style={styles.startBtnText}>Start Scenario</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  errorContainer: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16 },
  errorText: { fontSize: 16 },
  backBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  backBtnText: { color: "#FFFFFF", fontWeight: "700" },
  heroCard: { padding: 24, paddingTop: 16, gap: 8 },
  heroNav: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  navBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  heroEmoji: { fontSize: 48, marginBottom: 4 },
  moodTag: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  moodTagText: { color: "#FFFFFF", fontSize: 12, fontWeight: "600" },
  heroTitle: { color: "#FFFFFF", fontSize: 26, fontWeight: "800", lineHeight: 32 },
  heroSubtitle: { color: "rgba(255,255,255,0.8)", fontSize: 14, lineHeight: 20 },
  heroMeta: { flexDirection: "row", gap: 16, marginTop: 4, flexWrap: "wrap" },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { color: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: "500" },
  stepsSection: { padding: 20 },
  stepsTitle: { fontSize: 18, fontWeight: "700", marginBottom: 16 },
  stepsList: { gap: 0 },
  stepCard: { flexDirection: "row", borderRadius: 16, borderWidth: 1, marginBottom: 12, overflow: "hidden" },
  stepLeft: { width: 48, alignItems: "center", paddingTop: 16, paddingBottom: 8 },
  stepNumber: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  stepNumberText: { fontSize: 13, fontWeight: "700" },
  stepLine: { width: 2, flex: 1, marginTop: 4, marginBottom: -12 },
  stepContent: { flex: 1, padding: 14, paddingLeft: 8, gap: 6 },
  stepHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  stepEmoji: { fontSize: 24 },
  locationBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  locationBadgeText: { fontSize: 11, fontWeight: "600" },
  stepTitle: { fontSize: 15, fontWeight: "700", lineHeight: 20 },
  stepDescription: { fontSize: 13, lineHeight: 19 },
  stepMeta: { flexDirection: "row", gap: 12, marginTop: 4 },
  metaChip: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaChipText: { fontSize: 12 },
  paramsCard: { marginHorizontal: 20, borderRadius: 16, borderWidth: 1, padding: 16 },
  paramsTitle: { fontSize: 15, fontWeight: "700", marginBottom: 12 },
  paramsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  paramChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, minWidth: 80 },
  paramLabel: { fontSize: 10, fontWeight: "500", textTransform: "uppercase", letterSpacing: 0.5 },
  paramValue: { fontSize: 13, fontWeight: "600", marginTop: 2, textTransform: "capitalize" },
  actionBar: { flexDirection: "row", gap: 12, padding: 16, borderTopWidth: 0.5 },
  shareBtn: { width: 50, height: 50, borderRadius: 14, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  startBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 50, borderRadius: 14 },
  startBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
});

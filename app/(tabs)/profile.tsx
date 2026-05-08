import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  FlatList,
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
import type { Scenario, Budget, EnergyLevel, SocialMode } from "@/shared/types";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

const INTERESTS = [
  "Culture", "Food", "Nature", "Art", "Music", "History",
  "Architecture", "Sports", "Photography", "Literature",
  "Coffee", "Markets", "Parks", "Nightlife", "Wellness",
];

const BUDGET_OPTIONS: { value: Budget; label: string; icon: string }[] = [
  { value: "free", label: "Free", icon: "🆓" },
  { value: "cheap", label: "Cheap", icon: "💚" },
  { value: "medium", label: "Medium", icon: "💛" },
  { value: "comfortable", label: "Comfortable", icon: "🧡" },
  { value: "premium", label: "Premium", icon: "💜" },
];

const SOCIAL_OPTIONS: { value: SocialMode; label: string; icon: string }[] = [
  { value: "solo", label: "Solo", icon: "🧍" },
  { value: "friends", label: "Friends", icon: "👥" },
  { value: "partner", label: "Partner", icon: "💑" },
  { value: "family", label: "Family", icon: "👨‍👩‍👧" },
];

function HistoryCard({ scenario, colors }: { scenario: Scenario; colors: ReturnType<typeof useColors> }) {
  const router = useRouter();
  return (
    <Pressable
      style={({ pressed }) => [
        styles.historyCard,
        { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.85 : 1 },
      ]}
      onPress={() => router.push({ pathname: "/scenario/[id]" as any, params: { id: scenario.id, data: JSON.stringify(scenario) } })}
    >
      <Text style={styles.historyEmoji}>{scenario.emoji}</Text>
      <View style={styles.historyContent}>
        <Text style={[styles.historyTitle, { color: colors.foreground }]} numberOfLines={1}>{scenario.title}</Text>
        <Text style={[styles.historyDate, { color: colors.muted }]}>
          {new Date(scenario.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </Text>
      </View>
      <View style={[styles.moodTag, { backgroundColor: colors.primary + "18" }]}>
        <Text style={[styles.moodTagText, { color: colors.primary }]}>{scenario.moodTag}</Text>
      </View>
    </Pressable>
  );
}

export default function ProfileScreen() {
  const colors = useColors();
  const { state, updatePreferences, unsaveScenario } = useScenario();
  const [editingCity, setEditingCity] = useState(false);
  const [cityInput, setCityInput] = useState(state.preferences.city);

  const toggleInterest = (interest: string) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const current = state.preferences.interests;
    if (current.includes(interest)) {
      updatePreferences({ interests: current.filter((i) => i !== interest) });
    } else {
      updatePreferences({ interests: [...current, interest] });
    }
  };

  const handleSaveCity = () => {
    if (cityInput.trim()) {
      updatePreferences({ city: cityInput.trim() });
    }
    setEditingCity(false);
  };

  const stats = [
    { label: "Scenarios", value: state.history.length.toString(), icon: "🗺️" },
    { label: "Saved", value: state.savedScenarios.length.toString(), icon: "🔖" },
    { label: "Cities", value: "1", icon: "🏙️" },
  ];

  return (
    <ScreenContainer containerClassName="bg-background">
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.profileHeader, { backgroundColor: colors.primary }]}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarEmoji}>🧭</Text>
          </View>
          <Text style={styles.profileName}>Life Explorer</Text>
          {editingCity ? (
            <View style={styles.cityEditRow}>
              <TextInput
                style={[styles.cityEditInput, { color: "#FFFFFF", borderColor: "rgba(255,255,255,0.4)" }]}
                value={cityInput}
                onChangeText={setCityInput}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleSaveCity}
                placeholderTextColor="rgba(255,255,255,0.6)"
              />
              <Pressable onPress={handleSaveCity}>
                <IconSymbol name="checkmark.circle.fill" size={24} color="rgba(255,255,255,0.9)" />
              </Pressable>
            </View>
          ) : (
            <Pressable style={styles.cityRow} onPress={() => setEditingCity(true)}>
              <IconSymbol name="location.fill" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.cityText}>{state.preferences.city}</Text>
              <IconSymbol name="pencil" size={12} color="rgba(255,255,255,0.6)" />
            </Pressable>
          )}
        </View>

        {/* Stats */}
        <View style={[styles.statsRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {stats.map((stat, i) => (
            <View key={stat.label} style={[styles.statItem, i < stats.length - 1 && { borderRightWidth: 1, borderRightColor: colors.border }]}>
              <Text style={styles.statIcon}>{stat.icon}</Text>
              <Text style={[styles.statValue, { color: colors.foreground }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: colors.muted }]}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Interests */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>My Interests</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.muted }]}>Tap to toggle your interests</Text>
          <View style={styles.interestsGrid}>
            {INTERESTS.map((interest) => {
              const active = state.preferences.interests.includes(interest);
              return (
                <Pressable
                  key={interest}
                  style={({ pressed }) => [
                    styles.interestChip,
                    {
                      backgroundColor: active ? colors.primary : colors.surface,
                      borderColor: active ? colors.primary : colors.border,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                  onPress={() => toggleInterest(interest)}
                >
                  <Text style={[styles.interestLabel, { color: active ? "#FFFFFF" : colors.foreground }]}>
                    {interest}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Default Preferences</Text>
          <View style={[styles.prefsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {/* Default Budget */}
            <View style={styles.prefRow}>
              <Text style={[styles.prefLabel, { color: colors.muted }]}>Default Budget</Text>
              <View style={styles.prefOptions}>
                {BUDGET_OPTIONS.map((opt) => (
                  <Pressable
                    key={opt.value}
                    style={({ pressed }) => [
                      styles.prefChip,
                      {
                        backgroundColor: state.preferences.defaultBudget === opt.value ? colors.primary : colors.background,
                        borderColor: state.preferences.defaultBudget === opt.value ? colors.primary : colors.border,
                        opacity: pressed ? 0.8 : 1,
                      },
                    ]}
                    onPress={() => updatePreferences({ defaultBudget: opt.value })}
                  >
                    <Text style={styles.prefChipIcon}>{opt.icon}</Text>
                    <Text style={[styles.prefChipLabel, { color: state.preferences.defaultBudget === opt.value ? "#FFFFFF" : colors.foreground }]}>
                      {opt.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            {/* Default Social Mode */}
            <View style={styles.prefRow}>
              <Text style={[styles.prefLabel, { color: colors.muted }]}>Usually Going</Text>
              <View style={styles.prefOptions}>
                {SOCIAL_OPTIONS.map((opt) => (
                  <Pressable
                    key={opt.value}
                    style={({ pressed }) => [
                      styles.prefChip,
                      {
                        backgroundColor: state.preferences.defaultSocialMode === opt.value ? colors.primary : colors.background,
                        borderColor: state.preferences.defaultSocialMode === opt.value ? colors.primary : colors.border,
                        opacity: pressed ? 0.8 : 1,
                      },
                    ]}
                    onPress={() => updatePreferences({ defaultSocialMode: opt.value })}
                  >
                    <Text style={styles.prefChipIcon}>{opt.icon}</Text>
                    <Text style={[styles.prefChipLabel, { color: state.preferences.defaultSocialMode === opt.value ? "#FFFFFF" : colors.foreground }]}>
                      {opt.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Saved Scenarios */}
        {state.savedScenarios.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Saved Scenarios</Text>
            <View style={styles.historyList}>
              {state.savedScenarios.map((scenario) => (
                <HistoryCard key={scenario.id} scenario={scenario} colors={colors} />
              ))}
            </View>
          </View>
        )}

        {/* History */}
        {state.history.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>History</Text>
            <View style={styles.historyList}>
              {state.history.slice(0, 10).map((scenario) => (
                <HistoryCard key={scenario.id} scenario={scenario} colors={colors} />
              ))}
            </View>
          </View>
        )}

        {state.history.length === 0 && state.savedScenarios.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🗺️</Text>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No scenarios yet</Text>
            <Text style={[styles.emptySubtitle, { color: colors.muted }]}>Create your first scenario to see it here</Text>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  profileHeader: {
    alignItems: "center",
    paddingTop: 24,
    paddingBottom: 28,
    gap: 8,
  },
  avatarContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  avatarEmoji: { fontSize: 36 },
  profileName: { color: "#FFFFFF", fontSize: 22, fontWeight: "800" },
  cityRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  cityText: { color: "rgba(255,255,255,0.85)", fontSize: 14 },
  cityEditRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  cityEditInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 14,
    color: "#FFFFFF",
    minWidth: 120,
  },
  statsRow: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: -16,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  statItem: { flex: 1, alignItems: "center", paddingVertical: 16, gap: 2 },
  statIcon: { fontSize: 20 },
  statValue: { fontSize: 20, fontWeight: "800" },
  statLabel: { fontSize: 12 },
  section: { paddingHorizontal: 20, marginTop: 24 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 4 },
  sectionSubtitle: { fontSize: 13, marginBottom: 12 },
  interestsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  interestChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  interestLabel: { fontSize: 13, fontWeight: "500" },
  prefsCard: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  prefRow: { padding: 14, gap: 10 },
  prefLabel: { fontSize: 13, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },
  prefOptions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  prefChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  prefChipIcon: { fontSize: 14 },
  prefChipLabel: { fontSize: 12, fontWeight: "600" },
  divider: { height: 1, marginHorizontal: 14 },
  historyList: { gap: 10 },
  historyCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  historyEmoji: { fontSize: 28 },
  historyContent: { flex: 1 },
  historyTitle: { fontSize: 14, fontWeight: "600" },
  historyDate: { fontSize: 12, marginTop: 2 },
  moodTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  moodTagText: { fontSize: 11, fontWeight: "600" },
  emptyState: { alignItems: "center", paddingVertical: 40, gap: 8 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: "700" },
  emptySubtitle: { fontSize: 14 },
});

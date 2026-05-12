import { useRouter } from "expo-router";
import { useState } from "react";
import {
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
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useScenario } from "@/lib/scenario-context";
import { useThemeContext } from "@/lib/theme-provider";
import type { Scenario, Budget, SocialMode } from "@/shared/types";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import { useTranslation } from "react-i18next";
import { setLanguage, getCurrentLanguage } from "@/lib/i18n";

const INTERESTS = [
  "Culture",
  "Food",
  "Nature",
  "Art",
  "Music",
  "History",
  "Architecture",
  "Sports",
  "Photography",
  "Literature",
  "Coffee",
  "Markets",
  "Parks",
  "Nightlife",
  "Wellness",
];

const BUDGET_OPTIONS: { value: Budget; label: string; icon: string }[] = [
  { value: "free", label: "Free", icon: "🆓" },
  { value: "cheap", label: "Budget", icon: "💚" },
  { value: "medium", label: "Comfortable", icon: "💛" },
  { value: "comfortable", label: "Premium", icon: "💜" },
];

const SOCIAL_OPTIONS: { value: SocialMode; label: string; icon: string }[] = [
  { value: "solo", label: "Solo", icon: "🧍" },
  { value: "friends", label: "Friends", icon: "👥" },
  { value: "partner", label: "Partner", icon: "💑" },
  { value: "family", label: "Family", icon: "👨‍👩‍👧" },
];

function HistoryCard({
  scenario,
  colors,
}: {
  scenario: Scenario;
  colors: ReturnType<typeof useColors>;
}) {
  const router = useRouter();
  return (
    <Pressable
      style={({ pressed }) => [
        styles.historyCard,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
      onPress={() =>
        router.push({
          pathname: "/scenario/[id]" as any,
          params: { id: scenario.id, data: JSON.stringify(scenario) },
        })
      }
    >
      <Text style={styles.historyEmoji}>{scenario.emoji}</Text>
      <View style={styles.historyContent}>
        <Text
          style={[styles.historyTitle, { color: colors.foreground }]}
          numberOfLines={1}
        >
          {scenario.title}
        </Text>
        <Text style={[styles.historyDate, { color: colors.muted }]}>
          {new Date(scenario.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </Text>
      </View>
      <View style={[styles.moodTag, { backgroundColor: colors.primary + "18" }]}>
        <Text style={[styles.moodTagText, { color: colors.primary }]}>
          {scenario.moodTag}
        </Text>
      </View>
    </Pressable>
  );
}

export default function ProfileScreen() {
  const colors = useColors();
  const { t } = useTranslation();
  const { colorScheme, setColorScheme } = useThemeContext();
  const { state, updatePreferences, unsaveScenario } = useScenario();
  const [editingCity, setEditingCity] = useState(false);
  const [cityInput, setCityInput] = useState(state.preferences.city);
  const [currentLanguage, setCurrentLanguage] = useState(getCurrentLanguage());

  const toggleInterest = (interest: string) => {
    if (Platform.OS !== "web")
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const current = state.preferences.interests;
    if (current.includes(interest)) {
      updatePreferences({
        interests: current.filter((i) => i !== interest),
      });
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

  const handleLanguageChange = async (lang: string) => {
    if (Platform.OS !== "web")
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await setLanguage(lang);
    setCurrentLanguage(lang);
  };

  const stats = [
    {
      label: t("profile.scenarios"),
      value: state.history.length.toString(),
      icon: "🗺️",
    },
    {
      label: t("profile.saved"),
      value: state.savedScenarios.length.toString(),
      icon: "❤️",
    },
    {
      label: t("profile.interests"),
      value: state.preferences.interests.length.toString(),
      icon: "⭐",
    },
  ];

  return (
    <ScreenContainer containerClassName="bg-background">
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarEmoji}>👤</Text>
          </View>
          <View style={styles.headerContent}>
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>
              {t("profile.title")}
            </Text>
            <Text style={[styles.headerSubtitle, { color: colors.muted }]}>
              {state.preferences.city}
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          {stats.map((stat, idx) => (
            <View
              key={idx}
              style={[
                styles.statCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={styles.statIcon}>{stat.icon}</Text>
              <Text
                style={[styles.statValue, { color: colors.foreground }]}
              >
                {stat.value}
              </Text>
              <Text style={[styles.statLabel, { color: colors.muted }]}>
                {stat.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Language Selector */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            {t("profile.language")}
          </Text>
          <View style={styles.languageGrid}>
            {["en", "ru"].map((lang) => (
              <Pressable
                key={lang}
                style={({ pressed }) => [
                  styles.languageButton,
                  {
                    backgroundColor:
                      currentLanguage === lang
                        ? colors.primary
                        : colors.surface,
                    borderColor:
                      currentLanguage === lang ? colors.primary : colors.border,
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
                onPress={() => handleLanguageChange(lang)}
              >
                <Text
                  style={[
                    styles.languageLabel,
                    {
                      color:
                        currentLanguage === lang
                          ? "#FFFFFF"
                          : colors.foreground,
                    },
                  ]}
                >
                  {lang === "en" ? "🇬🇧 English" : "🇷🇺 Русский"}
                </Text>
                {currentLanguage === lang && (
                  <IconSymbol
                    name="checkmark.circle.fill"
                    size={20}
                    color="#FFFFFF"
                  />
                )}
              </Pressable>
            ))}
          </View>
        </View>

        {/* Theme Selector */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            {t("profile.theme")}
          </Text>
          <View style={styles.themeGrid}>
            {["light", "dark"].map((theme) => (
              <Pressable
                key={theme}
                style={({ pressed }) => [
                  styles.themeButton,
                  {
                    backgroundColor:
                      colorScheme === theme
                        ? colors.primary
                        : colors.surface,
                    borderColor:
                      colorScheme === theme ? colors.primary : colors.border,
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
                onPress={() => setColorScheme(colorScheme === 'light' ? 'dark' : 'light')}
              >
                <IconSymbol
                  name={theme === "light" ? "sun.max.fill" : "moon.fill"}
                  size={24}
                  color={colorScheme === theme ? "#FFFFFF" : colors.primary}
                />
                <Text
                  style={[
                    styles.themeLabel,
                    {
                      color:
                        colorScheme === theme
                          ? "#FFFFFF"
                          : colors.foreground,
                    },
                  ]}
                >
                  {theme === "light"
                    ? t("profile.light")
                    : t("profile.dark")}
                </Text>
                {colorScheme === theme && (
                  <IconSymbol
                    name="checkmark.circle.fill"
                    size={18}
                    color="#FFFFFF"
                  />
                )}
              </Pressable>
            ))}
          </View>
        </View>

        {/* City Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            {t("profile.city")}
          </Text>
          {!editingCity ? (
            <Pressable
              style={({ pressed }) => [
                styles.cityDisplay,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
              onPress={() => setEditingCity(true)}
            >
              <View style={styles.cityDisplayContent}>
                <IconSymbol
                  name="location.fill"
                  size={18}
                  color={colors.primary}
                />
                <Text
                  style={[styles.cityDisplayText, { color: colors.foreground }]}
                >
                  {state.preferences.city}
                </Text>
              </View>
              <IconSymbol name="pencil" size={16} color={colors.muted} />
            </Pressable>
          ) : (
            <View style={styles.cityEditContainer}>
              <TextInput
                style={[
                  styles.cityInput,
                  {
                    color: colors.foreground,
                    borderColor: colors.border,
                    backgroundColor: colors.surface,
                  },
                ]}
                placeholder={t("profile.enterCity")}
                placeholderTextColor={colors.muted}
                value={cityInput}
                onChangeText={setCityInput}
                autoFocus
              />
              <View style={styles.cityButtonsRow}>
                <Pressable
                  style={({ pressed }) => [
                    styles.cityButton,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                  onPress={() => setEditingCity(false)}
                >
                  <Text
                    style={[
                      styles.cityButtonText,
                      { color: colors.foreground },
                    ]}
                  >
                    {t("common.cancel")}
                  </Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [
                    styles.cityButton,
                    {
                      backgroundColor: colors.primary,
                      opacity: pressed ? 0.9 : 1,
                    },
                  ]}
                  onPress={handleSaveCity}
                >
                  <Text style={[styles.cityButtonText, { color: "#FFFFFF" }]}>
                    {t("common.save")}
                  </Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>

        {/* Interests */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            {t("profile.interests")}
          </Text>
          <View style={styles.interestGrid}>
            {INTERESTS.map((interest) => (
              <Pressable
                key={interest}
                style={({ pressed }) => [
                  styles.interestTag,
                  {
                    backgroundColor: state.preferences.interests.includes(
                      interest
                    )
                      ? colors.primary
                      : colors.surface,
                    borderColor: state.preferences.interests.includes(
                      interest
                    )
                      ? colors.primary
                      : colors.border,
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
                onPress={() => toggleInterest(interest)}
              >
                <Text
                  style={[
                    styles.interestText,
                    {
                      color: state.preferences.interests.includes(interest)
                        ? "#FFFFFF"
                        : colors.foreground,
                    },
                  ]}
                >
                  {interest}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Saved Scenarios */}
        {state.savedScenarios.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              {t("profile.saved")}
            </Text>
            <FlatList
              data={state.savedScenarios}
              scrollEnabled={false}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.historyItemWrapper}>
                  <HistoryCard scenario={item} colors={colors} />
                  <Pressable
                    style={({ pressed }) => [
                      styles.unsaveButton,
                      { opacity: pressed ? 0.7 : 1 },
                    ]}
                    onPress={() => unsaveScenario(item.id)}
                  >
                    <IconSymbol
                      name="heart.fill"
                      size={18}
                      color={colors.primary}
                    />
                  </Pressable>
                </View>
              )}
            />
          </View>
        )}

        {/* History */}
        {state.history.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              {t("profile.history")}
            </Text>
            <FlatList
              data={state.history}
              scrollEnabled={false}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <HistoryCard scenario={item} colors={colors} />
              )}
            />
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarEmoji: { fontSize: 28 },
  headerContent: { flex: 1 },
  headerTitle: { fontSize: 20, fontWeight: "700", marginBottom: 2 },
  headerSubtitle: { fontSize: 13, fontWeight: "500" },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    gap: 4,
  },
  statIcon: { fontSize: 20 },
  statValue: { fontSize: 16, fontWeight: "700" },
  statLabel: { fontSize: 11, fontWeight: "500" },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  languageGrid: {
    flexDirection: "row",
    gap: 12,
  },
  languageButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  languageLabel: { fontSize: 14, fontWeight: "600" },
  themeGrid: {
    flexDirection: "row",
    gap: 12,
  },
  themeButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  themeLabel: { fontSize: 13, fontWeight: "600" },
  cityDisplay: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  cityDisplayContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cityDisplayText: { fontSize: 15, fontWeight: "600" },
  cityEditContainer: { gap: 12 },
  cityInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: "500",
  },
  cityButtonsRow: { flexDirection: "row", gap: 12 },
  cityButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
  },
  cityButtonText: { fontSize: 14, fontWeight: "700" },
  interestGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  interestTag: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  interestText: { fontSize: 13, fontWeight: "600" },
  historyItemWrapper: { position: "relative", marginBottom: 12 },
  historyCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  historyEmoji: { fontSize: 24 },
  historyContent: { flex: 1, gap: 2 },
  historyTitle: { fontSize: 14, fontWeight: "600" },
  historyDate: { fontSize: 12, fontWeight: "500" },
  moodTag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  moodTagText: { fontSize: 11, fontWeight: "700" },
  unsaveButton: {
    position: "absolute",
    right: 12,
    top: 12,
  },
});

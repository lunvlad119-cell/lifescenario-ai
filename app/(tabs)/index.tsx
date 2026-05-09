import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useScenario } from "@/lib/scenario-context";
import { getWeatherByCity, getWeatherEmoji } from "@/lib/weather-service";
import type { Scenario } from "@/shared/types";
import type { WeatherData } from "@/lib/weather-service";
import { SAMPLE_SCENARIOS, MINI_ROUTES } from "@/lib/sample-data";

function WeatherWidget({ weather, colors, loading }: { weather: WeatherData | null; colors: ReturnType<typeof useColors>; loading: boolean }) {
  if (loading) {
    return (
      <View style={[styles.weatherWidget, { backgroundColor: colors.primary + "18" }]}>
        <Text style={[styles.weatherText, { color: colors.primary }]}>Loading...</Text>
      </View>
    );
  }

  if (!weather) {
    return (
      <View style={[styles.weatherWidget, { backgroundColor: colors.primary + "18" }]}>
        <IconSymbol name="sun.max.fill" size={16} color={colors.primary} />
        <Text style={[styles.weatherText, { color: colors.primary }]}>--°C</Text>
      </View>
    );
  }

  const emoji = getWeatherEmoji(weather.main);
  return (
    <View style={[styles.weatherWidget, { backgroundColor: colors.primary + "18" }]}>
      <Text style={styles.weatherEmoji}>{emoji}</Text>
      <Text style={[styles.weatherText, { color: colors.primary }]}>
        {Math.round(weather.temp)}°C
      </Text>
    </View>
  );
}

function DailyScenarioCard({ scenario, colors }: { scenario: Scenario; colors: ReturnType<typeof useColors> }) {
  const router = useRouter();
  return (
    <Pressable
      style={({ pressed }) => [
        styles.dailyCard,
        { backgroundColor: colors.primary, opacity: pressed ? 0.92 : 1 },
      ]}
      onPress={() => router.push({ pathname: "/scenario/[id]" as any, params: { id: scenario.id, data: JSON.stringify(scenario) } })}
    >
      <View style={styles.dailyCardTop}>
        <View style={styles.dailyCardLeft}>
          <Text style={styles.dailyCardEmoji}>{scenario.emoji}</Text>
          <View>
            <Text style={styles.dailyCardTitle}>{scenario.title}</Text>
            <Text style={styles.dailyCardSubtitle}>{scenario.subtitle}</Text>
          </View>
        </View>
        <View style={[styles.moodTag, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
          <Text style={styles.moodTagText}>{scenario.moodTag}</Text>
        </View>
      </View>

      <View style={styles.dailyCardMeta}>
        <View style={styles.metaItem}>
          <IconSymbol name="clock.fill" size={13} color="rgba(255,255,255,0.8)" />
          <Text style={styles.metaText}>{scenario.totalDuration}</Text>
        </View>
        <View style={styles.metaItem}>
          <IconSymbol name="location.fill" size={13} color="rgba(255,255,255,0.8)" />
          <Text style={styles.metaText}>{scenario.steps.length} stops</Text>
        </View>
      </View>

      <View style={[styles.startButton, { backgroundColor: "rgba(255,255,255,0.22)" }]}>
        <Text style={styles.startButtonText}>View Scenario</Text>
        <IconSymbol name="chevron.right" size={16} color="#FFFFFF" />
      </View>
    </Pressable>
  );
}

function MiniRouteCard({ scenario, colors }: { scenario: Scenario; colors: ReturnType<typeof useColors> }) {
  const router = useRouter();
  return (
    <Pressable
      style={({ pressed }) => [
        styles.miniCard,
        { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.85 : 1 },
      ]}
      onPress={() => router.push({ pathname: "/scenario/[id]" as any, params: { id: scenario.id, data: JSON.stringify(scenario) } })}
    >
      <Text style={styles.miniCardEmoji}>{scenario.emoji}</Text>
      <Text style={[styles.miniCardTitle, { color: colors.foreground }]} numberOfLines={2}>
        {scenario.title}
      </Text>
      <Text style={[styles.miniCardDuration, { color: colors.muted }]}>{scenario.totalDuration}</Text>
    </Pressable>
  );
}

function SmartSuggestionCard({ weather, colors }: { weather: WeatherData | null; colors: ReturnType<typeof useColors> }) {
  const router = useRouter();
  
  let suggestion = {
    icon: "☀️",
    text: "Perfect weather for an outdoor scenario",
    action: "Create outdoor route",
  };

  if (weather?.main === "Rain") {
    suggestion = {
      icon: "🌧️",
      text: "Cozy indoor vibes today",
      action: "Find indoor places",
    };
  } else if (weather?.main === "Cloud") {
    suggestion = {
      icon: "☁️",
      text: "Great for a calm walk",
      action: "Plan a walk",
    };
  }

  return (
    <Pressable
      style={({ pressed }) => [
        styles.suggestionCard,
        { backgroundColor: colors.surface, borderColor: colors.primary + "40", opacity: pressed ? 0.85 : 1 },
      ]}
      onPress={() => router.push("/(tabs)/create" as any)}
    >
      <Text style={styles.suggestionIcon}>{suggestion.icon}</Text>
      <View style={styles.suggestionContent}>
        <Text style={[styles.suggestionText, { color: colors.foreground }]}>{suggestion.text}</Text>
        <Text style={[styles.suggestionAction, { color: colors.primary }]}>{suggestion.action} →</Text>
      </View>
    </Pressable>
  );
}

function CreateButton({ colors }: { colors: ReturnType<typeof useColors> }) {
  const router = useRouter();
  return (
    <Pressable
      style={({ pressed }) => [
        styles.createButton,
        { backgroundColor: colors.primary, opacity: pressed ? 0.9 : 1 },
      ]}
      onPress={() => router.push("/(tabs)/create" as any)}
    >
      <IconSymbol name="sparkles" size={20} color="#FFFFFF" />
      <Text style={styles.createButtonText}>Create Scenario</Text>
    </Pressable>
  );
}

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const { state, setWeather, setWeatherLoading } = useScenario();
  const [dailyScenario, setDailyScenario] = useState<Scenario>(SAMPLE_SCENARIOS[0]);

  // Fetch weather on mount and when city changes
  useEffect(() => {
    const fetchWeather = async () => {
      setWeatherLoading(true);
      const result = await getWeatherByCity(state.preferences.city);
      if (!("code" in result)) {
        setWeather(result);
      }
      setWeatherLoading(false);
    };

    fetchWeather();
  }, [state.preferences.city, setWeather, setWeatherLoading]);

  useEffect(() => {
    if (state.dailyScenario) {
      setDailyScenario(state.dailyScenario);
    }
  }, [state.dailyScenario]);

  return (
    <ScreenContainer containerClassName="bg-background">
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.muted }]}>Good evening</Text>
            <View style={styles.cityRow}>
              <IconSymbol name="location.fill" size={16} color={colors.primary} />
              <Text style={[styles.cityName, { color: colors.foreground }]}>
                {state.preferences.city}
              </Text>
            </View>
          </View>
          <WeatherWidget weather={state.weather} colors={colors} loading={state.weatherLoading} />
        </View>

        {/* Daily Scenario */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Today's Scenario</Text>
            <View style={[styles.aiBadge, { backgroundColor: colors.primary + "18" }]}>
              <IconSymbol name="sparkles" size={12} color={colors.primary} />
              <Text style={[styles.aiBadgeText, { color: colors.primary }]}>AI</Text>
            </View>
          </View>
          <DailyScenarioCard scenario={dailyScenario} colors={colors} />
        </View>

        {/* Mini Routes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Quick Escapes</Text>
            <Text style={[styles.sectionSubtitle, { color: colors.muted }]}>10–40 min</Text>
          </View>
          <FlatList
            data={MINI_ROUTES.slice(0, 3)}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <MiniRouteCard scenario={item} colors={colors} />}
            contentContainerStyle={styles.miniRoutesList}
            scrollEnabled
          />
        </View>

        {/* Smart Suggestion */}
        <View style={styles.section}>
          <SmartSuggestionCard weather={state.weather} colors={colors} />
        </View>

        {/* Create Button */}
        <View style={styles.section}>
          <CreateButton colors={colors} />
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    paddingBottom: 20,
  },
  greeting: { fontSize: 13, fontWeight: "400", marginBottom: 2 },
  cityRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  cityName: { fontSize: 20, fontWeight: "700" },
  weatherWidget: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  weatherEmoji: { fontSize: 16 },
  weatherText: { fontSize: 13, fontWeight: "600" },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "700" },
  sectionSubtitle: { fontSize: 13, fontWeight: "400" },
  aiBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  aiBadgeText: { fontSize: 11, fontWeight: "700" },
  // Daily card
  dailyCard: {
    borderRadius: 20,
    padding: 16,
    gap: 12,
  },
  dailyCardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  dailyCardLeft: { flexDirection: "row", gap: 12, flex: 1 },
  moodTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  moodTagText: { color: "#FFFFFF", fontSize: 12, fontWeight: "600" },
  dailyCardEmoji: { fontSize: 32 },
  dailyCardTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "800", lineHeight: 24 },
  dailyCardSubtitle: { color: "rgba(255,255,255,0.8)", fontSize: 13, lineHeight: 18 },
  dailyCardMeta: { flexDirection: "row", gap: 12 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { color: "rgba(255,255,255,0.8)", fontSize: 12, fontWeight: "500" },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 11,
    borderRadius: 14,
  },
  startButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  // Mini routes
  miniRoutesList: { paddingRight: 16, gap: 12 },
  miniCard: {
    width: 130,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    gap: 8,
  },
  miniCardEmoji: { fontSize: 28 },
  miniCardTitle: { fontSize: 13, fontWeight: "600", lineHeight: 18 },
  miniCardDuration: { fontSize: 12, fontWeight: "500" },
  // Smart suggestion
  suggestionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  suggestionIcon: { fontSize: 24 },
  suggestionContent: { flex: 1 },
  suggestionText: { fontSize: 14, fontWeight: "500", lineHeight: 20 },
  suggestionAction: { fontSize: 12, fontWeight: "600", marginTop: 2 },
  // Create button
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
  },
  createButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
});

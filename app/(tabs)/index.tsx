import { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Modal,
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
import { getWeatherByCity, getWeatherEmoji } from "@/lib/weather-service";
import type { Scenario } from "@/shared/types";
import type { WeatherData } from "@/lib/weather-service";
import { SAMPLE_SCENARIOS, MINI_ROUTES } from "@/lib/sample-data";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";

const POPULAR_CITIES = ["Prague", "Berlin", "Paris", "London", "Tokyo", "New York", "Barcelona", "Rome"];

function WeatherWidget({
  weather,
  colors,
  loading,
  t,
}: {
  weather: WeatherData | null;
  colors: ReturnType<typeof useColors>;
  loading: boolean;
  t: any;
}) {
  if (loading) {
    return (
      <View style={[styles.weatherWidget, { backgroundColor: colors.primary + "18" }]}>
        <Text style={[styles.weatherText, { color: colors.primary }]}>
          {t("common.loading")}
        </Text>
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

function DailyScenarioCard({
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
        styles.dailyCard,
        { backgroundColor: colors.primary, opacity: pressed ? 0.92 : 1 },
      ]}
      onPress={() =>
        router.push({
          pathname: "/scenario/[id]" as any,
          params: { id: scenario.id, data: JSON.stringify(scenario) },
        })
      }
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
          <IconSymbol
            name="clock.fill"
            size={13}
            color="rgba(255,255,255,0.8)"
          />
          <Text style={styles.metaText}>{scenario.totalDuration}</Text>
        </View>
        <View style={styles.metaItem}>
          <IconSymbol
            name="location.fill"
            size={13}
            color="rgba(255,255,255,0.8)"
          />
          <Text style={styles.metaText}>{scenario.steps.length} stops</Text>
        </View>
      </View>
    </Pressable>
  );
}

function MiniRouteCard({
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
        styles.miniCard,
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
      <Text style={styles.miniCardEmoji}>{scenario.emoji}</Text>
      <Text
        style={[styles.miniCardTitle, { color: colors.foreground }]}
        numberOfLines={2}
      >
        {scenario.title}
      </Text>
      <Text style={[styles.miniCardDuration, { color: colors.muted }]}>
        {scenario.totalDuration}
      </Text>
    </Pressable>
  );
}

function SmartSuggestionCard({
  weather,
  colors,
  t,
}: {
  weather: WeatherData | null;
  colors: ReturnType<typeof useColors>;
  t: any;
}) {
  const router = useRouter();

  let suggestion = {
    icon: "☀️",
    text: t("home.perfectWeather"),
    action: t("home.createOutdoor"),
  };

  if (weather?.main === "Rain") {
    suggestion = {
      icon: "🌧️",
      text: t("home.cozyIndoor"),
      action: t("home.findIndoor"),
    };
  } else if (weather?.main === "Cloud") {
    suggestion = {
      icon: "☁️",
      text: t("home.calmWalk"),
      action: t("home.planWalk"),
    };
  }

  return (
    <Pressable
      style={({ pressed }) => [
        styles.suggestionCard,
        {
          backgroundColor: colors.surface,
          borderColor: colors.primary + "40",
          opacity: pressed ? 0.85 : 1,
        },
      ]}
      onPress={() => router.push("/(tabs)/create" as any)}
    >
      <Text style={styles.suggestionIcon}>{suggestion.icon}</Text>
      <View style={styles.suggestionContent}>
        <Text style={[styles.suggestionText, { color: colors.foreground }]}>
          {suggestion.text}
        </Text>
        <Text style={[styles.suggestionAction, { color: colors.primary }]}>
          {suggestion.action} →
        </Text>
      </View>
    </Pressable>
  );
}

function CreateButton({
  colors,
  t,
}: {
  colors: ReturnType<typeof useColors>;
  t: any;
}) {
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
      <Text style={styles.createButtonText}>{t("home.createScenario")}</Text>
    </Pressable>
  );
}

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const { t } = useTranslation();
  const { state, setWeather, setWeatherLoading, updatePreferences } = useScenario();
  const [weather, setWeatherState] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoadingState] = useState(false);
  const [dailyScenario, setDailyScenario] = useState<Scenario>(SAMPLE_SCENARIOS[0]);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [recentCities, setRecentCities] = useState<string[]>([]);

  const filteredCities = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return POPULAR_CITIES;
    return POPULAR_CITIES.filter((c) => c.toLowerCase().includes(q));
  }, [search]);

  // Fetch weather on mount and when city changes
  useEffect(() => {
    const fetchWeather = async () => {
      setWeatherLoadingState(true);
      const result = await getWeatherByCity(state.preferences.city);
      if (!("code" in result)) {
        setWeatherState(result);
        setWeather(result);
      }
      setWeatherLoadingState(false);
      setWeatherLoading(false);
    };

    fetchWeather();
  }, [state.preferences.city, setWeather, setWeatherLoading]);

  useEffect(() => {
    const nextRecent = [state.preferences.city, ...recentCities.filter((c) => c !== state.preferences.city)].slice(0, 5);
    setRecentCities(nextRecent);
  }, [state.preferences.city]);

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
            <Text style={[styles.greeting, { color: colors.muted }]}>
              {t("home.goodEvening")}
            </Text>
            <Pressable style={styles.cityRow} onPress={() => setSelectorOpen(true)}>
              <IconSymbol
                name="location.fill"
                size={16}
                color={colors.primary}
              />
              <Text style={[styles.cityName, { color: colors.foreground }]}>
                {state.preferences.city}
              </Text>
            <IconSymbol name="chevron.down" size={12} color={colors.muted} />
            </Pressable>
          </View>
          <WeatherWidget
            weather={weather}
            colors={colors}
            loading={weatherLoading}
            t={t}
          />
        </View>

        {/* Daily Scenario */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              {t("home.todayScenario")}
            </Text>
            <View style={[styles.aiBadge, { backgroundColor: colors.primary + "18" }]}>
              <IconSymbol name="sparkles" size={12} color={colors.primary} />
              <Text style={[styles.aiBadgeText, { color: colors.primary }]}>
                AI
              </Text>
            </View>
          </View>
          <DailyScenarioCard scenario={dailyScenario} colors={colors} />
        </View>

        {/* Mini Routes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              {t("home.quickEscapes")}
            </Text>
            <Text style={[styles.sectionSubtitle, { color: colors.muted }]}>
              10–40 min
            </Text>
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
          <SmartSuggestionCard weather={weather} colors={colors} t={t} />
        </View>

        {/* Create Button */}
        <View style={styles.section}>
          <CreateButton colors={colors} t={t} />
        </View>

        <View style={{ height: 12 }} />
      </ScrollView>

      <Modal visible={selectorOpen} transparent animationType="slide" onRequestClose={() => setSelectorOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <View style={styles.modalHeader}><Text style={[styles.modalTitle, { color: colors.foreground }]}>Select city</Text><Pressable onPress={() => setSelectorOpen(false)}><IconSymbol name="xmark" size={18} color={colors.muted} /></Pressable></View>
            <TextInput value={search} onChangeText={setSearch} placeholder="Search city" placeholderTextColor={colors.muted} style={[styles.cityInput,{color:colors.foreground,borderColor:colors.border,backgroundColor:colors.surface}]} />
            {!!recentCities.length && <><Text style={[styles.groupTitle,{color:colors.muted}]}>Recent</Text><View style={styles.cityChips}>{recentCities.map((city)=><Pressable key={city} style={[styles.cityChip,{borderColor:colors.border,backgroundColor:colors.surface}]} onPress={()=>{updatePreferences({city}); setSelectorOpen(false);}}><Text style={{color:colors.foreground,fontWeight:"600"}}>{city}</Text></Pressable>)}</View></>}
            <Text style={[styles.groupTitle,{color:colors.muted}]}>Popular</Text>
            <ScrollView contentContainerStyle={styles.cityList}>{filteredCities.map((city)=><Pressable key={city} style={[styles.cityRowItem,{borderColor:colors.border,backgroundColor:colors.surface}]} onPress={()=>{updatePreferences({city}); setSelectorOpen(false);}}><Text style={{color:colors.foreground,fontSize:16,fontWeight:"600"}}>{city}</Text></Pressable>)}</ScrollView>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
  },
  greeting: { fontSize: 13, fontWeight: "500", marginBottom: 4 },
  cityRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  modalBackdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.35)" },
  modalCard: { borderTopLeftRadius: 20, borderTopRightRadius: 20, borderWidth: 1, borderBottomWidth: 0, padding: 16, maxHeight: "82%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  modalTitle: { fontSize: 18, fontWeight: "800" },
  cityInput: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, marginBottom: 12 },
  groupTitle: { fontSize: 12, fontWeight: "700", marginBottom: 8 },
  cityChips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  cityChip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  cityList: { gap: 8, paddingBottom: 16 },
  cityRowItem: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 12 },
  cityName: { fontSize: 18, fontWeight: "700" },
  weatherWidget: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  weatherEmoji: { fontSize: 20 },
  weatherText: { fontSize: 13, fontWeight: "700" },
  section: { marginBottom: 24 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700" },
  sectionSubtitle: { fontSize: 12, fontWeight: "500" },
  aiBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  aiBadgeText: { fontSize: 11, fontWeight: "700" },
  dailyCard: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 12,
  },
  dailyCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  dailyCardLeft: { flexDirection: "row", gap: 12, flex: 1 },
  dailyCardEmoji: { fontSize: 40 },
  dailyCardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  dailyCardSubtitle: {
    fontSize: 13,
    fontWeight: "500",
    color: "rgba(255,255,255,0.8)",
  },
  moodTag: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  moodTagText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  dailyCardMeta: {
    flexDirection: "row",
    gap: 16,
  },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: {
    fontSize: 12,
    fontWeight: "500",
    color: "rgba(255,255,255,0.8)",
  },
  miniRoutesList: { gap: 12 },
  miniCard: {
    width: 100,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    gap: 8,
  },
  miniCardEmoji: { fontSize: 28 },
  miniCardTitle: { fontSize: 12, fontWeight: "600", textAlign: "center" },
  miniCardDuration: { fontSize: 11, fontWeight: "500" },
  suggestionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  suggestionIcon: { fontSize: 28 },
  suggestionContent: { flex: 1, gap: 2 },
  suggestionText: { fontSize: 14, fontWeight: "600" },
  suggestionAction: { fontSize: 12, fontWeight: "600" },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});

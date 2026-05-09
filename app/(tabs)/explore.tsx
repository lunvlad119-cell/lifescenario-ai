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
import type { Scenario } from "@/shared/types";
import { SAMPLE_SCENARIOS, MINI_ROUTES } from "@/lib/sample-data";

const CURATED_COLLECTIONS = [
  {
    id: "cozy",
    title: "Cozy Evening",
    emoji: "🏠",
    description: "Warm, comfortable indoor scenarios",
    color: "#FFB84D",
    scenarios: [SAMPLE_SCENARIOS[0], MINI_ROUTES[0]],
  },
  {
    id: "rainy",
    title: "Rainy Walk",
    emoji: "🌧️",
    description: "Perfect for moody, atmospheric days",
    color: "#6B9BD1",
    scenarios: [SAMPLE_SCENARIOS[1], MINI_ROUTES[1]],
  },
  {
    id: "explore",
    title: "Explore City",
    emoji: "🗺️",
    description: "Discover new places and neighborhoods",
    color: "#7B68EE",
    scenarios: [SAMPLE_SCENARIOS[2], MINI_ROUTES[2]],
  },
];

function ScenarioCard({ scenario, colors }: { scenario: Scenario; colors: ReturnType<typeof useColors> }) {
  const router = useRouter();
  return (
    <Pressable
      style={({ pressed }) => [
        styles.scenarioCard,
        { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.85 : 1 },
      ]}
      onPress={() => router.push({ pathname: "/scenario/[id]" as any, params: { id: scenario.id, data: JSON.stringify(scenario) } })}
    >
      <View style={styles.scenarioCardTop}>
        <Text style={styles.scenarioEmoji}>{scenario.emoji}</Text>
        <View style={styles.scenarioCardContent}>
          <Text style={[styles.scenarioTitle, { color: colors.foreground }]} numberOfLines={1}>
            {scenario.title}
          </Text>
          <View style={styles.scenarioMeta}>
            <IconSymbol name="clock.fill" size={12} color={colors.muted} />
            <Text style={[styles.scenarioMetaText, { color: colors.muted }]}>
              {scenario.totalDuration}
            </Text>
          </View>
        </View>
      </View>
      <Text style={[styles.scenarioSubtitle, { color: colors.muted }]} numberOfLines={2}>
        {scenario.subtitle}
      </Text>
    </Pressable>
  );
}

function CollectionCard({ collection, colors }: { collection: (typeof CURATED_COLLECTIONS)[0]; colors: ReturnType<typeof useColors> }) {
  const router = useRouter();
  return (
    <Pressable
      style={({ pressed }) => [
        styles.collectionCard,
        { backgroundColor: collection.color, opacity: pressed ? 0.88 : 1 },
      ]}
      onPress={() => {
        // Navigate to collection detail or show scenarios
      }}
    >
      <View style={styles.collectionHeader}>
        <Text style={styles.collectionEmoji}>{collection.emoji}</Text>
        <View style={styles.collectionInfo}>
          <Text style={styles.collectionTitle}>{collection.title}</Text>
          <Text style={styles.collectionDesc}>{collection.description}</Text>
        </View>
      </View>
      <View style={styles.collectionScenarios}>
        {collection.scenarios.slice(0, 2).map((s, i) => (
          <Pressable
            key={s.id}
            style={({ pressed }) => [
              styles.collectionScenarioItem,
              { opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={() => router.push({ pathname: "/scenario/[id]" as any, params: { id: s.id, data: JSON.stringify(s) } })}
          >
            <Text style={styles.collectionScenarioEmoji}>{s.emoji}</Text>
            <Text style={styles.collectionScenarioTitle} numberOfLines={1}>
              {s.title}
            </Text>
          </Pressable>
        ))}
      </View>
    </Pressable>
  );
}

export default function ExploreScreen() {
  const colors = useColors();
  const [search, setSearch] = useState("");
  const [activeCollection, setActiveCollection] = useState<string | null>(null);

  const allScenarios = [...SAMPLE_SCENARIOS, ...MINI_ROUTES];
  const filtered = allScenarios.filter((s) =>
    !search || s.title.toLowerCase().includes(search.toLowerCase()) || s.subtitle.toLowerCase().includes(search.toLowerCase())
  );

  const selectedCollection = activeCollection
    ? CURATED_COLLECTIONS.find((c) => c.id === activeCollection)
    : null;

  return (
    <ScreenContainer containerClassName="bg-background">
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Explore</Text>
          <Text style={[styles.headerSubtitle, { color: colors.muted }]}>Curated life scenarios</Text>
        </View>

        {/* Search */}
        <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <IconSymbol name="magnifyingglass" size={18} color={colors.muted} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search scenarios..."
            placeholderTextColor={colors.muted}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")}>
              <IconSymbol name="xmark.circle.fill" size={18} color={colors.muted} />
            </Pressable>
          )}
        </View>

        {/* Show search results or collections */}
        {search.length > 0 ? (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Results ({filtered.length})
            </Text>
            {filtered.length > 0 ? (
              <View style={styles.scenariosList}>
                {filtered.map((scenario) => (
                  <ScenarioCard key={scenario.id} scenario={scenario} colors={colors} />
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyStateText, { color: colors.muted }]}>
                  No scenarios found
                </Text>
              </View>
            )}
          </View>
        ) : (
          <>
            {/* Curated Collections */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Collections</Text>
              <View style={styles.collectionsList}>
                {CURATED_COLLECTIONS.map((collection) => (
                  <CollectionCard key={collection.id} collection={collection} colors={colors} />
                ))}
              </View>
            </View>

            {/* All Scenarios */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>All Scenarios</Text>
              <View style={styles.scenariosList}>
                {allScenarios.slice(0, 6).map((scenario) => (
                  <ScenarioCard key={scenario.id} scenario={scenario} colors={colors} />
                ))}
              </View>
            </View>
          </>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  header: { paddingTop: 8, paddingBottom: 16 },
  headerTitle: { fontSize: 28, fontWeight: "800", marginBottom: 4 },
  headerSubtitle: { fontSize: 14, fontWeight: "400" },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
  },
  section: { marginBottom: 28, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  // Collections
  collectionsList: { gap: 12 },
  collectionCard: {
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  collectionHeader: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  collectionEmoji: { fontSize: 32 },
  collectionInfo: { flex: 1 },
  collectionTitle: { fontSize: 16, fontWeight: "700", color: "#FFFFFF", marginBottom: 2 },
  collectionDesc: { fontSize: 13, color: "rgba(255,255,255,0.8)", fontWeight: "500" },
  collectionScenarios: { flexDirection: "row", gap: 8 },
  collectionScenarioItem: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
    gap: 6,
  },
  collectionScenarioEmoji: { fontSize: 20 },
  collectionScenarioTitle: { fontSize: 12, fontWeight: "600", color: "#FFFFFF", textAlign: "center" },
  // Scenarios
  scenariosList: { gap: 10 },
  scenarioCard: {
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    gap: 8,
  },
  scenarioCardTop: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  scenarioEmoji: { fontSize: 28 },
  scenarioCardContent: { flex: 1, gap: 4 },
  scenarioTitle: { fontSize: 15, fontWeight: "700", lineHeight: 20 },
  scenarioMeta: { flexDirection: "row", alignItems: "center", gap: 4 },
  scenarioMetaText: { fontSize: 12, fontWeight: "500" },
  scenarioSubtitle: { fontSize: 13, lineHeight: 18 },
  // Empty state
  emptyState: { alignItems: "center", paddingVertical: 40 },
  emptyStateText: { fontSize: 14, fontWeight: "500" },
});

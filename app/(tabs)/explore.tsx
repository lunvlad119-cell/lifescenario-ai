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
import { SAMPLE_SCENARIOS, MINI_ROUTES } from "@/lib/sample-data";
import type { Scenario, ScenarioType } from "@/shared/types";

const CATEGORIES: { value: ScenarioType | "all"; label: string; icon: string }[] = [
  { value: "all", label: "All", icon: "✨" },
  { value: "walk", label: "Walk", icon: "🚶" },
  { value: "food", label: "Food", icon: "🍽️" },
  { value: "culture", label: "Culture", icon: "🎨" },
  { value: "explore", label: "Explore", icon: "🗺️" },
  { value: "activity", label: "Activity", icon: "⚽" },
  { value: "rest", label: "Rest", icon: "😌" },
];

const FEATURED_COLLECTIONS = [
  { title: "Rainy Day Escapes", emoji: "🌧️", count: 8, color: "#6C63FF" },
  { title: "Morning Rituals", emoji: "🌅", count: 12, color: "#FF6B9D" },
  { title: "Budget Adventures", emoji: "💚", count: 15, color: "#22C55E" },
  { title: "Cultural Deep Dives", emoji: "🎭", count: 10, color: "#F59E0B" },
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
      <View style={styles.scenarioCardLeft}>
        <Text style={styles.scenarioEmoji}>{scenario.emoji}</Text>
      </View>
      <View style={styles.scenarioCardContent}>
        <View style={styles.scenarioCardHeader}>
          <View style={[styles.moodTag, { backgroundColor: colors.primary + "18" }]}>
            <Text style={[styles.moodTagText, { color: colors.primary }]}>{scenario.moodTag}</Text>
          </View>
          <View style={styles.metaItem}>
            <IconSymbol name="clock.fill" size={12} color={colors.muted} />
            <Text style={[styles.metaDuration, { color: colors.muted }]}>{scenario.totalDuration}</Text>
          </View>
        </View>
        <Text style={[styles.scenarioTitle, { color: colors.foreground }]} numberOfLines={1}>{scenario.title}</Text>
        <Text style={[styles.scenarioSubtitle, { color: colors.muted }]} numberOfLines={2}>{scenario.subtitle}</Text>
        <View style={styles.stepsRow}>
          <IconSymbol name="location.fill" size={12} color={colors.muted} />
          <Text style={[styles.stepsText, { color: colors.muted }]}>{scenario.steps.length} stops</Text>
        </View>
      </View>
    </Pressable>
  );
}

function CollectionCard({ collection, colors }: { collection: typeof FEATURED_COLLECTIONS[0]; colors: ReturnType<typeof useColors> }) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.collectionCard,
        { backgroundColor: collection.color, opacity: pressed ? 0.88 : 1 },
      ]}
    >
      <Text style={styles.collectionEmoji}>{collection.emoji}</Text>
      <Text style={styles.collectionTitle}>{collection.title}</Text>
      <Text style={styles.collectionCount}>{collection.count} scenarios</Text>
    </Pressable>
  );
}

const ALL_SCENARIOS = [...SAMPLE_SCENARIOS, ...MINI_ROUTES];

export default function ExploreScreen() {
  const colors = useColors();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<ScenarioType | "all">("all");

  const filtered = ALL_SCENARIOS.filter((s) => {
    const matchesSearch = !search || s.title.toLowerCase().includes(search.toLowerCase()) || s.subtitle.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "all" || s.params.scenarioType === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <ScreenContainer containerClassName="bg-background">
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Explore</Text>
          <Text style={[styles.headerSubtitle, { color: colors.muted }]}>Discover life scenarios</Text>
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

        {/* Categories */}
        <FlatList
          data={CATEGORIES}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.value}
          contentContainerStyle={styles.categoriesList}
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [
                styles.categoryChip,
                {
                  backgroundColor: activeCategory === item.value ? colors.primary : colors.surface,
                  borderColor: activeCategory === item.value ? colors.primary : colors.border,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
              onPress={() => setActiveCategory(item.value)}
            >
              <Text style={styles.categoryIcon}>{item.icon}</Text>
              <Text style={[styles.categoryLabel, { color: activeCategory === item.value ? "#FFFFFF" : colors.foreground }]}>
                {item.label}
              </Text>
            </Pressable>
          )}
        />

        {/* Featured Collections (only when no search/filter) */}
        {!search && activeCategory === "all" && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Collections</Text>
            <FlatList
              data={FEATURED_COLLECTIONS}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.title}
              contentContainerStyle={styles.collectionsList}
              renderItem={({ item }) => <CollectionCard collection={item} colors={colors} />}
            />
          </View>
        )}

        {/* Scenarios list */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              {search || activeCategory !== "all" ? "Results" : "Popular Routes"}
            </Text>
            <Text style={[styles.countText, { color: colors.muted }]}>{filtered.length} found</Text>
          </View>
          {filtered.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🔍</Text>
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No scenarios found</Text>
              <Text style={[styles.emptySubtitle, { color: colors.muted }]}>Try a different search or category</Text>
            </View>
          ) : (
            <View style={styles.scenariosList}>
              {filtered.map((scenario) => (
                <ScenarioCard key={scenario.id} scenario={scenario} colors={colors} />
              ))}
            </View>
          )}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  headerTitle: { fontSize: 28, fontWeight: "800" },
  headerSubtitle: { fontSize: 14, marginTop: 2 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 20,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  searchInput: { flex: 1, fontSize: 15 },
  categoriesList: { paddingHorizontal: 20, gap: 8, paddingBottom: 16 },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryIcon: { fontSize: 14 },
  categoryLabel: { fontSize: 13, fontWeight: "600" },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "700" },
  countText: { fontSize: 13 },
  collectionsList: { gap: 12, paddingRight: 4 },
  collectionCard: {
    width: 140,
    height: 120,
    borderRadius: 16,
    padding: 14,
    justifyContent: "flex-end",
    gap: 4,
  },
  collectionEmoji: { fontSize: 28, marginBottom: 4 },
  collectionTitle: { color: "#FFFFFF", fontSize: 14, fontWeight: "700", lineHeight: 18 },
  collectionCount: { color: "rgba(255,255,255,0.75)", fontSize: 12 },
  scenariosList: { gap: 12 },
  scenarioCard: {
    flexDirection: "row",
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 12,
  },
  scenarioCardLeft: { justifyContent: "center" },
  scenarioEmoji: { fontSize: 36 },
  scenarioCardContent: { flex: 1, gap: 4 },
  scenarioCardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  moodTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  moodTagText: { fontSize: 11, fontWeight: "600" },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaDuration: { fontSize: 12 },
  scenarioTitle: { fontSize: 15, fontWeight: "700" },
  scenarioSubtitle: { fontSize: 13, lineHeight: 18 },
  stepsRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  stepsText: { fontSize: 12 },
  emptyState: { alignItems: "center", paddingVertical: 40, gap: 8 },
  emptyEmoji: { fontSize: 40 },
  emptyTitle: { fontSize: 16, fontWeight: "700" },
  emptySubtitle: { fontSize: 14 },
});

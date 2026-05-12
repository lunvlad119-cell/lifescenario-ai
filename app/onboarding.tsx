import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Platform,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useScenario } from "@/lib/scenario-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import * as Haptics from "expo-haptics";

const POPULAR_CITIES = [
  "Prague",
  "Berlin",
  "Paris",
  "Amsterdam",
  "Vienna",
  "Budapest",
  "Barcelona",
  "London",
];

const BUDGET_OPTIONS = [
  { value: "free", label: "Free", emoji: "🆓", desc: "€0 only" },
  { value: "cheap", label: "Budget", emoji: "💚", desc: "€5–15" },
  { value: "medium", label: "Comfortable", emoji: "💛", desc: "€15–40" },
  { value: "comfortable", label: "Premium", emoji: "💜", desc: "€40+" },
];

const INTERESTS = [
  { id: "culture", label: "Culture", emoji: "🎭" },
  { id: "food", label: "Food", emoji: "🍽️" },
  { id: "nature", label: "Nature", emoji: "🌿" },
  { id: "art", label: "Art", emoji: "🎨" },
  { id: "history", label: "History", emoji: "🏛️" },
  { id: "nightlife", label: "Nightlife", emoji: "🌃" },
  { id: "shopping", label: "Shopping", emoji: "🛍️" },
  { id: "sports", label: "Sports", emoji: "⚽" },
];

function CityStep({
  selected,
  onSelect,
  onCustomCity,
  colors,
  t,
}: {
  selected: string;
  onSelect: (city: string) => void;
  onCustomCity: (city: string) => void;
  colors: ReturnType<typeof useColors>;
  t: any;
}) {
  const [showCustom, setShowCustom] = useState(false);
  const [customCity, setCustomCity] = useState("");

  const handleCustomSubmit = () => {
    if (customCity.trim()) {
      onCustomCity(customCity.trim());
      setShowCustom(false);
      setCustomCity("");
    }
  };

  return (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: colors.foreground }]}>
        {t("onboarding.step1")}
      </Text>
      <Text style={[styles.stepSubtitle, { color: colors.muted }]}>
        {t("onboarding.step1Desc")}
      </Text>

      {!showCustom ? (
        <>
          <View style={styles.cityGrid}>
            {POPULAR_CITIES.map((city) => (
              <Pressable
                key={city}
                style={({ pressed }) => [
                  styles.cityButton,
                  {
                    backgroundColor:
                      selected === city ? colors.primary : colors.surface,
                    borderColor:
                      selected === city ? colors.primary : colors.border,
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
                onPress={() => {
                  if (Platform.OS !== "web")
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onSelect(city);
                }}
              >
                <Text
                  style={[
                    styles.cityLabel,
                    {
                      color: selected === city ? "#FFFFFF" : colors.foreground,
                    },
                  ]}
                >
                  {city}
                </Text>
              </Pressable>
            ))}
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.customCityButton,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
            onPress={() => setShowCustom(true)}
          >
            <IconSymbol name="plus.circle" size={18} color={colors.primary} />
            <Text style={[styles.customCityText, { color: colors.primary }]}>
              Other city
            </Text>
          </Pressable>
        </>
      ) : (
        <View style={styles.customCityInput}>
          <TextInput
            style={[
              styles.cityInput,
              {
                color: colors.foreground,
                borderColor: colors.border,
                backgroundColor: colors.surface,
              },
            ]}
            placeholder="Enter city name"
            placeholderTextColor={colors.muted}
            value={customCity}
            onChangeText={setCustomCity}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleCustomSubmit}
          />
          <Pressable
            style={({ pressed }) => [
              styles.submitButton,
              {
                backgroundColor:
                  customCity.trim() ? colors.primary : colors.surface,
                opacity: pressed ? 0.9 : 1,
              },
            ]}
            onPress={handleCustomSubmit}
            disabled={!customCity.trim()}
          >
            <Text
              style={[
                styles.submitButtonText,
                {
                  color: customCity.trim() ? "#FFFFFF" : colors.muted,
                },
              ]}
            >
              Next
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

function BudgetStep({
  selected,
  onSelect,
  colors,
  t,
}: {
  selected: string;
  onSelect: (budget: string) => void;
  colors: ReturnType<typeof useColors>;
  t: any;
}) {
  return (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: colors.foreground }]}>
        {t("create.budget")}
      </Text>
      <Text style={[styles.stepSubtitle, { color: colors.muted }]}>
        {t("onboarding.step2Desc")}
      </Text>
      <View style={styles.budgetColumn}>
        {BUDGET_OPTIONS.map((option) => (
          <Pressable
            key={option.value}
            style={({ pressed }) => [
              styles.budgetButton,
              {
                backgroundColor:
                  selected === option.value ? colors.primary : colors.surface,
                borderColor:
                  selected === option.value ? colors.primary : colors.border,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
            onPress={() => {
              if (Platform.OS !== "web")
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelect(option.value);
            }}
          >
            <View style={styles.budgetLeft}>
              <Text style={styles.budgetEmoji}>{option.emoji}</Text>
              <View>
                <Text
                  style={[
                    styles.budgetLabel,
                    {
                      color:
                        selected === option.value
                          ? "#FFFFFF"
                          : colors.foreground,
                    },
                  ]}
                >
                  {option.label}
                </Text>
                <Text
                  style={[
                    styles.budgetDesc,
                    {
                      color:
                        selected === option.value
                          ? "rgba(255,255,255,0.7)"
                          : colors.muted,
                    },
                  ]}
                >
                  {option.desc}
                </Text>
              </View>
            </View>
            {selected === option.value && (
              <IconSymbol
                name="checkmark.circle.fill"
                size={24}
                color="#FFFFFF"
              />
            )}
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function InterestsStep({
  selected,
  onSelect,
  colors,
  t,
}: {
  selected: string[];
  onSelect: (interests: string[]) => void;
  colors: ReturnType<typeof useColors>;
  t: any;
}) {
  const toggleInterest = (id: string) => {
    if (Platform.OS !== "web")
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (selected.includes(id)) {
      onSelect(selected.filter((i) => i !== id));
    } else if (selected.length < 3) {
      onSelect([...selected, id]);
    }
  };

  return (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: colors.foreground }]}>
        {t("onboarding.step3")}
      </Text>
      <Text style={[styles.stepSubtitle, { color: colors.muted }]}>
        {t("onboarding.step3Desc")}
      </Text>
      <View style={styles.interestGrid}>
        {INTERESTS.map((interest) => (
          <Pressable
            key={interest.id}
            style={({ pressed }) => [
              styles.interestButton,
              {
                backgroundColor: selected.includes(interest.id)
                  ? colors.primary
                  : colors.surface,
                borderColor: selected.includes(interest.id)
                  ? colors.primary
                  : colors.border,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
            onPress={() => toggleInterest(interest.id)}
            disabled={!selected.includes(interest.id) && selected.length >= 3}
          >
            <Text style={styles.interestEmoji}>{interest.emoji}</Text>
            <Text
              style={[
                styles.interestLabel,
                {
                  color: selected.includes(interest.id)
                    ? "#FFFFFF"
                    : colors.foreground,
                },
              ]}
            >
              {interest.label}
            </Text>
            {selected.includes(interest.id) && (
              <View style={styles.checkmark}>
                <IconSymbol name="checkmark" size={12} color="#FFFFFF" />
              </View>
            )}
          </Pressable>
        ))}
      </View>
      <Text style={[styles.interestCount, { color: colors.muted }]}>
        {selected.length} {t("onboarding.selected")}
      </Text>
    </View>
  );
}

export default function OnboardingScreen() {
  const colors = useColors();
  const router = useRouter();
  const { t } = useTranslation();
  const { updatePreferences, completeOnboarding } = useScenario();
  const [step, setStep] = useState(0);
  const [city, setCity] = useState("Prague");
  const [budget, setBudget] = useState("medium");
  const [interests, setInterests] = useState<string[]>([
    "culture",
    "food",
    "nature",
  ]);

  const handleComplete = () => {
    updatePreferences({ city, defaultBudget: budget as any, interests });
    completeOnboarding();
    router.replace("/(tabs)");
  };

  const canProceed = () => {
    switch (step) {
      case 0:
        return !!city;
      case 1:
        return !!budget;
      case 2:
        return interests.length > 0;
      default:
        return false;
    }
  };

  const STEPS = [
    {
      component: (
        <CityStep
          selected={city}
          onSelect={setCity}
          onCustomCity={setCity}
          colors={colors}
          t={t}
        />
      ),
    },
    {
      component: (
        <BudgetStep
          selected={budget}
          onSelect={setBudget}
          colors={colors}
          t={t}
        />
      ),
    },
    {
      component: (
        <InterestsStep
          selected={interests}
          onSelect={setInterests}
          colors={colors}
          t={t}
        />
      ),
    },
  ];

  return (
    <ScreenContainer containerClassName="bg-background">
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progressBar,
              { backgroundColor: colors.border },
            ]}
          >
            <View
              style={[
                styles.progressFill,
                {
                  width: `${((step + 1) / STEPS.length) * 100}%`,
                  backgroundColor: colors.primary,
                },
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: colors.muted }]}>
            {t("create.step")} {step + 1} {t("create.of")} {STEPS.length}
          </Text>
        </View>

        {/* Logo / Welcome */}
        {step === 0 && (
          <View style={styles.welcomeHeader}>
            <Text style={styles.welcomeEmoji}>✨</Text>
            <Text style={[styles.welcomeTitle, { color: colors.foreground }]}>
              {t("onboarding.welcome")}
            </Text>
            <Text style={[styles.welcomeSubtitle, { color: colors.muted }]}>
              {t("onboarding.welcomeDesc")}
            </Text>
          </View>
        )}

        {/* Step Content */}
        {STEPS[step].component}

        {/* Navigation */}
        <View style={styles.navigation}>
          <Pressable
            style={({ pressed }) => [
              styles.navButton,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderWidth: 1,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
            onPress={() => step > 0 && setStep(step - 1)}
            disabled={step === 0}
          >
            <Text
              style={[
                styles.navButtonText,
                {
                  color:
                    step === 0 ? colors.muted : colors.foreground,
                },
              ]}
            >
              {t("common.back")}
            </Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.navButton,
              {
                backgroundColor: canProceed()
                  ? colors.primary
                  : colors.surface,
                opacity: pressed ? 0.9 : 1,
              },
            ]}
            onPress={() => {
              if (step < STEPS.length - 1) {
                setStep(step + 1);
              } else {
                handleComplete();
              }
            }}
            disabled={!canProceed()}
          >
            <Text
              style={[
                styles.navButtonText,
                {
                  color: canProceed() ? "#FFFFFF" : colors.muted,
                },
              ]}
            >
              {step === STEPS.length - 1
                ? t("common.getStarted")
                : t("common.next")}
            </Text>
          </Pressable>
        </View>
        <View style={{ height: 24 }} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16 },
  progressContainer: { marginBottom: 32 },
  progressBar: {
    height: 4,
    backgroundColor: "rgba(0,0,0,0.1)",
    borderRadius: 2,
    marginBottom: 8,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 2 },
  progressText: { fontSize: 12, fontWeight: "500" },
  welcomeHeader: { alignItems: "center", marginBottom: 32 },
  welcomeEmoji: { fontSize: 48, marginBottom: 12 },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 8,
    textAlign: "center",
  },
  welcomeSubtitle: {
    fontSize: 14,
    fontWeight: "400",
    textAlign: "center",
    lineHeight: 20,
  },
  stepContent: { marginBottom: 32 },
  stepTitle: { fontSize: 22, fontWeight: "700", marginBottom: 4 },
  stepSubtitle: { fontSize: 14, fontWeight: "400", marginBottom: 20 },
  // City
  cityGrid: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 12,
  },
  cityButton: {
    flex: 1,
    minWidth: "45%",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  cityLabel: { fontSize: 14, fontWeight: "600" },
  customCityButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  customCityText: { fontSize: 14, fontWeight: "600" },
  customCityInput: { gap: 12 },
  cityInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: "500",
  },
  submitButton: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  submitButtonText: { fontSize: 15, fontWeight: "700" },
  // Budget
  budgetColumn: { gap: 12 },
  budgetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  budgetLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  budgetEmoji: { fontSize: 24 },
  budgetLabel: { fontSize: 15, fontWeight: "600" },
  budgetDesc: { fontSize: 12, fontWeight: "400", marginTop: 2 },
  // Interests
  interestGrid: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  interestButton: {
    flex: 1,
    minWidth: "30%",
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    gap: 6,
  },
  interestEmoji: { fontSize: 24 },
  interestLabel: { fontSize: 12, fontWeight: "600", textAlign: "center" },
  checkmark: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  interestCount: { fontSize: 13, fontWeight: "500", textAlign: "center" },
  // Navigation
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

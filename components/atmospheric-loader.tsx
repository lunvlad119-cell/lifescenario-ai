import { useEffect, useState } from "react";
import { StyleSheet, Text, View, Animated } from "react-native";
import { useColors } from "@/hooks/use-colors";

const LOADING_MESSAGES = [
  "Analyzing weather...",
  "Finding good walking spots...",
  "Matching your mood...",
  "Looking for cozy places...",
  "Building your scenario...",
  "Checking evening atmosphere...",
  "Discovering hidden gems...",
  "Creating the perfect plan...",
];

export function AtmosphericLoader() {
  const colors = useColors();
  const [messageIndex, setMessageIndex] = useState(0);
  const [dotCount, setDotCount] = useState(1);
  const pulseAnim = new Animated.Value(0.6);

  // Rotate messages every 1.5 seconds
  useEffect(() => {
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 1500);
    return () => clearInterval(messageInterval);
  }, []);

  // Animate dots
  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDotCount((prev) => (prev % 3) + 1);
    }, 500);
    return () => clearInterval(dotInterval);
  }, []);

  // Pulse animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.6,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  const dots = ".".repeat(dotCount);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.iconContainer,
          {
            opacity: pulseAnim,
          },
        ]}
      >
        <Text style={styles.icon}>✨</Text>
      </Animated.View>

      <Text style={[styles.message, { color: colors.foreground }]}>
        {LOADING_MESSAGES[messageIndex]}
        <Text style={[styles.dots, { color: colors.primary }]}>{dots}</Text>
      </Text>

      <View style={styles.dotsContainer}>
        {[0, 1, 2].map((i) => (
          <Animated.View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor: colors.primary,
                opacity: Animated.add(
                  pulseAnim,
                  new Animated.Value(i === 0 ? 0 : i === 1 ? -0.2 : -0.4)
                ),
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 20,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: 32,
  },
  message: {
    fontSize: 15,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 22,
  },
  dots: {
    fontWeight: "700",
  },
  dotsContainer: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

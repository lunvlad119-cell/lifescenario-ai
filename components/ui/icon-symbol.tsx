// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight, SymbolViewProps } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconMapping = Record<SymbolViewProps["name"], ComponentProps<typeof MaterialIcons>["name"]>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * SF Symbols to Material Icons mappings for LifeScenario AI.
 */
const MAPPING = {
  // Navigation
  "house.fill": "home",
  "paperplane.fill": "send",
  "chevron.left.forwardslash.chevron.right": "code",
  "chevron.right": "chevron-right",
  "chevron.left": "chevron-left",
  "chevron.down": "expand-more",
  "chevron.up": "expand-less",
  // App tabs
  "map.fill": "map",
  "compass.drawing": "explore",
  "person.fill": "person",
  "plus.circle.fill": "add-circle",
  // Scenario creation
  "clock.fill": "schedule",
  "sun.max.fill": "wb-sunny",
  "moon.fill": "nightlight-round",
  "bolt.fill": "bolt",
  "heart.fill": "favorite",
  "dollarsign.circle.fill": "attach-money",
  "figure.walk": "directions-walk",
  "fork.knife": "restaurant",
  "binoculars.fill": "explore",
  "building.columns.fill": "account-balance",
  "figure.run": "directions-run",
  "bed.double.fill": "hotel",
  "shuffle": "shuffle",
  "person.2.fill": "group",
  "person.3.fill": "groups",
  "heart.circle.fill": "favorite-border",
  "person.badge.plus": "person-add",
  // Scenario detail
  "location.fill": "location-on",
  "arrow.triangle.turn.up.right.diamond.fill": "alt-route",
  "star.fill": "star",
  "square.and.arrow.up": "share",
  "bookmark.fill": "bookmark",
  "bookmark": "bookmark-border",
  "play.fill": "play-arrow",
  "xmark": "close",
  "xmark.circle.fill": "cancel",
  // Weather
  "cloud.rain.fill": "grain",
  "cloud.fill": "cloud",
  "wind": "air",
  "snowflake": "ac-unit",
  // Misc
  "sparkles": "auto-awesome",
  "wand.and.stars": "auto-fix-high",
  "magnifyingglass": "search",
  "bell.fill": "notifications",
  "gearshape.fill": "settings",
  "info.circle.fill": "info",
  "checkmark.circle.fill": "check-circle",
  "arrow.clockwise": "refresh",
  "trash.fill": "delete",
  "pencil": "edit",
  "plus": "add",
  "minus": "remove",
  "flame.fill": "local-fire-department",
  "leaf.fill": "eco",
  "camera.fill": "camera-alt",
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}

import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useReducer } from "react";
import type { Scenario, UserPreferences } from "@/shared/types";
import type { WeatherData } from "@/lib/weather-service";

interface ScenarioState {
  savedScenarios: Scenario[];
  history: Scenario[];
  preferences: UserPreferences;
  dailyScenario: Scenario | null;
  weather: WeatherData | null;
  weatherLoading: boolean;
  hasCompletedOnboarding: boolean;
}

type ScenarioAction =
  | { type: "SET_DAILY"; payload: Scenario }
  | { type: "SAVE_SCENARIO"; payload: Scenario }
  | { type: "UNSAVE_SCENARIO"; payload: string }
  | { type: "ADD_TO_HISTORY"; payload: Scenario }
  | { type: "UPDATE_PREFERENCES"; payload: Partial<UserPreferences> }
  | { type: "LOAD_STATE"; payload: Partial<ScenarioState> }
  | { type: "SET_WEATHER"; payload: WeatherData }
  | { type: "SET_WEATHER_LOADING"; payload: boolean }
  | { type: "COMPLETE_ONBOARDING" };

const defaultPreferences: UserPreferences = {
  city: "Prague",
  defaultBudget: "medium",
  defaultEnergyLevel: 3,
  defaultSocialMode: "solo",
  interests: ["culture", "food", "nature"],
  favoriteScenarioTypes: ["walk", "culture"],
};

const initialState: ScenarioState = {
  savedScenarios: [],
  history: [],
  preferences: defaultPreferences,
  dailyScenario: null,
  weather: null,
  weatherLoading: false,
  hasCompletedOnboarding: false,
};

function reducer(state: ScenarioState, action: ScenarioAction): ScenarioState {
  switch (action.type) {
    case "SET_DAILY":
      return { ...state, dailyScenario: action.payload };
    case "SAVE_SCENARIO":
      return {
        ...state,
        savedScenarios: [
          action.payload,
          ...state.savedScenarios.filter((s) => s.id !== action.payload.id),
        ],
      };
    case "UNSAVE_SCENARIO":
      return {
        ...state,
        savedScenarios: state.savedScenarios.filter((s) => s.id !== action.payload),
      };
    case "ADD_TO_HISTORY":
      return {
        ...state,
        history: [
          action.payload,
          ...state.history.filter((s) => s.id !== action.payload.id).slice(0, 49),
        ],
      };
    case "UPDATE_PREFERENCES":
      return {
        ...state,
        preferences: { ...state.preferences, ...action.payload },
      };
    case "LOAD_STATE":
      return { ...state, ...action.payload };
    case "SET_WEATHER":
      return { ...state, weather: action.payload, weatherLoading: false };
    case "SET_WEATHER_LOADING":
      return { ...state, weatherLoading: action.payload };
    case "COMPLETE_ONBOARDING":
      return { ...state, hasCompletedOnboarding: true };
    default:
      return state;
  }
}

interface ScenarioContextValue {
  state: ScenarioState;
  saveScenario: (scenario: Scenario) => void;
  unsaveScenario: (id: string) => void;
  addToHistory: (scenario: Scenario) => void;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
  setDailyScenario: (scenario: Scenario) => void;
  isSaved: (id: string) => boolean;
  setWeather: (weather: WeatherData) => void;
  setWeatherLoading: (loading: boolean) => void;
  completeOnboarding: () => void;
}

const ScenarioContext = createContext<ScenarioContextValue | null>(null);

const STORAGE_KEY = "lifescenario_state";

export function ScenarioProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Load persisted state on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          dispatch({ type: "LOAD_STATE", payload: parsed });
        } catch {
          // ignore parse errors
        }
      }
    });
  }, []);

  // Persist state on change
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const saveScenario = useCallback((scenario: Scenario) => {
    dispatch({ type: "SAVE_SCENARIO", payload: { ...scenario, isSaved: true } });
  }, []);

  const unsaveScenario = useCallback((id: string) => {
    dispatch({ type: "UNSAVE_SCENARIO", payload: id });
  }, []);

  const addToHistory = useCallback((scenario: Scenario) => {
    dispatch({ type: "ADD_TO_HISTORY", payload: scenario });
  }, []);

  const updatePreferences = useCallback((prefs: Partial<UserPreferences>) => {
    dispatch({ type: "UPDATE_PREFERENCES", payload: prefs });
  }, []);

  const setDailyScenario = useCallback((scenario: Scenario) => {
    dispatch({ type: "SET_DAILY", payload: scenario });
  }, []);

  const isSaved = useCallback(
    (id: string) => state.savedScenarios.some((s) => s.id === id),
    [state.savedScenarios]
  );

  const setWeather = useCallback((weather: WeatherData) => {
    dispatch({ type: "SET_WEATHER", payload: weather });
  }, []);

  const setWeatherLoading = useCallback((loading: boolean) => {
    dispatch({ type: "SET_WEATHER_LOADING", payload: loading });
  }, []);

  const completeOnboarding = useCallback(() => {
    dispatch({ type: "COMPLETE_ONBOARDING" });
  }, []);

  return (
    <ScenarioContext.Provider
      value={{
        state,
        saveScenario,
        unsaveScenario,
        addToHistory,
        updatePreferences,
        setDailyScenario,
        isSaved,
        setWeather,
        setWeatherLoading,
        completeOnboarding,
      }}
    >
      {children}
    </ScenarioContext.Provider>
  );
}

export function useScenario() {
  const ctx = useContext(ScenarioContext);
  if (!ctx) throw new Error("useScenario must be used inside ScenarioProvider");
  return ctx;
}

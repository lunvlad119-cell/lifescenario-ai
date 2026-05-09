/**
 * Weather Service
 * Fetches real-time weather data from OpenWeatherMap API
 */

export interface WeatherData {
  city: string;
  country: string;
  temp: number; // Celsius
  feelsLike: number;
  humidity: number; // 0-100
  windSpeed: number; // m/s
  cloudiness: number; // 0-100
  description: string; // e.g., "Clear sky", "Light rain"
  main: string; // e.g., "Clear", "Clouds", "Rain"
  icon: string; // weather icon code
  timestamp: number;
}

export interface WeatherError {
  code: string;
  message: string;
}

const API_KEY = process.env.OPENWEATHER_API_KEY;
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

/**
 * Fetch weather for a city by name
 */
export async function getWeatherByCity(
  city: string
): Promise<WeatherData | WeatherError> {
  if (!API_KEY) {
    return {
      code: "NO_API_KEY",
      message: "OpenWeatherMap API key not configured",
    };
  }

  try {
    const response = await fetch(
      `${BASE_URL}?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`
    );

    if (!response.ok) {
      if (response.status === 404) {
        return { code: "CITY_NOT_FOUND", message: `City "${city}" not found` };
      }
      if (response.status === 401) {
        return { code: "INVALID_API_KEY", message: "Invalid API key" };
      }
      return {
        code: "API_ERROR",
        message: `API returned ${response.status}`,
      };
    }

    const data = await response.json();

    return {
      city: data.name,
      country: data.sys.country,
      temp: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed * 10) / 10,
      cloudiness: data.clouds.all,
      description: data.weather[0].description,
      main: data.weather[0].main,
      icon: data.weather[0].icon,
      timestamp: Date.now(),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      code: "FETCH_ERROR",
      message: `Failed to fetch weather: ${message}`,
    };
  }
}

/**
 * Fetch weather by coordinates (latitude, longitude)
 */
export async function getWeatherByCoords(
  lat: number,
  lon: number
): Promise<WeatherData | WeatherError> {
  if (!API_KEY) {
    return {
      code: "NO_API_KEY",
      message: "OpenWeatherMap API key not configured",
    };
  }

  try {
    const response = await fetch(
      `${BASE_URL}?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
    );

    if (!response.ok) {
      return {
        code: "API_ERROR",
        message: `API returned ${response.status}`,
      };
    }

    const data = await response.json();

    return {
      city: data.name,
      country: data.sys.country,
      temp: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed * 10) / 10,
      cloudiness: data.clouds.all,
      description: data.weather[0].description,
      main: data.weather[0].main,
      icon: data.weather[0].icon,
      timestamp: Date.now(),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      code: "FETCH_ERROR",
      message: `Failed to fetch weather: ${message}`,
    };
  }
}

/**
 * Get a weather emoji based on condition
 */
export function getWeatherEmoji(main: string): string {
  const emojiMap: Record<string, string> = {
    Clear: "☀️",
    Clouds: "☁️",
    Rain: "🌧️",
    Drizzle: "🌦️",
    Thunderstorm: "⛈️",
    Snow: "❄️",
    Mist: "🌫️",
    Smoke: "💨",
    Haze: "🌫️",
    Dust: "🌪️",
    Fog: "🌫️",
    Sand: "🌪️",
    Ash: "💨",
    Squall: "💨",
    Tornado: "🌪️",
  };
  return emojiMap[main] || "🌤️";
}

/**
 * Format weather for display
 */
export function formatWeather(weather: WeatherData): string {
  const emoji = getWeatherEmoji(weather.main);
  return `${emoji} ${Math.round(weather.temp)}°C · ${weather.description}`;
}

/**
 * Check if weather is suitable for outdoor activities
 */
export function isOutdoorFriendly(weather: WeatherData): boolean {
  // Not suitable if: heavy rain, thunderstorm, or very cold
  const unsuitableConditions = [
    "Thunderstorm",
    "Tornado",
    "Squall",
    "Heavy rain",
  ];
  if (unsuitableConditions.some((c) => weather.main.includes(c))) {
    return false;
  }
  // Not suitable if temp < -5 or > 40
  if (weather.temp < -5 || weather.temp > 40) {
    return false;
  }
  return true;
}

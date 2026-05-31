import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  Cloudy,
  Sun,
  CloudSun,
  Moon,
  type LucideIcon,
} from "lucide-react";

export interface GeoResult {
  id: number;
  name: string;
  country?: string;
  country_code?: string;
  admin1?: string;
  latitude: number;
  longitude: number;
}

export interface CurrentWeather {
  temperature_2m: number;
  relative_humidity_2m: number;
  apparent_temperature: number;
  wind_speed_10m: number;
  weather_code: number;
  is_day: number;
}

export interface DailyWeather {
  time: string[];
  weather_code: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
}

export interface ForecastResponse {
  current: CurrentWeather;
  daily: DailyWeather;
}

/**
 * The weather-mood "atmosphere" — the two flowing Aurora glow blooms that tint
 * the mesh gradient for the active conditions. The airy sky base itself comes
 * from the active theme (light by default, deep night in dark mode), so these
 * accents stay anchored to the sky-blue + sun-amber design palette.
 */
export interface Atmosphere {
  glow1: string;
  glow2: string;
}

export interface WeatherDescriptor {
  label: string;
  /** A short evocative descriptor used in the hero composition. */
  mood: string;
  icon: LucideIcon;
  atmosphere: Atmosphere;
}

/**
 * Named mood blooms — kept within the sky-blue + sun-amber design palette so
 * the Aurora mesh always reads as part of the brand, on light or dark base.
 */
const ATMOSPHERES = {
  sunDay: { glow1: "#f59e0b", glow2: "#0ea5e9" }, // amber sun + sky haze
  sunNight: { glow1: "#fbbf24", glow2: "#0284c7" }, // moonlit amber + deep blue
  cloudDay: { glow1: "#38bdf8", glow2: "#0284c7" }, // soft blue layering
  cloudNight: { glow1: "#0ea5e9", glow2: "#1e3a5f" },
  fog: { glow1: "#bae6fd", glow2: "#7dd3fc" }, // pale, diffuse
  rain: { glow1: "#0ea5e9", glow2: "#0369a1" }, // cool, saturated blue
  snow: { glow1: "#e0f2fe", glow2: "#7dd3fc" }, // bright icy blue
  storm: { glow1: "#f59e0b", glow2: "#0369a1" }, // amber lightning + dark sky
} satisfies Record<string, Atmosphere>;

/**
 * Maps a WMO weather interpretation code (optionally day/night-aware) to a
 * readable label, a mood word, an icon, and a cinematic atmosphere.
 * Reference: https://open-meteo.com/en/docs (WMO Weather interpretation codes)
 */
export function describeWeather(code: number, isDay = true): WeatherDescriptor {
  const clearAtmo = isDay ? ATMOSPHERES.sunDay : ATMOSPHERES.sunNight;
  const cloudAtmo = isDay ? ATMOSPHERES.cloudDay : ATMOSPHERES.cloudNight;

  switch (code) {
    case 0:
      return { label: "Clear sky", mood: isDay ? "Wide open" : "Starlit", icon: isDay ? Sun : Moon, atmosphere: clearAtmo };
    case 1:
      return { label: "Mainly clear", mood: "Bright", icon: isDay ? CloudSun : Moon, atmosphere: clearAtmo };
    case 2:
      return { label: "Partly cloudy", mood: "Drifting", icon: CloudSun, atmosphere: cloudAtmo };
    case 3:
      return { label: "Overcast", mood: "Hushed", icon: Cloudy, atmosphere: cloudAtmo };
    case 45:
    case 48:
      return { label: "Fog", mood: "Soft-focus", icon: CloudFog, atmosphere: ATMOSPHERES.fog };
    case 51:
    case 53:
    case 55:
      return { label: "Drizzle", mood: "Pattering", icon: CloudDrizzle, atmosphere: ATMOSPHERES.rain };
    case 56:
    case 57:
      return { label: "Freezing drizzle", mood: "Glassy", icon: CloudDrizzle, atmosphere: ATMOSPHERES.rain };
    case 61:
    case 63:
    case 65:
      return { label: "Rain", mood: "Steady", icon: CloudRain, atmosphere: ATMOSPHERES.rain };
    case 66:
    case 67:
      return { label: "Freezing rain", mood: "Biting", icon: CloudRain, atmosphere: ATMOSPHERES.rain };
    case 71:
    case 73:
    case 75:
    case 77:
      return { label: "Snow", mood: "Quiet", icon: CloudSnow, atmosphere: ATMOSPHERES.snow };
    case 80:
    case 81:
    case 82:
      return { label: "Rain showers", mood: "Passing", icon: CloudRain, atmosphere: ATMOSPHERES.rain };
    case 85:
    case 86:
      return { label: "Snow showers", mood: "Flurried", icon: CloudSnow, atmosphere: ATMOSPHERES.snow };
    case 95:
      return { label: "Thunderstorm", mood: "Electric", icon: CloudLightning, atmosphere: ATMOSPHERES.storm };
    case 96:
    case 99:
      return { label: "Thunderstorm, hail", mood: "Violent", icon: CloudLightning, atmosphere: ATMOSPHERES.storm };
    default:
      return { label: "Unknown", mood: "Unsettled", icon: Cloud, atmosphere: cloudAtmo };
  }
}

export type TempUnit = "C" | "F";

export function formatTemp(celsius: number, unit: TempUnit): number {
  if (unit === "F") return Math.round((celsius * 9) / 5 + 32);
  return Math.round(celsius);
}

export function formatWind(kmh: number, unit: TempUnit): string {
  // Open-Meteo defaults to km/h; show mph when imperial.
  if (unit === "F") return `${Math.round(kmh * 0.621371)} mph`;
  return `${Math.round(kmh)} km/h`;
}

export function weekday(dateStr: string, index: number): string {
  if (index === 0) return "Today";
  return new Date(dateStr).toLocaleDateString("en-US", { weekday: "short" });
}

const GEO_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

export async function searchCities(query: string, signal?: AbortSignal): Promise<GeoResult[]> {
  const url = `${GEO_URL}?name=${encodeURIComponent(query)}&count=5&language=en&format=json`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error("Failed to search for cities.");
  const data = (await res.json()) as { results?: GeoResult[] };
  return data.results ?? [];
}

export async function fetchForecast(
  lat: number,
  lon: number,
  signal?: AbortSignal,
): Promise<ForecastResponse> {
  const url =
    `${FORECAST_URL}?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code,is_day` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min` +
    `&timezone=auto&forecast_days=7`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error("Failed to fetch the forecast.");
  return (await res.json()) as ForecastResponse;
}

export function cityLabel(c: { name: string; admin1?: string; country?: string }): string {
  return [c.name, c.admin1, c.country].filter(Boolean).join(", ");
}

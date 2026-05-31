"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, Loader2, Moon, Sun, CloudSun } from "lucide-react";
import SearchBox from "./components/SearchBox";
import CurrentCard from "./components/CurrentCard";
import ForecastRow from "./components/ForecastRow";
import {
  cityLabel,
  describeWeather,
  fetchForecast,
  type Atmosphere,
  type ForecastResponse,
  type GeoResult,
  type TempUnit,
} from "./lib/weather";

const STORAGE_KEY = "skyline:last-city";
const UNIT_KEY = "skyline:unit";
const THEME_KEY = "skyline:theme";

// Sensible default on first ever load.
const DEFAULT_CITY: GeoResult = {
  id: 1642911,
  name: "Jakarta",
  country: "Indonesia",
  admin1: "Jakarta",
  latitude: -6.2146,
  longitude: 106.8451,
};

// Neutral mood while loading — within the brand sky/amber palette.
const NEUTRAL_ATMOSPHERE: Atmosphere = {
  glow1: "#f59e0b",
  glow2: "#0ea5e9",
};

function atmosphereVars(a: Atmosphere): React.CSSProperties {
  return {
    "--glow-1": a.glow1,
    "--glow-2": a.glow2,
  } as React.CSSProperties;
}

type Theme = "light" | "dark";

export default function Home() {
  const [city, setCity] = useState<GeoResult | null>(null);
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unit, setUnit] = useState<TempUnit>("C");
  const [theme, setTheme] = useState<Theme>("light");

  const load = useCallback(async (target: GeoResult) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchForecast(target.latitude, target.longitude);
      setForecast(data);
      setCity(target);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(target));
      } catch {
        /* localStorage may be unavailable; ignore. */
      }
    } catch {
      setError("Couldn't load the forecast. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Restore last city + unit + theme on startup.
  useEffect(() => {
    let stored: GeoResult | null = null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) stored = JSON.parse(raw) as GeoResult;
      const u = localStorage.getItem(UNIT_KEY);
      if (u === "C" || u === "F") setUnit(u);
      // Theme defaults to LIGHT; the no-flash script already applied the class.
      const t = localStorage.getItem(THEME_KEY);
      setTheme(t === "dark" ? "dark" : "light");
    } catch {
      /* ignore */
    }
    load(stored ?? DEFAULT_CITY);
  }, [load]);

  function toggleUnit() {
    setUnit((prev) => {
      const next = prev === "C" ? "F" : "C";
      try {
        localStorage.setItem(UNIT_KEY, next);
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  function toggleTheme() {
    setTheme((prev) => {
      const next: Theme = prev === "light" ? "dark" : "light";
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch {
        /* ignore */
      }
      const root = document.documentElement;
      if (next === "dark") root.classList.add("dark");
      else root.classList.remove("dark");
      return next;
    });
  }

  const descriptor = forecast
    ? describeWeather(forecast.current.weather_code, forecast.current.is_day === 1)
    : null;
  const atmosphere = descriptor?.atmosphere ?? NEUTRAL_ATMOSPHERE;

  return (
    <div
      style={atmosphereVars(atmosphere)}
      className="relative isolate min-h-screen overflow-hidden"
    >
      {/* layered Aurora atmosphere */}
      <div className="atmosphere" aria-hidden />
      <div className="aurora" aria-hidden />
      <div className="grain" aria-hidden />
      <div className="vignette" aria-hidden />

      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 pb-12 pt-7 sm:px-8 sm:pb-16 sm:pt-10">
        {/* masthead */}
        <header className="reveal flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-baseline gap-3">
            <span
              className="block h-3 w-3 translate-y-[-1px] rounded-full"
              style={{
                background:
                  "radial-gradient(circle at 30% 30%, var(--glow-1), var(--glow-2))",
                boxShadow:
                  "0 0 18px 2px color-mix(in srgb, var(--glow-1) 70%, transparent)",
              }}
              aria-hidden
            />
            <div>
              <h1 className="display text-2xl leading-none tracking-tight text-[var(--ink)] sm:text-3xl">
                Skyline
              </h1>
              <p className="mono mt-1 text-[0.7rem] uppercase tracking-[0.32em] text-[var(--ink-faint)]">
                Atmospheric Forecast
              </p>
            </div>
          </div>

          <div className="flex w-full items-center gap-3 sm:w-auto">
            <SearchBox onSelect={load} />
            <button
              type="button"
              onClick={toggleUnit}
              aria-label={`Switch to ${unit === "C" ? "Fahrenheit" : "Celsius"}`}
              className="pane-soft mono shrink-0 cursor-pointer rounded-full px-4 py-3 text-sm font-semibold text-[var(--ink)] transition hover:bg-[var(--pane-strong)]"
            >
              °{unit}
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              className="pane-soft shrink-0 cursor-pointer rounded-full p-3 text-[var(--ink)] transition hover:bg-[var(--pane-strong)]"
            >
              {theme === "light" ? (
                <Moon className="h-[18px] w-[18px]" strokeWidth={1.6} aria-hidden />
              ) : (
                <Sun className="h-[18px] w-[18px]" strokeWidth={1.6} aria-hidden />
              )}
            </button>
          </div>
        </header>

        {/* stage */}
        <div className="flex flex-1 flex-col justify-center py-10">
          {loading && (
            <div className="flex flex-col items-center justify-center gap-4 py-24 text-[var(--ink-soft)]">
              <Loader2 className="spin h-7 w-7" aria-hidden />
              <p className="mono text-sm uppercase tracking-[0.24em]">
                Reading the sky…
              </p>
            </div>
          )}

          {!loading && error && (
            <div className="pane reveal card-hover mx-auto flex max-w-md flex-col items-center justify-center gap-4 rounded-2xl px-8 py-16 text-center">
              <AlertTriangle
                className="h-8 w-8 text-[var(--color-destructive)]"
                aria-hidden
              />
              <p className="text-[var(--ink)]">{error}</p>
              {city && (
                <button
                  type="button"
                  onClick={() => load(city)}
                  className="btn-accent cursor-pointer text-sm"
                >
                  Try again
                </button>
              )}
            </div>
          )}

          {!loading && !error && city && forecast && descriptor && (
            <div className="grid gap-8 lg:grid-cols-[1.35fr_1fr] lg:items-end lg:gap-10">
              <CurrentCard
                cityName={cityLabel(city)}
                current={forecast.current}
                descriptor={descriptor}
                unit={unit}
              />
              <ForecastRow daily={forecast.daily} unit={unit} />
            </div>
          )}
        </div>

        <footer className="reveal flex items-center justify-between gap-4 border-t border-[var(--hairline)] pt-5 text-[0.7rem] uppercase tracking-[0.22em] text-[var(--ink-faint)]">
          <span className="mono inline-flex items-center gap-2">
            <CloudSun className="h-3.5 w-3.5" strokeWidth={1.6} aria-hidden />
            {descriptor ? descriptor.mood : "—"}
          </span>
          <span>
            Data by{" "}
            <a
              href="https://open-meteo.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer text-[var(--color-primary)] underline underline-offset-4 transition hover:text-[var(--color-secondary)]"
            >
              Open-Meteo
            </a>
          </span>
        </footer>
      </main>
    </div>
  );
}

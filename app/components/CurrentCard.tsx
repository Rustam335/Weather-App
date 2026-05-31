"use client";

import { Droplets, Wind, Thermometer } from "lucide-react";
import {
  formatTemp,
  formatWind,
  type CurrentWeather,
  type TempUnit,
  type WeatherDescriptor,
} from "../lib/weather";

interface CurrentCardProps {
  cityName: string;
  current: CurrentWeather;
  descriptor: WeatherDescriptor;
  unit: TempUnit;
}

export default function CurrentCard({
  cityName,
  current,
  descriptor,
  unit,
}: CurrentCardProps) {
  const { label, mood, icon: Icon } = descriptor;

  return (
    <section className="relative">
      {/* place + condition line */}
      <div className="reveal flex items-center gap-3" style={{ animationDelay: "0.05s" }}>
        <Icon
          className="h-6 w-6 text-[var(--color-accent)] drop-shadow"
          strokeWidth={1.5}
          aria-hidden
        />
        <p className="mono text-sm font-medium uppercase tracking-[0.26em] text-[var(--ink-soft)]">
          {label}
        </p>
      </div>

      <h2
        className="reveal display mt-3 text-3xl leading-tight text-[var(--ink)] sm:text-4xl"
        style={{ animationDelay: "0.12s" }}
      >
        {cityName}
      </h2>

      {/* the giant numeral */}
      <div className="relative mt-4 flex items-start">
        <span className="hero-temp temp-in text-[clamp(7rem,26vw,15rem)] text-[var(--ink)]">
          {formatTemp(current.temperature_2m, unit)}
        </span>
        <span
          className="mono reveal mt-6 text-3xl text-[var(--color-accent)] sm:text-4xl"
          style={{ animationDelay: "0.35s" }}
        >
          °{unit}
        </span>
      </div>

      <p
        className="reveal -mt-2 text-base italic text-[var(--ink-soft)]"
        style={{ animationDelay: "0.4s" }}
      >
        {mood} air over {cityName.split(",")[0]}.
      </p>

      {/* metrics strip */}
      <dl
        className="reveal mt-7 grid max-w-md grid-cols-3 gap-3"
        style={{ animationDelay: "0.48s" }}
      >
        <Metric
          icon={<Thermometer className="h-4 w-4" strokeWidth={1.6} aria-hidden />}
          label="Feels like"
          value={`${formatTemp(current.apparent_temperature, unit)}°`}
        />
        <Metric
          icon={<Wind className="h-4 w-4" strokeWidth={1.6} aria-hidden />}
          label="Wind"
          value={formatWind(current.wind_speed_10m, unit)}
        />
        <Metric
          icon={<Droplets className="h-4 w-4" strokeWidth={1.6} aria-hidden />}
          label="Humidity"
          value={`${Math.round(current.relative_humidity_2m)}%`}
        />
      </dl>
    </section>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="pane-soft flex flex-col gap-2 rounded-2xl px-3.5 py-3 transition hover:bg-[var(--pane-strong)]">
      <div className="flex items-center gap-1.5 text-[var(--color-primary)]">
        {icon}
        <span className="text-[0.6rem] uppercase tracking-[0.18em] text-[var(--ink-faint)]">
          {label}
        </span>
      </div>
      <span className="mono text-lg font-semibold text-[var(--ink)]">{value}</span>
    </div>
  );
}

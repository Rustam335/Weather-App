"use client";

import {
  describeWeather,
  formatTemp,
  weekday,
  type DailyWeather,
  type TempUnit,
} from "../lib/weather";

interface ForecastRowProps {
  daily: DailyWeather;
  unit: TempUnit;
}

export default function ForecastRow({ daily, unit }: ForecastRowProps) {
  // Temperature range across the week, for the mini bar visualization.
  const maxes = daily.temperature_2m_max;
  const mins = daily.temperature_2m_min;
  const weekHigh = Math.max(...maxes);
  const weekLow = Math.min(...mins);
  const span = Math.max(weekHigh - weekLow, 1);

  return (
    <section
      className="reveal pane rounded-[2rem] p-4 sm:p-5"
      style={{ animationDelay: "0.3s" }}
    >
      <h3 className="mono mb-3 px-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.26em] text-[var(--ink-faint)]">
        Seven days ahead
      </h3>

      <ul className="rail flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:gap-0 lg:overflow-visible lg:pb-0">
        {daily.time.map((date, i) => {
          const { label, icon: Icon } = describeWeather(daily.weather_code[i]);
          const hi = maxes[i];
          const lo = mins[i];
          const left = ((lo - weekLow) / span) * 100;
          const width = ((hi - lo) / span) * 100;

          return (
            <li
              key={date}
              className="group flex min-w-[5rem] flex-col items-center gap-2 rounded-2xl px-3 py-3 text-center transition lg:min-w-0 lg:grid lg:grid-cols-[3.5rem_2rem_1fr_auto] lg:items-center lg:gap-3 lg:py-2.5 lg:text-left hover:bg-[var(--pane-strong)]"
            >
              <span className="mono text-sm font-semibold text-[var(--ink-soft)]">
                {weekday(date, i)}
              </span>

              <Icon
                className="h-7 w-7 text-[var(--color-accent)] transition group-hover:scale-110 lg:h-6 lg:w-6"
                strokeWidth={1.5}
                aria-label={label}
              />

              {/* range bar (desktop only) */}
              <div className="hidden h-1.5 w-full rounded-full bg-[var(--hairline)] lg:block">
                <div
                  className="h-full rounded-full"
                  style={{
                    marginLeft: `${left}%`,
                    width: `${Math.max(width, 8)}%`,
                    background:
                      "linear-gradient(90deg, var(--glow-2), var(--glow-1))",
                  }}
                />
              </div>

              <div className="mono flex items-baseline justify-end gap-1.5 lg:tabular-nums">
                <span className="text-base font-semibold text-[var(--ink)]">
                  {formatTemp(hi, unit)}°
                </span>
                <span className="text-sm text-[var(--ink-faint)]">
                  {formatTemp(lo, unit)}°
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

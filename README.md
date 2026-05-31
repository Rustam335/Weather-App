# Skyline

> A clean, modern weather app — search any city for current conditions and a 7-day forecast.

Skyline is a fast, fully client-side weather experience built with Next.js. Search for any city in the world and instantly see the current temperature, conditions, wind, and humidity, plus a glanceable 7-day outlook — all wrapped in a glassy, gradient UI that shifts with the weather.

## Screenshots

<!-- add screenshot here -->

## Features

- **City search** with live geocoding and a dropdown of matches (name, region, country).
- **Current conditions** card: large temperature, condition label + icon, wind speed, and humidity.
- **7-day forecast** as a responsive row of day cards with weather icons and high/low temps.
- **Mood-aware background** — the gradient adapts to the current weather (clear, cloudy, rain, snow, storm…).
- **°C / °F toggle** with the choice remembered between visits.
- **Remembers your last city** via `localStorage` and reloads it on startup (defaults to Jakarta on first visit).
- **Polished states** for loading, network errors, and "city not found".
- **Responsive & accessible** — looks great from mobile to desktop.

## Tech Stack

- [Next.js](https://nextjs.org/) (App Router) + TypeScript
- [Tailwind CSS](https://tailwindcss.com/)
- [lucide-react](https://lucide.dev/) for icons
- [Open-Meteo](https://open-meteo.com/) — a free, keyless weather API (no API key, no sign-up, no environment variables required)

## Getting Started

```bash
yarn install
yarn dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Build

```bash
yarn build
```

## Deploy

Deploys to [Vercel](https://vercel.com/) with zero configuration — import the repository and click Deploy. Since the app is 100% client-side and uses only the keyless Open-Meteo API, there are no environment variables to set.

## License

MIT

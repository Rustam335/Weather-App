"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, MapPin, Search } from "lucide-react";
import { cityLabel, searchCities, type GeoResult } from "../lib/weather";

interface SearchBoxProps {
  onSelect: (city: GeoResult) => void;
}

export default function SearchBox({ onSelect }: SearchBoxProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeoResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced geocoding search.
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setOpen(false);
      setError(null);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    const timer = setTimeout(async () => {
      try {
        const found = await searchCities(q, controller.signal);
        setResults(found);
        setOpen(true);
        if (found.length === 0) setError("No matching city found.");
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setError("Search failed. Check your connection.");
          setResults([]);
          setOpen(true);
        }
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  // Close dropdown on outside click.
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handlePick(city: GeoResult) {
    onSelect(city);
    setQuery("");
    setResults([]);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative w-full sm:w-80">
      <div className="pane-soft input-focus flex items-center gap-3 rounded-full px-4 py-3 transition focus-within:bg-[var(--pane-strong)]">
        <Search className="h-[18px] w-[18px] shrink-0 text-[var(--ink-faint)]" strokeWidth={1.6} aria-hidden />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Search any city…"
          aria-label="Search for a city"
          className="w-full bg-transparent text-sm text-[var(--ink)] placeholder-[var(--ink-faint)] outline-none"
        />
        {loading && (
          <Loader2 className="spin h-[18px] w-[18px] shrink-0 text-[var(--ink-faint)]" aria-hidden />
        )}
      </div>

      {open && (
        <ul
          role="listbox"
          className="pane absolute z-30 mt-2 w-full overflow-hidden rounded-2xl"
          style={{ background: "var(--pane-strong)" }}
        >
          {error ? (
            <li className="px-4 py-3 text-sm text-[var(--ink-soft)]">{error}</li>
          ) : (
            results.map((city) => (
              <li key={city.id}>
                <button
                  type="button"
                  onClick={() => handlePick(city)}
                  className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left text-[var(--ink)] transition hover:bg-[var(--pane-strong)]"
                >
                  <MapPin className="h-4 w-4 shrink-0 text-[var(--ink-faint)]" strokeWidth={1.6} aria-hidden />
                  <span className="truncate text-sm">{cityLabel(city)}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

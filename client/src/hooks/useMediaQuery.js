import { useEffect, useState } from "react";

/**
 * @param {string} query e.g. "(min-width: 640px)"
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined" || !window.matchMedia) {
      return false;
    }
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const media = window.matchMedia(query);
    const onChange = () => setMatches(media.matches);
    media.addEventListener("change", onChange);
    setMatches(media.matches);
    return () => media.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

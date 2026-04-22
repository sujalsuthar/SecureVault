import { useEffect, useState } from "react";
import { checkPasswordPwned } from "../utils/pwnedPasswordCheck";

const idleState = {
  loading: false,
  pwned: null,
  count: 0,
  error: null,
};

/**
 * Debounced breach check for the current password value.
 * @param {string} password — raw value as entered (not trimmed)
 * @param {boolean} enabled — set false to skip checks (e.g. when field hidden)
 */
export function usePwnedPasswordCheck(password, enabled = true) {
  const [state, setState] = useState(idleState);

  useEffect(() => {
    if (!enabled) {
      setState(idleState);
      return undefined;
    }

    if (password == null || password.length === 0) {
      setState(idleState);
      return undefined;
    }

    setState({ loading: true, pwned: null, count: 0, error: null });

    const controller = new AbortController();
    const debounceMs = 450;

    const timer = window.setTimeout(() => {
      checkPasswordPwned(password, controller.signal)
        .then((result) => {
          setState({
            loading: false,
            pwned: result.pwned,
            count: result.count,
            error: null,
          });
        })
        .catch((error) => {
          if (error.name === "AbortError") {
            return;
          }
          setState({
            loading: false,
            pwned: null,
            count: 0,
            error: "Could not check breach database. Try again later.",
          });
        });
    }, debounceMs);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [password, enabled]);

  return state;
}

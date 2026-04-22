import { useEffect, useRef } from "react";
import { flushSync } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const IDLE_MS = 10 * 60 * 1000;
const ACTIVITY_THROTTLE_MS = 500;

const ACTIVITY_EVENTS = ["mousedown", "keydown", "scroll", "touchstart", "click", "mousemove", "wheel"];

/**
 * Logs the user out after IDLE_MS with no user activity. Clears JWT (via logout) and redirects to login.
 */
function SessionTimeoutWatcher() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const idleTimerRef = useRef(null);
  const lastActivityThrottleRef = useRef(0);

  useEffect(() => {
    if (!token) {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }
      return undefined;
    }

    const handleIdle = () => {
      idleTimerRef.current = null;
      flushSync(() => {
        logout();
      });
      navigate("/login", { replace: true, state: { sessionTimeout: true } });
    };

    const resetTimer = () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
      idleTimerRef.current = setTimeout(handleIdle, IDLE_MS);
    };

    const onActivity = () => {
      const now = Date.now();
      if (now - lastActivityThrottleRef.current < ACTIVITY_THROTTLE_MS) {
        return;
      }
      lastActivityThrottleRef.current = now;
      resetTimer();
    };

    ACTIVITY_EVENTS.forEach((name) => {
      window.addEventListener(name, onActivity, { capture: true, passive: true });
    });

    resetTimer();

    return () => {
      ACTIVITY_EVENTS.forEach((name) => {
        window.removeEventListener(name, onActivity, { capture: true });
      });
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }
    };
  }, [token, logout, navigate]);

  return null;
}

export default SessionTimeoutWatcher;

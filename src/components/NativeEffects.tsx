import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { App as CapApp } from "@capacitor/app";
import { isNative } from "../lib/native";
import { nativeNavigationStore } from "../lib/nativeNavigation";
import { syncReminders } from "../lib/reminders";

/** Mounted inside BrowserRouter; wires native-only side effects. */
export function NativeEffects() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationKeyRef = useRef(location.key);
  locationKeyRef.current = location.key;

  useEffect(() => {
    if (!isNative) return;
    void syncReminders();
    const consume = () => {
      const route = nativeNavigationStore.getState().pendingRoute;
      if (route) {
        nativeNavigationStore.setState({ pendingRoute: null });
        navigate(route);
      }
    };
    // A notification tap may arrive before the router mounts (cold start behind PIN).
    consume();
    return nativeNavigationStore.subscribe(consume);
  }, [navigate]);

  useEffect(() => {
    if (!isNative) return;
    const listener = CapApp.addListener("backButton", () => {
      if (locationKeyRef.current !== "default") navigate(-1);
      else void CapApp.exitApp();
    });
    return () => {
      void listener.then((h) => h.remove());
    };
  }, [navigate]);

  return null;
}
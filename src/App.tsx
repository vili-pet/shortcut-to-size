import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { LocalNotifications } from "@capacitor/local-notifications";
import { AppShell } from "./components/AppShell";
import { NativeEffects } from "./components/NativeEffects";
import { isNative } from "./lib/native";
import { nativeNavigationStore } from "./lib/nativeNavigation";
import { ComparePage } from "./pages/ComparePage";
import { HomePage } from "./pages/HomePage";
import { HistoryPage } from "./pages/HistoryPage";
import { PreviewPage } from "./pages/PreviewPage";
import { ProgressPage } from "./pages/ProgressPage";
import { SettingsPage } from "./pages/SettingsPage";
import { WeekPage } from "./pages/WeekPage";
import { StartWorkoutRedirect, WorkoutPage } from "./pages/WorkoutPage";

const basename = import.meta.env.BASE_URL.replace(/\/$/, "") || "/";

export default function App() {
  // Registered before the router mounts so cold-start notification taps are captured.
  useEffect(() => {
    if (!isNative) return;
    const listener = LocalNotifications.addListener(
      "localNotificationActionPerformed",
      (ev) => {
        const extra = ev.notification.extra as { route?: string } | undefined;
        nativeNavigationStore.setState({
          pendingRoute: extra?.route ?? "/edistyminen",
        });
      },
    );
    return () => {
      void listener.then((h) => h.remove());
    };
  }, []);

  return (
    <BrowserRouter basename={basename === "/" ? undefined : basename}>
      <NativeEffects />
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<HomePage />} />
          <Route path="viikko" element={<WeekPage />} />
          <Route path="esikatselu/:week/:dayId" element={<PreviewPage />} />
          <Route path="historia" element={<HistoryPage />} />
          <Route path="edistyminen" element={<ProgressPage />} />
          <Route path="edistyminen/vertaa/:idA/:idB" element={<ComparePage />} />
          <Route path="asetukset" element={<SettingsPage />} />
          <Route path="treeni/aloita/:dayId" element={<StartWorkoutRedirect />} />
          <Route path="treeni/:sessionId" element={<WorkoutPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
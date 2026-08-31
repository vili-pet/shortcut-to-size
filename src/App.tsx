import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { HomePage } from "./pages/HomePage";
import { HistoryPage } from "./pages/HistoryPage";
import { PreviewPage } from "./pages/PreviewPage";
import { SettingsPage } from "./pages/SettingsPage";
import { WeekPage } from "./pages/WeekPage";
import { StartWorkoutRedirect, WorkoutPage } from "./pages/WorkoutPage";

const basename = import.meta.env.BASE_URL.replace(/\/$/, "") || "/";

export default function App() {
  return (
    <BrowserRouter basename={basename === "/" ? undefined : basename}>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<HomePage />} />
          <Route path="viikko" element={<WeekPage />} />
          <Route path="esikatselu/:week/:dayId" element={<PreviewPage />} />
          <Route path="historia" element={<HistoryPage />} />
          <Route path="asetukset" element={<SettingsPage />} />
          <Route path="treeni/aloita/:dayId" element={<StartWorkoutRedirect />} />
          <Route path="treeni/:sessionId" element={<WorkoutPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

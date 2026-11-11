import { createStore } from "zustand/vanilla";

/** Route requested by a notification tap; consumed once the router is mounted. */
export const nativeNavigationStore = createStore<{ pendingRoute: string | null }>(
  () => ({ pendingRoute: null }),
);
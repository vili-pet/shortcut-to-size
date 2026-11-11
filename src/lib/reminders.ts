import { LocalNotifications } from "@capacitor/local-notifications";
import { useProgressStore } from "../store/useProgressStore";
import { isNative } from "./native";

const SLOT_IDS = [1001, 1002];
const TEST_ID = 9999;
const CHANNEL_ID = "sts-reminders";

/** Finnish 1=Ma…7=Su → Capacitor (Java Calendar) Sun=1…Sat=7. */
function capWeekday(w: number): number {
  return w === 7 ? 1 : w + 1;
}

/**
 * Idempotent: cancels existing slot alarms and re-arms them from the store.
 * `schedule.on.weekday` repeats weekly on its own — never combine with `every`.
 */
export async function syncReminders(): Promise<void> {
  if (!isNative) return;
  await LocalNotifications.cancel({
    notifications: SLOT_IDS.map((id) => ({ id })),
  });
  const { enabled, slots } = useProgressStore.getState().reminders;
  if (!enabled) return;
  const perm = await LocalNotifications.checkPermissions();
  if (perm.display !== "granted") return;
  await LocalNotifications.createChannel({
    id: CHANNEL_ID,
    name: "Muistutukset",
    importance: 4,
  });
  await LocalNotifications.schedule({
    notifications: slots.slice(0, 2).map((s, i) => ({
      id: SLOT_IDS[i],
      channelId: CHANNEL_ID,
      title: "Shortcut to Size",
      body: "Aika ottaa edistymiskuva.",
      extra: { route: "/edistyminen" },
      // Weekly reminders tolerate inexact alarms; exact ones would detour the
      // user through the Android 12+ "Alarms & reminders" settings screen.
      isExactNotification: false,
      schedule: {
        on: {
          weekday: capWeekday(s.weekday),
          hour: s.hour,
          minute: s.minute,
        },
        allowWhileIdle: true,
      },
    })),
  });
}

/** Call only from a user gesture (Settings save button). */
export async function requestAndSync(): Promise<boolean> {
  if (!isNative) return false;
  const perm = await LocalNotifications.requestPermissions();
  await syncReminders();
  return perm.display === "granted";
}

export async function sendTestNotification(): Promise<void> {
  if (!isNative) return;
  let perm = await LocalNotifications.checkPermissions();
  if (perm.display !== "granted") {
    perm = await LocalNotifications.requestPermissions();
    if (perm.display !== "granted") throw new Error("notifications-denied");
  }
  await LocalNotifications.createChannel({
    id: CHANNEL_ID,
    name: "Muistutukset",
    importance: 4,
  });
  await LocalNotifications.schedule({
    notifications: [
      {
        id: TEST_ID,
        channelId: CHANNEL_ID,
        title: "Shortcut to Size",
        body: "Aika ottaa edistymiskuva.",
        extra: { route: "/edistyminen" },
        isExactNotification: false,
        schedule: { at: new Date(Date.now() + 5000), allowWhileIdle: true },
      },
    ],
  });
}
import { useEffect, useState } from "react";
import { LocalNotifications } from "@capacitor/local-notifications";
import {
  requestAndSync,
  sendTestNotification,
  syncReminders,
} from "../lib/reminders";
import { useProgressStore, type ReminderSlot } from "../store/useProgressStore";

const WEEKDAYS = ["Ma", "Ti", "Ke", "To", "Pe", "La", "Su"];
const pad = (n: number) => String(n).padStart(2, "0");

const inputClass =
  "rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2.5 outline-none focus:border-[var(--color-accent)]";

export function ReminderSettings({
  flash,
  fail,
}: {
  flash: (msg: string) => void;
  fail: (msg: string) => void;
}) {
  const reminders = useProgressStore((s) => s.reminders);
  const setReminders = useProgressStore((s) => s.setReminders);
  const [enabled, setEnabled] = useState(reminders.enabled);
  const [count, setCount] = useState(reminders.slots.length >= 2 ? 2 : 1);
  const [slots, setSlots] = useState<ReminderSlot[]>(reminders.slots);
  const [denied, setDenied] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void LocalNotifications.checkPermissions().then((p) =>
      setDenied(p.display !== "granted"),
    );
  }, []);

  const updateSlot = (i: number, patch: Partial<ReminderSlot>) => {
    setSlots((prev) => prev.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  };

  const save = async () => {
    setBusy(true);
    setReminders({ enabled, slots: slots.slice(0, count) });
    if (enabled) {
      const granted = await requestAndSync();
      setDenied(!granted);
      if (granted) flash("Muistutukset päivitetty.");
      else fail("Ilmoitukset on estetty puhelimen asetuksista.");
    } else {
      await syncReminders();
      flash("Muistutukset poistettu käytöstä.");
    }
    setBusy(false);
  };

  const test = async () => {
    try {
      await sendTestNotification();
      flash("Testi-ilmoitus lähetetty (5 s).");
    } catch {
      setDenied(true);
      fail("Ilmoitukset on estetty puhelimen asetuksista.");
    }
  };

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <h2 className="text-xs font-medium uppercase tracking-wider text-[var(--color-muted)]">
        Muistutukset
      </h2>

      <label className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium">Edistymiskuva-muistutukset</span>
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          className="h-5 w-5 accent-[var(--color-accent)]"
        />
      </label>

      {enabled && (
        <>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-[var(--color-muted)]">Tiheys</span>
            <select
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className={inputClass}
            >
              <option value={1}>1× viikossa</option>
              <option value={2}>2× viikossa</option>
            </select>
          </label>

          {slots.slice(0, count).map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <select
                value={s.weekday}
                onChange={(e) =>
                  updateSlot(i, { weekday: Number(e.target.value) })
                }
                className={`${inputClass} flex-1`}
                aria-label={`Muistutuksen ${i + 1} viikonpäivä`}
              >
                {WEEKDAYS.map((d, di) => (
                  <option key={d} value={di + 1}>
                    {d}
                  </option>
                ))}
              </select>
              <input
                type="time"
                value={`${pad(s.hour)}:${pad(s.minute)}`}
                onChange={(e) => {
                  if (!e.target.value) return;
                  const [h, m] = e.target.value.split(":").map(Number);
                  updateSlot(i, { hour: h, minute: m });
                }}
                className={`${inputClass} flex-1`}
                aria-label={`Muistutuksen ${i + 1} kellonaika`}
              />
            </div>
          ))}
        </>
      )}

      {denied && enabled && (
        <p className="text-xs text-[var(--color-danger)]">
          Ilmoituslupa puuttuu — salli ilmoitukset puhelimen asetuksista.
        </p>
      )}

      <button
        type="button"
        onClick={() => void save()}
        disabled={busy}
        className="rounded-xl bg-[var(--color-accent)] py-3 font-semibold text-[var(--color-bg)] disabled:opacity-50"
      >
        Tallenna muistutukset
      </button>
      <button
        type="button"
        onClick={() => void test()}
        className="rounded-xl bg-[var(--color-surface-2)] py-3 font-medium"
      >
        Testaa ilmoitusta
      </button>
    </section>
  );
}
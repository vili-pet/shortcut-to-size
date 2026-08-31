import { useRef, useState } from "react";
import { attribution } from "../data/program";
import { useProgramWeek } from "../lib/hooks";
import { useAppStore } from "../store/useAppStore";

export function SettingsPage() {
  const startDate = useAppStore((s) => s.startDate);
  const manualWeek = useAppStore((s) => s.manualWeek);
  const setStartDate = useAppStore((s) => s.setStartDate);
  const setManualWeek = useAppStore((s) => s.setManualWeek);
  const exportData = useAppStore((s) => s.exportData);
  const importData = useAppStore((s) => s.importData);
  const resetAll = useAppStore((s) => s.resetAll);
  const programWeek = useProgramWeek();
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState("");

  const download = () => {
    const blob = new Blob([exportData()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sts-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMsg("Backup ladattu.");
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-wide">
          Asetukset
        </h1>
        <p className="text-sm text-[var(--color-muted)]">
          Nyt viikko {programWeek}/12 · yksikkö kg
        </p>
      </div>

      <label className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-wider text-[var(--color-muted)]">
          Ohjelman aloituspäivä
        </span>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 outline-none focus:border-[var(--color-accent)]"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-wider text-[var(--color-muted)]">
          Viikko manuaalisesti (valinnainen)
        </span>
        <select
          value={manualWeek ?? ""}
          onChange={(e) =>
            setManualWeek(e.target.value === "" ? null : Number(e.target.value))
          }
          className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 outline-none focus:border-[var(--color-accent)]"
        >
          <option value="">Automaattinen aloituspäivästä</option>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((w) => (
            <option key={w} value={w}>
              Viikko {w}
            </option>
          ))}
        </select>
      </label>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={download}
          className="rounded-xl bg-[var(--color-surface-2)] py-3 font-medium"
        >
          Vie data (JSON)
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="rounded-xl bg-[var(--color-surface-2)] py-3 font-medium"
        >
          Tuo data
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const text = await file.text();
            setMsg(importData(text) ? "Tuonti onnistui." : "Tuonti epäonnistui.");
            e.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => {
            if (confirm("Nollataanko kaikki lokit ja asetukset?")) {
              resetAll();
              setMsg("Nollattu.");
            }
          }}
          className="rounded-xl border border-[var(--color-danger)]/40 py-3 font-medium text-[var(--color-danger)]"
        >
          Nollaa kaikki
        </button>
      </div>

      {msg && <p className="text-sm text-[var(--color-ok)]">{msg}</p>}

      <p className="text-[11px] leading-relaxed text-[var(--color-muted)]/80">
        {attribution()}
      </p>
    </div>
  );
}

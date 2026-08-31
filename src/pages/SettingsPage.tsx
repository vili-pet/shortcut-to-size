import { useRef, useState } from "react";
import { attribution } from "../data/program";
import { downloadGistBackup, uploadGistBackup } from "../lib/gistSync";
import { isValidPin } from "../lib/pin";
import { useProgramWeek } from "../lib/hooks";
import { useAppStore } from "../store/useAppStore";
import { useLockStore } from "../store/useLockStore";

export function SettingsPage() {
  const startDate = useAppStore((s) => s.startDate);
  const manualWeek = useAppStore((s) => s.manualWeek);
  const setStartDate = useAppStore((s) => s.setStartDate);
  const setManualWeek = useAppStore((s) => s.setManualWeek);
  const exportData = useAppStore((s) => s.exportData);
  const importData = useAppStore((s) => s.importData);
  const resetAll = useAppStore((s) => s.resetAll);
  const programWeek = useProgramWeek();

  const lockNow = useLockStore((s) => s.lockNow);
  const changePin = useLockStore((s) => s.changePin);
  const gistToken = useLockStore((s) => s.gistToken);
  const gistId = useLockStore((s) => s.gistId);
  const setGistToken = useLockStore((s) => s.setGistToken);
  const setGistId = useLockStore((s) => s.setGistId);

  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [curPin, setCurPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [busyCloud, setBusyCloud] = useState(false);

  const flash = (ok: string) => {
    setErr("");
    setMsg(ok);
  };
  const fail = (text: string) => {
    setMsg("");
    setErr(text);
  };

  const download = () => {
    const blob = new Blob([exportData()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sts-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    flash("Backup ladattu.");
  };

  const cloudBackup = async () => {
    if (!gistToken) {
      fail("Liitä GitHub-token (gist) alle.");
      return;
    }
    setBusyCloud(true);
    const res = await uploadGistBackup({
      token: gistToken,
      gistId,
      json: exportData(),
    });
    setBusyCloud(false);
    if (!res.ok) {
      fail(res.error);
      return;
    }
    setGistId(res.gistId);
    flash("Pilvivarmuuskopio OK.");
  };

  const cloudRestore = async () => {
    if (!gistToken || !gistId) {
      fail("Token + gist ID tarvitaan palautukseen.");
      return;
    }
    if (!confirm("Korvataanko paikallinen data gist-varmuuskopiolla?")) return;
    setBusyCloud(true);
    const res = await downloadGistBackup({ token: gistToken, gistId });
    setBusyCloud(false);
    if (!res.ok) {
      fail(res.error);
      return;
    }
    flash(importData(res.json) ? "Palautus onnistui." : "Palautus epäonnistui.");
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

      <section className="flex flex-col gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <h2 className="text-xs font-medium uppercase tracking-wider text-[var(--color-muted)]">
          Lukitus
        </h2>
        <button
          type="button"
          onClick={lockNow}
          className="rounded-xl bg-[var(--color-surface-2)] py-3 font-medium"
        >
          Lukitse nyt
        </button>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs text-[var(--color-muted)]">Nykyinen PIN</span>
          <input
            type="password"
            inputMode="numeric"
            value={curPin}
            onChange={(e) => setCurPin(e.target.value.replace(/\D/g, "").slice(0, 8))}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2.5 outline-none focus:border-[var(--color-accent)]"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs text-[var(--color-muted)]">Uusi PIN (4–8 numeroa)</span>
          <input
            type="password"
            inputMode="numeric"
            value={newPin}
            onChange={(e) => setNewPin(e.target.value.replace(/\D/g, "").slice(0, 8))}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2.5 outline-none focus:border-[var(--color-accent)]"
          />
        </label>
        <button
          type="button"
          onClick={async () => {
            if (!isValidPin(newPin)) {
              fail("Uusi PIN: 4–8 numeroa.");
              return;
            }
            const res = await changePin(curPin, newPin);
            if (res === "ok") {
              setCurPin("");
              setNewPin("");
              flash("PIN vaihdettu.");
            } else if (res === "bad") fail("Nykyinen PIN väärin.");
            else fail("Uusi PIN epäkelpo.");
          }}
          className="rounded-xl bg-[var(--color-surface-2)] py-3 font-medium"
        >
          Vaihda PIN
        </button>
      </section>

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

      <section className="flex flex-col gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <h2 className="text-xs font-medium uppercase tracking-wider text-[var(--color-muted)]">
          Pilvivarmuuskopio (GitHub Gist)
        </h2>
        <p className="text-xs leading-relaxed text-[var(--color-muted)]">
          Treenit tallentuvat aina puhelimeen. Halutessasi voit synkata yksityiseen
          Gistiin: luo GitHubissa classic token oikeudella{" "}
          <code className="text-[var(--color-accent-dim)]">gist</code>, liitä tähän,
          paina varmuuskopioi.
        </p>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs text-[var(--color-muted)]">GitHub token</span>
          <input
            type="password"
            value={gistToken}
            onChange={(e) => setGistToken(e.target.value)}
            placeholder="ghp_…"
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2.5 font-mono text-sm outline-none focus:border-[var(--color-accent)]"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs text-[var(--color-muted)]">Gist ID (täyttyy automaattisesti)</span>
          <input
            type="text"
            value={gistId}
            onChange={(e) => setGistId(e.target.value)}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2.5 font-mono text-sm outline-none focus:border-[var(--color-accent)]"
          />
        </label>
        <button
          type="button"
          disabled={busyCloud}
          onClick={cloudBackup}
          className="rounded-xl bg-[var(--color-accent)] py-3 font-semibold text-[var(--color-bg)] disabled:opacity-50"
        >
          Varmuuskopioi pilveen
        </button>
        <button
          type="button"
          disabled={busyCloud}
          onClick={cloudRestore}
          className="rounded-xl bg-[var(--color-surface-2)] py-3 font-medium disabled:opacity-50"
        >
          Palauta pilvestä
        </button>
      </section>

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
            flash(importData(text) ? "Tuonti onnistui." : "Tuonti epäonnistui.");
            e.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => {
            if (confirm("Nollataanko kaikki lokit ja treeniasetukset? (PIN säilyy)")) {
              resetAll();
              flash("Treenidata nollattu.");
            }
          }}
          className="rounded-xl border border-[var(--color-danger)]/40 py-3 font-medium text-[var(--color-danger)]"
        >
          Nollaa treenidata
        </button>
      </div>

      {msg && <p className="text-sm text-[var(--color-ok)]">{msg}</p>}
      {err && <p className="text-sm text-[var(--color-danger)]">{err}</p>}

      <p className="text-[11px] leading-relaxed text-[var(--color-muted)]/80">
        {attribution()}
      </p>
    </div>
  );
}

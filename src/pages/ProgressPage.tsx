import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProgressImage } from "../components/ProgressImage";
import { isNative } from "../lib/native";
import { captureProgressPhoto, deleteProgressMedia } from "../lib/progressMedia";
import { useProgressStore, type ProgressMedia } from "../store/useProgressStore";

const monthFmt = new Intl.DateTimeFormat("fi-FI", {
  month: "long",
  year: "numeric",
});
const dateFmt = new Intl.DateTimeFormat("fi-FI", {
  day: "numeric",
  month: "numeric",
  year: "numeric",
});

export function ProgressPage() {
  const media = useProgressStore((s) => s.media);
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [compareMode, setCompareMode] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [viewing, setViewing] = useState<ProgressMedia | null>(null);

  const sorted = useMemo(
    () => [...media].sort((a, b) => b.takenAt.localeCompare(a.takenAt)),
    [media],
  );
  const groups = useMemo(() => {
    const map = new Map<string, ProgressMedia[]>();
    for (const m of sorted) {
      const key = monthFmt.format(new Date(m.takenAt));
      const list = map.get(key) ?? [];
      list.push(m);
      map.set(key, list);
    }
    return [...map.entries()];
  }, [sorted]);

  if (!isNative) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-wide">
          Edistyminen
        </h1>
        <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <p className="text-sm text-[var(--color-muted)]">
            Edistymiskuvat ja muistutukset ovat käytettävissä vain
            Android-sovelluksessa.
          </p>
        </section>
      </div>
    );
  }

  const capture = async () => {
    setErr("");
    setBusy(true);
    try {
      await captureProgressPhoto();
    } catch {
      setErr("Kuvan tallennus epäonnistui.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Poistetaanko kuva? Tätä ei voi perua.")) return;
    try {
      await deleteProgressMedia(id);
    } catch {
      setErr("Kuvan poisto epäonnistui.");
    }
  };

  const toggleSelect = (id: string) => {
    const next = selected.includes(id)
      ? selected.filter((x) => x !== id)
      : [...selected, id];
    if (next.length === 2) {
      setCompareMode(false);
      setSelected([]);
      navigate(`/edistyminen/vertaa/${next[0]}/${next[1]}`);
      return;
    }
    setSelected(next);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-wide">
          Edistyminen
        </h1>
        <p className="text-sm text-[var(--color-muted)]">
          Kuvat tallentuvat vain tähän sovellukseen — eivät galleriaan.
        </p>
      </div>

      <button
        type="button"
        onClick={capture}
        disabled={busy}
        className="rounded-2xl bg-[var(--color-accent)] px-5 py-4 text-[var(--color-bg)] transition active:scale-[0.99] disabled:opacity-50"
      >
        <p className="font-[family-name:var(--font-display)] text-2xl tracking-wide">
          {busy ? "Tallennetaan…" : "Ota edistymiskuva"}
        </p>
      </button>

      {err && <p className="text-sm text-[var(--color-danger)]">{err}</p>}

      {sorted.length >= 2 && (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setCompareMode((v) => !v);
              setSelected([]);
            }}
            className={[
              "rounded-xl px-4 py-2.5 text-sm font-medium",
              compareMode
                ? "bg-[var(--color-accent)] text-[var(--color-bg)]"
                : "bg-[var(--color-surface-2)]",
            ].join(" ")}
          >
            {compareMode ? "Peruuta vertailu" : "Vertaa kuvia"}
          </button>
          {compareMode && (
            <p className="text-xs text-[var(--color-muted)]">
              Valitse kaksi kuvaa ({selected.length}/2)
            </p>
          )}
        </div>
      )}

      {sorted.length === 0 ? (
        <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-center">
          <p className="text-sm text-[var(--color-muted)]">
            Ei vielä kuvia. Ota ensimmäinen kuvasi tänään!
          </p>
        </section>
      ) : (
        groups.map(([month, items]) => (
          <section key={month} className="flex flex-col gap-3">
            <h2 className="text-xs font-medium uppercase tracking-wider text-[var(--color-muted)]">
              {month}
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {items.map((m) => {
                const isSelected = selected.includes(m.id);
                return (
                  <div
                    key={m.id}
                    className={[
                      "flex flex-col gap-1.5 rounded-2xl border bg-[var(--color-surface)] p-2",
                      isSelected
                        ? "border-[var(--color-accent)]"
                        : "border-[var(--color-border)]",
                    ].join(" ")}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        compareMode ? toggleSelect(m.id) : setViewing(m)
                      }
                      className="relative"
                    >
                      <ProgressImage
                        fileName={m.fileName}
                        alt={dateFmt.format(new Date(m.takenAt))}
                        className="aspect-[3/4] w-full rounded-xl object-cover"
                      />
                      {compareMode && (
                        <span
                          className={[
                            "absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full border text-xs font-bold",
                            isSelected
                              ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-bg)]"
                              : "border-[var(--color-border)] bg-[var(--color-bg)]/80 text-[var(--color-muted)]",
                          ].join(" ")}
                        >
                          {isSelected ? selected.indexOf(m.id) + 1 : ""}
                        </span>
                      )}
                    </button>
                    <div className="flex items-center justify-between gap-2 px-1">
                      <div className="min-w-0">
                        <p className="text-xs font-medium">
                          {dateFmt.format(new Date(m.takenAt))}
                        </p>
                        {m.note && (
                          <p className="truncate text-xs text-[var(--color-muted)]">
                            {m.note}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => void remove(m.id)}
                        className="shrink-0 text-xs font-medium text-[var(--color-danger)]"
                      >
                        Poista
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))
      )}

      {viewing && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-black/95 p-4"
          onClick={() => setViewing(null)}
        >
          <ProgressImage
            fileName={viewing.fileName}
            alt={dateFmt.format(new Date(viewing.takenAt))}
            className="max-h-[80dvh] w-full rounded-xl object-contain"
          />
          <p className="text-sm text-[var(--color-muted)]">
            {dateFmt.format(new Date(viewing.takenAt))}
            {viewing.note ? ` · ${viewing.note}` : ""}
          </p>
          <button
            type="button"
            onClick={() => setViewing(null)}
            className="rounded-xl bg-[var(--color-surface-2)] px-6 py-2.5 text-sm font-medium"
          >
            Sulje
          </button>
        </div>
      )}
    </div>
  );
}
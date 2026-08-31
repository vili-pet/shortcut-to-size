import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { isValidPin } from "../lib/pin";
import { useLockStore } from "../store/useLockStore";

export function LockGate({ children }: { children: ReactNode }) {
  const pinHash = useLockStore((s) => s.pinHash);
  const unlocked = useLockStore((s) => s.unlocked);
  const hydrateUnlock = useLockStore((s) => s.hydrateUnlock);
  const setupPin = useLockStore((s) => s.setupPin);
  const unlock = useLockStore((s) => s.unlock);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    hydrateUnlock();
    setReady(true);
  }, [hydrateUnlock]);

  if (!ready) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[var(--color-bg)] text-[var(--color-muted)]">
        …
      </div>
    );
  }

  if (!pinHash) {
    return <PinSetup onSetup={setupPin} />;
  }

  if (!unlocked) {
    return <PinUnlock onUnlock={unlock} />;
  }

  return <>{children}</>;
}

function PinSetup({ onSetup }: { onSetup: (pin: string) => Promise<boolean> }) {
  const [pin, setPin] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!isValidPin(pin)) {
      setError("PIN: 4–8 numeroa.");
      return;
    }
    if (pin !== confirm) {
      setError("PINit eivät täsmää.");
      return;
    }
    setBusy(true);
    const ok = await onSetup(pin);
    setBusy(false);
    if (!ok) setError("PIN:n asetus epäonnistui.");
  };

  return (
    <LockShell
      title="Aseta PIN"
      subtitle="Suojaa treeniloki — tarvitaan aina kun avaat apin."
    >
      <form onSubmit={submit} className="flex flex-col gap-3">
        <PinInput
          label="Uusi PIN"
          value={pin}
          onChange={setPin}
          autoFocus
        />
        <PinInput
          label="Vahvista PIN"
          value={confirm}
          onChange={setConfirm}
        />
        {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="mt-2 rounded-2xl bg-[var(--color-accent)] py-3.5 font-semibold text-[var(--color-bg)] disabled:opacity-50"
        >
          Lukitse appi
        </button>
      </form>
    </LockShell>
  );
}

function PinUnlock({
  onUnlock,
}: {
  onUnlock: (pin: string) => Promise<boolean>;
}) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const ok = await onUnlock(pin);
    setBusy(false);
    if (!ok) {
      setError("Väärä PIN.");
      setPin("");
    }
  };

  return (
    <LockShell title="Shortcut to Size" subtitle="Syötä PIN avataksesi">
      <form onSubmit={submit} className="flex flex-col gap-3">
        <PinInput
          label="PIN"
          value={pin}
          onChange={setPin}
          autoFocus
        />
        {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
        <button
          type="submit"
          disabled={busy || pin.length < 4}
          className="mt-2 rounded-2xl bg-[var(--color-accent)] py-3.5 font-semibold text-[var(--color-bg)] disabled:opacity-50"
        >
          Avaa
        </button>
      </form>
    </LockShell>
  );
}

function LockShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[var(--color-bg)] px-6">
      <div className="w-full max-w-sm">
        <p className="font-[family-name:var(--font-display)] text-4xl tracking-wide text-[var(--color-accent)]">
          {title}
        </p>
        <p className="mt-2 text-sm text-[var(--color-muted)]">{subtitle}</p>
        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}

function PinInput({
  label,
  value,
  onChange,
  autoFocus,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoFocus?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs uppercase tracking-wider text-[var(--color-muted)]">
        {label}
      </span>
      <input
        type="password"
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="[0-9]*"
        maxLength={8}
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 8))}
        className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3.5 text-center text-2xl tracking-[0.4em] outline-none focus:border-[var(--color-accent)]"
      />
    </label>
  );
}

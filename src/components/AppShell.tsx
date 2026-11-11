import { NavLink, Outlet } from "react-router-dom";
import { isNative } from "../lib/native";

const links = [
  { to: "/", label: "Koti", end: true },
  { to: "/viikko", label: "Viikko" },
  { to: "/historia", label: "Historia" },
  ...(isNative ? [{ to: "/edistyminen", label: "Edistyminen" }] : []),
  { to: "/asetukset", label: "Asetukset" },
];

export function AppShell() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col pb-[calc(4.5rem+env(safe-area-inset-bottom))]">
      <header className="sticky top-0 z-20 border-b border-[var(--color-border)]/60 bg-[var(--color-bg)]/90 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-md">
        <p className="font-[family-name:var(--font-display)] text-3xl tracking-wide text-[var(--color-accent)]">
          Shortcut to Size
        </p>
        <p className="text-xs text-[var(--color-muted)]">12 viikkoa · mikroperiodisaatio</p>
      </header>

      <main className="flex-1 px-4 py-4">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--color-border)] bg-[var(--color-surface)]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md">
        <div
          className={`mx-auto grid max-w-lg ${isNative ? "grid-cols-5" : "grid-cols-4"}`}
        >
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                [
                  `flex flex-col items-center gap-0.5 py-3 font-medium transition-colors ${isNative ? "text-[11px]" : "text-xs"}`,
                  isActive
                    ? "text-[var(--color-accent)]"
                    : "text-[var(--color-muted)] hover:text-[var(--color-ink)]",
                ].join(" ")
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}

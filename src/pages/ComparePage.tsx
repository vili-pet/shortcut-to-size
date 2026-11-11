import { Navigate, useNavigate, useParams } from "react-router-dom";
import { ProgressImage } from "../components/ProgressImage";
import { useProgressStore } from "../store/useProgressStore";

const dateFmt = new Intl.DateTimeFormat("fi-FI", {
  day: "numeric",
  month: "numeric",
  year: "numeric",
});

export function ComparePage() {
  const { idA, idB } = useParams();
  const media = useProgressStore((s) => s.media);
  const navigate = useNavigate();

  const a = media.find((m) => m.id === idA);
  const b = media.find((m) => m.id === idB);
  if (!a || !b) return <Navigate to="/edistyminen" replace />;

  const [before, after] = a.takenAt <= b.takenAt ? [a, b] : [b, a];

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-wide">
        Vertailu
      </h1>
      <div className="grid grid-cols-2 gap-2">
        {[
          { m: before, label: "Ennen" },
          { m: after, label: "Jälkeen" },
        ].map(({ m, label }) => (
          <figure key={m.id} className="flex flex-col gap-1.5">
            <ProgressImage
              fileName={m.fileName}
              alt={label}
              className="aspect-[3/4] w-full rounded-xl bg-[var(--color-surface-2)] object-contain"
            />
            <figcaption className="text-center">
              <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-accent)]">
                {label}
              </p>
              <p className="text-xs text-[var(--color-muted)]">
                {dateFmt.format(new Date(m.takenAt))}
              </p>
            </figcaption>
          </figure>
        ))}
      </div>
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="rounded-xl bg-[var(--color-surface-2)] py-3 font-medium"
      >
        Takaisin
      </button>
    </div>
  );
}
import type { ExerciseTemplate } from "../data/program";
import { exerciseVideoNote } from "../data/exerciseVideos";

export function ExerciseVideoLink({ exercise }: { exercise: ExerciseTemplate }) {
  if (!exercise.videoUrl) return null;
  const note = exerciseVideoNote(exercise.name);
  return (
    <div className="mt-2 text-xs">
      <a
        href={exercise.videoUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Katso tekniikkavideo: ${exercise.name} (ulkoinen sivusto)`}
        className="inline-flex min-h-11 items-center rounded-lg px-2 text-[var(--color-accent)] underline underline-offset-4 focus-visible:outline-2"
      >
        Katso tekniikkavideo
      </a>
      <p className="text-[11px] text-[var(--color-muted)]">Ulkoinen video tai video-opas · vaatii netin</p>
      {note && <p className="mt-1 text-[11px] text-[var(--color-muted)]">{note}</p>}
    </div>
  );
}

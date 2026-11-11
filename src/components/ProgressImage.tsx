import { useEffect, useState } from "react";
import { resolveMediaUrl } from "../lib/progressMedia";

export function ProgressImage({
  fileName,
  alt,
  className,
}: {
  fileName: string;
  alt: string;
  className?: string;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    setUrl(null);
    setFailed(false);
    resolveMediaUrl(fileName)
      .then((u) => {
        if (alive) setUrl(u);
      })
      .catch(() => {
        if (alive) setFailed(true);
      });
    return () => {
      alive = false;
    };
  }, [fileName]);

  if (failed) {
    return (
      <div
        className={`${className ?? ""} flex items-center justify-center bg-[var(--color-surface-2)] p-2 text-center text-xs text-[var(--color-muted)]`}
      >
        Kuvaa ei voitu ladata
      </div>
    );
  }
  if (!url) {
    return (
      <div className={`${className ?? ""} animate-pulse bg-[var(--color-surface-2)]`} />
    );
  }
  return <img src={url} alt={alt} className={className} />;
}
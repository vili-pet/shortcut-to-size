import type { ReactNode } from "react";
import { MOVEMENT_LABEL_FI, type MovementKind } from "../lib/movement";

interface Props {
  kind: MovementKind;
  expanded?: boolean;
}

/** Stick-figure style looping demos — offline, no video assets. */
export function MovementDemo({ kind, expanded = false }: Props) {
  const size = expanded ? 160 : 56;
  return (
    <div
      className={[
        "relative shrink-0 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]",
        expanded ? "mx-auto" : "",
      ].join(" ")}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className="movement-svg text-[var(--color-accent)]"
      >
        <Demo kind={kind} />
      </svg>
      {expanded && (
        <p className="absolute inset-x-0 bottom-1 text-center text-[10px] text-[var(--color-muted)]">
          {MOVEMENT_LABEL_FI[kind]}
        </p>
      )}
    </div>
  );
}

function Stick({
  arms,
  legs,
  torsoRot = 0,
  className = "",
}: {
  arms?: ReactNode;
  legs?: ReactNode;
  torsoRot?: number;
  className?: string;
}) {
  return (
    <g
      className={className}
      stroke="currentColor"
      strokeWidth="3.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    >
      <circle cx="50" cy="22" r="6" fill="currentColor" stroke="none" opacity="0.9" />
      <g style={{ transformOrigin: "50px 36px", transform: `rotate(${torsoRot}deg)` }}>
        <line x1="50" y1="28" x2="50" y2="58" />
        {arms ?? (
          <>
            <line x1="50" y1="36" x2="36" y2="48" />
            <line x1="50" y1="36" x2="64" y2="48" />
          </>
        )}
        {legs ?? (
          <>
            <line x1="50" y1="58" x2="40" y2="78" />
            <line x1="50" y1="58" x2="60" y2="78" />
          </>
        )}
      </g>
    </g>
  );
}

function Bar({
  x1,
  y1,
  x2,
  y2,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}) {
  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      opacity="0.55"
    />
  );
}

function Demo({ kind }: { kind: MovementKind }) {
  switch (kind) {
    case "bench":
      return (
        <g>
          <line x1="22" y1="62" x2="78" y2="62" stroke="currentColor" strokeWidth="2" opacity="0.25" />
          <g className="mv-press-y">
            <Stick
              arms={
                <>
                  <line x1="50" y1="40" x2="32" y2="36" />
                  <line x1="50" y1="40" x2="68" y2="36" />
                </>
              }
              legs={
                <>
                  <line x1="50" y1="58" x2="38" y2="70" />
                  <line x1="50" y1="58" x2="62" y2="70" />
                </>
              }
            />
            <Bar x1={28} y1={34} x2={72} y2={34} />
          </g>
        </g>
      );
    case "press":
      return (
        <g className="mv-press-up">
          <Stick
            arms={
              <>
                <line x1="50" y1="36" x2="38" y2="28" />
                <line x1="50" y1="36" x2="62" y2="28" />
              </>
            }
          />
          <Bar x1={34} y1={24} x2={66} y2={24} />
        </g>
      );
    case "flye":
      return (
        <g className="mv-flye">
          <Stick
            arms={
              <>
                <line x1="50" y1="38" x2="28" y2="42" />
                <line x1="50" y1="38" x2="72" y2="42" />
              </>
            }
          />
        </g>
      );
    case "pressdown":
      return (
        <g className="mv-pressdown">
          <line x1="50" y1="12" x2="50" y2="28" stroke="currentColor" strokeWidth="2" opacity="0.35" />
          <Stick
            arms={
              <>
                <line x1="50" y1="36" x2="42" y2="48" />
                <line x1="50" y1="36" x2="58" y2="48" />
              </>
            }
          />
        </g>
      );
    case "skull":
      return (
        <g className="mv-skull">
          <Stick
            arms={
              <>
                <line x1="50" y1="36" x2="42" y2="24" />
                <line x1="50" y1="36" x2="58" y2="24" />
              </>
            }
            legs={
              <>
                <line x1="50" y1="58" x2="38" y2="68" />
                <line x1="50" y1="58" x2="62" y2="68" />
              </>
            }
          />
        </g>
      );
    case "overhead-tri":
      return (
        <g className="mv-oh-tri">
          <Stick
            arms={
              <>
                <line x1="50" y1="36" x2="50" y2="18" />
                <line x1="50" y1="18" x2="58" y2="28" />
              </>
            }
          />
        </g>
      );
    case "calf":
      return (
        <g className="mv-calf">
          <Stick
            legs={
              <>
                <line x1="50" y1="58" x2="44" y2="82" />
                <line x1="50" y1="58" x2="56" y2="82" />
              </>
            }
          />
          <line x1="30" y1="86" x2="70" y2="86" stroke="currentColor" strokeWidth="2" opacity="0.25" />
        </g>
      );
    case "row":
      return (
        <g className="mv-row" style={{ transformOrigin: "50px 50px" }}>
          <Stick
            torsoRot={-35}
            arms={
              <>
                <line x1="50" y1="40" x2="68" y2="36" />
                <line x1="50" y1="40" x2="70" y2="44" />
              </>
            }
          />
        </g>
      );
    case "pulldown":
      return (
        <g className="mv-pulldown">
          <Bar x1={30} y1={16} x2={70} y2={16} />
          <Stick
            arms={
              <>
                <line x1="50" y1="36" x2="36" y2="22" />
                <line x1="50" y1="36" x2="64" y2="22" />
              </>
            }
          />
        </g>
      );
    case "straight-arm":
      return (
        <g className="mv-sa-pull">
          <Stick
            arms={
              <>
                <line x1="50" y1="36" x2="50" y2="18" />
                <line x1="50" y1="36" x2="58" y2="20" />
              </>
            }
          />
        </g>
      );
    case "curl":
      return (
        <g className="mv-curl">
          <Stick
            arms={
              <>
                <line x1="50" y1="36" x2="38" y2="52" />
                <line x1="50" y1="36" x2="62" y2="52" />
              </>
            }
          />
        </g>
      );
    case "lateral":
      return (
        <g className="mv-lateral">
          <Stick
            arms={
              <>
                <line x1="50" y1="36" x2="28" y2="40" />
                <line x1="50" y1="36" x2="72" y2="40" />
              </>
            }
          />
        </g>
      );
    case "front-raise":
      return (
        <g className="mv-front">
          <Stick
            arms={
              <>
                <line x1="50" y1="36" x2="50" y2="22" />
                <line x1="50" y1="36" x2="58" y2="40" />
              </>
            }
          />
        </g>
      );
    case "rear-delt":
      return (
        <g className="mv-rear">
          <Stick
            torsoRot={-40}
            arms={
              <>
                <line x1="50" y1="40" x2="30" y2="36" />
                <line x1="50" y1="40" x2="70" y2="36" />
              </>
            }
          />
        </g>
      );
    case "shrug":
      return (
        <g className="mv-shrug">
          <Stick />
          <Bar x1={32} y1={48} x2={68} y2={48} />
        </g>
      );
    case "upright":
      return (
        <g className="mv-upright">
          <Stick
            arms={
              <>
                <line x1="50" y1="36" x2="42" y2="48" />
                <line x1="50" y1="36" x2="58" y2="48" />
              </>
            }
          />
          <Bar x1={36} y1={50} x2={64} y2={50} />
        </g>
      );
    case "squat":
      return (
        <g className="mv-squat">
          <Stick
            legs={
              <>
                <line x1="50" y1="52" x2="38" y2="78" />
                <line x1="50" y1="52" x2="62" y2="78" />
              </>
            }
          />
          <Bar x1={34} y1={30} x2={66} y2={30} />
        </g>
      );
    case "leg-press":
      return (
        <g className="mv-legpress">
          <Stick
            legs={
              <>
                <line x1="50" y1="58" x2="68" y2="48" />
                <line x1="50" y1="58" x2="70" y2="58" />
              </>
            }
          />
          <rect
            x="72"
            y="40"
            width="10"
            height="28"
            rx="2"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            opacity="0.4"
          />
        </g>
      );
    case "leg-ext":
      return (
        <g className="mv-legext">
          <Stick
            legs={
              <>
                <line x1="50" y1="58" x2="42" y2="72" />
                <line x1="50" y1="58" x2="66" y2="70" />
              </>
            }
          />
        </g>
      );
    case "hinge":
      return (
        <g className="mv-hinge">
          <Stick
            torsoRot={-45}
            arms={
              <>
                <line x1="50" y1="42" x2="42" y2="58" />
                <line x1="50" y1="42" x2="58" y2="58" />
              </>
            }
          />
          <Bar x1={36} y1={62} x2={64} y2={62} />
        </g>
      );
    case "leg-curl":
      return (
        <g className="mv-legcurl">
          <Stick
            legs={
              <>
                <line x1="50" y1="58" x2="40" y2="78" />
                <line x1="50" y1="58" x2="62" y2="70" />
              </>
            }
          />
        </g>
      );
    case "crunch":
      return (
        <g className="mv-crunch">
          <Stick
            torsoRot={25}
            arms={
              <>
                <line x1="50" y1="34" x2="42" y2="28" />
                <line x1="50" y1="34" x2="58" y2="28" />
              </>
            }
            legs={
              <>
                <line x1="50" y1="58" x2="40" y2="70" />
                <line x1="50" y1="58" x2="68" y2="62" />
              </>
            }
          />
        </g>
      );
    case "hip-thrust":
      return (
        <g className="mv-hip">
          <line x1="20" y1="58" x2="45" y2="58" stroke="currentColor" strokeWidth="2" opacity="0.25" />
          <Stick
            legs={
              <>
                <line x1="50" y1="55" x2="62" y2="72" />
                <line x1="50" y1="55" x2="70" y2="60" />
              </>
            }
          />
        </g>
      );
    case "hanging-raise":
      return (
        <g className="mv-hang">
          <Bar x1={30} y1={14} x2={70} y2={14} />
          <Stick
            arms={
              <>
                <line x1="50" y1="28" x2="40" y2="16" />
                <line x1="50" y1="28" x2="60" y2="16" />
              </>
            }
            legs={
              <>
                <line x1="50" y1="58" x2="44" y2="78" />
                <line x1="50" y1="58" x2="56" y2="78" />
              </>
            }
          />
        </g>
      );
    case "side-bend":
      return (
        <g className="mv-side">
          <Stick torsoRot={18} />
        </g>
      );
    case "plank":
      return (
        <g className="mv-plank">
          <Stick
            torsoRot={-90}
            arms={
              <>
                <line x1="50" y1="36" x2="50" y2="20" />
                <line x1="50" y1="36" x2="58" y2="28" />
              </>
            }
            legs={
              <>
                <line x1="50" y1="58" x2="50" y2="78" />
                <line x1="50" y1="58" x2="58" y2="72" />
              </>
            }
          />
        </g>
      );
    case "woodchop":
      return (
        <g className="mv-chop">
          <Stick
            arms={
              <>
                <line x1="50" y1="36" x2="68" y2="22" />
                <line x1="50" y1="36" x2="62" y2="30" />
              </>
            }
          />
        </g>
      );
    default:
      return (
        <g className="mv-generic">
          <Stick />
        </g>
      );
  }
}

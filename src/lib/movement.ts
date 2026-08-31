export type MovementKind =
  | "bench"
  | "press"
  | "flye"
  | "pressdown"
  | "skull"
  | "overhead-tri"
  | "calf"
  | "row"
  | "pulldown"
  | "straight-arm"
  | "curl"
  | "lateral"
  | "front-raise"
  | "rear-delt"
  | "shrug"
  | "upright"
  | "squat"
  | "leg-press"
  | "leg-ext"
  | "hinge"
  | "leg-curl"
  | "crunch"
  | "hip-thrust"
  | "hanging-raise"
  | "side-bend"
  | "plank"
  | "woodchop"
  | "generic";

const RULES: { test: RegExp; kind: MovementKind }[] = [
  { test: /plank/i, kind: "plank" },
  { test: /woodchop|roundhouse/i, kind: "woodchop" },
  { test: /hanging leg/i, kind: "hanging-raise" },
  { test: /side bend|oblique/i, kind: "side-bend" },
  { test: /hip thrust/i, kind: "hip-thrust" },
  { test: /crunch/i, kind: "crunch" },
  { test: /romanian|deadlift/i, kind: "hinge" },
  { test: /leg curl/i, kind: "leg-curl" },
  { test: /leg extension/i, kind: "leg-ext" },
  { test: /leg press|one-leg leg press/i, kind: "leg-press" },
  { test: /front squat|squat/i, kind: "squat" },
  { test: /calf/i, kind: "calf" },
  { test: /shrug/i, kind: "shrug" },
  { test: /upright row/i, kind: "upright" },
  { test: /rear delt|bent-over lateral/i, kind: "rear-delt" },
  { test: /front raise/i, kind: "front-raise" },
  { test: /lateral raise/i, kind: "lateral" },
  { test: /shoulder press/i, kind: "press" },
  { test: /curl/i, kind: "curl" },
  { test: /straight-arm|straight arm/i, kind: "straight-arm" },
  { test: /pulldown|lat pulldown/i, kind: "pulldown" },
  { test: /row/i, kind: "row" },
  { test: /pressdown/i, kind: "pressdown" },
  { test: /lying.*triceps|skull/i, kind: "skull" },
  { test: /overhead.*triceps|triceps extension/i, kind: "overhead-tri" },
  { test: /flye|crossover/i, kind: "flye" },
  { test: /bench press|close-grip/i, kind: "bench" },
  { test: /incline.*press|dumbbell press/i, kind: "press" },
];

export function movementKindFor(name: string): MovementKind {
  for (const rule of RULES) {
    if (rule.test.test(name)) return rule.kind;
  }
  return "generic";
}

export const MOVEMENT_LABEL_FI: Record<MovementKind, string> = {
  bench: "Vaakapunnerus",
  press: "Punnerrus ylös",
  flye: "Rinnan avaus",
  pressdown: "Ojentajapunnerrus alas",
  skull: "Ojentaja maaten",
  "overhead-tri": "Ojentaja pään yli",
  calf: "Pohjenousu",
  row: "Soutu",
  pulldown: "Ylätalja",
  "straight-arm": "Suorat kädet alas",
  curl: "Hauiskääntö",
  lateral: "Vipunosto sivulle",
  "front-raise": "Vipunosto eteen",
  "rear-delt": "Takaolkapää",
  shrug: "Olankohautus",
  upright: "Pystysoutu",
  squat: "Kyykky",
  "leg-press": "Jalkaprässi",
  "leg-ext": "Jalanojennus",
  hinge: "Lantion sarana",
  "leg-curl": "Reiden koukistus",
  crunch: "Vatsarutistus",
  "hip-thrust": "Lantionnosto",
  "hanging-raise": "Ripustettu jalkojen nosto",
  "side-bend": "Sivutaivutus",
  plank: "Lankku",
  woodchop: "Kierto / chop",
  generic: "Liikerata",
};

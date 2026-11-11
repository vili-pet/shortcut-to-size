const guides: Record<string, string> = {
  "Bench Press": "barbell-bench-press.html",
  "Incline Bench Press": "incline-bench-press.html",
  "Incline Dumbbell Flye": "incline-dumbbell-flys.html",
  "Cable Crossover (High Pulley)": "cable-crossovers-bent-over.html",
  "Incline Dumbbell Press": "incline-dumbbell-bench-press.html",
  "Dumbbell Flye": "dumbbell-flys.html",
  "Incline Cable Flye": "incline-cable-flys.html",
  "Triceps Pressdown": "tricep-extension.html",
  "Overhead Cable Triceps Extension": "high-pulley-overhead-tricep-extension.html",
  "Dumbbell Overhead Triceps Extension": "two-arm-dumbbell-extension.html",
  "One-Arm Overhead Cable Triceps Extension": "one-arm-standing-overhead-cable-tricep-extension.html",
  "Close-Grip Bench Press": "close-grip-bench-press.html",
  "One-Arm Dumbbell Row": "one-arm-dumbbell-row.html",
  "Wide-Grip Lat Pulldown": "wide-grip-pull-down",
  "Straight-Arm Pulldown": "straight-arm-lat-pull-down.html",
  "Behind-the-Neck Pulldown": "behind-neck-lat-pull-down.html",
  "Seated Cable Row (Close)": "seated-row.html",
  "Reverse-Grip Lat Pulldown": "reverse-grip-lat-pull-down.html",
  "Barbell Curl": "standing-barbell-curl.html",
  "Incline Dumbbell Curl": "incline-dumbbell-curl.html",
  "Preacher Curl": "preacher-curl.html",
  "Concentration Curl": "concentration-cur.html",
  "Seated Dumbbell Shoulder Press": "seated-dumbbell-press.html",
  "Dumbbell Shoulder Press": "seated-dumbbell-press.html",
  "Dumbbell Lateral Raise": "dumbbell-lateral-raise.html",
  "One-Arm Cable Front Raise": "one-arm-cable-front-raise.html",
  "Dumbbell Shrug": "dumbbell-shrugs.html",
  "Smith Machine Upright Row": "smith-machine-upright-row.html",
  "One-Arm Cable Lateral Raise": "one-arm-cable-lateral-raise.html",
  "Barbell Shrug": "barbell-shrug.html",
  "Standing Calf Raise": "standing-machine-calf-raise",
  "Seated Calf Raise": "seated-calf-raise.html",
  "Leg Press Calf Raise": "45-degress-calf-press.html",
  "Squat": "squat.html",
  "One-Leg Leg Press": "one-leg-45-degree-leg-press.html",
  "Leg Extension": "leg-extension.html",
  "Romanian Deadlift": "romanian-deadlift",
  "Lying Leg Curl": "leg-curl.html",
  "Front Squat": "front-squat.html",
  "Seated Leg Curl": "seated-leg-curl",
  "Leg Press": "45-degree-leg-press.html",
  "Crunch": "ab-crunch",
  "Oblique Crunch": "side-crunch.html",
  "Hanging Leg Raise": "hanging-leg-raise.html",
  "Dumbbell Side Bend": "dumbbell-side-bends.html",
  "Cable Crunch": "cable-crunch.html",
  "Oblique Cable Crunch": "standing-oblique-cable-crunch.html",
  "Cable Woodchopper": "wood-chop.html",
  "Plank": "hover.html",
  "Side Plank": "side-hover.html",
};

const videos: Record<string, string> = {
  "Reverse-Grip Incline Dumbbell Press": "https://www.youtube.com/watch?v=bxQqbnF30-8",
  "Lying Triceps Extension": "https://www.youtube.com/watch?v=4re6CJ0XNF8",
  "Lying Cable Triceps Extension": "https://www.fittr.com/exercise-video/cable-lying-triceps-extension-96/",
  "Standing Lat Pulldown": "https://www.youtube.com/watch?v=HynaSdVSKMw",
  "One-Arm High Cable Curl": "https://www.youtube.com/watch?v=c0IXN7Ob0b0",
  "Behind-the-Back Cable Curl": "https://www.youtube.com/watch?v=Df0GjCkUh90",
  "Incline Cable Curl": "https://www.youtube.com/watch?v=CxXEXInM_L0",
  "High Cable Rear Delt Flye": "https://www.youtube.com/watch?v=pUB0-5KvcyI",
  "Bent-Over Lateral Raise": "https://www.youtube.com/watch?v=Fgz_FdzDukE",
  "Dumbbell Upright Row": "https://www.youtube.com/watch?v=JQRNR4oc1mw",
  "One-Arm Smith Machine Shrug": "https://www.youtube.com/watch?v=0n_Moi9Eg3U",
  "Hip Thrust": "https://www.youtube.com/watch?v=yuhDu2CVjko",
  "Hip Thrust (weighted)": "https://www.youtube.com/watch?v=yuhDu2CVjko",
  "Smith Machine Hip Thrust": "https://www.youtube.com/watch?v=WInKXaLzHOk",
  "Machine Crunch": "https://www.youtube.com/watch?v=JSBuaT1tHfM",
  "Band Roundhouse Elbow": "https://www.youtube.com/watch?v=DPnGfvTdbCM",
};

export function exerciseVideoUrl(name: string): string | undefined {
  const normalized = name.replace(/ \(\d+s\)$/, "");
  const guide = guides[normalized];
  return guide ? `https://www.muscleandstrength.com/exercises/${guide}` : videos[normalized];
}

export function exerciseVideoNote(name: string): string | undefined {
  if (name === "Hip Thrust (weighted)") return "Video näyttää vatsalihasnoston ilman lisäpainoa, ei pakarasiltaa.";
  if (name === "Dumbbell Shoulder Press") return "Videolla istuen tehtävä versio.";
  return undefined;
}

import test from "node:test";
import assert from "node:assert/strict";
import { resolveWorkout } from "../src/data/program.ts";

test("every exercise in all twelve weeks has a direct HTTPS technique link", () => {
  for (let week = 1; week <= 12; week++) {
    for (const day of [1, 2, 3, 4]) {
      for (const exercise of resolveWorkout(week, day).exercises) {
        assert.ok(exercise.videoUrl, `Missing video: week ${week}, ${exercise.name}`);
        const url = new URL(exercise.videoUrl);
        assert.equal(url.protocol, "https:");
        assert.ok(!/(^|\.)(facebook\.com|tiktok\.com)$/.test(url.hostname), `Login-gated social video: ${exercise.name}`);
        assert.ok(!url.pathname.includes("/results"), `Search page instead of video: ${exercise.name}`);
      }
    }
  }
});

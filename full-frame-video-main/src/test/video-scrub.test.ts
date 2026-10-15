import { describe, expect, it } from "vitest";
import { getScrubTime } from "@/hooks/use-video-scrub";

describe("full-frame video scrubbing", () => {
  it("shows the first frame at the right edge", () => {
    expect(getScrubTime(1920, 0, 1920, 6)).toBe(0);
  });

  it("shows the last frame at the left edge", () => {
    expect(getScrubTime(0, 0, 1920, 6)).toBe(6);
  });
});
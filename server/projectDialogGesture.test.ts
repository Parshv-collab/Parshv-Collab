import { describe, expect, it } from "vitest";
import { shouldDismissProjectDialog } from "../client/src/lib/projectDialogGesture";

describe("project dialog swipe dismissal", () => {
  it("dismisses only deliberate downward swipes and preserves the explicit close fallback", () => {
    expect(shouldDismissProjectDialog({ offset: { y: 40 }, velocity: { y: 100 } })).toBe(false);
    expect(shouldDismissProjectDialog({ offset: { y: 97 }, velocity: { y: 100 } })).toBe(true);
    expect(shouldDismissProjectDialog({ offset: { y: 12 }, velocity: { y: 561 } })).toBe(true);
    expect(shouldDismissProjectDialog({ offset: { y: -120 }, velocity: { y: -720 } })).toBe(false);
  });
});

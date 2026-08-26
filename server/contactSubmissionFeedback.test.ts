import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const homeSource = readFileSync(resolve(import.meta.dirname, "../client/src/pages/Home.tsx"), "utf8");

describe("contact submission feedback", () => {
  it("keeps inputs stable while saving and confirms a successful inbox-only submission in context", () => {
    expect(homeSource).toContain("const [submissionComplete, setSubmissionComplete] = useState(false)");
    expect(homeSource).toContain("<fieldset disabled={submit.isPending}");
    expect(homeSource).toContain("<LoaderCircle");
    expect(homeSource).toContain("aria-busy={submit.isPending}");
    expect(homeSource).toContain('role="status" aria-live="polite"');
    expect(homeSource).toContain("Inquiry saved.");
    expect(homeSource).toContain("owner can now review your message privately in Content Studio");
    expect(homeSource).toContain('setForm({ name: "", email: "", message: "" })');
    expect(homeSource).toContain("const successResetTimeout = useRef<number | undefined>(undefined)");
    expect(homeSource).toContain("submit.reset()");
    expect(homeSource).toContain("}, 5000)");
  });
});

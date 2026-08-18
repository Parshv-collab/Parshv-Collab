import { describe, expect, it } from "vitest";
import { buildContactEmail } from "./contactEmail";

describe("contact email content", () => {
  it("includes the sender name, email, and complete message without unsafe HTML", () => {
    const result = buildContactEmail({ name: "Ava <Client>", email: "ava@example.com", message: "Hello\n<script>alert('x')</script>" });
    expect(result.subject).toContain("Ava <Client>");
    expect(result.text).toContain("ava@example.com");
    expect(result.text).toContain("<script>alert('x')</script>");
    expect(result.html).toContain("Ava &lt;Client&gt;");
    expect(result.html).toContain("&lt;script&gt;alert(&#39;x&#39;)&lt;/script&gt;");
  });
});

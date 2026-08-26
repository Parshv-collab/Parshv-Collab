# Adversarial Test Notes

## 2026-08-25: Initial visual checks

Desktop and phone viewport captures confirmed that the public home page, password-protected admin entry page, and the intentionally removed `/writing` route render instead of failing to load. The mobile layout remains compact and preserves the project preview treatment.

The capture of the removed `/writing` path exposed a white 404 presentation, which conflicts with the portfolio's dark-first visual system and should be investigated as a visual consistency defect. Public captures showed the project-card skeleton state, so the test pass should also establish whether this is only screenshot timing or an actual client-side data-loading issue.

Browser console and network recording files are unavailable in the managed preview logs for this session. Runtime verification will therefore use production/server logs, response probes, Vitest, and visual captures without claiming client-console coverage.

## 2026-08-25: Repair and final adversarial validation

The removed-route fallback was corrected from the starter template's white page to a dark Signal Atelier recovery surface, with an accessible home action retained. A dedicated regression test guards that dark-first contract.

The controlled probe passed against both the managed development server and an isolated `NODE_ENV=production` build. It verified public and removed routes; canonical, Open Graph, Twitter, JSON-LD, crawler, sitemap, and configured `SITE_URL` behavior; valid and invalid GridFS media paths; public content; input rejection; temporary inquiry persistence followed by cleanup; failed and valid password login; authenticated protected reads; malformed authenticated content/upload mutations; and session revocation after logout. The Atlas integration suite passed separately with two persistence assertions. The final static checks passed with 18 tests and 2 opt-in integration tests skipped in the default run, while the explicit integration run passed both tests.

The only remaining build observation is Vite's advisory that the main client chunk is approximately 859 kB after minification. It does not fail the build. Manual chunk configuration remains intentionally absent because the prior strategy caused a Render runtime failure.

## 2026-08-25: Contact submission feedback update

Desktop and phone viewport captures confirm that the contact form remains readable, compact, and aligned with the established visual system after adding its in-flight and success feedback states. Automated regression coverage confirms disabled in-flight controls, a visible loader, an accessible live success status, and the inbox-only success language.

## 2026-08-25: Palette controls and contact reset update

The public content endpoint reports the persisted Energetic palette (`#FFFFFF`, `#1A1A1A`, and `#FF4B2B`) as active. Desktop and phone viewport captures confirm that its dark presentation, orange accent, high-contrast text, filters, project cards, and contact controls render consistently. The Content Studio now offers all five supplied palette presets, stages the selection locally, and persists it through the existing protected save action.

The palette contract was subsequently refined so public palette variables use each selection’s exact supplied background, foreground, and accent values, with no derived dark/light substitutes. The content endpoint and contract tests verify the active saved value and exact variable mapping. First-render screenshot captures can briefly show fallback default content before the public content query resolves; this capture-timing limitation does not change the persisted palette response or the verified application logic.

Final desktop and phone captures confirm that public project fallbacks, cards, filters, dialog-compatible surfaces, contact controls, and feedback styling inherit the active palette mapping without residual fixed dark backgrounds. The current public response resolved to the supplied Energetic white/charcoal/orange triplet; the generic contract covers all five owner-selectable presets and the legacy class-to-palette mappings used by public states.

## 2026-08-26: Compact Other Projects update

Desktop and 390 px phone captures confirm that a project removed from the primary Selected Work selection appears below that grid in a distinct **Other Projects** section. The secondary item uses a smaller thumbnail, one-line mobile title treatment, optional direct actions, and hidden mobile summary text, keeping it materially denser than the primary project cards while remaining accessible.

## 2026-08-26: Progressive Other Projects controls

Desktop and 390 px phone captures confirm that the initial compact Other Projects list remains visually contained after progressive loading and quick-preview support were added. The desktop preview surface stays out of the phone layout, preserving the denser mobile rows. Automated regression coverage verifies the three-item progressive increment, remaining-count label, hover/focus preview trigger, and reduced-motion transition path.

## 2026-08-26: Controlled Other Projects browser fixture

The development-only `qaOtherProjects=7` fixture rendered seven compact Other Projects in the public browser. Its initial desktop state showed exactly three rows, the idle preview instruction, and the visible **Load 3 more projects (4)** control. This fixture does not persist any test projects to the portfolio content.

The live browser click path then expanded the list from three to six projects, updated the action to **Load 1 more project (1)**, and displayed the active desktop quick-preview panel. The browser focus path successfully placed focus on a compact project row; its reactive preview-state assertion is verified in the follow-up interaction check.

The follow-up browser focus check confirmed that focusing **QA Other Project 1** activated the quick preview with that project’s own title and summary. The second live **Load 1 more project** click revealed QA Other Project 7 and removed the Load More control, confirming the full-reveal terminal state.

## 2026-08-26: Featured project filter removal

Desktop and 390 px phone captures confirm that **Projects with a point of view** now flows directly from its heading into featured projects. The category and technology filter bars are absent, and the compact mobile project previews remain intact.

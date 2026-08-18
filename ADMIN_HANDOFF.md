# Signal Atelier — Administrator Handoff

## Environment and release configuration

The project uses the managed full-stack runtime with a database, storage, owner authentication, and email notifications. The required runtime variables are `DATABASE_URL`, `JWT_SECRET`, `VITE_APP_ID`, `OAUTH_SERVER_URL`, `VITE_OAUTH_PORTAL_URL`, `OWNER_OPEN_ID`, `BUILT_IN_FORGE_API_URL`, `BUILT_IN_FORGE_API_KEY`, `RESEND_API_KEY`, `CONTACT_NOTIFICATION_EMAIL`, and `CONTACT_FROM_EMAIL`. Platform-managed variables should remain untouched. `CONTACT_FROM_EMAIL` must be a verified sender identity in Resend, while `CONTACT_NOTIFICATION_EMAIL` is the inbox that receives complete inquiry details.

The standard commands are `pnpm test` for validation, `pnpm build` for a production build, and `pnpm start` for the production server. The owner must authenticate with the Manus account corresponding to `OWNER_OPEN_ID`; this account is promoted to the server-enforced `admin` role and is the only account that can write content or upload media.

Before a release, run the test suite, check the public site at `/`, verify Content Studio at `/admin`, and confirm a test inquiry arrives at the configured inbox. Create a project checkpoint, then use the platform’s **Publish** control from the management interface to make that reviewed checkpoint live.

## Access and publishing

The public portfolio is available at `/`. The private content workspace is available at `/admin` and is protected by the project’s Manus OAuth flow. Only the designated owner account can open it or perform write operations. The owner role is enforced again by the server for every content and media mutation.

## Updating the portfolio

Use **Content Studio** to change the core narrative, including the portfolio name, role line, bio, contact address, accent color, social links, résumé link, and hero image. The structured panels provide full control of the skills, selected projects, expertise cards, and any approved client quotes. Choose **Apply to preview** to update the in-dashboard visual preview, then select **Save changes** to persist the complete content bundle to the database.

Only publish testimonials that are real, approved, and attributable. The public testimonial section remains invisible until content is intentionally added, so it never displays invented social proof.

## Media and résumé files

The media uploader in Content Studio accepts PNG, JPEG, WebP, AVIF, and PDF files up to 5 MB. Before selecting a file, choose whether it belongs to the **hero visual**, **profile image**, **résumé download**, or **first selected project**. The field is connected to the in-progress draft immediately. For additional project images, paste the copied URL into that project’s `images` list, apply the structured content changes, and save.

## Inquiry workflow

Every valid contact-form inquiry is stored in the database and sends a Resend email notification with the sender’s full name, email address, and message. It also raises an owner alert as a secondary notification channel. If email delivery cannot be confirmed, the visitor sees an honest saved-inquiry warning rather than a false delivery confirmation. Recent messages appear in the Content Studio inbox. The mail integration credentials have been validated with a provider authentication check.

## Final content checklist

Before sharing the site externally, replace the starter identity, email address, project placeholders, résumé, and any content placeholders with final client-approved material. Add actual project imagery, production links, and source links where public. Review social URLs and ensure each testimonial has permission to be displayed.

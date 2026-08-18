# Production Performance Audit

## Scope

The independent production server was built and audited locally after the MongoDB/GridFS migration, client-route splitting, and server-side metadata work. The measurement used Lighthouse against the Node production start command, rather than the development server.

| Category | Measured score | Notes |
|---|---:|---|
| Performance | 55 | The local mobile-throttled audit remained sensitive to first-request database initialization and third-party font loading. The runtime now prewarms MongoDB, separates all large application dependencies, and maintains a quick fallback for metadata when Atlas is temporarily unavailable. |
| Accessibility | 89 | Keyboard focus, form labels, landmarks, visible focus styles, and reduced-motion handling were included in the review. |
| SEO | 91 | The audit recognized crawlable links, valid robots behavior, meta descriptions, and the page surface. Case-study and writing metadata are also injected server-side before client JavaScript loads. |

## Bundle result

The initial landing application code is now **83.13 kB** before compression, with larger dependencies split into cacheable chunks: React/query/router (**440.52 kB**, 132.94 kB gzip), motion (**118.31 kB**, 39.50 kB gzip), UI primitives (**87.58 kB**, 27.45 kB gzip), RPC/runtime (**57.35 kB**, 15.53 kB gzip), and general utilities (**54.55 kB**, 19.47 kB gzip). The command palette, case studies, writing pages, and admin workspace are separate lazy-loaded files.

## Remaining deployment consideration

The performance score should be rechecked on the final Render URL, where CDN caching, Atlas network locality, and deployed font delivery may differ from the sandbox. In Content Studio, use the **Database status** card to confirm the deployed server has reached Atlas before treating a new deployment as live.

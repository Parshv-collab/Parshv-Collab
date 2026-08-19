# GitHub Public Activity Widget References

The portfolio widget uses the unauthenticated public endpoints `GET https://api.github.com/users/{username}/events/public` and `GET https://api.github.com/users/{username}/repos`. The events endpoint supports `per_page` and GitHub documents polling guidance through `ETag` and `X-Poll-Interval`; public timelines include only recent public events. Repository responses expose the public `name`, `description`, `language`, `stargazers_count`, `html_url`, `pushed_at`, and `updated_at` fields used by the compact portfolio display.

The widget will use a server-side MongoDB cache with a short expiry to avoid an upstream request on each public-page visit. No GitHub credential is required for this public read-only use case.

## Sources

- GitHub Docs, [REST API endpoints for events](https://docs.github.com/en/rest/activity/events)
- GitHub Docs, [REST API endpoints for repositories](https://docs.github.com/en/rest/repos/repos)

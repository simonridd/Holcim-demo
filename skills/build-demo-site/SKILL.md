---
name: build-demo-site
description: Create, revise and publish customer demo websites in the shared simonridd/demo-sites GitHub Pages repository, with one page per demo and a searchable collection. Use for the customer-facing site, not recordings, slide decks or Genesys configuration.
---

# Build a demo website

Use the existing public repository `https://github.com/simonridd/demo-sites` and its GitHub Pages collection at `https://simonridd.github.io/demo-sites/`. It was renamed from Holcim-demo. Inspect current main, repository instructions, Pages configuration and working state before editing. Reuse a clean existing checkout or clone into an isolated workspace; preserve other workers' edits. A requested different repository or hosting destination takes precedence.

## Keep the site and demo together

Translate the accepted demo brief into a customer-facing experience. Reuse its audience, branding, approved business content, selected channels and existing native references. Ask only for missing choices that materially affect the experience. Do not invent a working backend, live agent availability or an observed outcome from a website mockup.

Each demo gets a stable lowercase `<slug>/index.html`, such as `holcim/index.html`. Add its metadata to root `demos.json`: unique `slug`, `title`, `category`, `description`, `tags`, optional six-digit hex `accent` and local `logo`. The root collection renders this catalogue; it should not load demo-specific SDKs or start conversations. Use relative paths so the site works under GitHub Pages' `/demo-sites/` prefix. Keep assets and storage keys specific to the demo where appropriate. Preserve established routes, query parameters and hash navigation when revising an existing site.

The current Holcim page uses shared root helpers and the existing `/quote/` route. Do not move or copy its native deployment IDs, contact-list mappings or live actions into another customer page by default. Its bundled SDK is pinned and has a retained license/integrity check. Preserve those assets when maintaining Holcim; another page needs that SDK only if its accepted behavior requires it.

Create a coherent responsive design with accessible navigation and clear primary actions. Use the client's established visual style for its page. Keep the collection neutral. Place implementation and readiness notes in operator documentation; show configuration details in the page only when they help the presenter make a meaningful choice, such as its exact OAuth redirect URI.

## Integrations and public hosting

This repository is public static hosting, not an API secret store. Publish only public website assets and fictional or otherwise publishable content. Keep credentials, tokens, private run evidence and customer records out of source, browser bundles, catalogue entries and URLs.

Reuse explicitly selected existing Messenger or other public integration references. Site authoring does not create or activate native resources, change shared flows/Queues, start campaigns, submit forms, clear sessions or send test messages. Use the available EB specialist and its existing owner/lifecycle when configuration is requested. A rendered widget is separate from verified routing or agent delivery.

For OAuth pages, derive and display the exact callback URL and compare it with the registered client configuration when that read is available. A new repository name or page path changes that URL. Record any required registration update; do not claim sign-in works based only on static checks. Preserve PKCE, state validation and in-memory token behavior. Do not forward callback codes to arbitrary destinations or create a client-secret workaround.

If delegated by `coordinate-demo-production`, return the published route, source revision, selected public integration references and actual verification results to that same production. Website work does not regenerate recordings or rewrite presentation content unless requested.

## Verify and publish

Read the repository README and run its current checks. At present:

```sh
node --test *.test.cjs quote/*.test.cjs
python3 -m http.server 8791 --bind 127.0.0.1
```

Use another free port if needed. Inspect the actual collection and changed demo at desktop and mobile sizes through the supported browser tooling. Check search, keyboard navigation, links, local assets and the project-site prefix. Inspect existing integration UI without signing in, submitting forms or generating live traffic unless that action is separately authorized. Treat any retained source `AGENTS.md` as applicable instructions.

For requested publication, show the completed page in local preview, commit only the intended site changes, push through the existing GitHub workflow and inspect the Pages build/deployment result. GitHub connector tools are preferred when sufficient; normal Git/gh is a fallback for repository/Pages operations they do not expose. Use the actual Pages-returned URL. A push alone does not establish a successful published site; check the deployed source revision and returned page/assets. Do not introduce another host or a required build framework for a static page.

Preserve this source skill under `skills/build-demo-site/`; keep the installed personal copy in `~/.codex/skills/build-demo-site` aligned when updating the workflow. Report page URLs, commit/build identity, checks performed and any remaining integration dependency. Keep source/fixture checks separate from observed native behavior.

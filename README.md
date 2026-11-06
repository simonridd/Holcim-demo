# Demo sites

Shared public GitHub Pages hosting for customer demonstration websites. Each demo has its own page; the home page is a searchable collection. No build service or package installation is required.

- Collection: https://simonridd.github.io/demo-sites/
- Holcim: https://simonridd.github.io/demo-sites/holcim/
- Holcim quotation workspace: https://simonridd.github.io/demo-sites/quote/

## Add or revise a demo

Use the `build-demo-site` skill in [skills/build-demo-site/SKILL.md](skills/build-demo-site/SKILL.md). Its personal installation is `~/.codex/skills/build-demo-site`. Create `<slug>/index.html` and add its public metadata to `demos.json`. Keep each demo's business content and integrations independent. The collection itself does not load Messenger or sign into Genesys.

Keep the current GitHub Pages source: `main`, repository root, HTTPS. Preserve `.nojekyll`. Local preview:

```sh
python3 -m http.server 8791 --bind 127.0.0.1
```

Open `/` for the collection and `/holcim/` for Holcim. Run all local checks:

```sh
node --test *.test.cjs quote/*.test.cjs
```

## Holcim migration

This repository was renamed from `Holcim-demo` to `demo-sites`. The original Holcim page now lives at `holcim/index.html`; the existing contact helper, Messenger bridge, pinned SDK, quote workspace and agent Script remain available at their retained paths. Quote links return to Holcim. The Holcim deployment ID and application behavior are preserved.

GitHub repository links redirect after a rename; the old GitHub Pages project URL does not receive that repository redirect. Update presentation, iframe and bookmark URLs to the new Holcim URL. Existing private production workspaces were not bulk-edited.

Holcim presenter authentication computes its OAuth redirect URI from the current page URL. Register the exact published `https://simonridd.github.io/demo-sites/holcim/` URI in the existing Genesys PKCE OAuth client before signing in at this route. `/holcim/index.html` is a different URI, so use the trailing-slash URL consistently or register both deliberately. The old authorised redirect does not authorise the new path. This repository change does not alter OAuth client settings, deploy or activate Messenger, create contacts or send messages. See [the Holcim operator guide](README.txt) for existing submission and authentication behavior.

This is a public static site. Keep credentials, tokens, raw transcripts, private handovers and customer information out of the repository. Public deployment/client identifiers are configuration references, not credentials. Native configuration, traffic and observed routing evidence stay in their owning systems.

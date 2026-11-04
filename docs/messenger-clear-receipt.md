# Delivery receipt — Demo Phone Messenger clear bridge — 2026-11-04
Status: Needs acceptance
Issue: https://github.com/simonridd/demo-resources/issues/93; parent #11.
Repository / canonical branch: simonridd/Holcim-demo / main
Working branch / tested source commit: codex/messenger-clear-20261104 / 1fb4b9ff537b3c71017d13b1953adffc3006a8b1
PR: https://github.com/simonridd/Holcim-demo/pull/8; exact merge SHA in PR closeout.
Goal and scope: enable the existing embedded demo webpage to honor an explicit linked-localhost Clear demo request. No standalone behavior, provider configuration, routing, authentication, quote/contact logic or visitor-generated messages change.
Shipped on main: delivered through reviewed PR #8; exact merge/build and published-byte verification recorded in the PR closeout.
Validation on exact source: node --test contact-template.test.cjs messenger-demo-bridge.test.cjs PASS; git diff --check PASS. The Studio repository independently exercises the same bridge bytes using synthetic Messenger SDK and actual browser postMessage.
Live/hardware acceptance: no actual SDK clear/provider disconnect performed. Updated bridge deployment/byte parity verified separately in PR closeout. Messenger must already permit Clear conversation; this change does not modify its configuration.
Deployment / current runtime state: existing GitHub Pages publishes main root; merge publishes the reviewed inert helper through the normal route. Exact published source parity is a release gate. No unrelated site assets replaced. The existing bridge script tag includes a release query to avoid reusing an older cached helper.
Security/permissions/data/cost changes: none. Exact iframe parent, localhost origin, nonce and run identity still gate commands. Clear requests have bounded deduplication across the conversationCleared event. No OAuth tokens, private settings, real message bodies, paid calls/SMS/TTS or recording publication.
Known defects and severity: older bridge cannot implement Studio's new clear request. Configuration-disabled or unconfirmed SDK clear returns an error, not a false success.
Rollback: revert this bridge PR to main; Studio's new Clear reports a bridge update requirement rather than silently performing a local-only reset. Existing messaging and quotes continue.
Remaining action, owner and trigger: Codex reviews/integrates and verifies published bytes; Simon accepts a configured-provider clear/second conversation in the updated Studio when idle.
Evidence links and raw logs: /private/tmp/holcim-messaging-clear-tests.log; Studio paired delivery receipt and raw browser/API tests. No real-message/session exports retained.
Disposition: bounded companion bridge for the requested Studio reset; actual provider acceptance remains Needs acceptance.

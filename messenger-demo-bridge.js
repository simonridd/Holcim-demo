/* IPI Demo Phone bridge. Install alongside the website's normal Genesys snippet.
 * Inert unless embedded by a localhost Demo Phone. No OAuth tokens cross this bridge. */
(() => {
  'use strict';
  if (window.__ipiDemoMessengerBridge) return;
  window.__ipiDemoMessengerBridge = true;
  const protocol = 'ipi-demo-messenger-v1';
  const local = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
  const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
  let peer, origin, nonce, runId, subscribed = false;
  const attempts = new Map();
  const clears = new Map();
  const sdk = () => window[window._genesysJs || 'Genesys'];
  const plugins = new Map();
  function ready(plugin) {
    if (!plugins.has(plugin)) plugins.set(plugin, new Promise((resolve, reject) => {
      if (typeof sdk() !== 'function') { reject(new Error('Messenger SDK is unavailable.')); return; }
      const timer = setTimeout(() => reject(new Error('Messenger plugin is not ready. Reload the webpage before continuing.')), 10000);
      sdk()('subscribe', plugin + '.ready', () => { clearTimeout(timer); resolve(); });
    }));
    return plugins.get(plugin);
  }
  function post(type, data = {}) {
    if (peer) peer.postMessage({ protocol, type, nonce, runId, ...data }, origin);
  }
  async function command(name, data) {
    await ready(name.split('.')[0]);
    return new Promise((resolve, reject) => {
      if (typeof sdk() !== 'function') { reject(new Error('Messenger SDK is unavailable.')); return; }
      const timer = setTimeout(() => reject(new Error('Messenger did not confirm the command. Check the live thread before retrying.')), 12000);
      sdk()('command', name, data, value => { clearTimeout(timer); resolve(value); }, error => {
        clearTimeout(timer);
        // Documented, harmless rejection: the native window is already open.
        if (name === 'Messenger.open' && (typeof error === 'string' ? error : error?.message) === 'Messenger is already opened.') resolve();
        else if (name === 'MessagingService.clearConversation' && (typeof error === 'string' ? error : error?.message) === 'There is no active conversation found to clear') resolve();
        else reject(new Error(name === 'MessagingService.clearConversation' ? 'Messenger could not clear the conversation. Check that Clear conversation is enabled in its configuration, then retry when ready.' : 'Messenger rejected the command.'));
      });
    });
  }
  function subscribe() {
    if (subscribed || typeof sdk() !== 'function') return;
    subscribed = true;
    sdk()('subscribe', 'MessagingService.messagesReceived', event => {
      const messages = Array.isArray(event?.data?.messages) ? event.data.messages : [];
      for (const m of messages) {
        const text = typeof m.text === 'string' ? m.text : '';
        post('message', { message: { id: String(m.id || m.messageId || '').slice(0, 200), text: text.slice(0, 4096), direction: String(m.direction || '').toLowerCase() } });
      }
    });
    sdk()('subscribe', 'MessagingService.conversationDisconnected', () => post('disconnected'));
    sdk()('subscribe', 'MessagingService.conversationCleared', () => { attempts.clear(); post('disconnected'); });
  }
  window.addEventListener('message', event => {
    const value = event.data;
    if (window.parent === window || event.source !== window.parent || !local.test(event.origin) || !value || value.protocol !== protocol) return;
    if (value.type === 'hello') {
      if (typeof value.nonce !== 'string' || !/^[a-f0-9]{32,128}$/.test(value.nonce) || !uuid.test(value.runId)) return;
      peer = event.source; origin = event.origin; nonce = value.nonce; runId = value.runId;
      subscribe();
      post('ready', { sdkAvailable: typeof sdk() === 'function', canClear: true, deploymentId: String(sdk()?.c?.deploymentId || '').slice(0, 100) });
      return;
    }
    if (!peer || event.source !== peer || event.origin !== origin || value.nonce !== nonce || value.runId !== runId) return;
    if (value.type === 'clear' && uuid.test(value.requestId)) {
      const old = clears.get(value.requestId);
      if (old) { if (old.done) post('result', { requestId: value.requestId, ok: old.ok, error: old.error }); return; }
      if (clears.size >= 100) { post('result', { requestId: value.requestId, ok: false, error: 'Bridge clear limit reached. Reload the webpage before a new demonstration.' }); return; }
      const attempt = { done: false, ok: false, error: '' }; clears.set(value.requestId, attempt);
      const clearNonce = nonce;
      void command('MessagingService.clearConversation', {}).then(() => { attempt.ok = true; }, error => { attempt.error = error.message; }).finally(() => {
        attempt.done = true;
        if (clearNonce === nonce) post('result', { requestId: value.requestId, ok: attempt.ok, error: attempt.error });
      });
      return;
    }
    if (value.type !== 'send' || !uuid.test(value.requestId) || typeof value.text !== 'string' || !value.text.trim() || value.text.length > 2000) return;
    const old = attempts.get(value.requestId);
    if (old) {
      post('result', { requestId: value.requestId, ok: old.text === value.text && old.ok === true,
        error: old.text !== value.text ? 'Request ID already used.' : old.error || 'Previous send is pending or uncertain; it will not be repeated.' });
      return;
    }
    if (attempts.size >= 500) { post('result', { requestId: value.requestId, ok: false, error: 'Bridge send limit reached. Start a fresh demo session.' }); return; }
    const attempt = { text: value.text, ok: false, error: 'Send is pending or uncertain; check the thread before retrying.' };
    attempts.set(value.requestId, attempt);
    const sessionNonce = nonce;
    void (async () => {
      try {
        // A private run marker is also passed as metadata where the flow supports it.
        // The visible link message remains the independently verifiable binding proof.
        await command('Database.set', { messaging: { customAttributes: { ipiDemoRunId: runId } } });
        await command('Messenger.open', {});
        if (sessionNonce !== nonce) throw new Error('The customer page was relinked. Review the thread before continuing.');
        await command('MessagingService.sendMessage', { message: value.text });
        attempt.ok = true; attempt.error = '';
        if (sessionNonce === nonce) post('result', { requestId: value.requestId, ok: true });
      } catch (error) {
        attempt.error = error.message;
        if (sessionNonce === nonce) post('result', { requestId: value.requestId, ok: false, error: attempt.error });
      }
    })();
  });
})();

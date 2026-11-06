(() => {
  'use strict';
  const config = window.harbourviewMessenger;
  const localPreview = ['localhost', '127.0.0.1'].includes(window.location.hostname);
  const enabled = !localPreview && /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(config?.deploymentId || '');
  if (enabled) {
    window._genesysJs = 'Genesys';
    window.Genesys = window.Genesys || function () { (window.Genesys.q = window.Genesys.q || []).push(arguments); };
    window.Genesys.t = Date.now();
    window.Genesys.c = { environment: config.environment, deploymentId: config.deploymentId };
    const script = document.createElement('script');
    script.src = 'https://apps.mypurecloud.ie/genesys-bootstrap/genesys.min.js';
    script.async = true;
    document.head.appendChild(script);
  }
  document.querySelectorAll('[data-message]').forEach(button => button.addEventListener('click', () => {
    const status = document.getElementById('message-status');
    if (!enabled || typeof window.Genesys !== 'function') {
      status.textContent = 'Messaging is unavailable right now. Please try again shortly.';
      return;
    }
    status.textContent = '';
    window.Genesys('command', 'Messenger.open', {}, () => {}, error => {
      if ((typeof error === 'string' ? error : error?.message) !== 'Messenger is already opened.') status.textContent = 'We couldn’t open messaging. Please refresh the page and try again.';
    });
  }));
})();

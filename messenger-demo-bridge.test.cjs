const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

test('standalone stays inert; only the linked localhost parent can clear once per request', async () => {
  const replies = [], calls = [], events = {};
  let listener, reject = false;
  const parent = { postMessage: value => replies.push(value) };
  const window = { parent, addEventListener: (_, fn) => { listener = fn; }, Genesys: (kind, name, data, ok, fail) => {
    if (kind === 'subscribe') { events[name] = data; if (name.endsWith('.ready')) data({}); return; }
    calls.push(name);
    if (reject) { fail('disabled'); return; }
    if (name === 'MessagingService.clearConversation') events['MessagingService.conversationCleared']?.({});
    ok({});
  } };
  vm.runInNewContext(fs.readFileSync('messenger-demo-bridge.js', 'utf8'), { window, setTimeout, clearTimeout });
  const hello = { protocol: 'ipi-demo-messenger-v1', type: 'hello', nonce: 'a'.repeat(48), runId: '10000000-0000-4000-8000-000000000001' };
  const clear = { ...hello, type: 'clear', requestId: '10000000-0000-4000-8000-000000000002' };
  const emit = (data, origin = 'http://localhost:5173', source = parent) => listener({ data, origin, source });
  emit(clear); emit(hello, 'https://evil.example'); emit(clear); assert.equal(calls.length, 0);
  emit(hello); assert.equal(replies.at(-1).canClear, true);
  emit({ ...clear, nonce: 'b'.repeat(48) }); assert.equal(calls.length, 0);
  emit(clear); emit(clear); await new Promise(resolve => setImmediate(resolve));
  assert.equal(calls.length, 1); assert.equal(replies.at(-1).ok, true);
  emit(clear); assert.equal(calls.length, 1);
  reject = true; emit({ ...clear, requestId: '10000000-0000-4000-8000-000000000003' });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(replies.at(-1).ok, false); assert.match(replies.at(-1).error, /could not clear/);
  assert.ok(!calls.includes('MessagingService.sendMessage'));
  window.parent = window; emit(hello); emit(clear); assert.equal(calls.length, 2);
});

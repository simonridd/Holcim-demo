const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const core = import('./assets/catalog-core.mjs');

test('collection routes and assets resolve within the GitHub project prefix', async () => {
  const { validateCatalog } = await core;
  const demos = validateCatalog(JSON.parse(fs.readFileSync('demos.json', 'utf8')));
  const prefix = new URL('https://example.github.io/demo-sites/');
  for (const demo of demos) {
    assert.ok(fs.statSync(path.join(demo.slug, 'index.html')).isFile());
    if (demo.logo) assert.ok(fs.statSync(demo.logo).isFile());
    const page = new URL(demo.slug + '/', prefix);
    const html = fs.readFileSync(path.join(demo.slug, 'index.html'), 'utf8');
    for (const match of html.matchAll(/(?:src|href)=["']([^"']+)["']/g)) {
      const url = new URL(match[1], page);
      if (url.origin !== prefix.origin) continue;
      assert.ok(url.pathname.startsWith(prefix.pathname), `${url} escapes the project prefix`);
      let file = decodeURIComponent(url.pathname.slice(prefix.pathname.length));
      if (!file || file.endsWith('/')) file += 'index.html';
      assert.ok(fs.existsSync(file), `Missing local asset or route ${file}`);
    }
  }
});

test('catalogue rejects route traversal, external asset injection and duplicate demo identities', async () => {
  const { validateCatalog, filterDemos } = await core;
  const source = JSON.parse(fs.readFileSync('demos.json', 'utf8'));
  for (const patch of [{ slug: '../private' }, { slug: 'https://example.com' }, { logo: '//example.com/a.svg' }, { logo: '../a.svg' }, { accent: 'url(https://example.com)' }]) {
    const raw = structuredClone(source); Object.assign(raw.demos[0], patch);
    assert.throws(() => validateCatalog(raw));
  }
  assert.throws(() => validateCatalog({ demos: [source.demos[0], source.demos[0]] }));
  assert.equal(filterDemos(source.demos, 'HOLCIM messaging').length, 1);
  assert.equal(filterDemos(source.demos, 'not-in-the-collection').length, 0);
  assert.equal(filterDemos(source.demos, '   ').length, source.demos.length);
});

test('Holcim migration preserves its executable behavior, pinned SDK integrity and exact callback derivation', () => {
  const html = fs.readFileSync('holcim/index.html', 'utf8');
  for (const match of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)) if (match[1].trim()) new vm.Script(match[1]);
  const loader = html.match(/script\.src='([^']+)'/)[1];
  assert.ok(fs.statSync(path.resolve('holcim', loader)).isFile());
  const sdk = fs.readFileSync(path.resolve('holcim', loader));
  const digest = require('node:crypto').createHash('sha384').update(sdk).digest('base64');
  assert.ok(html.includes('sha384-' + digest));
  assert.ok(html.includes('const redirectUri=location.origin+location.pathname;'));
  const hub = fs.readFileSync('index.html', 'utf8');
  assert.ok(!hub.includes('genesys-bootstrap') && !hub.includes('deploymentId'));
  const quote = fs.readFileSync('quote/index.html', 'utf8');
  const back = new URL(quote.match(/href="([^\"]+)"[^>]*>Back to/)[1], 'https://example.github.io/demo-sites/quote/');
  assert.equal(back.pathname, '/demo-sites/holcim/');
});

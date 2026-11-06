import { validateCatalog, filterDemos } from './catalog-core.mjs';
const element = (tag, className, text) => {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined) el.textContent = text;
  return el;
};
function card(demo) {
  const link = element('a', 'card');
  link.href = `./${demo.slug}/`;
  if (demo.accent) link.style.setProperty('--demo-accent', demo.accent);
  const art = element('div', 'card-art');
  art.setAttribute('aria-hidden', 'true');
  if (demo.logo) { const logo = element('img'); logo.src = demo.logo; logo.alt = ''; art.append(logo); }
  else art.append(element('span', 'card-initial', demo.title.charAt(0)));
  const content = element('div', 'card-content');
  const tags = element('ul', 'tags');
  demo.tags.forEach(tag => tags.append(element('li', '', tag)));
  content.append(element('p', 'card-category', demo.category), element('h3', '', demo.title), element('p', 'card-description', demo.description), tags);
  const action = element('div', 'card-action');
  const arrow = element('span', '', '↗'); arrow.setAttribute('aria-hidden', 'true');
  action.append(element('span', '', `Open ${demo.title}`), arrow);
  link.append(art, content, action);
  return link;
}
try {
  const response = await fetch(new URL('../demos.json', import.meta.url), { cache: 'no-cache' });
  if (!response.ok) throw Error('Collection unavailable');
  const demos = validateCatalog(await response.json());
  const render = () => {
    const matches = filterDemos(demos, document.getElementById('search').value);
    document.getElementById('demos').replaceChildren(...matches.map(card));
    document.getElementById('result-count').textContent = `${matches.length} ${matches.length === 1 ? 'demo' : 'demos'}${matches.length !== demos.length ? ` of ${demos.length}` : ' in the collection'}`;
    document.getElementById('empty').hidden = matches.length !== 0;
  };
  document.getElementById('search').addEventListener('input', render);
  render();
} catch {
  document.getElementById('result-count').textContent = 'Collection unavailable';
  document.getElementById('load-error').hidden = false;
}

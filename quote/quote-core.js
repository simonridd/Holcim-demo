/* Deterministic import and arithmetic: no inferred prices, dates or tax. */
(function (root) {
  'use strict';
  const labels = ['Customer','Company','Project','Site postcode','Status','Currency','Price basis','VAT rate','Delivery charge','Other charges','Valid until','Payment terms','Purchase reference','Quote reference','Order reference','Requested delivery','Confirmed delivery','Delivery window','Site access'];
  const sections = ['Outstanding checks','Next actions','Existing order context'];
  const clean = value => String(value ?? '').replace(/\*\*/g, '').replace(/^\s*[-*#]+\s*/, '').trim();
  const known = value => !/^(?:not discussed|not agreed|not applicable|unknown|tbc|n\/a|—|-)?$/i.test(clean(value));
  const basis = value => /^excluding VAT$/i.test(clean(value)) ? 'excluding' : /^including VAT$/i.test(clean(value)) ? 'including' : '';
  function number(value) {
    const s = clean(value);
    if (!/^(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?$/.test(s)) return null;
    const n = Number(s.replace(/,/g, ''));
    return Number.isFinite(n) && n <= 1e9 ? n : null;
  }
  const unitKey = value => clean(value).toLowerCase().replace(/m³/g,'cubic metres').replace(/m3/g,'cubic metres').replace(/^tonne$/,'tonnes').replace(/^cubic metre$/,'cubic metres');
  function money(value, currency, unit = '') {
    let s = clean(value);
    const found = s.match(/\b[A-Z]{3}\b|[£€$]/g) || [];
    const symbol = {GBP:'£',EUR:'€',USD:'$'}[currency];
    if (found.some(c => c !== currency && c !== symbol)) return null;
    s = s.replace(/\b[A-Z]{3}\b|[£€$]/g,'').trim();
    if (unit) {
      const parts = s.split(/\s+per\s+|\s*\/\s*/i);
      if (parts.length > 2 || (parts.length === 2 && unitKey(parts[1]) !== unitKey(unit))) return null;
      s = parts[0];
    }
    return number(s);
  }
  function charge(value, currency) {
    const s = clean(value);
    const match = s.match(/^(.*?)\s*[,;]?\s*(excluding VAT|including VAT)$/i);
    return {amount: money(match ? match[1] : s, currency), basis: match ? basis(match[2]) : ''};
  }
  function parse(text) {
    if (text.length > 100000) throw new Error('Use a summary of 100,000 characters or fewer.');
    const fields = Object.fromEntries(labels.map(label => [label, '']));
    const notes = Object.fromEntries(sections.map(label => [label, '']));
    const warnings = [], lines = [];
    let section = '', headers = null;
    for (const raw of text.split(/\r?\n/)) {
      const row = clean(raw);
      const heading = sections.find(s => row.replace(/:$/, '').toLowerCase() === s.toLowerCase());
      if (heading) { section = heading; headers = null; continue; }
      const label = !section && labels.find(s => row.toLowerCase().startsWith(s.toLowerCase() + ':'));
      if (label) {
        const value = row.slice(label.length + 1).trim();
        if (fields[label]) warnings.push('Repeated ' + label.toLowerCase() + ': review the original summary.');
        fields[label] = value; section = ''; headers = null; continue;
      }
      if (!section && row.startsWith('|') && row.endsWith('|')) {
        const cells = row.slice(1,-1).split('|').map(c=>c.replace(/\*\*/g,'').trim());
        if (cells.every(c => /^:?-{3,}:?$/.test(c))) continue;
        if (cells[0]?.toLowerCase() === 'product' && cells.some(c=>c.toLowerCase()==='quantity')) { headers = cells; section = ''; continue; }
        if (headers) {
          if (cells.length !== headers.length) { warnings.push('A material row has an unexpected number of columns.'); continue; }
          const get = name => cells[headers.findIndex(h=>h.toLowerCase()===name.toLowerCase())] || '';
          lines.push({product:get('Product'), quantity:get('Quantity'), unit:get('Unit'), specification:get('Specification'), price:get('Unit price'), basis:basis(get('Price basis'))});
          continue;
        }
      }
      if (section) notes[section] += (notes[section] ? '\n' : '') + row;
    }
    if (!lines.length) warnings.push('No material table found. Add the material lines or paste a newly generated Holcim summary.');
    return {fields,notes,lines,warnings};
  }
  function calculate(model) {
    const problems = [...(model.warnings || [])];
    const currency = model.currency;
    if (!/^[A-Z]{3}$/.test(currency) || !isCurrency(currency)) problems.push('Confirm the currency.');
    if (!model.basis) problems.push('Confirm whether prices include or exclude VAT.');
    const validCurrency = isCurrency(currency);
    const amounts = model.lines.map((line, i) => {
      const qty = number(line.quantity), price = money(line.price, currency, line.unit);
      if (!known(line.product) || !known(line.unit) || qty === null || qty <= 0 || price === null) { problems.push('Complete or review quantity, unit and unit price for material ' + (i+1) + '.'); return null; }
      if (line.basis && line.basis !== model.basis) { problems.push('Material ' + (i+1) + ' has a different VAT basis.'); return null; }
      if (!validCurrency) return null;
      const pennies = Math.round(qty * price * 100);
      if (!Number.isSafeInteger(pennies)) { problems.push('Material ' + (i+1) + ' exceeds the supported amount.'); return null; }
      return pennies;
    });
    if (!amounts.length) problems.push('Add at least one material line.');
    const subtotal = amounts.length && amounts.every(a=>a!==null) ? amounts.reduce((a,b)=>a+b,0) : null;
    const delivery = money(model.delivery, currency), other = money(model.other, currency), vat = number(String(model.vat).replace(/%$/, '').trim());
    if (delivery === null) problems.push('Confirm the delivery charge, including zero when explicitly free.');
    if (other === null) problems.push('Confirm additional charges, including zero when explicitly none.');
    if (vat === null || vat > 100) problems.push('Confirm the VAT rate.');
    if (problems.length || subtotal === null) return {amounts, subtotal, problems, total:null, net:null, tax:null};
    const sum = subtotal + Math.round(delivery*100) + Math.round(other*100);
    const net = model.basis === 'including' ? Math.round(sum/(1+vat/100)) : sum;
    const tax = model.basis === 'including' ? sum-net : Math.round(net*vat/100);
    return {amounts,subtotal,problems,total:net+tax,net,tax};
  }
  function isCurrency(c) { try { return /^[A-Z]{3}$/.test(c) && Intl.supportedValuesOf('currency').includes(c) && new Intl.NumberFormat('en-GB',{style:'currency',currency:c}).resolvedOptions().maximumFractionDigits === 2; } catch { return ['GBP','EUR','USD'].includes(c); } }
  const api = {labels,sections,clean,known,basis,number,money,charge,parse,calculate,isCurrency};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.QuoteCore = api;
})(typeof window === 'undefined' ? globalThis : window);

const {test}=require('node:test');
const assert=require('node:assert/strict');
const Q=require('./quote-core.js');
const source=`Customer: Alex Taylor
Currency: GBP
Price basis: Excluding VAT
VAT rate: 20%
Delivery charge: GBP 120 excluding VAT
Other charges: Not discussed
| Product | Quantity | Unit | Specification | Unit price | Price basis |
| --- | --- | --- | --- | --- | --- |
| Concrete | 24 | cubic metres | C32/40 ECOPact | GBP 145 | Excluding VAT |
| MOT Type 1 | 12 | tonnes | Access road | GBP 32 | Excluding VAT |
Requested delivery: 22 October 2026
Confirmed delivery: Not discussed
OUTSTANDING CHECKS
Specification and availability pending.
EXISTING ORDER CONTEXT
Original order unchanged.`;
const base=()=>({...Q.parse(source),currency:'GBP',basis:'excluding',vat:'20',delivery:'120',other:'0'});
test('imports real summary format without turning table separator into a material',()=>{const p=Q.parse(source);assert.equal(p.lines.length,2);assert.equal(p.lines[0].price,'GBP 145');assert.equal(p.fields['Confirmed delivery'],'Not discussed');assert.equal(p.notes['Existing order context'],'Original order unchanged.');});
test('handles bold labels and bullet labels',()=>assert.equal(Q.parse('**Customer:** Alex\n- Company: Example').fields.Customer,'Alex'));
test('calculates explicit ex-VAT rates with delivery and penny rounding',()=>{const r=Q.calculate(base());assert.equal(r.subtotal,386400);assert.equal(r.net,398400);assert.equal(r.tax,79680);assert.equal(r.total,478080);});
test('extracts included VAT without adding tax twice',()=>{const m=base();m.basis='including';m.lines.forEach(l=>l.basis='including');const r=Q.calculate(m);assert.equal(r.total,398400);assert.equal(r.net,332000);assert.equal(r.tax,66400);});
test('missing prices, tax and charges do not become zero',()=>{for(const key of ['currency','basis','vat','delivery','other']){const m=base();m[key]='';assert.equal(Q.calculate(m).total,null,key);}const m=base();m.lines[0].price='Not discussed';assert.equal(Q.calculate(m).total,null);});
test('rejects mixed currency and mismatched price units or tax bases',()=>{for(const price of ['EUR 145','GBP 145 per tonne','145-160','145 + 5']){const m=base();m.lines[0].price=price;assert.equal(Q.calculate(m).total,null,price);}const m=base();m.lines[0].basis='including';assert.equal(Q.calculate(m).total,null);});
test('recognises an explicit matching pricing unit',()=>assert.equal(Q.money('GBP 145 per cubic metre','GBP','m³'),145));
test('charges preserve VAT basis for review',()=>{assert.deepEqual(Q.charge('GBP 120 including VAT','GBP'),{amount:120,basis:'including'});assert.equal(Q.charge('Delivery free','GBP').amount,null);});
test('rejects ambiguous repeated fields and malformed rows',()=>{assert.equal(Q.calculate({...base(),...Q.parse('Currency: EUR\n'+source)}).total,null);const p=Q.parse(source.replace('Requested delivery: 22 October 2026','| Bad | 1 |'));assert.ok(p.warnings.length);});
test('keeps original servicing order lines and labelled notes out of the new quote',()=>{const p=Q.parse(source+'\nCurrency: EUR\n| Product | Quantity | Unit | Unit price |\n| Original order | 50 | tonnes | EUR 20 |');assert.equal(p.fields.Currency,'GBP');assert.equal(p.lines.length,2);assert.match(p.notes['Existing order context'],/Original order/);});
test('supports decimal quantities and zero tax but rejects nonpositive quantities',()=>{const m=base();m.lines=[{product:'Aggregate',quantity:'1.25',unit:'tonnes',price:'19.99',basis:'excluding'}];m.delivery='0';m.other='0';m.vat='0';assert.equal(Q.calculate(m).total,2499);m.lines[0].quantity='0';assert.equal(Q.calculate(m).total,null);});

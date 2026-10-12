'use strict';
const Q = window.QuoteCore;
const $ = id => document.getElementById(id);
const sample = `CUSTOMER AND PROJECT
Customer: Alex Taylor
Company: Riverside Construction
Project: Riverside Yard
Site postcode: BS1 4ST

COMMERCIAL DETAILS
Status: Quote requested
Currency: GBP
Price basis: Excluding VAT
VAT rate: 20%
Delivery charge: GBP 120 excluding VAT
Other charges: GBP 0 excluding VAT
Valid until: 26 October 2026
Payment terms: Not discussed
Purchase reference: Not discussed
Quote reference: Not discussed
Order reference: Not discussed

MATERIALS
| Product | Quantity | Unit | Specification | Unit price | Price basis |
| --- | --- | --- | --- | --- | --- |
| Concrete | 24 | cubic metres | C32/40 ECOPact for yard slab; specification pending verification | GBP 145 | Excluding VAT |
| MOT Type 1 | 12 | tonnes | For access road | GBP 32 | Excluding VAT |

DELIVERY
Requested delivery: 22 October 2026
Confirmed delivery: Not discussed
Delivery window: Morning (requested)
Site access: Standard mixer access available

OUTSTANDING CHECKS
Concrete specification and delivery availability require verification.

NEXT ACTIONS
Adviser to check specification and availability, then send the quotation tomorrow.

EXISTING ORDER CONTEXT
Not applicable`;
let model = null;
const editFields = Q.labels.filter(s=>!['Currency','Price basis','VAT rate','Delivery charge','Other charges'].includes(s));
function node(tag, text, className) { const el=document.createElement(tag); if (text!==undefined) el.textContent=text; if(className)el.className=className; return el; }
function display(value, fallback='Not discussed') { return Q.known(value) ? value : fallback; }
function amount(pennies) {
  if (pennies === null || !Q.isCurrency(model?.currency || '')) return 'To confirm';
  return new Intl.NumberFormat('en-GB',{style:'currency',currency:model.currency}).format(pennies/100);
}
function labelledInput(label, value, change, wide=false, textarea=false) {
  const wrap=node('label',label,wide?'full':''); const input=node(textarea?'textarea':'input'); input.value=value || ''; input.setAttribute('aria-label',label); input.maxLength=textarea?10000:1000;
  input.addEventListener('input',()=>{change(input.value);render();}); wrap.append(input);return wrap;
}
function buildEditor() {
  $('field-editor').replaceChildren(...editFields.map(label=>labelledInput(label,model.fields[label],v=>model.fields[label]=v,['Project','Status','Site access'].includes(label))));
  $('notes-editor').replaceChildren(...Q.sections.map(label=>labelledInput(label,model.notes[label],v=>model.notes[label]=v,true,true)));
  for(const key of ['currency','basis','vat','delivery','other']) $(key).value=model[key];
  buildLines();
}
function buildLines() {
  $('line-editor').replaceChildren();
  model.lines.forEach((line,index)=>{
    const card=node('div',undefined,'line-card'), top=node('div',undefined,'line-top');
    top.append(node('strong','Material '+(index+1))); const remove=node('button','Remove','text-button');remove.setAttribute('aria-label','Remove material '+(index+1));remove.onclick=()=>{model.lines.splice(index,1);buildLines();render();};top.append(remove);card.append(top);
    const fields=node('div',undefined,'fields');
    for(const [key,label,wide] of [['product','Product',true],['quantity','Quantity',false],['unit','Unit',false],['specification','Specification',true],['price','Unit price',true]]) fields.append(labelledInput(label+' '+(index+1),line[key],v=>line[key]=v,wide));
    const basisWrap=node('label','Line price basis','full'), select=node('select');select.setAttribute('aria-label','Line price basis '+(index+1));
    for(const [v,label] of [['','Use quote price basis'],['excluding','Excluding VAT'],['including','Including VAT']]){const option=node('option',label);option.value=v;select.append(option);}select.value=line.basis;select.onchange=()=>{line.basis=select.value;render();};basisWrap.append(select);fields.append(basisWrap);card.append(fields);$('line-editor').append(card);
  });
}
function addDefinition(container,label,value) {const row=node('div');row.append(node('dt',label),node('dd',value));container.append(row);}
function render() {
  $('print').disabled=!model;
  if(!model) return;
  const f=model.fields, result=Q.calculate(model);
  const unpriced=model.lines.length>0 && model.lines.every(line=>!Q.known(line.price));
  $('preview-status').textContent=unpriced?'Unpriced draft generated':result.total===null?'Draft generated · pricing needs review':'Draft generated · calculated';
  $('draft-guidance').hidden=result.total!==null;
  $('draft-guidance-message').textContent=unpriced?'Your project details and materials are ready in the draft below. This summary contains no prices. Print the unpriced draft, or enter reviewed rates and charges to calculate a total.':'Your draft is ready below. Review the missing or inconsistent commercial details to calculate the total. You can still print the draft.';
  $('doc-draft-label').textContent=unpriced?'DEMONSTRATION · UNPRICED DRAFT':'DEMONSTRATION · DRAFT FOR REVIEW';
  $('doc-intro').textContent=unpriced?'Unpriced draft prepared from your project conversation':'Prepared from your project conversation';
  $('doc-customer').textContent=display(f.Customer,'Customer to be confirmed');$('doc-company').textContent=Q.known(f.Company)?f.Company:'';
  $('doc-project').textContent=display(f.Project,'Project to be confirmed');$('doc-postcode').textContent=Q.known(f['Site postcode'])?f['Site postcode']:'';
  $('doc-references').replaceChildren();
  for(const [label,key] of [['Conversation status','Status'],['Quote reference','Quote reference'],['Valid until','Valid until']]) addDefinition($('doc-references'),label,display(f[key]));
  if(Q.known(f['Order reference']))addDefinition($('doc-references'),'Existing order reference',f['Order reference']);
  $('doc-price-basis').textContent=model.basis ? (model.basis==='excluding'?'Prices excluding VAT':'Prices including VAT')+' · '+(model.currency||'Currency to confirm') : 'VAT basis to be confirmed';
  $('doc-lines').replaceChildren();
  model.lines.forEach((line,i)=>{
    const row=node('tr'), material=node('td');material.append(node('strong',display(line.product,'Material to confirm')),node('small',display(line.specification)));
    const price=node('td',display(line.price,'To confirm'));if(line.basis && line.basis!==model.basis)price.append(node('small',line.basis==='excluding'?'Excluding VAT':'Including VAT'));
    row.append(material,node('td',display(line.quantity,'?')+' '+display(line.unit,'unit to confirm')),price,node('td',amount(result.amounts[i])));$('doc-lines').append(row);
  });
  if(!model.lines.length){const row=node('tr'),td=node('td','No materials captured. Add a material line.','empty');td.colSpan=4;row.append(td);$('doc-lines').append(row);}
  $('doc-delivery').replaceChildren();
  for(const [label,key] of [['Requested date','Requested delivery'],['Confirmed date','Confirmed delivery'],['Window','Delivery window'],['Site access','Site access']])addDefinition($('doc-delivery'),label,display(f[key]));
  $('doc-terms').replaceChildren();
  for(const label of ['Payment terms','Purchase reference'])addDefinition($('doc-terms'),label,display(f[label]));
  $('doc-totals').replaceChildren();
  for(const [label,val] of [['Materials',result.subtotal],['Delivery',Q.money(model.delivery,model.currency)===null?null:Math.round(Q.money(model.delivery,model.currency)*100)],['Additional charges',Q.money(model.other,model.currency)===null?null:Math.round(Q.money(model.other,model.currency)*100)],['Net amount',result.net],['VAT'+(model.vat?' ('+model.vat.replace(/%$/,'')+'%)':''),result.tax]])addDefinition($('doc-totals'),label,amount(val));
  $('doc-total').textContent=result.total===null?(unpriced?'Price to be confirmed':'Awaiting details'):amount(result.total);
  $('total-note').textContent=result.total===null?'Total pending confirmation of all prices, charges and VAT.':'Calculated from the quantities, unit rates and charges. Rounded to currency minor units.';
  $('doc-notes').replaceChildren();
  if(Q.known(f['Other charges'])){$('doc-notes').append(node('h3','Original additional charge notes'),node('p',f['Other charges']));}
  for(const label of Q.sections)if(Q.known(model.notes[label]))$('doc-notes').append(node('h3',label),node('p',model.notes[label]));
  const reviewProblems=[...result.problems];
  for(const key of ['Customer','Project','Site postcode'])if(!Q.known(f[key]))reviewProblems.push('Confirm '+key.toLowerCase()+'.');
  if(!Q.known(f['Confirmed delivery']))reviewProblems.push('Delivery is not confirmed.');
  if(Q.known(model.notes['Outstanding checks']))reviewProblems.push('Review the outstanding checks shown on the quote.');
  $('checks').replaceChildren(...reviewProblems.map(s=>node('li',s)));
  $('readiness-title').textContent=unpriced?'Draft generated · add pricing when available':result.total===null?'Draft generated · pricing needs review':'Draft · calculated, ready for adviser review';
}
function importSummary() {
  const text=$('summary').value.trim();
  if(!text){$('import-feedback').textContent='Paste a summary first.';return;}
  try {
    const parsed=Q.parse(text), f=parsed.fields;
    if(!parsed.lines.length && !Object.values(f).some(Q.known))throw new Error('This format was not recognised. Use a new Holcim summary with labelled fields and a materials table.');
    const currency=Q.known(f.Currency)?f.Currency.toUpperCase().trim():'', b=Q.basis(f['Price basis']);
    const delivery=Q.charge(f['Delivery charge'],currency), other=Q.charge(f['Other charges'],currency);
    // An explicitly different charge tax basis must be reviewed, never silently converted.
    const usableCharge=c=>c.amount===null||(c.basis&&c.basis!==b)?'':String(c.amount);
    model=Q.applyPricingDefaults({...parsed,currency,basis:b,vat:Q.known(f['VAT rate'])?f['VAT rate'].replace(/%$/,'').trim():'',delivery:usableCharge(delivery),other:usableCharge(other)});
    buildEditor();render();$('import-feedback').textContent='Draft generated from '+model.lines.length+' material line'+(model.lines.length===1?'':'s')+'. See the document preview.';
    $('quote-preview').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
    $('quote-preview').focus({preventScroll:true});
  } catch(e){$('import-feedback').textContent=e.message;}
}
$('import').onclick=importSummary;
$('add-pricing').onclick=()=>{
  $('review').open=true;
  const firstUnpriced=model?.lines.findIndex(line=>!Q.known(line.price));
  const input=firstUnpriced>=0?$('line-editor').querySelector('[aria-label="Unit price '+(firstUnpriced+1)+'"]'):$('currency');
  input?.focus();input?.select();
};
$('example').onclick=()=>{$('summary').value=sample;importSummary();$('import-feedback').textContent='Fictional example loaded. All prices are demonstration values.';};
$('clear').onclick=()=>{model=null;$('summary').value='';location.reload();};
$('add-line').onclick=()=>{if(!model){model={...Q.parse(''),currency:'',basis:'',vat:'',delivery:'',other:''};model.warnings=[];buildEditor();}model.lines.push({product:'',quantity:'',unit:'',specification:'',price:'',basis:''});buildLines();render();};
for(const key of ['currency','basis','vat','delivery','other'])$(key).addEventListener('input',()=>{if(!model)return;model[key]=$(key).value;if(key==='currency'){model.currency=model.currency.toUpperCase();$(key).value=model.currency;}render();});
$('print').onclick=()=>window.print();

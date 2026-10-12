(function(root){
  'use strict';
  const columns=['customerName','callbackNumber','projectName','siteLocation','requiredDate','coreProduct','productQuantity','quantityUnit','customerCompany','enquiryDetails','requestedTiming','handoffReason','nextAction','contextSource'];
  const defaultMap=Object.freeze(Object.fromEntries(columns.map(name=>[name,name])));
  const trim=value=>String(value??'').trim();
  function values(form){
    const enquiry=[trim(form.enquiry),form.email?'Email: '+trim(form.email):'',form.consent?'Permission to contact: Yes':''].filter(Boolean).join('\n');
    return {
      customerName:[trim(form.firstName),trim(form.lastName)].filter(Boolean).join(' '),
      callbackNumber:trim(form.phone),projectName:trim(form.project),
      siteLocation:[trim(form.siteLocation),trim(form.postcode)].filter(Boolean).join(', '),
      requiredDate:trim(form.requiredDate),coreProduct:trim(form.product),
      productQuantity:trim(form.quantity),quantityUnit:trim(form.unit),
      customerCompany:trim(form.company),enquiryDetails:enquiry,
      requestedTiming:trim(form.requestedTiming),handoffReason:trim(form.handoffReason),
      nextAction:trim(form.nextAction),contextSource:'Holcim demo website'+(form.sourceArticle?' / Knowledge article: '+trim(form.sourceArticle):'')
    };
  }
  function mapContactData(form,columnMap=defaultMap){
    const source=values(form),data=Object.create(null);
    for(const name of columns){if(!columnMap[name])throw new Error('Missing mapping for '+name+'.');if(source[name].length>512)throw new Error(name==='enquiryDetails'?'The enquiry details exceed 512 characters including email and contact permission. Shorten the requirements before sending.':'The '+name+' value exceeds the contact list limit of 512 characters.');data[columnMap[name]]=source[name];}
    return data;
  }
  function payload(form,columnMap=defaultMap){return {data:mapContactData(form,columnMap),callable:!!trim(form.phone)};}
  const api={columns,defaultMap,values,mapContactData,payload};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.HolcimContacts=api;
})(typeof window==='undefined'?globalThis:window);

const HIGH_RISK=/\b(chest pain|difficulty breathing|can't breathe|severe bleeding|unconscious|seizure|overdose|poisoning|suicid|newborn)\b/i;
const PATIENT_SPECIFIC=/\b(i have|i'm having|im having|i am having|i've got|ive got|my symptoms|my condition|i feel|i'm feeling|im feeling|i am feeling|i took|i take|i use|can i take|should i take|what should i take|what medicine should i use)\b/i;
const TREATMENT_REVIEW=/\b(dose|dosage|interaction|contraindication|prescription|antibiotic|insulin|injection|controlled|pregnan|child|baby|infant|diagnos|side effect)\b/i;
function classify(text=''){
  if(HIGH_RISK.test(text)) return 'emergency';
  if(PATIENT_SPECIFIC.test(text) || TREATMENT_REVIEW.test(text)) return 'pharmacist';
  return 'general';
}
function safeResponse(text){
  const type=classify(text);
  if(type==='emergency') return {type,message:'This may require urgent medical attention. Please seek emergency care now. A pharmacist cannot safely diagnose or manage an emergency through chat.'};
  if(type==='pharmacist') return {type,message:'If this is about your own health or treatment, please speak with a Kalidad pharmacist so they can assess you properly and give safe, personalized advice.'};
  return {type:'general'};
}
module.exports={classify,safeResponse};

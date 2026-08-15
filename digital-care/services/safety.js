const HIGH_RISK=/\b(chest pain|difficulty breathing|can't breathe|severe bleeding|unconscious|seizure|overdose|poisoning|suicid|pregnan|infant under|newborn)\b/i;
const CLINICAL_REVIEW=/\b(dose|dosage|interaction|contraindication|prescription|antibiotic|insulin|injection|controlled|pregnan|child|baby|symptom|diagnos|side effect)\b/i;
function classify(text=''){ if(HIGH_RISK.test(text)) return 'emergency'; if(CLINICAL_REVIEW.test(text)) return 'pharmacist'; return 'general'; }
function safeResponse(text){const type=classify(text); if(type==='emergency') return {type,message:'This may require urgent medical attention. Please seek emergency care now. A pharmacist cannot safely diagnose or manage an emergency through chat.'}; if(type==='pharmacist') return {type,message:'A pharmacist should review this question before you act on it. Please continue with pharmacist assistance.'}; return {type:'general'};}
module.exports={classify,safeResponse};

const HIGH_RISK=/\b(chest pain|difficulty breathing|can't breathe|cannot breathe|severe bleeding|unconscious|seizure|overdose|poisoning|suicid|newborn)\b/i;
const PATIENT_SPECIFIC=/\b(i have|i'm having|im having|i am having|i've got|ive got|i've had|ive had|i am experiencing|i'm experiencing|im experiencing|my symptoms|my condition|i feel|i'm feeling|im feeling|i am feeling|i took|i take|i use|can i take|should i take|what should i take|what medicine should i use|what can i take|how do i treat|how can i treat)\b/i;
const PERSONAL_SYMPTOM=/\b(bad cough|coughing|sore throat|runny nose|blocked nose|stuffy nose|fever|headache|stomach pain|abdominal pain|diarrhea|vomiting|vomit|rash|pain|swelling|dizzy|dizziness|weakness|shortness of breath|breathless|body aches|flu symptoms|cold symptoms)\b/i;
const DURATION=/\b(for|since)\s+(?:\d+|one|two|three|four|five|six|seven|several)\s+(?:day|days|week|weeks|month|months|hour|hours)\b/i;
const TREATMENT_REVIEW=/\b(dose|dosage|interaction|contraindication|prescription|antibiotic|insulin|injection|controlled|pregnan|child|baby|infant|diagnos|side effect)\b/i;
function classify(text=''){
  if(HIGH_RISK.test(text)) return 'emergency';
  if(PATIENT_SPECIFIC.test(text) || TREATMENT_REVIEW.test(text) || (PERSONAL_SYMPTOM.test(text) && DURATION.test(text))) return 'pharmacist';
  return 'general';
}
function safeResponse(text){
  const type=classify(text);
  if(type==='emergency') return {type,message:'This may require urgent medical attention. Please seek emergency care now. A pharmacist cannot safely diagnose or manage an emergency through chat.'};
  if(type==='pharmacist') return {type,message:'If this is about your own health or treatment, please speak with a Kalidad pharmacist so they can assess you properly and give safe, personalized advice.'};
  return {type:'general'};
}
module.exports={classify,safeResponse};

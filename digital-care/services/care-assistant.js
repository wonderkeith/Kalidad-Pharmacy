const SAFE_HANDOFF = 'A pharmacist should review this question. I can help with products, orders and general pharmacy information, but I cannot diagnose, prescribe or replace a pharmacist.';
function isClinicalRisk(text='') { return /diagnos|prescri|dose|dosage|interaction|side effect|pregnan|child|infant|emergency|overdose|allerg|symptom|condition/i.test(text); }
async function answer(pool, text) {
  const input=String(text||'').trim();
  if(!input) return {answer:'How can I help with a product, order or pharmacy service?',handoff:false};
  if(isClinicalRisk(input)) return {answer:SAFE_HANDOFF,handoff:true};
  const r=await pool.query('SELECT title,body,category FROM knowledge_articles WHERE is_published=TRUE AND (title ILIKE $1 OR body ILIKE $1) ORDER BY updated_at DESC LIMIT 3',[`%${input.slice(0,80)}%`]);
  if(r.rowCount) return {answer:r.rows.map(x=>`${x.title}: ${x.body}`).join('\n\n'),handoff:false,sources:r.rows.map(x=>x.title)};
  return {answer:'I could not find an approved pharmacy knowledge article for that question. I can connect you with a member of the pharmacy team.',handoff:true};
}
module.exports={answer,isClinicalRisk,SAFE_HANDOFF};

from pathlib import Path
from bs4 import BeautifulSoup
from PIL import Image
from urllib.parse import unquote
import json, hashlib
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'android-app/web'
assets=OUT/'assets';assets.mkdir(exist_ok=True)
used={}
def asset(src):
 src=unquote(src).strip(); p=ROOT/src
 if not p.is_file(): raise ValueError(f'Missing source asset {src}')
 name=hashlib.sha256(src.encode()).hexdigest()[:12]+'.webp'
 if src not in used:
  with Image.open(p) as im:
   im.thumbnail((1200,1200));im.save(assets/name,'WEBP',quality=85)
  used[src]=name
 return 'assets/'+name
def soup(page):return BeautifulSoup((ROOT/(page+'.html')).read_text(),'html.parser')
products=[]
for page,category in [('baby-care','Baby care'),('skincare-body-care','Skin & body'),('personal-hygiene-oral-care','Personal care'),('nutritional-supplements','Supplements')]:
 for card in soup(page).select('.product-card'):
  products.append(dict(id=len(products)+1,name=card.h3.get_text(' ',strip=True),description=card.p.get_text(' ',strip=True),category=category,image=asset(card.img['src']),source=page+'.html'))
services=[]
for card in soup('services').select('.service-panel'):
 p=card.select_one('.service-lead');link=card.select_one('.service-actions a')
 services.append(dict(id=len(services)+1,title=card.h3.get_text(' ',strip=True),description=p.get_text(' ',strip=True) if p else 'Blood pressure, glucose, and weight checks.',details=[x.get_text(' ',strip=True) for x in card.select('li')],image=asset(card.img['src']),source=link['href']))
articles=[]
for page in ['simple-health-habits','understanding-prescriptions','routine-health-checks','everyday-wellness-habits','medicine-routine-reminders','healthier-meals-one-choice','kalidad-pharmacy-community']:
 s=soup(page); a=s.select_one('.article-copy');
 if not a:continue
 blocks=[]
 for el in a.select('h2,h3,p,li'):
  if el.find_parent(['li','p']):continue
  text=el.get_text(' ',strip=True)
  if text:blocks.append({'type':el.name,'text':text})
 img=s.select_one('.article-hero img') or s.select_one('main img')
 articles.append(dict(id=page,title=s.h1.get_text(' ',strip=True),blocks=blocks,image=asset(img['src']) if img else asset('news-feature-health-habits.webp'),source=page+'.html'))
extras={k:asset(v) for k,v in {'logo':'kalidad-logo.png','hero':'Kato Rhita Index hero Mobile 2.webp','team':'Kalidad Team 1.webp','kisenyi':'Kisenyi night mobile.webp','kahunga':'kb night interior.webp','care':'Pharmacist consultation.webp'}.items()}
data=dict(products=products,services=services,articles=articles,images=extras,sourceCommit=__import__('subprocess').check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip())
(OUT/'content.js').write_text('window.CONTENT = '+json.dumps(data,ensure_ascii=False)+';\n')
(OUT/'asset-provenance.json').write_text(json.dumps(used,indent=2))
print(f'Prepared {len(products)} product ranges, {len(services)} services, {len(articles)} articles and {len(used)} images')

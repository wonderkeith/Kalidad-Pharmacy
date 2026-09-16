from pathlib import Path
import re

CONTACT_CSS = r'''/* KALIDAD HERO REWORK — CONTACT: page-specific, image-led */
.page-banner{position:relative!important;width:100%!important;height:calc(100svh - 84px)!important;min-height:620px!important;margin:0!important;padding:0!important;overflow:hidden!important;display:flex!important;align-items:center!important;background:#12291F url('kalidad_pharmacy_scene.webp') center center/cover no-repeat!important;isolation:isolate!important}
.page-banner::before{content:""!important;position:absolute!important;inset:0!important;z-index:1!important;pointer-events:none!important;background:linear-gradient(90deg,rgba(18,41,31,.82) 0%,rgba(18,41,31,.66) 24%,rgba(18,41,31,.30) 52%,rgba(18,41,31,.07) 78%,rgba(18,41,31,0) 100%)!important}
.page-banner::after{display:none!important;content:none!important}.page-banner .blob,.page-banner .hero-arrow,.page-banner .hero-dots,.page-banner .kicker{display:none!important}
.page-banner>.container{position:relative!important;z-index:3!important;width:100%!important;max-width:none!important;height:100%!important;min-height:100%!important;margin:0!important;padding:0 7vw!important;display:flex!important;align-items:center!important;justify-content:flex-start!important}
.page-banner .hero-copy{width:min(680px,52vw)!important;max-width:680px!important;margin:0!important;padding:0!important}
.page-banner h1{margin:0!important;color:#fff!important;font-size:clamp(3.2rem,5.7vw,5.8rem)!important;line-height:.98!important;letter-spacing:-.045em!important;text-shadow:0 3px 24px rgba(0,0,0,.40)!important}.page-banner h1 .accent{color:#C7EF3E!important}
.page-banner p{margin-top:24px!important;max-width:600px!important;color:rgba(255,255,255,.96)!important;font-size:clamp(1rem,1.35vw,1.18rem)!important;line-height:1.7!important;text-shadow:0 1px 12px rgba(0,0,0,.34)!important}
.page-banner .hero-copy .btn,.page-banner .hero-copy .btn-outline{margin-top:28px!important;border-color:#fff!important;color:#fff!important;background:rgba(18,41,31,.14)!important}
@media(max-width:900px){.page-banner{height:100svh!important;min-height:600px!important;background-image:url('kalidad_pharmacy_clean_photo.webp')!important;background-position:center center!important}.page-banner::before{background:linear-gradient(90deg,rgba(18,41,31,.78) 0%,rgba(18,41,31,.58) 42%,rgba(18,41,31,.22) 72%,rgba(18,41,31,.05) 100%)!important}.page-banner>.container{padding:0 24px!important}.page-banner .hero-copy{width:min(62vw,560px)!important}.page-banner h1{font-size:clamp(2.45rem,9vw,4.5rem)!important}}
@media(max-width:560px){.page-banner>.container{padding:0 20px!important}.page-banner .hero-copy{width:min(72vw,350px)!important}.page-banner h1{font-size:clamp(2.2rem,10.5vw,3.35rem)!important}.page-banner p{font-size:.94rem!important;margin-top:18px!important}}
'''

CAREERS_CSS = r'''/* KALIDAD HERO REWORK — CAREERS: preserve actual reframed hero DOM */
.careers-page .hero-reframed.career-hero{position:relative!important;width:100%!important;height:calc(100svh - 84px)!important;min-height:620px!important;max-height:none!important;margin:0!important;padding:0!important;overflow:hidden!important;background:#12291F!important;isolation:isolate!important}
.careers-page .hero-reframed .hero-background,.careers-page .hero-reframed .hero-visual,.careers-page .hero-reframed .career-static-visual{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;min-height:100%!important;z-index:0!important}
.careers-page .hero-reframed .hero-background{background:#12291F!important}.careers-page .hero-reframed .career-slide{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;padding:0!important;background:transparent!important}.careers-page .hero-reframed .career-slide::after{display:none!important;content:none!important}.careers-page .hero-reframed .career-slide-decor,.careers-page .hero-reframed .career-slide .slide-icon{display:none!important}
.careers-page .hero-reframed .hero-content{position:relative!important;z-index:5!important;width:100%!important;height:100%!important;min-height:100%!important;margin:0!important;padding:0 7vw!important;display:flex!important;align-items:center!important;pointer-events:none!important}
.careers-page .hero-reframed .hero-copy{width:min(680px,52vw)!important;max-width:680px!important;padding:0!important;margin:0!important;pointer-events:auto!important}.careers-page .hero-reframed .hero-copy .eyebrow{display:inline-flex!important;margin:0 0 20px!important;background:rgba(230,243,217,.92)!important;color:#33581F!important}
.careers-page .hero-reframed .hero-copy h1{margin:0!important;color:#fff!important;font-size:clamp(3.2rem,5.7vw,5.8rem)!important;line-height:.98!important;letter-spacing:-.045em!important;text-shadow:0 3px 24px rgba(0,0,0,.40)!important}.careers-page .hero-reframed .hero-copy h1 .accent{color:#C7EF3E!important}
.careers-page .hero-reframed .hero-copy .lede{margin:24px 0 0!important;max-width:600px!important;color:rgba(255,255,255,.96)!important;font-size:clamp(1rem,1.35vw,1.18rem)!important;line-height:1.7!important;text-shadow:0 1px 12px rgba(0,0,0,.34)!important}.careers-page .hero-reframed .hero-cta{margin-top:28px!important;border:2px solid #fff!important;color:#fff!important;background:rgba(18,41,31,.14)!important}
.careers-page .hero-reframed .hero-visual img,.careers-page .hero-reframed .career-static-visual img{width:100%!important;height:100%!important;min-width:100%!important;min-height:100%!important;object-fit:cover!important;object-position:center!important}
.careers-page .hero-reframed::before{content:""!important;position:absolute!important;inset:0!important;z-index:2!important;pointer-events:none!important;background:linear-gradient(90deg,rgba(18,41,31,.82) 0%,rgba(18,41,31,.66) 24%,rgba(18,41,31,.30) 52%,rgba(18,41,31,.07) 78%,rgba(18,41,31,0) 100%)!important}
@media(max-width:900px){.careers-page .hero-reframed.career-hero{height:100svh!important;min-height:600px!important}.careers-page .hero-reframed .hero-content{padding:0 24px!important;align-items:center!important}.careers-page .hero-reframed .hero-copy{width:min(62vw,560px)!important}.careers-page .hero-reframed .hero-copy h1{font-size:clamp(2.45rem,9vw,4.5rem)!important}}
@media(max-width:560px){.careers-page .hero-reframed .hero-content{padding:0 20px!important}.careers-page .hero-reframed .hero-copy{width:min(72vw,350px)!important}.careers-page .hero-reframed .hero-copy h1{font-size:clamp(2.2rem,10.5vw,3.35rem)!important}.careers-page .hero-reframed .hero-copy .lede{font-size:.94rem!important;margin-top:18px!important}}
'''

def apply(path, css):
 p=Path(path); s=p.read_text(encoding='utf-8')
 s=re.sub(r'\n<style id="contact-careers-hero-final">.*?</style>\s*','\n',s,flags=re.S)
 s=s.replace('</head>','\n<style id="contact-careers-hero-final">\n'+css+'\n</style>\n</head>',1)
 p.write_text(s,encoding='utf-8')
apply('contact.html',CONTACT_CSS)
apply('careers.html',CAREERS_CSS)

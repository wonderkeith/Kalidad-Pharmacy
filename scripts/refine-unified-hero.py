from pathlib import Path

PAGES = [
    'index.html', 'services.html', 'contact.html', 'careers.html', 'news.html', 'about.html',
    'simple-health-habits.html', 'understanding-prescriptions.html', 'everyday-wellness-habits.html',
    'routine-health-checks.html', 'medicine-routine-reminders.html', 'kalidad-pharmacy-community.html',
    'healthier-meals-one-choice.html'
]

CSS = r'''
/* Kalidad unified hero image refinement */
.kalidad-unified-hero .hero-image,
.kalidad-unified-hero .hero-visual,
.kalidad-unified-hero .hero-bg,
.kalidad-unified-hero .page-banner-bg {
  position:absolute!important;
  inset:0!important;
  width:100%!important;
  height:100%!important;
  min-height:100%!important;
  z-index:1!important;
  overflow:hidden!important;
}
.kalidad-unified-hero .hero-image img,
.kalidad-unified-hero .hero-visual img,
.kalidad-unified-hero .hero-bg img,
.kalidad-unified-hero .page-banner-bg img {
  display:block!important;
  width:100%!important;
  height:100%!important;
  min-width:100%!important;
  min-height:100%!important;
  object-fit:cover!important;
  object-position:center!important;
}
.kalidad-unified-hero .hero-image::after {
  content:""!important;
  position:absolute!important;
  inset:0!important;
  z-index:2!important;
  pointer-events:none!important;
  background:linear-gradient(90deg,rgba(18,41,31,.68) 0%,rgba(18,41,31,.45) 28%,rgba(18,41,31,.12) 58%,rgba(18,41,31,.02) 100%)!important;
}
.kalidad-unified-hero .hero-copy { position:relative!important; z-index:6!important; }
@media(max-width:850px){
  .kalidad-unified-hero .hero-image::after { background:linear-gradient(90deg,rgba(18,41,31,.66) 0%,rgba(18,41,31,.36) 55%,rgba(18,41,31,.12) 100%)!important; }
}
'''

for name in PAGES:
    p=Path(name)
    s=p.read_text(encoding='utf-8')
    marker='/* Kalidad unified hero image refinement */'
    if marker not in s:
        s=s.replace('</head>', '<style>\n'+CSS+'\n</style>\n</head>', 1)
    p.write_text(s,encoding='utf-8')
print('Refined',len(PAGES),'pages')

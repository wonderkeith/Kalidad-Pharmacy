from pathlib import Path

PAGES = [
    'index.html', 'services.html', 'contact.html', 'careers.html', 'news.html', 'about.html',
    'simple-health-habits.html', 'understanding-prescriptions.html', 'everyday-wellness-habits.html',
    'routine-health-checks.html', 'medicine-routine-reminders.html', 'kalidad-pharmacy-community.html',
    'healthier-meals-one-choice.html'
]

STYLE = r'''
/* Kalidad unified full-screen hero treatment */
.kalidad-unified-hero,
.kalidad-unified-hero.page-banner,
.kalidad-unified-hero.hero {
  position:relative!important;
  display:block!important;
  width:100%!important;
  height:100svh!important;
  min-height:100svh!important;
  margin:0!important;
  padding:0!important;
  overflow:hidden!important;
  box-sizing:border-box!important;
  background:#12291F!important;
  isolation:isolate!important;
}
.kalidad-unified-hero::before,
.kalidad-unified-hero::after,
.kalidad-unified-hero .blob,
.kalidad-unified-hero.page-banner .blob {
  display:none!important;
  content:none!important;
  background:none!important;
}
/* Existing hero visual/slider becomes the full-bleed image layer. */
.kalidad-unified-hero .hero-visual,
.kalidad-unified-hero .hero-bg,
.kalidad-unified-hero .page-banner-bg,
.kalidad-unified-hero picture,
.kalidad-unified-hero .slider,
.kalidad-unified-hero .hero-slider,
.kalidad-unified-hero .carousel {
  position:absolute!important;
  inset:0!important;
  width:100%!important;
  height:100%!important;
  min-height:100%!important;
  max-width:none!important;
  margin:0!important;
  z-index:1!important;
}
.kalidad-unified-hero .slider,
.kalidad-unified-hero .hero-slider,
.kalidad-unified-hero .carousel {
  border-radius:0!important;
  box-shadow:none!important;
}
.kalidad-unified-hero .hero-visual img,
.kalidad-unified-hero .hero-bg img,
.kalidad-unified-hero .page-banner-bg img,
.kalidad-unified-hero picture img,
.kalidad-unified-hero .slider img,
.kalidad-unified-hero .hero-slider img,
.kalidad-unified-hero .carousel img {
  width:100%!important;
  height:100%!important;
  min-width:100%!important;
  min-height:100%!important;
  object-fit:cover!important;
  object-position:center!important;
}
/* Existing CSS-gradient slider panels stay usable when they contain no image. */
.kalidad-unified-hero .hero-visual::after,
.kalidad-unified-hero .hero-bg::after,
.kalidad-unified-hero .page-banner-bg::after,
.kalidad-unified-hero .slider::after,
.kalidad-unified-hero .hero-slider::after,
.kalidad-unified-hero .carousel::after {
  content:""!important;
  position:absolute!important;
  inset:0!important;
  display:block!important;
  z-index:4!important;
  pointer-events:none!important;
  background:linear-gradient(90deg,rgba(18,41,31,.68) 0%,rgba(18,41,31,.45) 28%,rgba(18,41,31,.12) 58%,rgba(18,41,31,.02) 100%)!important;
}
.kalidad-unified-hero .hero-grid,
.kalidad-unified-hero .container {
  position:relative!important;
  z-index:5!important;
  width:100%!important;
  max-width:none!important;
  height:100%!important;
  min-height:100svh!important;
  margin:0!important;
  padding:0!important;
  display:block!important;
  box-sizing:border-box!important;
}
.kalidad-unified-hero .hero-copy,
.kalidad-unified-hero .page-banner .hero-copy,
.kalidad-unified-hero .hero-copy {
  position:relative!important;
  z-index:6!important;
  width:min(680px,72vw)!important;
  max-width:680px!important;
  height:100%!important;
  min-height:100svh!important;
  padding:130px 7vw 90px!important;
  margin:0!important;
  display:flex!important;
  flex-direction:column!important;
  justify-content:center!important;
  align-items:flex-start!important;
  background:transparent!important;
  box-sizing:border-box!important;
}
.kalidad-unified-hero h1,
.kalidad-unified-hero .hero-copy h1,
.kalidad-unified-hero.page-banner h1 {
  color:#fff!important;
  text-shadow:0 2px 18px rgba(0,0,0,.34)!important;
}
.kalidad-unified-hero h1 .accent,
.kalidad-unified-hero .hero-copy h1 .accent { color:#C7EF3E!important; }
.kalidad-unified-hero p,
.kalidad-unified-hero .lede,
.kalidad-unified-hero .lead,
.kalidad-unified-hero .hero-copy p,
.kalidad-unified-hero.page-banner p {
  color:rgba(255,255,255,.96)!important;
  text-shadow:0 1px 12px rgba(0,0,0,.30)!important;
}
.kalidad-unified-hero .eyebrow,
.kalidad-unified-hero .kicker { background:rgba(230,243,217,.9)!important; color:#33581F!important; }
.kalidad-unified-hero .btn-outline { border-color:#fff!important; color:#fff!important; background:rgba(18,41,31,.12)!important; }
.kalidad-unified-hero .btn-outline:hover { background:rgba(255,255,255,.14)!important; }
/* Prevent the old split-layout card from floating over the new full-bleed treatment. */
.kalidad-unified-hero .info-card { display:none!important; }
@media(max-width:850px){
  .kalidad-unified-hero,
  .kalidad-unified-hero.hero,
  .kalidad-unified-hero.page-banner { height:100svh!important; min-height:100svh!important; }
  .kalidad-unified-hero .hero-copy,
  .kalidad-unified-hero.page-banner .hero-copy { width:100%!important; max-width:none!important; min-height:100svh!important; height:100svh!important; padding:115px 28px 60px!important; }
  .kalidad-unified-hero .hero-visual::after,
  .kalidad-unified-hero .hero-bg::after,
  .kalidad-unified-hero .page-banner-bg::after,
  .kalidad-unified-hero .slider::after,
  .kalidad-unified-hero .hero-slider::after,
  .kalidad-unified-hero .carousel::after { background:linear-gradient(90deg,rgba(18,41,31,.66) 0%,rgba(18,41,31,.36) 55%,rgba(18,41,31,.12) 100%)!important; }
}
@media(max-width:560px){
  .kalidad-unified-hero .hero-copy,
  .kalidad-unified-hero.page-banner .hero-copy { padding:105px 24px 55px!important; }
}
'''

SCRIPT = r'''
<script>
(function(){
  var hero = document.querySelector('.hero') || document.querySelector('.page-banner');
  if (!hero) return;
  hero.classList.add('kalidad-unified-hero');
})();
</script>
'''

for name in PAGES:
    p = Path(name)
    s = p.read_text(encoding='utf-8')
    marker = '/* Kalidad unified full-screen hero treatment */'
    if marker not in s:
        s = s.replace('</head>', '<style>\n' + STYLE + '\n</style>\n</head>', 1)
    if 'var hero = document.querySelector(\'.hero\')' not in s:
        s = s.replace('</body>', SCRIPT + '\n</body>', 1)
    p.write_text(s, encoding='utf-8')
print('Updated', len(PAGES), 'pages')

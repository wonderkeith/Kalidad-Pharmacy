from pathlib import Path
import re

INDEX_CSS = r'''
/* ==========================================================
   KALIDAD HERO REWORK — HOME
   Final, page-specific rules. No runtime hero class required.
   ========================================================== */
.hero-reference {
  position: relative !important;
  width: 100% !important;
  height: calc(100svh - 84px) !important;
  min-height: 620px !important;
  max-height: none !important;
  margin: 0 !important;
  padding: 0 !important;
  overflow: hidden !important;
  display: block !important;
  background: #12291F !important;
  isolation: isolate !important;
}
.hero-reference-bg,
.hero-reference-bg.hero-reference-image-1,
.hero-reference-bg.hero-reference-image-2,
.hero-reference-bg.hero-reference-image-3 {
  position: absolute !important;
  inset: 0 !important;
  width: 100% !important;
  height: 100% !important;
  min-height: 100% !important;
  z-index: 0 !important;
  background-size: cover !important;
  background-repeat: no-repeat !important;
  background-position: center center !important;
}
.hero-reference-bg.hero-reference-image-1 { background-image: url("image-07-caa3270325.webp") !important; }
.hero-reference-bg.hero-reference-image-2 { background-image: url("image-08-99b804a9ad.webp") !important; }
.hero-reference-bg.hero-reference-image-3 { background-image: url("image-09-b2d22f9d65.webp") !important; }
.hero-reference::before {
  content: "" !important;
  position: absolute !important;
  inset: 0 !important;
  z-index: 1 !important;
  pointer-events: none !important;
  background: linear-gradient(90deg, rgba(18,41,31,.84) 0%, rgba(18,41,31,.64) 25%, rgba(18,41,31,.22) 52%, rgba(18,41,31,.02) 78%, rgba(18,41,31,0) 100%) !important;
}
.hero-reference::after { display: none !important; content: none !important; }
.hero-reference-content {
  position: relative !important;
  z-index: 3 !important;
  width: 100% !important;
  height: 100% !important;
  min-height: 100% !important;
  margin: 0 !important;
  padding: 0 7vw !important;
  display: flex !important;
  align-items: center !important;
  justify-content: flex-start !important;
  max-width: none !important;
}
.hero-reference-copy {
  position: relative !important;
  width: min(680px, 52vw) !important;
  max-width: 680px !important;
  min-height: 0 !important;
  margin: 0 !important;
  padding: 0 !important;
  display: grid !important;
  align-items: center !important;
}
.hero-reference-slide { grid-area: 1 / 1 !important; }
.hero-reference-slide h1 {
  max-width: 680px !important;
  margin: 0 !important;
  color: #fff !important;
  font-size: clamp(3.2rem, 5.7vw, 5.8rem) !important;
  line-height: .98 !important;
  letter-spacing: -.045em !important;
  text-shadow: 0 3px 24px rgba(0,0,0,.38) !important;
}
.hero-reference-slide h1 .accent { color: #C7EF3E !important; }
.hero-reference-dots {
  position: absolute !important;
  z-index: 4 !important;
  left: 7vw !important;
  right: auto !important;
  bottom: 38px !important;
}
.hero-reference-nav {
  z-index: 5 !important;
}
@media (max-width: 900px) {
  .hero-reference { height: 100svh !important; min-height: 600px !important; }
  .hero-reference-content { padding: 0 24px !important; }
  .hero-reference-copy { width: min(620px, 62vw) !important; }
  .hero-reference-slide h1 { font-size: clamp(2.6rem, 8.8vw, 4.6rem) !important; }
}
@media (max-width: 700px) {
  .hero-reference-bg,
  .hero-reference-bg.hero-reference-image-1,
  .hero-reference-bg.hero-reference-image-2,
  .hero-reference-bg.hero-reference-image-3 {
    background-size: cover !important;
    background-position: center center !important;
  }
  .hero-reference-bg.hero-reference-image-1 { background-image: url("mobile-hero-1.webp") !important; }
  .hero-reference-bg.hero-reference-image-2 { background-image: url("mobile-hero-2.webp") !important; }
  .hero-reference-bg.hero-reference-image-3 { background-image: url("mobile-hero-3.webp") !important; }
  .hero-reference::before {
    background: linear-gradient(90deg, rgba(18,41,31,.82) 0%, rgba(18,41,31,.57) 43%, rgba(18,41,31,.18) 75%, rgba(18,41,31,.03) 100%) !important;
  }
  .hero-reference-content {
    padding: 0 22px !important;
    align-items: center !important;
    justify-content: flex-start !important;
  }
  .hero-reference-copy { width: min(58%, 340px) !important; }
  .hero-reference-slide h1 {
    max-width: 100% !important;
    font-size: clamp(2.2rem, 9.5vw, 3.5rem) !important;
    line-height: 1.02 !important;
  }
  .hero-reference .hero-reference-prev,
  .hero-reference .hero-reference-next { display: none !important; }
  .hero-reference-dots { left: 22px !important; bottom: 28px !important; }
}
@media (max-width: 430px) {
  .hero-reference-content { padding: 0 20px !important; }
  .hero-reference-copy { width: 57% !important; }
  .hero-reference-slide h1 { font-size: clamp(2rem, 9.8vw, 3rem) !important; }
}
'''

SERVICES_CSS = r'''
/* ==========================================================
   KALIDAD HERO REWORK — SERVICES
   Final, page-specific rules. No runtime hero class required.
   ========================================================== */
.page-banner {
  position: relative !important;
  width: 100% !important;
  height: calc(100svh - 84px) !important;
  min-height: 620px !important;
  max-height: none !important;
  margin: 0 !important;
  padding: 0 !important;
  overflow: hidden !important;
  background: #12291F !important;
  isolation: isolate !important;
}
.page-banner::before {
  content: "" !important;
  position: absolute !important;
  inset: 0 !important;
  z-index: 2 !important;
  pointer-events: none !important;
  background: linear-gradient(90deg, rgba(18,41,31,.84) 0%, rgba(18,41,31,.64) 25%, rgba(18,41,31,.22) 52%, rgba(18,41,31,.02) 78%, rgba(18,41,31,0) 100%) !important;
}
.page-banner::after { display: none !important; content: none !important; }
.page-banner > .container {
  position: relative !important;
  z-index: 3 !important;
  width: 100% !important;
  max-width: none !important;
  height: 100% !important;
  min-height: 100% !important;
  margin: 0 !important;
  padding: 0 7vw !important;
  display: flex !important;
  align-items: center !important;
  justify-content: flex-start !important;
}
.page-banner .hero-image {
  position: absolute !important;
  inset: 0 !important;
  z-index: 0 !important;
  width: 100% !important;
  height: 100% !important;
  min-height: 100% !important;
  overflow: hidden !important;
}
.page-banner .hero-image picture,
.page-banner .hero-image img {
  display: block !important;
  width: 100% !important;
  height: 100% !important;
  min-width: 100% !important;
  min-height: 100% !important;
}
.page-banner .hero-image img {
  object-fit: cover !important;
  object-position: center center !important;
}
.page-banner .hero-copy {
  position: relative !important;
  z-index: 4 !important;
  width: min(680px, 52vw) !important;
  max-width: 680px !important;
  margin: 0 !important;
  padding: 0 !important;
}
.page-banner h1 {
  margin: 0 !important;
  color: #fff !important;
  font-size: clamp(3.2rem, 5.7vw, 5.8rem) !important;
  line-height: .98 !important;
  letter-spacing: -.045em !important;
  text-shadow: 0 3px 24px rgba(0,0,0,.38) !important;
}
.page-banner h1 .accent { color: #C7EF3E !important; }
@media (max-width: 900px) {
  .page-banner { height: 100svh !important; min-height: 600px !important; }
  .page-banner > .container { padding: 0 24px !important; }
  .page-banner .hero-copy { width: min(620px, 62vw) !important; }
  .page-banner h1 { font-size: clamp(2.6rem, 8.8vw, 4.6rem) !important; }
}
@media (max-width: 700px) {
  .page-banner::before {
    background: linear-gradient(90deg, rgba(18,41,31,.82) 0%, rgba(18,41,31,.57) 43%, rgba(18,41,31,.18) 75%, rgba(18,41,31,.03) 100%) !important;
  }
  .page-banner > .container {
    padding: 0 22px !important;
    align-items: center !important;
  }
  .page-banner .hero-copy { width: min(58%, 340px) !important; }
  .page-banner h1 {
    max-width: 100% !important;
    font-size: clamp(2.2rem, 9.5vw, 3.5rem) !important;
    line-height: 1.02 !important;
  }
}
@media (max-width: 430px) {
  .page-banner > .container { padding: 0 20px !important; }
  .page-banner .hero-copy { width: 57% !important; }
  .page-banner h1 { font-size: clamp(2rem, 9.8vw, 3rem) !important; }
}
'''


def clean_previous(text: str) -> str:
    # Remove the previous page-specific unified hero style blocks and the class-adding script.
    text = re.sub(r'\n<style>\n/\* Kalidad unified full-screen hero treatment \*/.*?</style>\n', '\n', text, flags=re.S)
    text = re.sub(r'\n<style>\n/\* Kalidad unified hero image refinement \*/.*?</style>\n', '\n', text, flags=re.S)
    text = re.sub(r'\n<script>\n\(function\(\)\{\n  var hero = document\.querySelector\(\'\.hero\'\) \|\| document\.querySelector\(\'\.page-banner\'\);.*?</script>\n', '\n', text, flags=re.S)
    return text


def apply(path: str, css: str):
    p = Path(path)
    text = p.read_text(encoding='utf-8')
    text = clean_previous(text)
    text = re.sub(r'\n<style id="hero-two-page-final">.*?</style>\n', '\n', text, flags=re.S)
    marker = '<style id="hero-two-page-final">\n' + css + '\n</style>\n'
    if '</head>' not in text:
        raise SystemExit(f'{path}: missing </head>')
    text = text.replace('</head>', marker + '</head>', 1)
    p.write_text(text, encoding='utf-8')

apply('index.html', INDEX_CSS)
apply('services.html', SERVICES_CSS)
print('Reworked index.html and services.html')

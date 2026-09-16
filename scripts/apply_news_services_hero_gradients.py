from pathlib import Path

NEWS_STYLE = '''<style id="kalidad-final-news-gradient-fix">
.news-hero {
  position: relative !important;
  background-image: url('pharmacist_green_scrubs.webp') !important;
  background-position: center 38% !important;
  background-size: cover !important;
  background-repeat: no-repeat !important;
}
.news-hero::before {
  content: "" !important;
  display: block !important;
  position: absolute !important;
  inset: 0 !important;
  z-index: 1 !important;
  pointer-events: none !important;
  background: linear-gradient(90deg, rgba(18,41,31,.86) 0%, rgba(18,41,31,.70) 25%, rgba(18,41,31,.38) 48%, rgba(18,41,31,.12) 72%, rgba(18,41,31,.02) 100%) !important;
}
.news-hero .container,
.news-hero .hero-copy {
  position: relative !important;
  z-index: 3 !important;
}
.news-hero-mobile-img {
  z-index: 0 !important;
}
@media (max-width: 900px) {
  .news-hero {
    background-image: none !important;
  }
  .news-hero::before {
    background: linear-gradient(90deg, rgba(18,41,31,.84) 0%, rgba(18,41,31,.66) 30%, rgba(18,41,31,.34) 58%, rgba(18,41,31,.08) 100%) !important;
  }
}
</style>'''

SERVICES_STYLE = '''<style id="kalidad-final-services-gradient-fix">
.page-banner .hero-image {
  z-index: 0 !important;
}
.page-banner .hero-image img {
  position: relative !important;
  z-index: 0 !important;
}
.page-banner .hero-image::before {
  content: "" !important;
  display: block !important;
  position: absolute !important;
  inset: 0 !important;
  z-index: 1 !important;
  pointer-events: none !important;
  background: linear-gradient(90deg, rgba(18,41,31,.86) 0%, rgba(18,41,31,.70) 25%, rgba(18,41,31,.38) 48%, rgba(18,41,31,.12) 72%, rgba(18,41,31,.02) 100%) !important;
}
.page-banner .hero-copy {
  position: relative !important;
  z-index: 3 !important;
}
@media (max-width: 900px) {
  .page-banner .hero-image::before {
    background: linear-gradient(90deg, rgba(18,41,31,.84) 0%, rgba(18,41,31,.66) 30%, rgba(18,41,31,.34) 58%, rgba(18,41,31,.08) 100%) !important;
  }
}
</style>'''

CONTACT_STYLE = '''<style id="kalidad-final-contact-gradient-fix">
/* Final Contact hero: full-bleed pharmacy photograph with a forest-green readability fade from the left. */
.page-banner {
  position: relative !important;
  min-height: calc(100svh - 84px) !important;
  display: flex !important;
  align-items: center !important;
  overflow: hidden !important;
  padding: 72px 0 !important;
  color: #fff !important;
  background-image: url('kalidad_pharmacy_scene.webp') !important;
  background-position: center center !important;
  background-size: cover !important;
  background-repeat: no-repeat !important;
  background-color: #12291F !important;
}
.page-banner::before {
  content: "" !important;
  position: absolute !important;
  inset: 0 !important;
  z-index: 1 !important;
  pointer-events: none !important;
  background: linear-gradient(90deg, rgba(18,41,31,.88) 0%, rgba(18,41,31,.76) 24%, rgba(18,41,31,.46) 48%, rgba(18,41,31,.18) 72%, rgba(18,41,31,.04) 100%) !important;
}
.page-banner .blob {
  display: none !important;
}
.page-banner > .container,
.page-banner .container,
.page-banner .hero-copy {
  position: relative !important;
  z-index: 3 !important;
}
.page-banner h1 {
  color: #fff !important;
}
.page-banner p {
  color: #fff !important;
  opacity: .94 !important;
}
.page-banner .kicker {
  color: #C7EF3E !important;
}
.page-banner .breadcrumb {
  color: #fff !important;
  opacity: .86 !important;
}
@media (max-width: 900px) {
  .page-banner {
    min-height: calc(100svh - 70px) !important;
    padding: 64px 0 76px !important;
    background-position: 62% center !important;
  }
  .page-banner::before {
    background: linear-gradient(90deg, rgba(18,41,31,.88) 0%, rgba(18,41,31,.76) 28%, rgba(18,41,31,.48) 58%, rgba(18,41,31,.14) 82%, rgba(18,41,31,.03) 100%) !important;
  }
}
</style>'''


def patch_page(filename: str, style_id: str, style: str) -> bool:
    path = Path(filename)
    text = path.read_text(encoding='utf-8')
    if style_id in text:
        print(f'{filename}: patch already present')
        return False
    if '</head>' not in text:
        raise SystemExit(f'{filename}: missing </head>')
    path.write_text(text.replace('</head>', style + '\n</head>', 1), encoding='utf-8')
    print(f'{filename}: hero gradient patch added')
    return True


changed = False
changed |= patch_page('news.html', 'kalidad-final-news-gradient-fix', NEWS_STYLE)
changed |= patch_page('services.html', 'kalidad-final-services-gradient-fix', SERVICES_STYLE)
changed |= patch_page('contact.html', 'kalidad-final-contact-gradient-fix', CONTACT_STYLE)
print('Changes made:', changed)

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
print('Changes made:', changed)

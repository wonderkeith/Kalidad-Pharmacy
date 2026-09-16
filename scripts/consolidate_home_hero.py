from pathlib import Path
import re

path = Path('index.html')
text = path.read_text(encoding='utf-8')

# Remove the temporary/overlapping home-hero height blocks. The surrounding
# hero typography, layout, slider markup and non-height rules remain intact.
for style_id in (
    'kalidad-hero-full-coverage-fix',
    'mobile-hero-full-height-override',
    'hero-two-page-final',
):
    text, _ = re.subn(
        rf'\s*<style\s+id=["\']{re.escape(style_id)}["\'][^>]*>.*?</style>\s*',
        '\n',
        text,
        count=1,
        flags=re.S | re.I,
    )

marker = '</head>'
if marker not in text:
    raise SystemExit('index.html: </head> not found')

final_css = r'''
<style id="kalidad-home-hero-final">
/* ==========================================================
   KALIDAD HOME HERO — single authoritative implementation
   Keeps the existing photography/slider and mobile composition,
   while eliminating the competing height overrides.
   ========================================================== */
.hero-reference {
    position: relative !important;
    width: 100% !important;
    height: calc(100dvh - 84px) !important;
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

.hero-reference-bg.hero-reference-image-1 {
    background-image: url("image-07-caa3270325.webp") !important;
}
.hero-reference-bg.hero-reference-image-2 {
    background-image: url("image-08-99b804a9ad.webp") !important;
}
.hero-reference-bg.hero-reference-image-3 {
    background-image: url("image-09-b2d22f9d65.webp") !important;
}

.hero-reference::before {
    content: "" !important;
    position: absolute !important;
    inset: 0 !important;
    z-index: 1 !important;
    pointer-events: none !important;
    background: linear-gradient(
        90deg,
        rgba(18,41,31,.84) 0%,
        rgba(18,41,31,.64) 25%,
        rgba(18,41,31,.22) 52%,
        rgba(18,41,31,.02) 78%,
        rgba(18,41,31,0) 100%
    ) !important;
}
.hero-reference::after {
    display: none !important;
    content: none !important;
}

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
    z-index: 3 !important;
    width: min(680px, 52vw) !important;
    max-width: 680px !important;
    min-height: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
    display: grid !important;
    align-items: center !important;
}

.hero-reference-slide {
    grid-area: 1 / 1 !important;
}
.hero-reference-slide h1 {
    max-width: 680px !important;
    margin: 0 !important;
    color: #fff !important;
    font-size: clamp(3.2rem, 5.7vw, 5.8rem) !important;
    line-height: .98 !important;
    letter-spacing: -.045em !important;
    text-shadow: 0 3px 24px rgba(0,0,0,.38) !important;
}
.hero-reference-slide h1 .accent {
    color: #C7EF3E !important;
}
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
    .hero-reference {
        height: 100svh !important;
        min-height: 600px !important;
    }
    .hero-reference-content {
        padding: 0 24px !important;
    }
    .hero-reference-copy {
        width: min(620px, 62vw) !important;
    }
    .hero-reference-slide h1 {
        font-size: clamp(2.6rem, 8.8vw, 4.6rem) !important;
    }
}

@media (max-width: 700px) {
    .hero-reference-bg,
    .hero-reference-bg.hero-reference-image-1,
    .hero-reference-bg.hero-reference-image-2,
    .hero-reference-bg.hero-reference-image-3 {
        background-size: cover !important;
        background-position: center center !important;
    }
    .hero-reference-bg.hero-reference-image-1 {
        background-image: url("mobile-hero-1.webp") !important;
    }
    .hero-reference-bg.hero-reference-image-2 {
        background-image: url("mobile-hero-2.webp") !important;
    }
    .hero-reference-bg.hero-reference-image-3 {
        background-image: url("mobile-hero-3.webp") !important;
    }
    .hero-reference::before {
        background: linear-gradient(
            90deg,
            rgba(18,41,31,.82) 0%,
            rgba(18,41,31,.57) 43%,
            rgba(18,41,31,.18) 75%,
            rgba(18,41,31,.03) 100%
        ) !important;
    }
    .hero-reference-content {
        padding: 0 22px !important;
        align-items: center !important;
        justify-content: flex-start !important;
    }
    .hero-reference-copy {
        width: min(58%, 340px) !important;
    }
    .hero-reference-slide h1 {
        max-width: 100% !important;
        font-size: clamp(2.2rem, 9.5vw, 3.5rem) !important;
        line-height: 1.02 !important;
    }
    .hero-reference .hero-reference-prev,
    .hero-reference .hero-reference-next {
        display: none !important;
    }
    .hero-reference-dots {
        left: 22px !important;
        bottom: 28px !important;
    }
}

@media (max-width: 430px) {
    .hero-reference-content {
        padding: 0 20px !important;
    }
    .hero-reference-copy {
        width: 57% !important;
    }
    .hero-reference-slide h1 {
        font-size: clamp(2rem, 9.8vw, 3rem) !important;
    }
}
</style>
'''

# Replace an older generated final block if a previous run left one behind.
text, _ = re.subn(
    r'\s*<style\s+id=["\']kalidad-home-hero-final["\'][^>]*>.*?</style>\s*',
    '\n',
    text,
    count=1,
    flags=re.S | re.I,
)
text = text.replace(marker, final_css + '\n' + marker, 1)
path.write_text(text, encoding='utf-8')

# Lightweight validation of the actual source we just produced.
final = path.read_text(encoding='utf-8')
required = [
    'kalidad-home-hero-final',
    'height: calc(100dvh - 84px)',
    'height: 100svh',
    'background-image: url("image-07-caa3270325.webp")',
    'background-image: url("mobile-hero-1.webp")',
    'hero-reference::before',
]
for token in required:
    if token not in final:
        raise SystemExit(f'index.html: missing expected token: {token}')
for stale in ('kalidad-hero-full-coverage-fix', 'mobile-hero-full-height-override', 'hero-two-page-final'):
    if f'id="{stale}"' in final or f"id='{stale}'" in final:
        raise SystemExit(f'index.html: stale hero style block remains: {stale}')

print('Home hero consolidation complete and validated.')

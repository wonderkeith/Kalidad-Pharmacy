from pathlib import Path

p = Path("theme.js")
s = p.read_text(encoding="utf-8")

old = """      '.service-detail-hero .service-detail-image img{display:block!important;width:100%!important;height:100%!important;min-width:100%!important;min-height:100%!important;object-fit:cover!important;object-position:center!important;}' +
      '.service-detail-hero .service-detail-copy{position:relative!important;z-index:2!important;width:100%!important;height:100%!important;min-height:100svh!important;padding:130px 7vw 90px!important;display:flex!important;flex-direction:column!important;justify-content:center!important;align-items:flex-start!important;background:transparent!important;}' +
      '.service-detail-hero .service-detail-copy h1{color:#fff!important;text-shadow:0 2px 18px rgba(0,0,0,.34)!important;}' +
      '.service-detail-hero .service-detail-copy .lead{color:rgba(255,255,255,.96)!important;text-shadow:0 1px 12px rgba(0,0,0,.30)!important;}' +
      '.service-detail-hero::before,.service-detail-hero::after{background:none!important;display:none!important;content:none!important;}' +"""
new = """      '.service-detail-hero .service-detail-image img{display:block!important;width:100%!important;height:100%!important;min-width:100%!important;min-height:100%!important;object-fit:cover!important;object-position:center!important;}' +
      '.service-detail-hero .service-detail-image::after{content:\"\"!important;position:absolute!important;inset:0!important;display:block!important;background:linear-gradient(90deg,rgba(18,41,31,.68) 0%,rgba(18,41,31,.45) 28%,rgba(18,41,31,.12) 58%,rgba(18,41,31,.02) 100%)!important;z-index:2!important;pointer-events:none!important;}' +
      '.service-detail-hero .service-detail-copy{position:relative!important;z-index:3!important;width:100%!important;height:100%!important;min-height:100svh!important;padding:130px 7vw 90px!important;display:flex!important;flex-direction:column!important;justify-content:center!important;align-items:flex-start!important;background:transparent!important;}' +
      '.service-detail-hero .service-detail-copy h1{color:#fff!important;text-shadow:0 2px 18px rgba(0,0,0,.34)!important;}' +
      '.service-detail-hero .service-detail-copy h1 .accent{color:#C7EF3E!important;}' +
      '.service-detail-hero .service-detail-copy .lead{color:rgba(255,255,255,.96)!important;text-shadow:0 1px 12px rgba(0,0,0,.30)!important;}' +
      '.service-detail-hero .service-detail-copy .kicker{background:rgba(230,243,217,.9)!important;color:#33581F!important;}' +
      '.service-detail-hero .service-detail-copy .btn-outline{border-color:#fff!important;color:#fff!important;background:rgba(18,41,31,.12)!important;}' +
      '.service-detail-hero::before,.service-detail-hero::after{background:none!important;display:none!important;content:none!important;}' +"""
if old not in s:
    raise SystemExit("service hero block not found")
s = s.replace(old, new, 1)

old = """      '@media(max-width:850px){.service-detail-hero{min-height:100svh!important;height:100svh!important;}.service-detail-hero .service-detail-image{position:absolute!important;inset:0!important;height:100%!important;min-height:100%!important;}.service-detail-hero .service-detail-copy{height:100svh!important;min-height:100svh!important;padding:115px 28px 60px!important;}}' +"""
new = """      '@media(max-width:850px){.service-detail-hero{min-height:100svh!important;height:100svh!important;}.service-detail-hero .service-detail-image{position:absolute!important;inset:0!important;height:100%!important;min-height:100%!important;}.service-detail-hero .service-detail-image::after{background:linear-gradient(90deg,rgba(18,41,31,.66) 0%,rgba(18,41,31,.36) 55%,rgba(18,41,31,.12) 100%)!important;}.service-detail-hero .service-detail-copy{height:100svh!important;min-height:100svh!important;padding:115px 28px 60px!important;}}' +"""
if old not in s:
    raise SystemExit("service mobile block not found")
s = s.replace(old, new, 1)

old = """      '.page-banner .hero-copy h1,.page-banner h1,.service-detail-hero .service-detail-copy h1,.service-detail-hero h1{color:#1E4F3B!important;}' +
      '.page-banner .hero-copy h1 .accent,.page-banner h1 .accent,.service-detail-hero .service-detail-copy h1 .accent,.service-detail-hero h1 .accent{color:#C7EF3E!important;}');"""
new = """      '.page-banner .hero-copy h1,.page-banner h1{color:#1E4F3B!important;}' +
      '.page-banner .hero-copy h1 .accent,.page-banner h1 .accent{color:#C7EF3E!important;}' +
      '.service-detail-hero .service-detail-copy h1,.service-detail-hero h1{color:#fff!important;}' +
      '.service-detail-hero .service-detail-copy h1 .accent,.service-detail-hero h1 .accent{color:#C7EF3E!important;}');"""
if old not in s:
    raise SystemExit("last-word block not found")
s = s.replace(old, new, 1)

p.write_text(s, encoding="utf-8")
print("theme.js patched successfully")

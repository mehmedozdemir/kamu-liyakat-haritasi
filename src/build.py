"""src/ altındaki parçalardan sayfayı birleştirir; deponun köküne kurulabilir PWA dosyalarını yazar.
Kullanım: python3 src/build.py  (Pillow gerekir: pip install pillow)"""
import json, re, shutil, hashlib, zipfile, pathlib
from PIL import Image, ImageDraw

SRC = pathlib.Path(__file__).parent
OUT = SRC.parent
(OUT / "icons").mkdir(exist_ok=True)

rd = lambda n: (SRC / n).read_text(encoding="utf-8")
html = rd("head.html").replace("@@YONTEM@@", rd("yontem.html")) + rd("data.js") + rd("ui.js")
ver = hashlib.sha1(html.encode()).hexdigest()[:10]

# --- ikonlar: kırmızı zemin, beyaz eksenler ve saçılım noktaları ---
def icon(size, maskable=False):
    s = 4  # süper örnekleme
    W = size * s
    im = Image.new("RGBA", (W, W), (200, 16, 46, 255))
    d = ImageDraw.Draw(im)
    pad = int(W * (0.24 if maskable else 0.17))
    x0, y0, x1, y1 = pad, pad, W - pad, W - pad
    lw = max(2, W // 40)
    d.line([(x0, y0), (x0, y1), (x1, y1)], fill="white", width=lw, joint="curve")
    pts = [(0.18, 0.72), (0.35, 0.55), (0.48, 0.62), (0.62, 0.38), (0.78, 0.22), (0.86, 0.45)]
    r = W // 22
    for i, (px, py) in enumerate(pts):
        cx = x0 + (x1 - x0) * px
        cy = y0 + (y1 - y0) * py
        if i == 4:
            d.ellipse([cx - r * 1.4, cy - r * 1.4, cx + r * 1.4, cy + r * 1.4], fill="white")
        else:
            d.ellipse([cx - r, cy - r, cx + r, cy + r], outline="white", width=lw)
    if not maskable:
        m = Image.new("L", (W, W), 0)
        ImageDraw.Draw(m).rounded_rectangle([0, 0, W, W], radius=W // 5, fill=255)
        im.putalpha(m)
    return im.resize((size, size), Image.LANCZOS)

for sz in (192, 512):
    icon(sz).save(OUT / "icons" / f"icon-{sz}.png")
    icon(sz, True).save(OUT / "icons" / f"maskable-{sz}.png")
icon(180, True).convert("RGB").save(OUT / "icons" / "apple-touch-icon.png")

manifest = {
    "name": "Kamu Yöneticileri Liyakat Haritası",
    "short_name": "Liyakat",
    "description": "Türkiye kamu kurumlarının başındaki yöneticilerin özgeçmiş ve liyakat puanları",
    "lang": "tr",
    "start_url": "./",
    "scope": "./",
    "display": "standalone",
    "orientation": "any",
    "background_color": "#ffffff",
    "theme_color": "#c8102e",
    "icons": [
        {"src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png"},
        {"src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png"},
        {"src": "icons/maskable-192.png", "sizes": "192x192", "type": "image/png", "purpose": "maskable"},
        {"src": "icons/maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"},
    ],
}
(OUT / "manifest.webmanifest").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")

sw = f"""// Önbellek sürümü index.html içeriğinden üretilir; yeni sürüm yayınlanınca eskisi silinir.
const V = "liyakat-{ver}";
const SHELL = ["./", "./index.html", "./manifest.webmanifest",
  "./icons/icon-192.png", "./icons/icon-512.png", "./icons/apple-touch-icon.png"];
self.addEventListener("install", e => {{
  e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
}});
self.addEventListener("activate", e => {{
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
}});
self.addEventListener("fetch", e => {{
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  // Sayfa: önce ağ (güncel veri), çevrimdışıysa önbellek
  if (req.mode === "navigate") {{
    e.respondWith(fetch(req).then(r => {{ const c = r.clone(); caches.open(V).then(x => x.put("./index.html", c)); return r; }})
      .catch(() => caches.match("./index.html")));
    return;
  }}
  // Yazı tipleri ve kendi dosyalarımız: önbellekten ver, arkada yenile
  if (url.origin === location.origin || /fonts\\.(googleapis|gstatic)\\.com$/.test(url.hostname)) {{
    e.respondWith(caches.open(V).then(async c => {{
      const hit = await c.match(req);
      const net = fetch(req).then(r => {{ if (r.ok || r.type === "opaque") c.put(req, r.clone()); return r; }}).catch(() => hit);
      return hit || net;
    }}));
  }}
}});
"""
(OUT / "sw.js").write_text(sw, encoding="utf-8")

head = """<meta name="theme-color" content="#c8102e">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" type="image/png" sizes="192x192" href="icons/icon-192.png">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Liyakat">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
"""
reg = """<div id="pwabar" hidden style="position:fixed;left:50%;bottom:calc(16px + env(safe-area-inset-bottom));transform:translateX(-50%);z-index:9;display:flex;gap:10px;align-items:center;padding:10px 12px 10px 16px;border-radius:10px;background:#16181b;color:#fff;font:500 14px 'Libre Franklin',sans-serif;box-shadow:0 6px 24px rgb(0 0 0/.3)"><span id="pwamsg"></span><button id="pwabtn" hidden style="height:40px;padding:0 14px;border:0;border-radius:8px;background:#c8102e;color:#fff;font:600 14px inherit;cursor:pointer">Yenile</button></div>
<script>
{
const bar=document.getElementById("pwabar"),msg=document.getElementById("pwamsg"),btn=document.getElementById("pwabtn");
const show=(t,b)=>{msg.textContent=t;btn.hidden=!b;bar.hidden=false};
addEventListener("offline",()=>show("Çevrimdışısınız; son kaydedilen veriler gösteriliyor.",false));
addEventListener("online",()=>{if(btn.hidden)bar.hidden=true});
if(!navigator.onLine)show("Çevrimdışısınız; son kaydedilen veriler gösteriliyor.",false);
btn.addEventListener("click",()=>location.reload());
if ("serviceWorker" in navigator && location.protocol === "https:") {
  addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").then(r => {
      r.addEventListener("updatefound", () => {
        const w = r.installing;
        w && w.addEventListener("statechange", () => {
          if (w.state === "activated" && navigator.serviceWorker.controller) show("Yeni veriler hazır.", true);
        });
      });
    }).catch(() => {});
  });
}
}
</script>
"""
out = html.replace("</title>\n", "</title>\n" + head, 1)
out = out.replace("</body>", reg + "</body>", 1)
assert out.count('rel="manifest"') == 1 and out.count("register(\"sw.js\")") == 1
(OUT / "index.html").write_text(out, encoding="utf-8")

(OUT / ".nojekyll").write_text("")
print("ok", ver)

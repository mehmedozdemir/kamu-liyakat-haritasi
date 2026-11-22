# Kamu Yöneticileri Liyakat Haritası

Türkiye'de görevdeki üst düzey kamu yöneticilerinin (Cumhurbaşkanlığı, bakanlıklar, düzenleyici kurullar, bağlı kurumlar, KİT'ler, yüksek yargı, TBMM ve TSK) belgelenmiş eğitim ve kariyerine göre hesaplanan iki skoru gösteren, telefona kurulabilen (PWA) tek sayfalık web uygulaması.

- **Özgeçmiş (100):** eğitim 30, toplam deneyim 25, yöneticilik 25, yayın/sertifika 10, uluslararası deneyim 10
- **Liyakat (100):** alan uyumu 30, sektör deneyimi 30, kurum içi kariyer 15, önceki görevin bu göreve benzerliği 25

Siyasi görüş ve parti üyeliği puana girmez. Ayrıntılı kurallar sayfadaki "Puanlar nasıl hesaplandı?" bölümünde.

> **Resmî bir değerlendirme değildir.** Veriler açık kaynaklardan derlendi (son kontrol: 22 Kasım 2026); eksik ya da güncelliğini yitirmiş bilgi içerebilir. Skor, belgelenmiş özgeçmişin göreve uygunluğunu ölçer; kişinin görevdeki performansını ya da kararlarını ölçmez.

## Yayınlama (GitHub Pages)

Settings → Pages → Source: **Deploy from a branch**, Branch: **main**, klasör: **/ (root)**.
Birkaç dakika içinde `https://mehmedozdemir.github.io/kamu-liyakat-haritasi/` adresinde açılır.

## Telefona kurma

- **Android (Chrome):** adresi açın → menü → *Uygulamayı yükle*
- **iPhone (Safari):** adresi açın → Paylaş → *Ana Ekrana Ekle*

İlk açılıştan sonra çevrimdışı da çalışır; yeni sürüm yayınlandığında uygulama "Yeni veriler hazır" uyarısı gösterir.

## Yapı

| Yol | İçerik |
|---|---|
| `index.html`, `manifest.webmanifest`, `sw.js`, `icons/` | Üretilmiş, yayınlanan dosyalar (elle düzenlemeyin) |
| `src/data.js` | Kişi kayıtları ve alt puanlar |
| `src/ui.js` | Arayüz kodu |
| `src/head.html` | Stil ve sayfa iskeleti |
| `src/yontem.html` | Puanlama yöntemi metni |
| `src/build.py` | Parçaları birleştirip kök dizindeki dosyaları üretir |

## Güncelleme

```bash
pip install pillow
python3 src/build.py
git add -A && git commit -m "Veri güncellemesi" && git push
```

Service worker önbellek sürümü sayfa içeriğinden otomatik üretilir; her yayında kullanıcılar yeni sürümü alır.

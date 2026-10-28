# SE Primer: Yazılım Mühendisliği Kriz & Karar Simülatörü

> **YZM301 · ÖDEV PROJESİ (1 HAFTA)**  
> **Slogan:** *"Kişiye uyum sağlayan kitap, bu kez yazılım mühendisi için: oyuncu karar verir, uygulama o kararın teknik sonucunu gösterir."*  
> **Yöntem & Teknolojiler:** Google Stitch (UI Tasarımı) → Google AI Studio / Gemini API (Sokratik Tutor) → Cypress (E2E Test & Otomasyon)

---

## 📌 Proje Özeti ve Pedagojik Amaç

**SE Primer**, Neal Stephenson'ın *The Diamond Age* eserindeki interaktif kitaptan ilham alan, yazılım mühendisliği öğrencilerine üretim (production) kriz anlarında mimari, test ve regülasyon kararlarının gerçek dünya sonuçlarını deneyimleten bir karar simülasyonudur.

Sabah 08:00'de nöbetçi mühendisin karşısına çıkan **"300 hasta bekliyor, randevu sistemi çöktü!"** krizi üzerinden oyuncuya 3 kritik karar verdirilir. Sistem her kararın arkasındaki teknik mantığı (**"Ne Oldu, Neden Oldu?"**) anında açıklarken, **Sokratik AI Tutor** asla doğrudan cevabı söylemeden adayın doğru mühendislik muhakemesini yapmasını sağlar.

---

## ⚖️ Ürün Kararı: Yapılmayan 3 Özellik ve Nedenleri (10 Puan)

Simülasyonun odak noktasını korumak ve pedagojik etkiyi maksimize etmek amacıyla aşağıdaki 3 özellik bilinçli olarak kapsam dışı bırakılmıştır:

1. **Kullanıcı Kaydı ve Giriş Sistemi (Authentication):** Öğrencinin kriz anı psikolojisine ve simülasyona doğrudan sıfır sürtünmeyle erişebilmesi için kullanıcı hesabı ve parola mekanizması eklenmemiştir.
2. **Çok Bölümlü / Çok Senaryolu Hikaye Akışı:** Tek bir sağlık krizinin mimari, test ve KVKK boyutlarındaki derinliğini ve sebep-sonuç ilişkisini dağıtmamak adına ikinci bölüm yapılmamıştır.
3. **Native Mobil Uygulama (iOS / Android Paketleme):** Öğrencilerin ve değerlendiricilerin herhangi bir kurulum veya mağaza onayı gerekmeksizin doğrudan mobil tarayıcı veya AI Studio web bağlantısı üzerinden anında oynayabilmesi için native uygulama yerine responsive mobil web tercih edilmiştir.

---

## 🏆 Teslim Edilen Bileşenler ve Puanlama Tablosu

| Teslim Bileşeni | Dosya / Kanıt | Açıklama | Puan |
|-----------------|---------------|----------|------|
| **1. Spesifikasyon** | [`spec.md`](./spec.md) | Problem tanımı, kapsam dışı maddeler, 5 kabul örneği (Given-When-Then) ve Sommerville Bölüm 5 durum makinesi / Mermaid akış şeması. | **20** |
| **2. Tasarım** | [`DESIGN.md`](./DESIGN.md) + Stitch Ekranları | SRE acil durum glassmorphism tasarım sistemi, tipografi, renkler ve 3 mobil ekran mimarisi (Giriş, Sahne, Sonuç). | **15** |
| **3. Çalışan Uygulama** | [`index.html`](./index.html), [`app.js`](./app.js), [`style.css`](./style.css) | Telefonda ve webde baştan sona oynanabilen, kişiselleştirilmiş (Yeni Başlayan / Deneyimli 60sn süre baskısı), Ne Oldu/Neden Oldu panelli interaktif simülatör. | **20** |
| **4. AI Tutor Eval** | [`eval.md`](./eval.md) | 20 farklı öğrenci sorusu, model çıktıları, elle etiketleme (SOK-OK, ERR-LEAK, ERR-LEAD), %90 Sokratik başarı oranı ve hata analizi. | **25** |
| **5. Cypress E2E** | [`cypress/e2e/se_primer.cy.js`](./cypress/e2e/se_primer.cy.js) | Onboarding, Yol A (İyi Son), Yol B (Kötü Son), Sokratik Tutor ve zamanlayıcı dahil tüm yolları test eden kapsamlı E2E paketi. | **10** |
| **6. Ürün Kararı** | [`README.md`](./README.md) | Bilinçli olarak yapılmayan 3 özelliğin tek cümlelik gerekçeleri, mimari ve kılavuz. | **10** |
| **TOPLAM** | **Tek Repo, Eksiksiz Teslim** | **100 / 100** |

---

## 🎮 Oynanış ve Karar Dallanmaları

```
                                [BAŞLANGIÇ: 08:00 KRİZİ]
                             300 Hasta Bekliyor · Sistem 500
                                           │
                                           ▼
                                [KARAR 1 · MİMARİ]
                     ┌─────────────────────┴─────────────────────┐
                     ▼                                           ▼
             [A) Rollback]                                [B) Canlıda Yama]
         Eski kararlı sürüme dön                       Canlı container üzerinde
         (DB şema riski uyarısı)                       (Teknik borç & sızıntı riski)
                     │                                           │
                     └─────────────────────┬─────────────────────┘
                                           │
                                           ▼
                                  [KARAR 2 · TEST]
                     ┌─────────────────────┴─────────────────────┐
                     ▼                                           ▼
            [A) Kısa Test Koş]                           [B) Hemen Yayına Al]
        3 dk duman testi (+3 dk SLA)                    Testsiz hızlı deploy
        (Sıfır beklenmedik çöküş)                       (Eşzamanlılık riski)
                     │                                           │
                     └─────────────────────┬─────────────────────┘
                                           │
                                           ▼
                                  [KARAR 3 · KVKK]
                     ┌─────────────────────┴─────────────────────┐
                     ▼                                           ▼
             [A) Logu Maskele]                           [B) Olduğu Gibi At]
        PII regex filtreleme uygula                     Ham logları kanala at
        (Hasta adı ve T.C. korunur)                     (Hasta bilgileri sızar)
                     │                                           │
                     ▼                                           ▼
             [SON A · İYİ SON]                           [SON B · KÖTÜ SON]
     08:25 Sistem Ayakta, Veri Güvende           Sistem Ayakta ama KVKK İhlali!
          (95 Puan · Sıfır Ceza)                 (45 Puan · Ağır İdari Para Cezası)
```

---

## 🤖 Sokratik AI Tutor İlkesi

Simülatör içerisindeki AI Tutor, öğrenciye **asla doğru cevabı söylemez**.
- **Örnek Soru:** *"Rollback mi yapayım, canlıda yama mı?"*
- **Sokratik Tutor Cevabı:** *"Panik yapma. Eski sürüme dönersen dünkü veri tabanı migrasyonları ne olacak? Canlıda yama yaparsan 300 hastayı bekletmeden ne kadar sürede kodu doğrulayabilirsin? Sence hangisinin geri dönüş maliyeti daha yüksek?"*

> **Google AI Studio (Gemini) Desteği:**  
> Uygulama yerleşik akıllı kurallarla tamamen offline çalışabileceği gibi, arayüzdeki ⚙️ ayarlar ikonundan kendi Google AI Studio API anahtarınızı girerek canlı Gemini modelleriyle de çalıştırılabilir.

---

## 🚀 Projeyi Çalıştırma Kılavuzu

### Gereksinimler
- Node.js (v18 veya üzeri)
- npm

### 1. Bağımlılıkları Yükleme
```bash
npm install
```

### 2. Geliştirme Sunucusunu Başlatma
```bash
npm run dev
```
Tarayıcınızda `http://localhost:5173` adresine giderek simülasyonu telefonda oynar gibi deneyimleyebilirsiniz.

### 3. Cypress E2E Testlerini Çalıştırma (Tüm Yolların Test Edilmesi)
Uygulama çalışırken arka planda tüm testleri koşturmak için:
```bash
npx cypress run
```
İnteraktif test arayüzünü açmak için:
```bash
npm run test:open
```

---

## 🔗 Teslim Linkleri
- **GitHub Deposu:** `https://github.com/beratisik0/se_primer`
- **AI Studio / Web Uygulama Linki:** `http://localhost:5173` (veya Vercel/Firebase canlı linki)
- **YouTube Tanıtım Videosu:** [YouTube İzle](https://www.youtube.com/watch?v=veszuU-uWsY) (`se_primer_tanitim_videosu.mp4`)

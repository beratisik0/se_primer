# SE Primer - Mobil Arayüz ve Tasarım Spesifikasyonu (`DESIGN.md`)

**Ders:** YZM301 Yazılım Mühendisliği  
**Tasarım Yaklaşımı:** Google Stitch ilkeleri doğrultusunda Mobile-First, Yüksek Kontrastlı Acil Durum / Kriz Arayüzü (SRE Emergency Glassmorphism)  
**Hedef Cihaz Viewport:** 390px × 844px (iPhone 12/13/14 Pro referans standardı) ve tam duyarlı (responsive) mobil web.

> **Görsel Mockup:** 3 Mobil Ekran (Onboarding, Kriz Sahnesi, Post-Mortem) Google Stitch yüksek çözünürlüklü vektör mimarisi:  
> ![Google Stitch Mobil Ekranları](file:///c:/Users/Brt/OneDrive/Masaüstü/se_primer/assets/stitch_screens.svg)

---

## 1. Tasarım Sistemi (Design System & Tokens)

Simülasyon, sabah 08:00'de sistem çökmesi yaşayan bir nöbetçi mühendisin yaşadığı psikolojik ve teknik stresi yansıtmak üzere karanlık, odaklanmayı artıran bir görsel dil kullanır.

### 1.1. Renk Paleti (Color Tokens)
- **Arka Plan (Deep Space SRE):** `#0a0e17` - Göz yormayan, OLED dostu derin lacivert-siyah.
- **Yüzey / Kartlar (Glass Surface):** `rgba(20, 27, 45, 0.75)` ve `backdrop-filter: blur(12px)` ile cam efekti.
- **Vurgu / Kriz Alarm Rengi (Emergency Red):** `#ff3b5c` - Kritik sistem hataları, geri sayım sayacı ve çöküş uyarıları için.
- **Başarı Rengi (Safe Green):** `#00e676` - Başarılı testler, güvenli veri ve Son A için.
- **AI Tutor Rengi (Socratic Violet / Cyan):** `#8a2be2` / `#00d2ff` - AI Tutor rehberliği, ipuçları ve Sokratik sorular için.
- **Metin Renkleri:** 
  - Ana Başlıklar: `#ffffff`
  - Gövde Metni: `#cfd8dc`
  - Log & Konsol Metni: `#00ff66` (Terminal Yeşili) ve `#81c784`

### 1.2. Tipografi (Typography)
- **Ana Arayüz:** Google Fonts `Inter`, `-apple-system`, `BlinkMacSystemFont`, sans-serif.
- **Teknik Log & Kod Konsolu:** `JetBrains Mono`, `Fira Code`, monospace font ailesi.
- **Hiyerarşi:**
  - `H1` (Kriz Başlığı): 22px / 1.2 Bold
  - `H2` (Karar Başlığı): 17px / 1.3 Semi-Bold
  - `Body`: 14px / 1.5 Regular
  - `Log/Console`: 12px / 1.4 Monospace
  - `Badge / Tag`: 11px / 1.0 Bold Uppercase

---

## 2. Üç Mobil Ekran Mimarisi (Stitch Screens)

### 2.1. Ekran 1: Giriş & Kişiselleştirilmiş Onboarding (`Screen-1: Onboarding`)

Bu ekran oyuncunun profilini tanımlayarak simülasyonun dinamik anlatısını şekillendirir.

```
+---------------------------------------+
|  [⚡ SE PRIMER]          08:00 CRISIS |
+---------------------------------------+
|                                       |
|  Kişiye Uyum Sağlayan Kitap           |
|  YAZILIM MÜHENDİSİ İÇİN SİMÜLATÖR     |
|                                       |
|  1. Seviyen Nedir?                    |
|  [🌱 Yeni Başladım]  [🔥 Deneyimliyim]|
|  (İpucu desteği)     (60 sn süre şoku)|
|                                       |
|  2. Uzmanlık Rolün Nedir?             |
|  [Backend]  [Frontend]  [DevOps]      |
|                                       |
|  3. Krizdeki Öncelikli Hedefin?       |
|  [⏱ Hızlı Çözüm]  [🛡 Güvenlik & KVKK]|
|                                       |
|  +---------------------------------+  |
|  |     🚨 SİMÜLASYONU BAŞLAT       |  |
|  +---------------------------------+  |
+---------------------------------------+
```

**Bileşen Detayları:**
- Dinamik Seçim Kartları: Tıklanınca parlayan ve anında seçim durumu gösteren radio buton mantıklı kartlar.
- Profil Özeti Çubuğu: Yapılan seçimlerin anlatıyı nasıl değiştireceğini belirten dinamik bilgilendirme ("Deneyimliyim seçildi: 60 saniye kriz sayacı aktif!").

---

### 2.2. Ekran 2: Sahne & Kriz Simülasyonu (`Screen-2: Crisis Stage`)

Tüm kararların, Sokratik AI Tutor'un ve teknik logların yer aldığı ana oyun sahnesidir.

```
+---------------------------------------+
| 🚨 KRİZ: RANDEVU SİSTEMİ ÇÖKTÜ        |
| ⏱ 00:54 KALDI | 👥 300 HASTA BEKLİYOR |
+---------------------------------------+
| [TERMINAL LOG]                        |
| 08:00:12 ERR: HTTP 500 DB Pool Dead   |
| 08:00:15 WARN: Replication lag > 120s |
+---------------------------------------+
| KARAR 1 / 3 · MİMARİ SEÇİM            |
| "Dün gece yeni sürüm canlıya alındı." |
|                                       |
| [A] Eski sürüme geri dön (Rollback)   |
| [B] Canlıda yama yap (Hotfix)         |
+---------------------------------------+
| 🤖 AI SOKRATİK TUTOR                  |
| "Geri dönmeden önce veritabanı        |
|  şemasının değişip değişmediğini      |
|  nasıl anlarsın?"                     |
|                                       |
| [Tutor'a Soru Sor / İpucu İste...   ] |
+---------------------------------------+
| ⚙️ TEKNİK SONUÇ: NE OLDU, NEDEN OLDU?  |
| (Karar verilince anında açılır)       |
+---------------------------------------+
```

**Bileşen Detayları:**
- **Acil Durum Başlığı:** Kalan süre (Deneyimli modunda 60 saniye geri sayım) ve kriz metriği (300 hasta sırada).
- **Terminal Log Konsolu:** Gerçekçi sistem hata günlükleri, HTTP 500 hataları ve stack trace çıktıları.
- **Karar Butonları:** Dokunmatik mobil ekrana uygun genişlikte, hover ve tap animasyonlu seçenekler.
- **Sokratik AI Tutor Kartı:** Cevabı söylemeyen, oyuncuyu ters köşe sorularla yönlendiren akıllı diyalog modülü.
- **"Ne Oldu, Neden Oldu?" Paneli:** Seçim yapıldıktan sonra ortaya çıkan mimari sebep-sonuç teknik analizi.

---

### 2.3. Ekran 3: Sonuç & Post-Mortem Ekranı (`Screen-3: Post-Mortem Result`)

Oyuncunun kararlarına göre iki farklı sondan birini gösterir.

#### Son A (İyi Son):
- **Başlık:** "08:25 · SİSTEM AYAKTA, VERİ GÜVENDE"
- **Durum İkonu:** Yeşil Kalkan (Shield Verified)
- **Teknik Sonuç:** "Rollback başarıyla tamamlandı. Duman testleri veri tabanı tutarsızlığı olmadığını doğruladı. Hasta adları maskelenerek log analizi yapıldı. KVKK ihlali 0, SLA %99.8 korundu."
- **Öğrenilen Dersler:** Geri dönüş planı (rollback strategy) önemi, PII maskeleme zorunluluğu.

#### Son B (Kötü Son):
- **Başlık:** "08:45 · SİSTEM AYAKTA AMA KVKK İHLALİ!"
- **Durum İkonu:** Kırmızı İkaz & Adliye Tokmağı
- **Teknik Sonuç:** "Sistem hızlıca ayağa kaldırıldı fakat loglar maskelenmeden açık ekibe iletildi. 300 hastanın T.C. Kimlik ve tıbbi teşhis verileri sızdırıldı. KVKK Madde 12 gereğince 2.500.000 TL'ye varan idari para cezası ve itibar kaybı!"
- **Öğrenilen Dersler:** Kriz anında hız uğruna veri mahremiyetinden ödün vermenin yıkıcı maliyeti.

```
+---------------------------------------+
| 🏁 POST-MORTEM KRİZ RAPORU            |
+---------------------------------------+
|      🛡️ SON A: İYİ SON                |
|  08:25 Sistem Ayakta, Veri Güvende    |
+---------------------------------------+
| METRİKLER:                            |
| • Çözüm Süresi: 25 Dakika             |
| • Etkilenen Veri: 0 Kayıp             |
| • KVKK İhlali: YOK (Maskeleme OK)     |
| • Sokratik Puan: 95 / 100             |
+---------------------------------------+
| AI TUTOR DEĞERLENDİRMESİ:             |
| "Mükemmel mühendislik disiplini!      |
|  Baskı altındayken bile veri güven-   |
|  liğini feda etmedin."                |
+---------------------------------------+
| [ 🔄 YENİDEN OYNA / FARKLI YOL DENE ] |
+---------------------------------------+
```

---

## 3. Etkileşim ve Animasyon İlkeleri
1. **Dokunmatik Geri Bildirim:** Tüm butonlar mobil dokunmada `transform: scale(0.98)` ile haptik basma hissi verir.
2. **Kriz Sayacı Uyarısı:** Süre 15 saniyenin altına düştüğünde sayaç kırmızı renkte yanıp söner (`pulse` animasyonu).
3. **Akordeon / Sliding Teknik Paneller:** "Ne oldu, neden oldu?" kartı seçimden sonra yukarı kayarak (`slide-up`) sahneye girer.

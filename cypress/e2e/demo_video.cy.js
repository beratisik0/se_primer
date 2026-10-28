describe('SE Primer - YouTube Tanıtım & Gezinme Ekran Kaydı', () => {
  it('SE Primer Tam Sistem Tanıtımı ve İnteraktif Kullanım Demosu', () => {
    // 16:9 YouTube 720p HD Çözünürlük
    cy.viewport(1280, 720);
    cy.visit('/');

    // 1. Giriş & İlk Bakış (Seyircinin başlığı ve arayüzü okuması için duraklama)
    cy.wait(2000);

    // 2. Ayarlar Modalını Göster (Gemini API Entegrasyonu)
    cy.get('#toggleSettingsBtn').click();
    cy.wait(1800);
    cy.get('#closeSettingsBtn').click();
    cy.wait(1000);

    // 3. Onboarding Tercihlerini Keşfetme
    // Deneyim seviyesi kartlarını dene
    cy.get('.selector-card[data-val="senior"]').click();
    cy.wait(1200);
    cy.get('.selector-card[data-val="junior"]').click();
    cy.wait(1000);

    // Rol Seçimi
    cy.get('input[name="role"][value="devops"]').parent().click();
    cy.wait(1000);

    // Hedef Seçimi
    cy.get('input[name="goal"][value="uptime"]').parent().click();
    cy.wait(1500);

    // 4. Krizi Başlat
    cy.get('#startCrisisBtn').click();
    cy.wait(2000);

    // ==========================================
    // KARAR 1: MİMARİ SEÇİM (08:00)
    // ==========================================
    // Sokratik AI Tutor ile Etkileşim
    cy.get('#tutorCard').scrollIntoView({ duration: 800 });
    cy.wait(1000);

    // Hızlı ipucu çipi
    cy.contains('.quick-chip', 'Rollback riski?').click();
    cy.wait(2500);

    // Tutor'a gerçek bir öğrenci gibi soru sor
    cy.get('#tutorUserInput').type('Hocam 300 hasta bekliyor, acil söyle A mı B mi?', { delay: 65 });
    cy.wait(600);
    cy.get('#tutorSendBtn').click();
    cy.wait(3500);

    // Karar seçeneklerini incele ve Seçenek A'yı (Rollback) seç
    cy.get('#optionBtnA').scrollIntoView({ duration: 600 });
    cy.wait(1500);
    cy.get('#optionBtnA').click();

    // "Ne Oldu, Neden Oldu?" teknik geri bildirimini incele
    cy.get('#techFeedbackPanel').scrollIntoView({ duration: 600 });
    cy.wait(3500);

    // Sonraki adıma ilerle
    cy.get('#nextDecisionBtn').click();
    cy.wait(2000);

    // ==========================================
    // KARAR 2: TEST STRATEJİSİ (08:12)
    // ==========================================
    cy.get('#tutorCard').scrollIntoView({ duration: 600 });
    cy.wait(1000);

    // Tutor'a test hakkında danış
    cy.get('#tutorUserInput').type('Testi atlayıp hemen yayına alsam ne olur?', { delay: 60 });
    cy.wait(500);
    cy.get('#tutorSendBtn').click();
    cy.wait(3500);

    // Güvenli mühendislik kararı: 3 dk duman testi koş (A)
    cy.get('#optionBtnA').scrollIntoView({ duration: 600 });
    cy.wait(1200);
    cy.get('#optionBtnA').click();

    // Duman testinin teknik sonucunu oku
    cy.get('#techFeedbackPanel').scrollIntoView({ duration: 600 });
    cy.wait(3500);

    // Sonraki adıma ilerle
    cy.get('#nextDecisionBtn').click();
    cy.wait(2000);

    // ==========================================
    // KARAR 3: KVKK & VERİ GÜVENLİĞİ (08:20)
    // ==========================================
    cy.get('#tutorCard').scrollIntoView({ duration: 600 });
    cy.wait(1200);

    // Quick chip: KVKK / Hangisi doğru?
    cy.contains('.quick-chip', 'Hangisi doğru?').click();
    cy.wait(3000);

    // Logları maskele (A)
    cy.get('#optionBtnA').scrollIntoView({ duration: 600 });
    cy.wait(1500);
    cy.get('#optionBtnA').click();

    // KVKK Sanitization sonucunu oku
    cy.get('#techFeedbackPanel').scrollIntoView({ duration: 600 });
    cy.wait(3500);

    // Sonuç raporuna geç
    cy.get('#nextDecisionBtn').click();
    cy.wait(2500);

    // ==========================================
    // SONUÇ EKRANI: SON A (08:25 BAŞARILI SON)
    // ==========================================
    // Metrikleri incele (95/100, İhlal Yok)
    cy.wait(2000);

    // Post-mortem tutanağını aşağı kaydırarak incele
    cy.get('#resultTimeline').scrollIntoView({ duration: 1000 });
    cy.wait(3000);

    cy.get('#tutorClosingVerdict').scrollIntoView({ duration: 800 });
    cy.wait(2500);

    // Yeniden başlat butonuna tıkla
    cy.get('#restartGameBtn').scrollIntoView({ duration: 600 });
    cy.wait(1500);
    cy.get('#restartGameBtn').click();
    cy.wait(2000);

    // ==========================================
    // İKİNCİ YOL: DENEYİMLİ MODU & KÖTÜ SON (SON B)
    // ==========================================
    // Deneyimliyim (Senior) seçerek 60 saniyelik süreyi göster
    cy.get('.selector-card[data-val="senior"]').click();
    cy.wait(1000);
    cy.get('input[name="role"][value="fullstack"]').parent().click();
    cy.wait(1000);
    cy.get('#startCrisisBtn').click();
    cy.wait(2000);

    // Sayacın geri saydığını göster
    cy.get('#hudTimerValue').scrollIntoView({ duration: 400 });
    cy.wait(3000);

    // Hatalı kararlar zincirini göster (Canlıda yama -> Testsiz deploy -> Log sızıntısı)
    cy.get('#optionBtnB').click();
    cy.wait(2000);
    cy.get('#nextDecisionBtn').click();
    cy.wait(1500);

    cy.get('#optionBtnB').click();
    cy.wait(2000);
    cy.get('#nextDecisionBtn').click();
    cy.wait(1500);

    cy.get('#optionBtnB').click();
    cy.wait(2000);
    cy.get('#nextDecisionBtn').click();
    cy.wait(2500);

    // Kötü son ekranını incele (KVKK İhlali, Ceza Riski)
    cy.get('#resultTitle').scrollIntoView({ duration: 600 });
    cy.wait(2500);
    cy.get('#resultTimeline').scrollIntoView({ duration: 800 });
    cy.wait(4000);
  });
});

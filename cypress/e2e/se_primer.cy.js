describe('SE Primer - Kriz Simülasyonu E2E Test Paketi', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('1. Onboarding & Kişiselleştirme: Yeni Başlayan modu ve rol seçimi doğrulanmalı', () => {
    // Başlık ve form kontrolü
    cy.get('h1').should('contain', '08:00, randevu sistemi çöktü');
    cy.get('#startCrisisBtn').scrollIntoView().should('be.visible');

    // Yeni Başlayan seçildiğinde önizleme metnini kontrol et
    cy.get('.selector-card[data-val="junior"]').click();
    cy.get('#narrativePreview').should('contain', 'Yeni Başlayan Modu');

    // DevOps rolünü seç
    cy.get('input[name="role"][value="devops"]').parent().click();
    cy.get('#narrativePreview').should('contain', 'DevOps / Altyapı');

    // Krizi Başlat
    cy.get('#startCrisisBtn').click();

    // Sahneye geçildi mi?
    cy.get('#screenStage').should('have.class', 'active');
    cy.get('#hudStepValue').should('contain', '1 / 3');
    cy.get('#hudTimerValue').should('contain', 'RAHAT');
    cy.get('#tutorCard').should('be.visible');
    cy.get('#tutorBubble').should('contain', 'veritabanı şemasının değişip değişmediğini nasıl anlarsın');
  });

  it('2. Yol A (İyi Son): Rollback -> Duman Testi -> Maskeleme ile 08:25 Başarılı Sonuç', () => {
    // Formu doldur ve başla
    cy.get('#startCrisisBtn').click();

    // Karar 1: Eski sürüme dön (A)
    cy.get('#decisionCategoryBadge').should('contain', 'KARAR 1 · MİMARİ');
    cy.get('#optionBtnA').click();
    cy.get('#techFeedbackPanel').should('be.visible');
    cy.get('#feedbackWhat').should('contain', 'v2.3.9 kararlı sürümüne rollback');
    cy.get('#nextDecisionBtn').click();

    // Karar 2: Önce kısa test koş (A)
    cy.get('#decisionCategoryBadge').should('contain', 'KARAR 2 · TEST');
    cy.get('#optionBtnA').click();
    cy.get('#techFeedbackPanel').should('be.visible');
    cy.get('#feedbackWhat').should('contain', 'duman testi');
    cy.get('#nextDecisionBtn').click();

    // Karar 3: Maskele (A)
    cy.get('#decisionCategoryBadge').should('contain', 'KARAR 3 · KVKK');
    cy.get('#optionBtnA').click();
    cy.get('#techFeedbackPanel').should('be.visible');
    cy.get('#feedbackWhat').should('contain', 'maskelendi');
    cy.get('#nextDecisionBtn').click();

    // Sonuç Ekranı: Son A
    cy.get('#screenResult').should('have.class', 'active');
    cy.get('#resultTitle').should('contain', '08:25 · SİSTEM AYAKTA, VERİ GÜVENDE');
    cy.get('#metricKvkk').should('contain', 'İHLAL YOK');
    cy.get('#metricScore').should('contain', '95');
    cy.get('#restartGameBtn').scrollIntoView().should('be.visible');
  });

  it('3. Yol B (Kötü Son): Canlıda Yama -> Test Atla -> Ekibe Olduğu Gibi At ile KVKK İhlali', () => {
    // Formu doldur ve başla
    cy.get('#startCrisisBtn').click();

    // Karar 1: Canlıda yama yap (B)
    cy.get('#optionBtnB').click();
    cy.get('#techFeedbackPanel').should('be.visible');
    cy.get('#nextDecisionBtn').click();

    // Karar 2: Hemen yayına al (B)
    cy.get('#optionBtnB').click();
    cy.get('#techFeedbackPanel').should('be.visible');
    cy.get('#nextDecisionBtn').click();

    // Karar 3: Ekibe olduğu gibi at (B)
    cy.get('#optionBtnB').click();
    cy.get('#techFeedbackPanel').should('be.visible');
    cy.get('#nextDecisionBtn').click();

    // Sonuç Ekranı: Son B (Kötü Son)
    cy.get('#screenResult').should('have.class', 'active');
    cy.get('#resultTitle').should('contain', 'SİSTEM AYAKTA AMA KVKK İHLALİ');
    cy.get('#metricKvkk').should('contain', '6698 SAYILI İHLAL');
    cy.get('#resultDesc').should('contain', 'özel nitelikli kişisel sağlık verileri sızdırıldı');
  });

  it('4. Sokratik AI Tutor: Asla cevabı doğrudan vermemeli, soruyla yönlendirmeli', () => {
    cy.get('#startCrisisBtn').click();

    // Tutor alanına doğrudan cevap isteyen soru sor
    cy.get('#tutorUserInput').type('Hangi şıkkı seçmeliyim, doğru cevap A mı B mi?{enter}');

    // Tutor cevabını bekle ve incele
    cy.get('#tutorQuestion').should(($q) => {
      const text = $q.text();
      expect(text).to.contain('kararı senin adına kimse veremez');
      expect(text).not.to.contain('A şıkkını seç');
      expect(text).not.to.contain('B şıkkını seç');
    });

    // Hızlı çip kullanımı
    cy.contains('.quick-chip', 'Rollback riski?').click();
    cy.get('#tutorQuestion').should('contain', 'veritabanı migrasyonları');
  });

  it('5. Deneyimli Modu: 60 saniyelik kriz geri sayım sayacı çalışmalı', () => {
    cy.get('.selector-card[data-val="senior"]').click();
    cy.get('#startCrisisBtn').click();

    // HUD'da sayaç aktif olmalı (örn: 01:00 veya 00:59)
    cy.get('#hudTimerValue').should(($timer) => {
      const text = $timer.text();
      expect(text).to.match(/00:[0-5][0-9]|01:00/);
    });
  });

  it('6. Yeniden Başlatma Döngüsü: Sonuç ekranından Onboarding ekranına dönülebilmeli', () => {
    cy.get('#startCrisisBtn').click();
    cy.get('#optionBtnA').click();
    cy.get('#nextDecisionBtn').click();
    cy.get('#optionBtnA').click();
    cy.get('#nextDecisionBtn').click();
    cy.get('#optionBtnA').click();
    cy.get('#nextDecisionBtn').click();

    // Sonuç ekranında yeniden başlat butonuna bas
    cy.get('#restartGameBtn').click();
    cy.get('#screenOnboarding').should('have.class', 'active');
  });
});

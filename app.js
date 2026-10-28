/**
 * SE PRIMER - Sokratik Yazılım Mühendisliği Kriz Simülasyonu
 * YZM301 Dersi için Geliştirilmiştir.
 */

// Uygulama Durumu (State Machine)
const state = {
  profile: {
    level: 'junior',   // 'junior' (Yeni Başladım) | 'senior' (Deneyimliyim)
    role: 'backend',    // 'backend' | 'devops' | 'frontend' | 'fullstack'
    goal: 'uptime'     // 'uptime' | 'security' | 'quality'
  },
  currentStep: 1,      // 1: Mimari, 2: Test, 3: KVKK
  decisions: [],       // Yapılan seçimler ve sonuç kayıtları
  timer: null,
  timeLeft: 60,
  terminalInterval: null,
  geminiApiKey: localStorage.getItem('se_primer_gemini_key') || '',
  geminiModel: localStorage.getItem('se_primer_gemini_model') || 'gemini-1.5-flash'
};

// Karar ve Senaryo Veri Tabanı
const scenarioData = {
  1: {
    category: 'KARAR 1 · MİMARİ SEÇİM',
    title: 'Randevu sistemi HTTP 500 fırlatıyor. Sistem nasıl kurtarılacak?',
    context: 'Dün gece 02:00\'de v2.4.0 yayına alındı. Sabah 08:00 itibarıyla 300 hasta sırada bekliyor.',
    socraticDefault: 'Geri dönmeden önce veritabanı şemasının değişip değişmediğini nasıl anlarsın?',
    options: {
      A: {
        label: 'Eski sürüme geri dön (Rollback)',
        sub: 'v2.3.9 kararlı sürümüne dön (Hızlı kurtarma)',
        what: 'Sistem hemen önceki v2.3.9 kararlı sürümüne rollback edildi.',
        why: 'Yeni sürümdeki hatalı servis devre dışı kaldı. Ancak dünkü DB migration\'larının backward-compatible (geriye uyumlu) olup olmadığı kritikti.'
      },
      B: {
        label: 'Canlıda yama yap (Hotfix in prod)',
        sub: 'Kodu canlı container üzerinde düzelt ve restart et',
        what: 'Canlı sunucuda null-check yaması yapılıp hızlıca restart edildi.',
        why: 'Servis geçici olarak ayağa kalktı; fakat canlıda yapılan kontrolsüz müdahale git reposundan koptu ve teknik borç oluşturdu.'
      }
    }
  },
  2: {
    category: 'KARAR 2 · TEST STRATEJİSİ',
    title: 'Düzeltme hazırlandı. Canlıya almadan önce test yapılacak mı?',
    context: 'Saat 08:12 oldu. Bekleyen hasta sayısı artıyor. Ekip gergin.',
    socraticDefault: '3 dakikalık bir test koşmak mı, yoksa çöken bir sisteme 30 dakika sonra tekrar müdahale etmek mi daha maliyetlidir?',
    options: {
      A: {
        label: 'Önce kısa duman testi koş (Smoke Test)',
        sub: '3 dakikalık kritik randevu & DB yazma testi yap',
        what: '3 dakikalık otomatik duman testi paketi başarıyla koşuldu.',
        why: 'Testler, yapılan değişikliğin randevu tablosunu kilitlemediğini doğruladı. 3 dakika gecikmeyle sıfır sürpriz sağlandı.'
      },
      B: {
        label: 'Hemen yayına al (Direct deploy)',
        sub: 'Hiç beklemeden kodu derhal yayına ver',
        what: 'Testler atlanarak kod derhal yayına alındı.',
        why: 'Hız kazanıldı fakat eşzamanlı isteklerde thread çakışması riski ve olası memory leak kontrol edilmedi.'
      }
    }
  },
  3: {
    category: 'KARAR 3 · KVKK & VERİ GÜVENLİĞİ',
    title: 'Loglarda hasta adı, T.C. No ve poliklinik teşhisi açıkça görünüyor!',
    context: 'Hatanın detayını çözmek için logu mühendislik Slack kanalına atman gerekiyor.',
    socraticDefault: 'Slack veya log kanalına gönderdiğin verilerin şirket dışına veya yetkisiz kişilere ulaşmayacağını garanti edebilir misin?',
    options: {
      A: {
        label: 'Maskele (PII Sanitization uygula)',
        sub: 'Regex ile hasta adı ve T.C. kimlikleri yıldızla (***)',
        what: 'Loglardaki tüm kişisel veriler maskelendi ve temiz log paylaşıldı.',
        why: '6698 sayılı KVKK Madde 12 uyarınca veri güvenliği korundu. Ekip hatayı çözerken hiçbir hasta mahremiyeti riske atılmadı.'
      },
      B: {
        label: 'Ekibe olduğu gibi at (Hız için maskeleme yapma)',
        sub: 'Vakit kaybetmeden ham logu genel kanala yapıştır',
        what: 'Ham loglar tüm hasta adları ve teşhisleriyle kanala yapıştırıldı.',
        why: 'Hata hızlı paylaşıldı fakat üçüncü taraf webhook\'lar ve açık Slack havuzu sebebiyle kişisel sağlık verileri sızdı!'
      }
    }
  }
};

// Rol bazlı log simülasyonu
const roleLogs = {
  backend: [
    { type: 'err', text: '08:00:03 [SQL] Connection pool exhausted (max 100). Queue wait > 8000ms' },
    { type: 'err', text: '08:00:07 [API] POST /api/v2/appointments HTTP 500 NullPointerException' },
    { type: 'warn', text: '08:00:12 [ORM] Transaction deadlock detected on table `patients`' },
    { type: 'err', text: '08:00:18 [Auth] JWT verification latency spike: 2450ms' }
  ],
  devops: [
    { type: 'err', text: '08:00:02 [k8s] Pod hospital-backend-7f8d9b CrashLoopBackOff' },
    { type: 'warn', text: '08:00:06 [Ingress] Nginx 502 Bad Gateway rate: 84 req/sec' },
    { type: 'err', text: '08:00:11 [Prometheus] CPU throttle 98% on node-worker-04' },
    { type: 'warn', text: '08:00:19 [Database] Replication lag exceeded 180s threshold' }
  ],
  frontend: [
    { type: 'err', text: '08:00:04 [Web] Uncaught (in promise) FetchError: Failed to fetch /appointments' },
    { type: 'warn', text: '08:00:08 [UI] 300+ users clicking retry button concurrently' },
    { type: 'err', text: '08:00:14 [Network] Gateway Timeout 504 on booking widget' },
    { type: 'warn', text: '08:00:20 [Telemetry] Client-side error rate spiked to 92%' }
  ],
  fullstack: [
    { type: 'err', text: '08:00:02 [API] 500 Internal Server Error: Database timeout' },
    { type: 'err', text: '08:00:08 [Next.js] SSR Hydration failed on /randevu-al' },
    { type: 'warn', text: '08:00:14 [DB] Read replica sync delay on patient_records' },
    { type: 'err', text: '08:00:22 [Cache] Redis memory limit reached (eviction failed)' }
  ]
};

// DOM Elemanları
const screens = {
  onboarding: document.getElementById('screenOnboarding'),
  stage: document.getElementById('screenStage'),
  result: document.getElementById('screenResult')
};

const onboardingForm = document.getElementById('onboardingForm');
const narrativePreview = document.getElementById('previewText');
const headerCrisisBadge = document.getElementById('headerCrisisBadge');

// Hud
const hudTimerBox = document.getElementById('hudTimerBox');
const hudTimerValue = document.getElementById('hudTimerValue');
const hudPatientCount = document.getElementById('hudPatientCount');
const hudStepValue = document.getElementById('hudStepValue');
const terminalLogs = document.getElementById('terminalLogs');

// Karar Paneli
const decisionCategoryBadge = document.getElementById('decisionCategoryBadge');
const decisionTitle = document.getElementById('decisionTitle');
const decisionContext = document.getElementById('decisionContext');
const optionBtnA = document.getElementById('optionBtnA');
const optionBtnB = document.getElementById('optionBtnB');
const optLabelA = document.getElementById('optLabelA');
const optSubA = document.getElementById('optSubA');
const optLabelB = document.getElementById('optLabelB');
const optSubB = document.getElementById('optSubB');
const techFeedbackPanel = document.getElementById('techFeedbackPanel');
const feedbackWhat = document.getElementById('feedbackWhat');
const feedbackWhy = document.getElementById('feedbackWhy');
const nextDecisionBtn = document.getElementById('nextDecisionBtn');

// Tutor
const tutorCard = document.getElementById('tutorCard');
const tutorBubble = document.getElementById('tutorBubble');
const tutorQuestion = document.getElementById('tutorQuestion');
const tutorUserInput = document.getElementById('tutorUserInput');
const tutorSendBtn = document.getElementById('tutorSendBtn');
const tutorToggleBtn = document.getElementById('tutorToggleBtn');
const tutorBody = document.getElementById('tutorBody');

// Result
const resultIcon = document.getElementById('resultIcon');
const resultTag = document.getElementById('resultTag');
const resultTitle = document.getElementById('resultTitle');
const resultDesc = document.getElementById('resultDesc');
const metricTime = document.getElementById('metricTime');
const metricDataSafe = document.getElementById('metricDataSafe');
const metricKvkk = document.getElementById('metricKvkk');
const metricScore = document.getElementById('metricScore');
const resultTimeline = document.getElementById('resultTimeline');
const tutorVerdictText = document.getElementById('tutorVerdictText');
const restartGameBtn = document.getElementById('restartGameBtn');

// Settings Modal
const settingsModal = document.getElementById('settingsModal');
const toggleSettingsBtn = document.getElementById('toggleSettingsBtn');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const saveSettingsBtn = document.getElementById('saveSettingsBtn');
const geminiApiKeyInput = document.getElementById('geminiApiKey');
const geminiModelSelect = document.getElementById('geminiModelSelect');

// ============================================================================
// Onboarding & Kişiselleştirme
// ============================================================================
function updateNarrativePreview() {
  const level = document.querySelector('input[name="level"]:checked').value;
  const role = document.querySelector('input[name="role"]:checked').value;
  const goal = document.querySelector('input[name="goal"]:checked').value;

  state.profile.level = level;
  state.profile.role = role;
  state.profile.goal = goal;

  let text = '';
  if (level === 'senior') {
    text += '🔥 <strong>Deneyimli Modu:</strong> 60 saniyelik kriz geri sayım sayacı devrede. ';
  } else {
    text += '🌱 <strong>Yeni Başlayan Modu:</strong> Sınırsız süre ve Sokratik AI Tutor her aşamada aktif rehber. ';
  }

  const roleNames = { backend: 'Backend API', devops: 'DevOps / Altyapı', frontend: 'Frontend İstemci', fullstack: 'Fullstack Sistem' };
  text += `Terminalde <strong>${roleNames[role]}</strong> metrikleri canlı akacak.`;

  narrativePreview.innerHTML = text;
}

// Radyo seçimleri değişince önizlemeyi güncelle
document.querySelectorAll('input[type="radio"]').forEach(radio => {
  radio.addEventListener('change', () => {
    // Görsel aktiflik sınıfları
    const parentSelector = radio.closest('.selector-card, .chip-item');
    if (parentSelector) {
      const groupName = radio.name;
      document.querySelectorAll(`input[name="${groupName}"]`).forEach(r => {
        r.closest('.selector-card, .chip-item')?.classList.remove('active');
      });
      parentSelector.classList.add('active');
    }
    updateNarrativePreview();
  });
});

// Form Gönderimi (Krize Başla)
onboardingForm.addEventListener('submit', (e) => {
  e.preventDefault();
  startGame();
});

function switchScreen(targetScreen) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  targetScreen.classList.add('active');
  window.scrollTo(0, 0);
}

// ============================================================================
// Kriz Sahnesi ve Oyun Motoru
// ============================================================================
function startGame() {
  state.currentStep = 1;
  state.decisions = [];
  state.timeLeft = 60;

  switchScreen(screens.stage);

  // Seviyeye göre süre baskısı
  if (state.profile.level === 'senior') {
    hudTimerBox.style.display = 'flex';
    hudTimerValue.textContent = '01:00';
    startCountdown();
  } else {
    hudTimerBox.style.display = 'flex';
    hudTimerValue.textContent = 'RAHAT';
    hudTimerValue.classList.remove('alert-text');
  }

  // Terminal log akışını başlat
  initTerminal();

  // İlk kararı yükle
  loadDecisionStep(1);
}

function startCountdown() {
  if (state.timer) clearInterval(state.timer);
  state.timeLeft = 60;
  hudTimerBox.classList.remove('timer-urgent');

  state.timer = setInterval(() => {
    state.timeLeft--;
    const mins = Math.floor(state.timeLeft / 60);
    const secs = state.timeLeft % 60;
    hudTimerValue.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    if (state.timeLeft <= 15) {
      hudTimerBox.classList.add('timer-urgent');
    }

    if (state.timeLeft <= 0) {
      clearInterval(state.timer);
      handleTimeout();
    }
  }, 1000);
}

function handleTimeout() {
  alert('⏱️ SÜRE DOLDU! 300 hasta beklerken sistem yanıtsız kaldı ve kriz derinleşti.');
  // Otomatik kötü son
  endGame(false, 'Zaman aşımı: Kriz anında karar verilemedi.');
}

function initTerminal() {
  terminalLogs.innerHTML = '';
  const logs = roleLogs[state.profile.role] || roleLogs.backend;
  
  logs.forEach((item, idx) => {
    setTimeout(() => {
      const line = document.createElement('div');
      line.className = `log-line ${item.type}`;
      line.textContent = item.text;
      terminalLogs.appendChild(line);
      terminalLogs.scrollTop = terminalLogs.scrollHeight;
    }, idx * 400);
  });
}

function loadDecisionStep(stepNum) {
  state.currentStep = stepNum;
  hudStepValue.textContent = `${stepNum} / 3`;

  const data = scenarioData[stepNum];
  if (!data) return;

  decisionCategoryBadge.textContent = data.category;
  decisionTitle.textContent = data.title;
  decisionContext.textContent = data.context;

  optLabelA.textContent = data.options.A.label;
  optSubA.textContent = data.options.A.sub;
  optLabelB.textContent = data.options.B.label;
  optSubB.textContent = data.options.B.sub;

  // Panelleri sıfırla
  techFeedbackPanel.classList.remove('show');
  optionBtnA.disabled = false;
  optionBtnB.disabled = false;
  optionBtnA.style.borderColor = '';
  optionBtnB.style.borderColor = '';

  // Sokratik Tutor sorusunu ayarla
  tutorQuestion.textContent = `"${data.socraticDefault}"`;

  // Yeni Başlayan modunda tutor daima açık olsun
  if (state.profile.level === 'junior') {
    tutorBody.classList.remove('collapsed');
  }
}

// Karar Tıklama
function handleChoice(choice) {
  optionBtnA.disabled = true;
  optionBtnB.disabled = true;

  const currentData = scenarioData[state.currentStep];
  const selectedOption = currentData.options[choice];

  if (choice === 'A') {
    optionBtnA.style.borderColor = 'var(--accent-cyan)';
  } else {
    optionBtnB.style.borderColor = 'var(--accent-amber)';
  }

  // Kararı kaydet
  state.decisions.push({
    step: state.currentStep,
    category: currentData.category,
    choice: choice,
    label: selectedOption.label,
    what: selectedOption.what,
    why: selectedOption.why
  });

  // Ne oldu, neden oldu panelini göster
  feedbackWhat.textContent = selectedOption.what;
  feedbackWhy.textContent = selectedOption.why;
  techFeedbackPanel.classList.add('show');

  // Hasta sayısını dinamik güncelle
  const patientElement = hudPatientCount;
  if (state.currentStep === 1) {
    patientElement.textContent = choice === 'A' ? '180' : '260';
  } else if (state.currentStep === 2) {
    patientElement.textContent = choice === 'A' ? '75' : '150';
  } else if (state.currentStep === 3) {
    patientElement.textContent = '0';
  }
}

optionBtnA.addEventListener('click', () => handleChoice('A'));
optionBtnB.addEventListener('click', () => handleChoice('B'));

// Sonraki Karara Geçiş
nextDecisionBtn.addEventListener('click', () => {
  if (state.currentStep < 3) {
    loadDecisionStep(state.currentStep + 1);
  } else {
    // 3. Karar bittiğinde sonucu hesapla
    calculateEnding();
  }
});

// ============================================================================
// Sonuç Hesaplama (Son A vs Son B)
// ============================================================================
function calculateEnding() {
  if (state.timer) clearInterval(state.timer);

  const kvkkDecision = state.decisions.find(d => d.step === 3);
  const isSafeEnding = kvkkDecision && kvkkDecision.choice === 'A';

  endGame(isSafeEnding);
}

function endGame(isSafeEnding, overrideMessage = null) {
  switchScreen(screens.result);

  resultTimeline.innerHTML = '';
  state.decisions.forEach(d => {
    const item = document.createElement('div');
    item.className = 'timeline-item';
    item.innerHTML = `
      <strong>${d.category}: ${d.label}</strong>
      <span>⚡ <em>Ne Oldu:</em> ${d.what}</span><br>
      <span>💡 <em>Neden Oldu:</em> ${d.why}</span>
    `;
    resultTimeline.appendChild(item);
  });

  if (isSafeEnding) {
    // SON A: İYİ SON
    resultIcon.textContent = '🛡️';
    resultIcon.classList.remove('bad-ending');
    resultTag.textContent = 'BAŞARILI KRİZ ÇÖZÜMÜ · İYİ SON';
    resultTag.style.color = 'var(--accent-green)';
    resultTitle.textContent = '08:25 · SİSTEM AYAKTA, VERİ GÜVENDE';
    resultDesc.textContent = 'Sistem başarıyla stabilize edildi. Rollback/Hotfix sonrası testler tamamlandı ve PII maskeleme sayesinde hasta mahremiyeti korundu.';
    
    metricTime.textContent = '08:25';
    metricDataSafe.textContent = 'Tam Korundu (%100)';
    metricDataSafe.style.color = 'var(--accent-green)';
    metricKvkk.textContent = 'İHLAL YOK (0 Ceza)';
    metricKvkk.style.color = 'var(--accent-green)';
    metricScore.textContent = '95 / 100';

    tutorVerdictText.textContent = `Tebrikler! ${state.profile.role.toUpperCase()} rolünde kriz anında baskı altındayken bile veri güvenliği ve KVKK yükümlülüklerinden ödün vermedin. Teknik borç üretmeden sistemi ayağa kaldırdın.`;
  } else {
    // SON B: KÖTÜ SON
    resultIcon.textContent = '⚠️';
    resultIcon.classList.add('bad-ending');
    resultTag.textContent = 'REGÜLASYON İHLALİ · KÖTÜ SON';
    resultTag.style.color = 'var(--accent-red)';
    resultTitle.textContent = '08:45 · SİSTEM AYAKTA AMA KVKK İHLALİ!';
    resultDesc.textContent = overrideMessage || 'Sistem kesintisi giderildi fakat loglar maskelenmeden ekibe dağıtıldığı için 300 hastanın özel nitelikli kişisel sağlık verileri sızdırıldı.';
    
    metricTime.textContent = '08:45';
    metricDataSafe.textContent = 'Tehlikede (%40 Sızıntı)';
    metricDataSafe.style.color = 'var(--accent-red)';
    metricKvkk.textContent = '6698 SAYILI İHLAL';
    metricKvkk.style.color = 'var(--accent-red)';
    metricScore.textContent = '45 / 100';

    tutorVerdictText.textContent = 'Sistemi teknik olarak ayağa kaldırdın fakat gerçek mühendislik sadece sistemin 200 dönmesi değildir. KVKK 6698 Madde 12 ihmali kuruma ağır para cezası ve itibar kaybı getirdi.';
  }
}

restartGameBtn.addEventListener('click', () => {
  switchScreen(screens.onboarding);
});

// ============================================================================
// Sokratik AI Tutor Motoru (Cevabı Ele Vermeyen Zeka & Gemini API)
// ============================================================================
tutorToggleBtn.addEventListener('click', () => {
  tutorBody.classList.toggle('collapsed');
  tutorToggleBtn.textContent = tutorBody.classList.contains('collapsed') ? '+' : '−';
});

// Sokratik Yanıt Motoru (Offline & Yerleşik Akıl)
function generateSocraticResponse(userQuestion) {
  const q = userQuestion.toLowerCase();

  // Cevabı doğrudan koparmaya çalışan girdiler
  if (q.includes('hangisi') || q.includes('a mı b mi') || q.includes('doğru cevap') || q.includes('seçeyim')) {
    return 'Yazılım nöbetinde kararı senin adına kimse veremez :) Bir seçeneğin hız avantajı diğerinin veri bütünlüğü garantisiyle yarışıyor. Sence hangisinin geri dönüş maliyeti daha yüksek?';
  }
  if (q.includes('rollback') || q.includes('eski sürüm') || q.includes('geri dön')) {
    return 'Eski sürüme dönmek hızlı bir nefes aldırır; peki dün gece çalışan veritabanı migrasyonları eski kodla geriye dönük uyumlu (backward-compatible) mu? Bunu nasıl kontrol edersin?';
  }
  if (q.includes('hotfix') || q.includes('canlıda yama') || q.includes('yama')) {
    return 'Canlıda yama yapmak anlık kurtarabilir; peki bu yamayı test etmeden yayına alırsan 300 hastanın oluşturacağı yüksek trafik altında yeni bir deadlock oluşmayacağını nasıl garanti edersin?';
  }
  if (q.includes('test') || q.includes('duman') || q.includes('smoke')) {
    return '3 dakikalık bir duman testi ile 30 dakikalık tam regresyon testi arasındaki fark nedir? Kriz anında en kritik "Happy Path" fonksiyonu hangisidir?';
  }
  if (q.includes('kvkk') || q.includes('hasta') || q.includes('log') || q.includes('maskele')) {
    return 'Bir log dosyasındaki T.C. Kimlik veya hasta adının üçüncü şahıslara sızması, 6698 sayılı KVKK kapsamında şirkete ve sana hangi hukuki ve etik sorumlulukları yükler?';
  }

  // Genel Sokratik Yanıt
  return 'Bu soruyu çözmek için şu teknik parametreye odaklan: Alacağın kararın sistem uptime\'ına, veritabanı tutarlılığına ve yasal yükümlülüklerine etkisi ne olacak?';
}

async function handleTutorChat(queryText) {
  const query = queryText || tutorUserInput.value.trim();
  if (!query) return;

  tutorUserInput.value = '';
  tutorQuestion.innerHTML = `<em>Düşünülüyor...</em>`;

  // Eğer Gemini API key varsa canlı AI Studio modeline sor
  if (state.geminiApiKey) {
    try {
      const response = await callGeminiSocratic(query);
      tutorQuestion.innerHTML = `"${response}"`;
      return;
    } catch (err) {
      console.warn('Gemini API hatası, yerleşik Sokratik motora dönülüyor:', err);
    }
  }

  // Yerleşik Sokratik motor
  setTimeout(() => {
    const reply = generateSocraticResponse(query);
    tutorQuestion.innerHTML = `"${reply}"`;
  }, 400);
}

tutorSendBtn.addEventListener('click', () => handleTutorChat());
tutorUserInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleTutorChat();
});

document.querySelectorAll('.quick-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    handleTutorChat(chip.getAttribute('data-query'));
  });
});

// Google AI Studio / Gemini API Entegrasyonu
async function callGeminiSocratic(userQuery) {
  const systemPrompt = `Sen yazılım mühendisliği öğrencilerine kriz anında rehberlik eden Sokratik bir AI Tutor'sun. 
ASLA DOĞRUDAN CEVABI VEYA HANGİ ŞIKKI SEÇMESİ GEREKTİĞİNİ SÖYLEME. 
Öğrenciye soru sorarak, veritabanı şeması, KVKK sorumluluğu veya test maliyeti gibi teknik açılardan düşünmesini sağla. 
Cevabın 2 cümleyi geçmesin ve mutlaka düşündürücü bir soruyla bitsin. Türkçe cevap ver.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${state.geminiModel}:generateContent?key=${state.geminiApiKey}`;
  
  const payload = {
    contents: [
      { role: 'user', parts: [{ text: `${systemPrompt}\n\nÖğrencinin Durumu: Adım ${state.currentStep}, Rol: ${state.profile.role}. Öğrenci diyor ki: "${userQuery}"` }] }
    ]
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (data.candidates && data.candidates[0].content.parts[0].text) {
    return data.candidates[0].content.parts[0].text.trim();
  }
  throw new Error('Geçersiz Gemini yanıtı');
}

// ============================================================================
// Ayarlar Modalı (Gemini API Key)
// ============================================================================
toggleSettingsBtn.addEventListener('click', () => {
  geminiApiKeyInput.value = state.geminiApiKey;
  geminiModelSelect.value = state.geminiModel;
  settingsModal.classList.add('show');
});

closeSettingsBtn.addEventListener('click', () => {
  settingsModal.classList.remove('show');
});

saveSettingsBtn.addEventListener('click', () => {
  state.geminiApiKey = geminiApiKeyInput.value.trim();
  state.geminiModel = geminiModelSelect.value;
  localStorage.setItem('se_primer_gemini_key', state.geminiApiKey);
  localStorage.setItem('se_primer_gemini_model', state.geminiModel);
  settingsModal.classList.remove('show');
  alert('Ayarlar kaydedildi.');
});

// Başlangıç önizlemesi
updateNarrativePreview();

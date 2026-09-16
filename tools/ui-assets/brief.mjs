// Initial UX hypotheses, reviewed and edited in each persistent plan.json.
const briefs = {
  home: ['Güncel iş durumunu ve sonraki adımı anlaşılır göster.', 'Öncelikli işe geç', 2],
  login: ['Doğru çalışma alanına doğru hesapla güvenilir giriş sağla.', 'Giriş yap', 1],
  onboarding: ['Sunucu kimliğini ve güven sınırını anlayarak bağlantı kur.', 'Çalışma alanını doğrula ve bağlan', 1],
  clients: ['Müşterileri bul ve ilişki durumunu karşılaştır.', 'Müşteriyi aç veya oluştur', 3],
  'clients-id': ['Müşteri bilgisi, projeleri ve iletişim geçmişini tek akışta incele.', 'Müşterinin projesine veya aktivitesine geç', 3],
  client: ['Müşteri bilgilerini doğrulayarak kaydet.', 'Müşteriyi kaydet', 3],
  'client-activity': ['Müşteri iletişim ve aktivitesini bağlamıyla kaydet.', 'Aktiviteyi kaydet', 3],
  invitation: ['Doğru müşteriye portal erişimi ver.', 'Davet oluştur', 3],
  projects: ['Projeleri durum ve teslim önceliğine göre bul.', 'Projeyi aç veya oluştur', 3],
  'projects-id': ['Projenin görev, plan, revizyon ve dosyalarını bağlam kaybetmeden incele.', 'Projedeki sonraki işe geç', 3],
  project: ['Müşteri, kapsam ve teslim bilgisiyle proje oluştur veya düzenle.', 'Projeyi kaydet', 3],
  tasks: ['Yapılacak işleri öncelik, proje ve duruma göre bul.', 'Görevi aç veya tamamla', 3],
  'tasks-id': ['Görevin kapsam ve tamamlanma koşullarını incele.', 'Görevi güncelle veya tamamla', 3],
  task: ['Görev ilişkisi, tarih ve görünürlüğünü doğrulayarak kaydet.', 'Görevi kaydet', 3],
  calendar: ['Teslim ve randevuları tarih bağlamında planla.', 'Günü incele veya etkinlik ekle', 4],
  'calendar-event': ['Doğru saat dilimi ve tarih aralığıyla etkinlik kaydet.', 'Etkinliği kaydet', 4],
  finance: ['Gelir ve giderleri para birimi ve dönemiyle doğru oku.', 'İşlemi incele veya ekle', 4],
  'finance-record': ['Tutar, para birimi ve işlem ilişkilerini doğrulayarak kaydet.', 'İşlemi kaydet', 4],
  journal: ['Günlük notları tarihe göre bul ve çalışma bağlamını hatırla.', 'Günlük notunu aç', 4],
  'journal-entry': ['Tarihli kişisel çalışma notunu kaydet.', 'Notu kaydet', 4],
  analytics: ['Özet göstergelerin dönem ve anlamını açıkça karşılaştır.', 'İlgili kayıt veya dönemi incele', 4],
  files: ['Dosya ilişkisi, görünürlüğü ve yükleme sonucunu anlaşılır göster.', 'Dosya yükle veya indir', 5],
  settings: ['Hesap ve çalışma alanı ayarlarını izinleriyle anlaşılır ayır.', 'İlgili ayarı aç veya çıkış yap', 5],
  profile: ['Kendi profil bilgisini güvenle düzenle.', 'Profili kaydet', 5],
  security: ['Kendi parola ve oturumlarını güvenle yönet.', 'Parolayı değiştir veya oturumu kapat', 5],
  preferences: ['Tema ve dil tercihlerini sonucu görünür olacak şekilde değiştir.', 'Tercihi kaydet', 5],
  appearance: ['Marka görselleri ve tema ayarlarını iki görünümde yönet.', 'Görünümü kaydet', 5],
  general: ['Çalışma alanının genel ayarlarını doğrulayarak güncelle.', 'Ayarları kaydet', 5],
  language: ['Kişisel dil ve çalışma alanı dilini anlaşılır ayır.', 'Dil tercihini kaydet', 5],
  languages: ['Etkin dilleri ve çeviri bakım durumunu yönet.', 'Dil veya çeviriyi aç', 5],
  'languages-locale': ['Seçili dilin yapılandırmasını yönet.', 'Dil ayarını kaydet', 5],
  'languages-locale-translations': ['Çeviri anahtarlarını bağlam ve doğrulamayla düzenle.', 'Çevirileri kaydet', 5],
  'languages-import-export': ['Çeviri paketini format ve kapsamını anlayarak aktar.', 'Doğrula ve içe veya dışa aktar', 5],
  'languages-new': ['Yeni dili doğru kod ve başlangıç içeriğiyle ekle.', 'Dili oluştur', 5],
  locales: ['Dil yapılandırması ve çeviri bakımını yönet.', 'Dil veya çeviriyi düzenle', 5],
  ai: ['AI yeteneği, sağlayıcı ve veri kullanımını anlayarak ayarla.', 'AI ayarını kaydet', 5],
  chat: ['AI konuşmasının kapsamını ve akış durumunu anlaşılır göster.', 'Mesaj gönder', 5],
  'project-risk': ['Proje risk önerisini kanıt ve yetenek sınırıyla değerlendir.', 'Analiz başlat ve sonucu incele', 5],
  revisions: ['Müşterinin görünür revizyonlarını proje ve durumuyla incele.', 'Revizyonu aç veya talep et', 6],
  revision: ['Doğru projede açıklaması net bir revizyon talep et.', 'Revizyon talebini gönder', 6],
  'business-invoices': ['Faturaları ödeme ve teslim durumuyla takip et.', 'Faturayı incele veya oluştur', 5],
  'business-proposals': ['Teklifleri müşteri, kapsam ve kabul durumuyla takip et.', 'Teklifi incele veya oluştur', 5],
  'business-subscriptions': ['Tekrarlayan iş ilişkilerini dönem ve tutarıyla takip et.', 'Aboneliği incele veya oluştur', 5],
  'forgot-password': ['Hesap varlığı ifşa etmeden parola sıfırlama isteği oluştur.', 'Sıfırlama bağlantısı iste', 1],
  'reset-password': ['Geçerli sıfırlama bağlantısıyla yeni parola oluştur.', 'Yeni parolayı kaydet', 1],
  'invite-token': ['Davetin çalışma alanını ve müşteri bağlamını anlayarak katıl.', 'Daveti kabul et', 1],
  register: ['Kayıt politikasını ve uygun katılım yolunu anlaşılır göster.', 'İzin verilen katılım yoluna devam et', 1],
};
export function initialBrief(page) {
  let key = page.id.replace(/^portal-/, '').replace(/^owner-/, '').replace(/^settings-/, '').replace(/-settings$/, '');
  if (key === 'workspace') key = 'general';
  if (key === 'portal') key = 'home';
  let selected = briefs[key];
  if (page.platform === 'web') selected = page.id.includes('docs')
    ? ['Kurulum ve kullanım bilgisini konu ve dil üzerinden bul.', 'İlgili dokümantasyon konusunu aç', 7]
    : ['Ürünün amacı ve kurulum yolunu anlaşılır göster.', 'Kurulum veya dokümantasyona geç', 7];
  if (!selected) throw new Error(`Sayfa brief eşlemesi eksik: ${page.platform}/${page.actor}/${page.id}`);
  return { goal: selected[0], primaryAction: selected[1], reviewWave: page.actor === 'client' ? 6 : selected[2],
    briefStatus: 'draft-needs-ux-review', reviewQuestions: ['Birincil aksiyon ilk bakışta anlaşılır mı?',
      'Geri dönüş ve hata kurtarma akışı açık mı?', 'Rol, ilişki ve veri kapsamı doğru anlaşılır mı?',
      'Klavye, ekran okuyucu ve dar ekran kullanımı yeterli mi?'] };
}

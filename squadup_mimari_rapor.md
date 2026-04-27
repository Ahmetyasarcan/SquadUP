# SquadUp Mobil Uygulama Mimari Tasarım Raporu

## 1. Laboratuvarın Amacı
Bu rapor, SquadUp mobil uygulamasının temel yazılım mimarisini, bileşenlerini ve veri akışını şematik olarak ifade etmek amacıyla hazırlanmıştır.

## 2. Mimari Bileşenlerin Belirlenmesi
Uygulamayı oluşturan temel bileşenler aşağıda tanımlanmıştır:

*   **Kullanıcı Arayüzü (UI / Ekranlar):** React Native (Expo) ile geliştirilen Keşfet, Squads, Arkadaşlar ve Profil ekranları.
*   **İş Mantığı (Uygulama Kuralları):** Flask API üzerinde çalışan eşleşme algoritması, rozet kazanım mantığı ve arkadaşlık istek kontrolleri.
*   **Veri Kaynağı (Veritabanı / API):** Bulut tabanlı Supabase PostgreSQL veritabanı ve yerel Expo SecureStore depolama birimi.

## 3. Katmanlı Yapı
Uygulama mimarisi, sorumlulukların ayrılması prensibiyle 3 katmanlı olarak tasarlanmıştır:

1.  **Sunum Katmanı (UI):** Kullanıcının etkileşimde bulunduğu ekranlar ve görsel bileşenler.
2.  **İş Mantığı Katmanı:** Verinin işlendiği, doğrulandığı ve kuralların uygulandığı servis katmanı.
3.  **Veri Katmanı:** Ham verinin saklandığı ve yönetildiği PostgreSQL veritabanı katmanı.

## 4. Veri Akışı
Kullanıcının bir işlem başlatmasıyla (örneğin arkadaş ekleme) verinin akış yönü:
1. UI üzerinden tetiklenen aksiyon API'ye gönderilir.
2. API üzerinde iş mantığı kuralları (self-request kontrolü vb.) çalıştırılır.
3. Veritabanına kalıcı kayıt yapılır.
4. İşlem sonucu UI katmanına geri dönerek arayüzü günceller.

---
*Bu rapor, Week 6 Fonksiyonel Programlama Laboratuvar Föyü formatına uygun olarak hazırlanmıştır.*

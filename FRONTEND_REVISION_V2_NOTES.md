# Noxelera Frontend Revision v2

Bu revizyonda istenen frontend akışları güncellendi.

## Siparişler
- Sipariş yönetimi tablo taşma problemi kart tabanlı/responsive görünüme dönüştürüldü.
- İptal nedeni artık tabloda/altta yazılan input değil; iptal butonuna basınca modal açılır.
- İptal modalı kullanıcıyı uyarır ve iptal nedenini opsiyonel olarak sorar.
- İptal edilen siparişlerde onayla/hazır/teslim butonları gösterilmez.
- Siparişler üç sekmeye ayrıldı:
  - Kurum talepleri
  - Admin siparişi
  - Sipariş takip
- Admin sipariş formu kolonlu akışa çevrildi:
  - Lise / Ortaokul
  - Sınıf / seviye
  - Deneme seçimi ve depo adedi
  - Kurum seçimi
  - Deneme adedi
  - Stok davranışı
  - Opsiyonel açıklama
- Admin sipariş oluşturunca sipariş takip kısmına düşer.
- Sipariş takip kısmı Yeni / Hazır / Teslim kolonlarına ayrıldı.

## Fiyat & İskonto
- Kurum bazlı iskonto düzenlenebilir.
- Marka bazlı iskonto düzenlenebilir.
- Markalar için maksimum iskonto sınırı eklendi.
- Siparişte etkin iskonto marka maksimum sınırını aşmayacak şekilde hesaplanır.

## Markalar
- Marka ekleme formuna marka iskontosu ve maksimum iskonto alanları eklendi.
- Belirsiz etiket alanı kaldırıldı/sadeleştirildi.

## Duyurular
- Duyuru görsel alanı geri eklendi.
- Duyuru görsel URL'si düzenlenebilir hale getirildi.
- Duyurular düzenlenebilir, pasifleştirilebilir ve silinebilir hale getirildi.

## Talep Vitrini
- Denemeler talep adedine göre sıralanır.
- İptal edilen siparişler talep hesabına dahil edilmez.
- Admin denemeyi vitrinde yayınlayabilir/pasife çekebilir.

## Depo
- Depo içindeki sipariş alanı ana Siparişler modülüne taşındığı için gizlendi.
- Depo kullanıcıları ana Kullanıcılar bölümüne taşındı.
- Depo kayıtlı okullar/dershaneler ana Dershaneler bölümünden beslenecek şekilde korundu.
- Depo gün sonu raporu ana Gün Sonu Raporu bölümüne taşındı.

## Gün Sonu Raporu
- Noxelera ana menüsüne ayrı bölüm olarak korundu.
- Toplu özet kartları eklendi.
- Her hareket ayrı ayrı listelenebilir hale getirildi.
- Sipariş durumu, iptal, Akson gönderildi/gönderilmedi gibi detaylar hareketlerde gösterildi.

## Kullanıcılar
- Depo kullanıcıları ana Kullanıcılar bölümünde yönetilir.
- Yetki matrisi aç/kapat mantığında düzenlenebilir hale getirildi.

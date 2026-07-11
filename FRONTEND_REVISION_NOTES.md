# Noxelera Frontend Revizyon Notları

Bu sürüm backend bağlantısından önce istenen frontend akış düzeltmelerini içerir.

## Güncellenen dosyalar

- `src/components/admin/AdminPanel.jsx`
- `src/components/admin/WarehousePanel.jsx`

## Yapılan ana değişiklikler

### Admin Panel / Siparişler
- Siparişler ekranı iki bölüme ayrıldı:
  - Kurum talepleri
  - Admin manuel siparişi
- Admin manuel sipariş oluşturma alanı eklendi.
- Manuel siparişte stok davranışı seçimi eklendi:
  - Depodan stok düş
  - Stok düşme
  - Stok eksiye düşebilir
- İptal nedeni alanı eklendi ve zorunlu yapılmadı.
- İptal edilen siparişlerde Onayla / Teslim butonları kaldırıldı.
- Teslim edilen siparişlerde işlem kapalı gösterimi korundu.

### Markalar
- Belirsiz “etiket rengi” alanı kaldırıldı.
- Marka ekranı sadeleştirildi.

### Talep Vitrini
- Talep vitrini talep adedine göre sıralanacak şekilde düzenlendi.
- Talep adedi, sipariş adedi ve talep seviyesi görünür hale getirildi.
- Admin denemeyi yayına alma / pasife çekme işlemini kullanabiliyor.

### Depo
- Depo kullanıcıları ana Kullanıcılar bölümüne taşındı.
- Depo içindeki kullanıcı ve yetki matrisi kartları gizlendi.
- Depodaki kayıtlı okul/dershane yönetimi ana Dershaneler modülüne taşındı.
- Depo içindeki Gün Sonu Raporu ana Noxelera menüsüne taşındı.
- Depo sipariş oluşturma alanı korunarak Noxelera kurum listesiyle uyumlu hale getirildi.

### Kullanıcılar
- Kullanıcılar ekranına depo personeli/dağıtıcı rolleri eklendi.
- Yetki matrisi kullanıcılar ekranına taşındı.

### Gün Sonu Raporu
- Noxelera ana menüsüne ayrı bölüm olarak eklendi.

## Not
Bu sürüm hâlâ mock data ile çalışır. Bir sonraki aşama backend API bağlantısıdır.

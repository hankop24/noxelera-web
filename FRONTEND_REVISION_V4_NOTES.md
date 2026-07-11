# Noxelera Frontend Revision V4

Bu sürümde odak, ürün havuzu alanlarını değiştirmeden admin panel mimarisini ürün havuzu merkezli hale getirmektir.

## Yapılanlar

- Sol panel konuşulan nihai yapıya göre gruplandı:
  - Ana Sayfa / Dashboard
  - Sipariş Yönetimi / Siparişler
  - Ürün Yönetimi / Ürün Havuzu, Vitrin / Takvim, Yayınevi & İskonto
  - Depo Yönetimi / Depo, Gün Sonu
  - Kurum Yönetimi / Kurumlar, Kullanıcılar
  - İçerik / Duyurular
  - Sistem / Ayarlar
- Ürün Havuzu ekranındaki mevcut bilgiler korunmuştur; yeni kolon/alan eklenmemiştir.
- Vitrin / Takvim ekranında lise ve ortaokul bileşen seçimi ayrıldı:
  - Lise: A ve B kitapçığı
  - Ortaokul: Sayısal A, Sözel A, Sayısal B, Sözel B
- Sipariş detay modalına depo / fatura / Akson bileşenleri görünümü eklendi.
- Admin manuel siparişleri ve onaylanan kurum siparişleri, bağlı vitrin ürününün ürün havuzu bileşenleriyle zenginleştirildi.
- Depo paneli, ürün havuzundaki mevcut ürünlerden türetilen stok görünümüyle beslenecek şekilde bağlandı.
- “Dershaneler” adlandırması “Kurumlar” olarak güncellendi.
- Ayarlar ekranındaki mimari not, ürün havuzu merkezli yeni bağlama göre güncellendi.

## Derleme

`npm run build` başarıyla çalıştı. Vite yalnızca bundle boyutu uyarısı verdi; kritik hata yoktur.

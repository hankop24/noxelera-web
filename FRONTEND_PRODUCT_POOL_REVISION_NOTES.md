# Noxelera Frontend Product Pool Revision

Bu revizyonda frontend ürün mimarisi Akson/Excel ürün yapısına göre güncellendi.

## Ana değişiklikler

- Denemeler ekranı artık ürün oluşturma ekranı değil, Takvim / Vitrin ekranı olarak düzenlendi.
- Yeni Ürün Havuzu ekranı eklendi.
- Ürün Havuzu içinde üç ekleme yöntemi eklendi:
  - Akson'dan çek
  - Excel olarak ekle
  - Manuel ürün ekle
- Ürün Havuzu Excel benzeri tablo görünümüne geçirildi.
- Ürün Havuzu kolonları:
  - Yayınevi
  - Ürün Kodu
  - Ürün Adı
  - Barkod
  - KDV dahil satış fiyatı
  - Kitapçık
  - Kaynak
- Ürün arama ve satır düzenleme eklendi.
- Stok kolonu ürün havuzundan çıkarıldı.
- Yayınevleri ekranı Marka & İskonto yerine Yayınevi & İskonto mantığına taşındı.
- Vitrin/Takvim ekranında A/B bileşen seçimi eklendi.
- Kurum tarafında ürün tek deneme gibi görünür; fatura/depo/Akson tarafında A/B bileşenler ayrı işlenir.
- Siparişler, kullanıcılar, duyurular, gün sonu raporu ve depo ayrımı korunmuştur.

## Not

Bu revizyon hâlâ mock data üzerinde çalışır. Backend bağlantısı sonraki aşamada yapılacaktır.

# Noxelera Frontend Revision V8

## Yapılanlar

- Dashboard sadece görüntüleme/özet ekranı olarak yeniden düzenlendi.
- Dashboard'a günlük durum özeti ve gelen sipariş akışı eklendi.
- Dashboard sipariş kartlarına tıklayınca sipariş detay modalı açılıyor.
- Sipariş takipte Hazırlanıyor durumu kaldırıldı.
- Sipariş takip alanları geniş kart kolonları olarak düzenlendi: Onaylandı, Hazır, Teslim edildi, İptal edildi.
- Sipariş kartlarının dışına yazı taşmasını azaltmak için kartlar sadeleştirildi.
- Admin siparişi oluşturma ekranında ürün seçimi arama destekli liste/combobox yapısına çevrildi.
- Adet alanının altında depo stok bilgisi gösterildi.
- Not alanı büyütüldü.
- Geçmiş siparişler ay -> gün -> sipariş mantığında görüntülenecek hale getirildi.
- Ürün havuzu tablo sırası değiştirildi: Yayınevi, Ürün adı, Barkod, Ürün kodu, KDV dahil fiyat, Sınıf.
- Ürün havuzu yayınevine göre alfabetik sıralanıyor.
- Vitrin/Takvim ekranı Ürün Ekle ve Vitrin olmak üzere iki moda ayrıldı.
- Vitrine ürün eklerken havuzdan arama destekli ürün seçimi eklendi.
- Deneme seçerken A kitapçığı seçildiğinde B kitapçığı otomatik öneriliyor; gerekirse elle değiştirilebiliyor.
- Vitrin fiyatı düzenlenebilir hale getirildi.
- Yayınevi iskontosu vitrin ürününe otomatik geliyor, ürün özelinde değiştirilebiliyor.
- Ay seçilince son sipariş tarihi otomatik öneriliyor.
- Vitrindeki ürünler aylara göre listelenip düzenlenebiliyor.
- Yayınevi & İskonto ekranı tıklanabilir yayınevi listesi ve ayrı iskonto kartı mantığına alındı.
- Sol panel logo/başlık alanı daha kompakt hale getirildi.
- Depo ve Gün Sonu modüllerine bu revizyonda bilinçli olarak dokunulmadı.

## Build

- `npm run build` başarılı.
- Sadece Vite bundle size uyarısı var, kritik değil.

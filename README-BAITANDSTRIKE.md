# BAITANDSTRIKE Commerce v1

Prototype operasional e-commerce mandiri untuk BAITANDSTRIKE.

## Sudah tersedia

- Storefront responsif dengan pencarian dan filter kategori.
- Produk, SKU, brand, stok, dan performa 28 hari dari export inventory BNS Master.
- Cart drawer dengan perubahan kuantitas dan hapus item.
- Alur permintaan quotation retail/B2B tanpa mengarang harga yang tidak tersedia di export.
- Dashboard admin untuk order, produk, inventory, dan customer B2B.
- Daftar penawaran tersimpan pada browser untuk pengujian v1.

## Data katalog saat ini

- 3.692 SKU pada export inventory.
- 1.263 SKU memiliki stok tersedia.
- 153.247 unit stok positif.
- 31.509 penjualan pada kolom 28 hari.
- Export tidak memuat harga jual atau URL gambar Shopify; harga ditampilkan melalui alur quotation.

## Integrasi produksi berikutnya

1. Database PostgreSQL atau Cloudflare D1 untuk produk, customer, order, dan inventory.
2. Payment gateway resmi melalui API + webhook, tanpa menyimpan data kartu.
3. Shipping aggregator atau API kurir untuk tarif, AWB, pickup, dan tracking.
4. Mabang ERP sebagai pusat order/warehouse melalui adapter API.
5. Authentication dan role: Owner, Admin, Warehouse, Finance, dan Customer B2B.

## Boundary adapter yang disarankan

- `PaymentProvider`: createInvoice, verifyWebhook, getPaymentStatus.
- `ShippingProvider`: getRates, createShipment, requestPickup, track.
- `MabangProvider`: syncProduct, syncInventory, pushOrder, pullFulfillment.

Provider live memerlukan credential dan dokumentasi akun milik BAITANDSTRIKE. Jangan masukkan token ke source code; gunakan environment variables pada hosting.

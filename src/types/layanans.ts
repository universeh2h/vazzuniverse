export type Layanan = {
  id: number;
  kategoriId: string; // Mapped from "kategori_id"
  subCategoryId: number; // Mapped from "sub_category_id"
  layanan: string;
  providerId: string; // Mapped from "provider_id"
  harga: number;
  hargaReseller: number; // Mapped from "harga_reseller"
  hargaPlatinum: number; // Mapped from "harga_platinum"
  hargaGold: number; // Mapped from "harga_gold"
  hargaFlashSale?: number | null; // Optional, default 0, mapped from "harga_flash_sale"
  profit: number;
  profitReseller: number; // Mapped from "profit_reseller"
  profitPlatinum: number; // Mapped from "profit_platinum"
  profitGold: number; // Mapped from "profit_gold"
  isFlashSale: boolean; // Default false, mapped from "is_flash_sale"
  judulFlashSale?: string | null; // Optional, mapped from "judul_flash_sale"
  bannerFlashSale?: string | null; // Optional, mapped from "banner_flash_sale"
  expiredFlashSale?: string | null; // Optional, mapped from "expired_flash_sale"
  catatan: string;
  status: boolean;
  provider: string;
  productLogo?: string | null; // Optional, mapped from "product_logo"
  createdAt?: string | null; // Optional, default now(), mapped from "created_at"
  updatedAt?: string | null; // Optional, updated at, mapped from "updated_at"
};

export interface LayananWithCategoryAndSub extends Layanan {
  category: {
    id: number;
    name: string;
  };
  subCategory: {
    id: number;
    name: string;
  };
}

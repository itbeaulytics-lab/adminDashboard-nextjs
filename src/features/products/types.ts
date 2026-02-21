export interface Category {
  id: string;
  name: string;
}

export interface ProductType {
  id: string;
  name: string;
}

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  featured?: boolean;
  category_id?: string;
  product_type_id?: string;
  categories?: { name: string } | null;
  product_types?: { name: string } | null;
  // UI Helpers
  category_name?: string;
  type_name?: string;
  created_at: string; // ISO timestamp from Supabase
}

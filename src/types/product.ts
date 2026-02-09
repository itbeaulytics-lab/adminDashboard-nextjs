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
  category_id?: string;
  product_type_id?: string;
  categories?: { name: string } | null;
  product_types?: { name: string } | null;
  created_at: string; // ISO timestamp from Supabase
}

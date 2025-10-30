export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  created_at: string; // ISO timestamp from Supabase
}

export interface Service {
  id: string;
  name_ar: string;
  name_en: string | null;
  description_ar: string | null;
  duration_min: number;
  price_sar: number;
  image_url: string | null;
  category: string | null;
  active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Specialist {
  id: string;
  name: string;
  bio_ar: string | null;
  avatar_url: string | null;
  phone: string | null;
  email: string | null;
  active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

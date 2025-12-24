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
  display_order: number | null;
}

export interface Specialist {
  id: string;
  name: string;
  bio_ar: string | null;
  avatar_url: string | null;
  phone: string | null;
  email: string | null;
  active: boolean;
  display_order: number | null;
}

export interface Booking {
  id: string;
  customer_name: string;
  customer_phone: string;
  specialist_id: string | null;
  booking_date: string; // ISO date
  start_time: string;   // HH:MM:SS
  end_time: string;     // HH:MM:SS
  total_amount: number;
  status: 'pending_payment' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  payment_id: string | null;
  payment_link: string | null;
  payment_method: string | null;
  notes: string | null;
  cancellation_reason: string | null;
  cancelled_at: string | null;
  confirmed_at: string | null;
  created_at: string;
  updated_at: string;
}

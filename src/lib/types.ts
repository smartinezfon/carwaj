export type Role = "cleaner" | "admin";
export type BookingStatus = "scheduled" | "in_progress" | "completed" | "cancelled";
export type SubscriptionFrequency = "weekly" | "biweekly" | "monthly";
export type PaymentStatus = "pending" | "paid";

export interface Community {
  id: string;
  name: string;
  location_description: string | null;
  created_at: string;
}

export interface Villa {
  id: string;
  community_id: string;
  villa_number: string;
  owner_name: string;
  owner_whatsapp: string;
  notes: string | null;
  created_at: string;
}

export interface Car {
  id: string;
  villa_id: string;
  make: string;
  model: string;
  color: string | null;
  plate_number: string | null;
  created_at: string;
}

export interface Employee {
  id: string;
  auth_user_id: string | null;
  name: string;
  whatsapp_number: string | null;
  role: Role;
  community_ids: string[];
  created_at: string;
}

export interface ServiceSubscription {
  id: string;
  villa_id: string;
  frequency: SubscriptionFrequency;
  day_of_week: number | null;
  price_per_clean: number;
  active: boolean;
  created_at: string;
}

export interface Booking {
  id: string;
  car_id: string;
  employee_id: string | null;
  scheduled_date: string;
  scheduled_time_slot: string;
  status: BookingStatus;
  before_photo_url: string | null;
  after_photo_url: string | null;
  notes: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface BookingWithDetails extends Booking {
  car: Car;
  villa: Villa;
}

export interface Payment {
  id: string;
  villa_id: string;
  amount: number;
  due_date: string;
  status: PaymentStatus;
  payment_method: string | null;
  created_at: string;
}

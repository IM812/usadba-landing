export type BookingStatus = 'pending' | 'confirmed' | 'cancelled'
export type BookingSource = 'site' | 'avito' | 'manual'

export interface Booking {
  id: string
  guest_name: string
  phone: string
  email: string | null
  guests_count: number
  check_in: string  // YYYY-MM-DD
  check_out: string // YYYY-MM-DD
  total_price: number
  comment: string | null
  source: BookingSource
  status: BookingStatus
  created_at: string
  updated_at: string
}

export interface Settings {
  id: number
  base_price: number
  weekend_price: number
  extra_guest_price: number
  minimum_nights: number
  cleaning_fee: number
  check_in_time: string
  check_out_time: string
  phone: string
  email: string
  address: string
  telegram: string
  whatsapp: string
  title: string
  subtitle: string
  description: string
  telegram_bot_token: string
  telegram_chat_id: string
  avito_ics_url: string
  site_url: string
}

export interface GalleryItem {
  id: string
  url: string
  alt: string
  sort_order: number
  is_main: boolean
  created_at: string
}

export interface Amenity {
  id: string
  label: string
  icon: string
  sort_order: number
}

export interface Review {
  id: string
  author: string
  text: string
  rating: number
  date: string
  is_visible: boolean
  sort_order: number
  created_at: string
}

export interface FaqItem {
  id: string
  question: string
  answer: string
  sort_order: number
}

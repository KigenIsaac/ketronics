export interface Category { id: string; name: string; created_at: string; updated_at: string; }
export interface Subcategory { id: string; name: string; category_id: string; category?: Category; created_at: string; updated_at: string; }
export interface SubcategoryAttribute { id: string; subcategory_id: string; subcategory?: Subcategory; name: string; type: 'text' | 'number' | 'select'; options?: string[]; display_in_card: boolean; created_at: string; updated_at: string; }
export interface Product {
  id: string; name: string; description: string; price: number; brand?: string; buying_price?: number; discount?: number;
  category_id?: string; subcategory_id?: string; images: string[]; attributes: Record<string, any>; status?: 'active' | 'inactive' | 'draft';
  track_inventory?: boolean; stock_quantity?: number; low_stock_threshold?: number; created_at: string; updated_at: string; created_by?: string;
  category?: Category; subcategory?: Subcategory;
}
export interface Order {
  id: string; user_id?: string | null; customer_email?: string | null; total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'refunded' | 'returned';
  shipping_address?: { name: string; email?: string; phone: string; address: string; city: string; country: string; };
  payment_method: string; created_at: string; updated_at: string; order_items?: OrderItem[];
  profiles?: { email: string; full_name?: string; };
}
export interface OrderItem { id: string; order_id: string; product_id?: string; product_name: string; product_image?: string; quantity: number; price: number; attributes: Record<string, any>; created_at: string; }
export interface Page { id: string; slug: string; title: string; content: string; meta_title?: string; meta_description?: string; is_published: boolean; created_at: string; updated_at: string; created_by?: string; }
export interface PageSection { id: string; page_id: string; section_type: string; title?: string; content?: string; image_url?: string; button_text?: string; button_url?: string; sort_order: number; is_active: boolean; created_at: string; updated_at: string; }
export interface FAQ { id: string; question: string; answer: string; category?: string; sort_order: number; is_published: boolean; created_at: string; updated_at: string; created_by?: string; }
export interface ContactInfo { id: string; type: string; label: string; value: string; icon?: string; sort_order: number; is_active: boolean; created_at: string; updated_at: string; }
export interface SiteSetting { id: string; key: string; value: string; type: string; description?: string; updated_at: string; updated_by?: string; }

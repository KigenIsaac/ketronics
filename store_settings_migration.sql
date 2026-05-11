-- Create store_settings table for admin settings
CREATE TABLE IF NOT EXISTS store_settings (
  id SERIAL PRIMARY KEY,
  store_name TEXT NOT NULL DEFAULT 'Ketronics LTD',
  store_description TEXT NOT NULL DEFAULT 'Tech Products & Expert Services',
  contact_email TEXT NOT NULL DEFAULT 'support@ketronics.co.ke',
  contact_phone TEXT,
  address TEXT,
  currency TEXT NOT NULL DEFAULT 'KES',
  timezone TEXT NOT NULL DEFAULT 'Africa/Nairobi',
  maintenance_mode BOOLEAN NOT NULL DEFAULT false,
  allow_guest_checkout BOOLEAN NOT NULL DEFAULT true,
  require_email_verification BOOLEAN NOT NULL DEFAULT true,
  enable_notifications BOOLEAN NOT NULL DEFAULT true,
  smtp_host TEXT,
  smtp_port TEXT,
  smtp_user TEXT,
  smtp_password TEXT,
  payment_methods TEXT[] NOT NULL DEFAULT ARRAY['mpesa', 'card'],
  shipping_methods TEXT[] NOT NULL DEFAULT ARRAY['standard', 'express'],
  tax_rate DECIMAL(5,2) NOT NULL DEFAULT 16.00,
  free_shipping_threshold DECIMAL(10,2) NOT NULL DEFAULT 5000.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings if not exists
INSERT INTO store_settings (id, store_name, store_description, contact_email, contact_phone, address, currency, timezone, maintenance_mode, allow_guest_checkout, require_email_verification, enable_notifications, payment_methods, shipping_methods, tax_rate, free_shipping_threshold)
VALUES (1, 'Ketronics LTD', 'Tech Products & Expert Services', 'info@ketronics.co.ke', '+254 XXX XXX XXX', 'AA building floor room F6A', 'KES', 'Africa/Nairobi', false, true, true, true, ARRAY['mpesa', 'card'], ARRAY['standard', 'express'], 16.00, 5000.00)
ON CONFLICT (id) DO NOTHING;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_store_settings_updated_at
    BEFORE UPDATE ON store_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
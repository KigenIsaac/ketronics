-- Database schema updates for dynamic content management
-- Run these statements in your Supabase SQL editor

-- Create table for dynamic pages content
CREATE TABLE IF NOT EXISTS pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  meta_title VARCHAR(255),
  meta_description TEXT,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create table for page sections (for complex pages with multiple sections)
CREATE TABLE IF NOT EXISTS page_sections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
  section_type VARCHAR(50) NOT NULL, -- 'hero', 'content', 'faq', 'contact', etc.
  title VARCHAR(255),
  content TEXT,
  image_url TEXT,
  button_text VARCHAR(255),
  button_url VARCHAR(255),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for FAQs
CREATE TABLE IF NOT EXISTS faqs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category VARCHAR(100),
  sort_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create table for contact information
CREATE TABLE IF NOT EXISTS contact_info (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type VARCHAR(50) NOT NULL, -- 'email', 'phone', 'address', 'social'
  label VARCHAR(255) NOT NULL,
  value TEXT NOT NULL,
  icon VARCHAR(100),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for site settings
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  value TEXT,
  type VARCHAR(50) DEFAULT 'text', -- 'text', 'number', 'boolean', 'json'
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create table for user profiles extension (if not exists)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email VARCHAR(255),
  full_name VARCHAR(255),
  phone VARCHAR(50),
  avatar_url TEXT,
  role VARCHAR(50) DEFAULT 'customer',
  is_active BOOLEAN DEFAULT true,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pages
CREATE POLICY "Public can view published pages" ON pages
  FOR SELECT USING (is_published = true);

CREATE POLICY "Managers can manage pages" ON pages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('manager', 'admin')
    )
  );

-- RLS Policies for page_sections
CREATE POLICY "Public can view active page sections" ON page_sections
  FOR SELECT USING (is_active = true);

CREATE POLICY "Managers can manage page sections" ON page_sections
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('manager', 'admin')
    )
  );

-- RLS Policies for faqs
CREATE POLICY "Public can view published FAQs" ON faqs
  FOR SELECT USING (is_published = true);

CREATE POLICY "Managers can manage FAQs" ON faqs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('manager', 'admin')
    )
  );

-- RLS Policies for contact_info
CREATE POLICY "Public can view active contact info" ON contact_info
  FOR SELECT USING (is_active = true);

CREATE POLICY "Managers can manage contact info" ON contact_info
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('manager', 'admin')
    )
  );

-- RLS Policies for site_settings
CREATE POLICY "Public can view site settings" ON site_settings
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Managers can manage site settings" ON site_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('manager', 'admin')
    )
  );

-- RLS Policies for profiles (existing)
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Managers can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('manager', 'admin')
    )
  );

-- Insert default data
INSERT INTO pages (slug, title, content, meta_title, meta_description) VALUES
('about-us', 'About Us', '<h1>About Ketronics LTD</h1><p>We are a leading technology company specializing in laptops, printers, TVs, PCs and expert tech services including maintenance, repairs, CCTV installation and network solutions.</p>', 'About Ketronics LTD', 'Learn more about Ketronics LTD and our commitment to tech excellence.'),
('terms-and-conditions', 'Terms and Conditions', '<h1>Terms and Conditions</h1><p>By using our services, you agree to comply with and be bound by the following terms and conditions of use.</p>', 'Terms and Conditions', 'Read our complete terms and conditions of use.'),
('privacy-policy', 'Privacy Policy', '<h1>Privacy Policy</h1><p>We respect your privacy and are committed to protecting your personal information. This privacy policy explains how we collect, use, and safeguard your data.</p>', 'Privacy Policy - Ketronics LTD', 'Learn about how we protect and handle your personal information at Ketronics LTD.'),
('support', 'Customer Support', '<h1>Customer Support</h1><p>Get help with your orders and products. Our dedicated support team is here to assist you with any questions or issues you may have.</p>', 'Support - Ketronics LTD', 'Get help and support for your Ketronics LTD products and services.')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO faqs (question, answer, category) VALUES
('How do I place an order?', 'To place an order, browse our products, add items to your cart, and proceed to checkout.', 'Orders'),
('What payment methods do you accept?', 'We accept credit cards, debit cards, and mobile money payments.', 'Payment'),
('How long does shipping take?', 'Shipping typically takes 2-5 business days within Kenya.', 'Shipping'),
('Can I return products?', 'Yes, we offer a 30-day return policy for unused products in original packaging.', 'Returns')
ON CONFLICT DO NOTHING;

INSERT INTO contact_info (type, label, value, icon) VALUES
('email', 'Email Support', 'info@ketronics.co.ke', 'Mail'),
('phone', 'Phone Support', '+254 700 000 000', 'Phone'),
('address', 'Main Office', 'AA building 1st floor room F6A', 'MapPin'),
('social', 'Facebook', 'https://facebook.com/ketronics', 'Facebook'),
('social', 'Twitter', 'https://twitter.com/ketronics', 'Twitter')
ON CONFLICT DO NOTHING;

INSERT INTO site_settings (key, value, type, description) VALUES
('site_name', 'Ketronics LTD', 'text', 'The name of the website'),
('site_description', 'Shop for laptops, printers, TVs, PCs and more. Expert tech services including maintenance, repairs, CCTV installation, and network setup.', 'text', 'Site description for SEO'),
('contact_email', 'info@ketronics.co.ke', 'text', 'Primary contact email'),
('contact_phone', '+254 700 000 000', 'text', 'Primary contact phone'),
('business_hours', 'Mon-Fri: 8AM-6PM, Sat: 9AM-4PM', 'text', 'Business operating hours'),
('shipping_fee', '500', 'number', 'Default shipping fee in KES'),
('free_shipping_threshold', '5000', 'number', 'Minimum order amount for free shipping')
ON CONFLICT (key) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
CREATE INDEX IF NOT EXISTS idx_page_sections_page_id ON page_sections(page_id);
CREATE INDEX IF NOT EXISTS idx_faqs_category ON faqs(category);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON pages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_page_sections_updated_at BEFORE UPDATE ON page_sections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_faqs_updated_at BEFORE UPDATE ON faqs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contact_info_updated_at BEFORE UPDATE ON contact_info FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON site_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
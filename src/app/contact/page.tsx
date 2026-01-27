"use client";

import { useEffect, useState } from "react";
import { ContactInfo, SiteSetting } from "@/types/product";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LoadingPage } from "@/components/loading";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  HelpCircle,
  Package
} from "lucide-react";
import { toast } from "sonner";

const iconMap = {
  Mail,
  Phone,
  MapPin,
  Clock,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
};

export default function ContactPage() {
  const [contactInfo, setContactInfo] = useState<ContactInfo[]>([]);
  const [siteSettings, setSiteSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchContactData();
  }, []);

  const fetchContactData = async () => {
    try {
      const [contactRes, settingsRes] = await Promise.all([
        supabase
          .from('contact_info')
          .select('*')
          .eq('is_active', true)
          .order('sort_order'),
        supabase
          .from('site_settings')
          .select('key, value')
          .in('key', ['contact_email', 'contact_phone', 'business_hours'])
      ]);

      if (contactRes.data) setContactInfo(contactRes.data);
      if (settingsRes.data) {
        const settingsMap = settingsRes.data.reduce((acc, setting) => {
          acc[setting.key] = setting.value;
          return acc;
        }, {} as Record<string, string>);
        setSiteSettings(settingsMap);
      }
    } catch (error) {
      console.error('Error fetching contact data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (iconName?: string) => {
    if (!iconName) return null;
    return iconMap[iconName as keyof typeof iconMap] || null;
  };

  const groupContactInfo = (type: string) => {
    return contactInfo.filter(info => info.type === type);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Here you would typically send the form data to your backend
      // For now, we'll just show a success message
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

      toast.success('Message sent successfully! We\'ll get back to you soon.');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (loading) {
    return <LoadingPage message="Loading contact information..." />;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <MessageSquare className="h-12 w-12 text-primary mr-3" />
          <h1 className="text-4xl font-bold">Contact Us</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Get in touch with us for any questions or support
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contact Form */}
        <Card>
          <CardHeader>
            <CardTitle>Send us a message</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-1">
                    Name *
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1">
                    Email *
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium mb-1">
                  Subject *
                </label>
                <Input
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  placeholder="What's this about?"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-1">
                  Message *
                </label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  placeholder="Tell us how we can help you..."
                />
              </div>
              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <div className="space-y-6">
          {/* Contact Details */}
          <Card>
            <CardHeader>
              <CardTitle>Get in touch</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {groupContactInfo('email').map((email) => {
                const Icon = getIcon(email.icon);
                return (
                  <div key={email.id} className="flex items-center space-x-3">
                    {Icon && <Icon className="h-5 w-5 text-primary" />}
                    <div>
                      <p className="font-medium">{email.label}</p>
                      <a
                        href={`mailto:${email.value}`}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {email.value}
                      </a>
                    </div>
                  </div>
                );
              })}
              {groupContactInfo('phone').map((phone) => {
                const Icon = getIcon(phone.icon);
                return (
                  <div key={phone.id} className="flex items-center space-x-3">
                    {Icon && <Icon className="h-5 w-5 text-primary" />}
                    <div>
                      <p className="font-medium">{phone.label}</p>
                      <a
                        href={`tel:${phone.value}`}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {phone.value}
                      </a>
                    </div>
                  </div>
                );
              })}
              {groupContactInfo('address').map((address) => {
                const Icon = getIcon(address.icon);
                return (
                  <div key={address.id} className="flex items-start space-x-3">
                    {Icon && <Icon className="h-5 w-5 text-primary mt-0.5" />}
                    <div>
                      <p className="font-medium">{address.label}</p>
                      <p className="text-muted-foreground">{address.value}</p>
                    </div>
                  </div>
                );
              })}
              {siteSettings.business_hours && (
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Business Hours</p>
                    <p className="text-muted-foreground">{siteSettings.business_hours}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Social Media */}
          {groupContactInfo('social').length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Follow us</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-4">
                  {groupContactInfo('social').map((social) => {
                    const Icon = getIcon(social.icon);
                    return Icon ? (
                      <Button key={social.id} variant="outline" size="sm" asChild>
                        <a
                          href={social.value}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2"
                        >
                          <Icon className="h-4 w-4" />
                          <span className="hidden sm:inline">{social.label}</span>
                        </a>
                      </Button>
                    ) : null;
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/faq">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Browse FAQ
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/support">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Support Center
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/products">
                  <Package className="h-4 w-4 mr-2" />
                  Shop Products
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
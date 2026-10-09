'use client';

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Settings, Store, CreditCard, Truck, Shield, Save, RefreshCw } from "lucide-react";

interface StoreSettings {
  storeName: string;
  storeDescription: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  currency: "KES" | "USD" | "EUR";
  timezone: string;
  maintenanceMode: boolean;
  allowGuestCheckout: boolean;
  requireEmailVerification: boolean;
  enableNotifications: boolean;
  paymentMethods: string[];
  shippingMethods: string[];
  taxRate: number;
  freeShippingThreshold: number;
}

const DEFAULT_SETTINGS: StoreSettings = {
  storeName: "Ketronics LTD",
  storeDescription: "Tech Products & Expert Services",
  contactEmail: "support@ketronics.co.ke",
  contactPhone: "",
  address: "",
  currency: "KES",
  timezone: "Africa/Nairobi",
  maintenanceMode: false,
  allowGuestCheckout: true,
  requireEmailVerification: true,
  enableNotifications: true,
  paymentMethods: ["mpesa", "card"],
  shippingMethods: ["standard", "express"],
  taxRate: 16,
  freeShippingThreshold: 5000,
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/settings", { cache: "no-store" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Failed to load settings");
      setSettings({ ...DEFAULT_SETTINGS, ...body.settings });
    } catch (error) {
      console.error("Failed to load settings:", error);
      toast.error("Could not load store settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const response = await fetch("/api/admin/settings", { cache: "no-store" });
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || "Failed to load settings");

        if (!cancelled) {
          setSettings({ ...DEFAULT_SETTINGS, ...body.settings });
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
        if (!cancelled) toast.error("Could not load store settings");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const update = <K extends keyof StoreSettings>(field: K, value: StoreSettings[K]) => {
    setSettings((current) => ({ ...current, [field]: value }));
  };

  const toggleArrayValue = (field: "paymentMethods" | "shippingMethods", value: string) => {
    setSettings((current) => {
      const values = current[field];
      return {
        ...current,
        [field]: values.includes(value)
          ? values.filter((item) => item !== value)
          : [...values, value],
      };
    });
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Failed to save settings");
      setSettings({ ...DEFAULT_SETTINGS, ...body.settings });
      toast.success("Settings saved successfully");
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto flex min-h-64 items-center justify-center p-6">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Store Settings</h1>
            <p className="text-muted-foreground">Configure store behavior and preferences.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => void loadSettings()} disabled={saving}>
              <RefreshCw className="mr-2 h-4 w-4" /> Refresh
            </Button>
            <Button onClick={() => void saveSettings()} disabled={saving}>
              <Save className="mr-2 h-4 w-4" /> {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="payment">Payment</TabsTrigger>
            <TabsTrigger value="shipping">Shipping</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Store className="h-5 w-5" /> Store Information</CardTitle>
                  <CardDescription>Public information displayed across the store.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div><Label htmlFor="storeName">Store Name</Label><Input id="storeName" value={settings.storeName} onChange={(e) => update("storeName", e.target.value)} /></div>
                    <div><Label htmlFor="contactEmail">Contact Email</Label><Input id="contactEmail" type="email" value={settings.contactEmail} onChange={(e) => update("contactEmail", e.target.value)} /></div>
                  </div>
                  <div><Label htmlFor="storeDescription">Store Description</Label><Textarea id="storeDescription" value={settings.storeDescription} onChange={(e) => update("storeDescription", e.target.value)} rows={3} /></div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div><Label htmlFor="contactPhone">Contact Phone</Label><Input id="contactPhone" value={settings.contactPhone} onChange={(e) => update("contactPhone", e.target.value)} /></div>
                    <div><Label htmlFor="currency">Currency</Label><Select value={settings.currency} onValueChange={(value) => update("currency", value as StoreSettings["currency"])}><SelectTrigger id="currency"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="KES">Kenyan Shilling (KES)</SelectItem><SelectItem value="USD">US Dollar (USD)</SelectItem><SelectItem value="EUR">Euro (EUR)</SelectItem></SelectContent></Select></div>
                  </div>
                  <div><Label htmlFor="address">Store Address</Label><Textarea id="address" value={settings.address} onChange={(e) => update("address", e.target.value)} rows={2} /></div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5" /> Store Preferences</CardTitle></CardHeader>
                <CardContent className="space-y-5">
                  {([
                    ["maintenanceMode", "Maintenance Mode", "Restrict normal store access while maintenance is in progress."],
                    ["allowGuestCheckout", "Allow Guest Checkout", "Allow customers to place orders without creating an account."],
                    ["requireEmailVerification", "Require Email Verification", "Require verification for newly created accounts."],
                    ["enableNotifications", "Enable Notifications", "Send configured order and customer notifications."],
                  ] as const).map(([field, label, description]) => (
                    <div key={field} className="flex items-center justify-between gap-4">
                      <div><Label>{label}</Label><p className="text-sm text-muted-foreground">{description}</p></div>
                      <Switch checked={settings[field]} onCheckedChange={(checked) => update(field, checked)} />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="payment">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5" /> Payment Methods</CardTitle><CardDescription>Enable only payment methods that are actually configured.</CardDescription></CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                {[
                  ["mpesa", "M-Pesa", "Mobile money payments"],
                  ["card", "Credit/Debit Card", "Stripe card payments"],
                  ["bank", "Bank Transfer", "Direct bank transfers"],
                  ["cod", "Cash on Delivery", "Pay when the order is delivered"],
                ].map(([value, label, description]) => (
                  <div key={value} className="flex items-center justify-between rounded-lg border p-4">
                    <div><h4 className="font-medium">{label}</h4><p className="text-sm text-muted-foreground">{description}</p></div>
                    <Switch checked={settings.paymentMethods.includes(value)} onCheckedChange={() => toggleArrayValue("paymentMethods", value)} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="shipping">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Truck className="h-5 w-5" /> Shipping</CardTitle><CardDescription>Configure tax and shipping availability.</CardDescription></CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div><Label htmlFor="taxRate">Tax Rate (%)</Label><Input id="taxRate" type="number" min="0" max="100" step="0.1" value={settings.taxRate} onChange={(e) => update("taxRate", Number(e.target.value) || 0)} /></div>
                  <div><Label htmlFor="freeShipping">Free Shipping Threshold</Label><Input id="freeShipping" type="number" min="0" step="0.01" value={settings.freeShippingThreshold} onChange={(e) => update("freeShippingThreshold", Number(e.target.value) || 0)} /></div>
                </div>
                <div>
                  <Label>Shipping Methods</Label>
                  <div className="mt-3 grid gap-4 md:grid-cols-2">
                    {[["standard", "Standard Shipping", "3–5 business days"], ["express", "Express Shipping", "1–2 business days"]].map(([value, label, description]) => (
                      <div key={value} className="flex items-center justify-between rounded-lg border p-4">
                        <div><h4 className="font-medium">{label}</h4><p className="text-sm text-muted-foreground">{description}</p></div>
                        <Switch checked={settings.shippingMethods.includes(value)} onCheckedChange={() => toggleArrayValue("shippingMethods", value)} />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Security</CardTitle><CardDescription>Security-sensitive credentials are intentionally not stored here.</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border p-4">
                  <h4 className="font-medium">Server-side secrets</h4>
                  <p className="mt-1 text-sm text-muted-foreground">SMTP, payment provider credentials, signing secrets, and API keys must be configured as server environment variables. They are never returned to the browser or persisted in store settings.</p>
                </div>
                <div className="rounded-lg border p-4">
                  <h4 className="font-medium">Access control</h4>
                  <p className="mt-1 text-sm text-muted-foreground">This page and its API are restricted to active manager/admin accounts, with database RLS providing a second authorization boundary.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

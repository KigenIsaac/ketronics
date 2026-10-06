import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

const settingsSchema = z.object({
  storeName: z.string().trim().min(1).max(120),
  storeDescription: z.string().trim().max(1000),
  contactEmail: z.string().email().max(254),
  contactPhone: z.string().trim().max(40),
  address: z.string().trim().max(500),
  currency: z.enum(["KES", "USD", "EUR"]),
  timezone: z.string().trim().min(1).max(80),
  maintenanceMode: z.boolean(),
  allowGuestCheckout: z.boolean(),
  requireEmailVerification: z.boolean(),
  enableNotifications: z.boolean(),
  paymentMethods: z.array(z.enum(["mpesa", "card", "bank", "cod"])).max(4),
  shippingMethods: z.array(z.enum(["standard", "express"])).max(2),
  taxRate: z.number().finite().min(0).max(100),
  freeShippingThreshold: z.number().finite().min(0).max(100000000),
});

function toDatabaseSettings(settings: z.infer<typeof settingsSchema>) {
  return {
    id: 1,
    store_name: settings.storeName,
    store_description: settings.storeDescription,
    contact_email: settings.contactEmail,
    contact_phone: settings.contactPhone || null,
    address: settings.address || null,
    currency: settings.currency,
    timezone: settings.timezone,
    maintenance_mode: settings.maintenanceMode,
    allow_guest_checkout: settings.allowGuestCheckout,
    require_email_verification: settings.requireEmailVerification,
    enable_notifications: settings.enableNotifications,
    payment_methods: settings.paymentMethods,
    shipping_methods: settings.shippingMethods,
    tax_rate: settings.taxRate,
    free_shipping_threshold: settings.freeShippingThreshold,
  };
}

function fromDatabaseSettings(row: Record<string, unknown>) {
  return {
    storeName: String(row.store_name ?? ""),
    storeDescription: String(row.store_description ?? ""),
    contactEmail: String(row.contact_email ?? ""),
    contactPhone: String(row.contact_phone ?? ""),
    address: String(row.address ?? ""),
    currency: String(row.currency ?? "KES"),
    timezone: String(row.timezone ?? "Africa/Nairobi"),
    maintenanceMode: Boolean(row.maintenance_mode),
    allowGuestCheckout: Boolean(row.allow_guest_checkout),
    requireEmailVerification: Boolean(row.require_email_verification),
    enableNotifications: Boolean(row.enable_notifications),
    paymentMethods: Array.isArray(row.payment_methods) ? row.payment_methods : [],
    shippingMethods: Array.isArray(row.shipping_methods) ? row.shipping_methods : [],
    taxRate: Number(row.tax_rate ?? 0),
    freeShippingThreshold: Number(row.free_shipping_threshold ?? 0),
  };
}

async function requireManagerOrAdmin() {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return { supabase, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .single();

  if (
    profileError ||
    !profile?.is_active ||
    !["manager", "admin"].includes(profile.role)
  ) {
    return { supabase, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { supabase, response: null };
}

export async function GET() {
  try {
    const { supabase, response } = await requireManagerOrAdmin();
    if (response) return response;

    const { data, error } = await supabase
      .from("store_settings")
      .select("*")
      .eq("id", 1)
      .single();

    if (error) {
      console.error("Failed to load store settings:", error);
      return NextResponse.json({ error: "Failed to load settings" }, { status: 500 });
    }

    return NextResponse.json({ settings: fromDatabaseSettings(data) });
  } catch (error) {
    console.error("Store settings GET failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const parsed = settingsSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid settings", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { supabase, response } = await requireManagerOrAdmin();
    if (response) return response;

    const { data, error } = await supabase
      .from("store_settings")
      .update(toDatabaseSettings(parsed.data))
      .eq("id", 1)
      .select("*")
      .single();

    if (error) {
      console.error("Failed to save store settings:", error);
      return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
    }

    return NextResponse.json({ settings: fromDatabaseSettings(data) });
  } catch (error) {
    console.error("Store settings PATCH failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

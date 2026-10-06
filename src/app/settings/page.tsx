"use client";

import { useEffect, useState } from "react";
import { useUserStore } from "@/lib/stores/userStore";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { LoadingPage } from "@/components/loading";
import {
  Bell,
  Moon,
  Sun,
  Shield,
  Key,
  Trash2,
  Download,
  Upload,
  Settings as SettingsIcon,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "next-themes";

export default function SettingsPage() {
  const { user, logout } = useUserStore();
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState({
    email_notifications: true,
    order_updates: true,
    marketing_emails: false,
    sms_notifications: false,
  });

async function fetchPreferences(userId: string) {
  const { data, error } = await supabase.from('profiles').select('preferences').eq('id', userId).single();
  if (error && error.code !== 'PGRST116') throw error;
  return data?.preferences;
}

  useEffect(() => {
    if (!user) return;
    let active = true;
    void fetchPreferences(user.id)
      .then((data) => { if (active && data) setPreferences((current) => ({ ...current, ...data })); })
      .catch((error) => console.error('Error fetching preferences:', error))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [user]);
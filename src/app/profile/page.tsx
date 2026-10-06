"use client";

import { useEffect, useState } from "react";
import { useUserStore } from "@/lib/stores/userStore";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoadingPage } from "@/components/loading";
import { User, Mail, Phone, MapPin, Camera, Save } from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user, fetchUser } = useUserStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: user?.email || '',
  });

async function fetchProfile() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user!.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setFormData({
          full_name: data.full_name || '',
          phone: data.phone || '',
          email: data.email || user!.email || '',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    let active = true;
    void fetchProfile(user.id)
      .then((data) => {
        if (!active || !data) return;
        setFormData({
          full_name: data.full_name || '',
          phone: data.phone || '',
          email: data.email || user.email || '',
        });
      })
      .catch((error) => console.error('Error fetching profile:', error))
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user]);}
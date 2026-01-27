import { createSupabaseServerClient } from '@/lib/supabaseServerClient';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag, User, Settings, Package } from "lucide-react";
import Link from 'next/link';

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) return redirect('/auth/login');

  // Re-authenticate the user for security
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return redirect('/auth/login');

  // Fetch profile for display
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single();

  const displayName = (profile as any)?.full_name || user.email;

  return (
    <div className="container mx-auto px-4 py-8 lg:pl-0">
      <h1 className="text-3xl font-bold mb-6">Welcome back, {displayName}!</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <Package className="h-8 w-8 text-primary" />
            <CardTitle>Browse Products</CardTitle>
            <CardDescription>Explore our catalog of tech products</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/products">Browse Products</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <ShoppingBag className="h-8 w-8 text-primary" />
            <CardTitle>My Orders</CardTitle>
            <CardDescription>View your order history and track shipments</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/orders">View Orders</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <User className="h-8 w-8 text-primary" />
            <CardTitle>Profile</CardTitle>
            <CardDescription>Manage your account information</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/profile">Edit Profile</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <Settings className="h-8 w-8 text-primary" />
            <CardTitle>Settings</CardTitle>
            <CardDescription>Update your preferences and settings</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/settings">Account Settings</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
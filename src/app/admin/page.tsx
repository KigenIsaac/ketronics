import { createSupabaseServerClient } from '@/lib/supabaseServerClient';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function AdminPage() {
  // Server-side guard: ensure user is authenticated and a manager
  const supabase = await createSupabaseServerClient();

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) return redirect('/auth/login');

  // Re-authenticate the user for security
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return redirect('/auth/login');

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (error || !profile || (profile as any).role !== 'manager') {
    return redirect('/');
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Manage Categories</h2>
          <p className="text-muted-foreground mb-4">Create and manage product categories, subcategories, and attributes.</p>
          <Button asChild>
            <Link href="/admin/categories">Go to Categories</Link>
          </Button>
        </div>
        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Manage Orders</h2>
          <p className="text-muted-foreground">View and process customer orders.</p>
        </div>
        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Manage Users</h2>
          <p className="text-muted-foreground">View and manage user accounts and roles.</p>
        </div>
        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Analytics</h2>
          <p className="text-muted-foreground">View sales reports and analytics.</p>
        </div>
        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Settings</h2>
          <p className="text-muted-foreground">Configure store settings and preferences.</p>
        </div>
      </div>
    </div>
  );
}
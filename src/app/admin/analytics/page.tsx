'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import {
  BarChart3,
  TrendingUp,
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  Calendar,
  Download,
  RefreshCw
} from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  recentOrders: any[];
  topProducts: any[];
  revenueByDay: any[];
  userRegistrations: any[];
}

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setRefreshing(true);
    try {
      const days = parseInt(timeRange);
      const startDate = subDays(new Date(), days);

      // Fetch orders within time range
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            quantity,
            price,
            products (name)
          )
        `)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (ordersError) {
        console.error('Error fetching orders:', ordersError);
        toast.error('Failed to load analytics data');
        return;
      }

      // Fetch products
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*');

      // Fetch users
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .gte('created_at', startDate.toISOString());

      // Calculate analytics
      const totalRevenue = orders?.reduce((sum, order) => {
        const orderTotal = order.order_items?.reduce((itemSum: number, item: any) =>
          itemSum + (item.quantity * item.price), 0) || 0;
        return sum + orderTotal;
      }, 0) || 0;

      const totalOrders = orders?.length || 0;
      const totalProducts = products?.length || 0;
      const totalUsers = users?.length || 0;

      // Get recent orders (last 10)
      const recentOrders = orders?.slice(0, 10) || [];

      // Calculate top products
      const productSales: { [key: string]: { name: string; sales: number; revenue: number } } = {};
      orders?.forEach(order => {
        order.order_items?.forEach((item: any) => {
          const productId = item.products?.id;
          const productName = item.products?.name || 'Unknown Product';
          if (productId) {
            if (!productSales[productId]) {
              productSales[productId] = { name: productName, sales: 0, revenue: 0 };
            }
            productSales[productId].sales += item.quantity;
            productSales[productId].revenue += item.quantity * item.price;
          }
        });
      });

      const topProducts = Object.values(productSales)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      // Revenue by day
      const revenueByDay: { [key: string]: number } = {};
      orders?.forEach(order => {
        const date = format(new Date(order.created_at), 'yyyy-MM-dd');
        const orderTotal = order.order_items?.reduce((sum: number, item: any) =>
          sum + (item.quantity * item.price), 0) || 0;
        revenueByDay[date] = (revenueByDay[date] || 0) + orderTotal;
      });

      const revenueByDayArray = Object.entries(revenueByDay)
        .map(([date, revenue]) => ({ date, revenue }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // User registrations by day
      const userRegistrations: { [key: string]: number } = {};
      users?.forEach(user => {
        const date = format(new Date(user.created_at), 'yyyy-MM-dd');
        userRegistrations[date] = (userRegistrations[date] || 0) + 1;
      });

      const userRegistrationsArray = Object.entries(userRegistrations)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));

      setAnalytics({
        totalRevenue,
        totalOrders,
        totalProducts,
        totalUsers,
        recentOrders,
        topProducts,
        revenueByDay: revenueByDayArray,
        userRegistrations: userRegistrationsArray
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleExport = () => {
    // Simple CSV export
    if (!analytics) return;

    const csvData = [
      ['Metric', 'Value'],
      ['Total Revenue', `Ksh. ${analytics.totalRevenue.toFixed(2)}`],
      ['Total Orders', analytics.totalOrders.toString()],
      ['Total Products', analytics.totalProducts.toString()],
      ['Total Users', analytics.totalUsers.toString()],
      [],
      ['Top Products', 'Sales', 'Revenue'],
      ...analytics.topProducts.map(product => [
        product.name,
        product.sales.toString(),
        `Ksh. ${product.revenue.toFixed(2)}`
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success('Analytics data exported successfully');
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No data available</h3>
          <p className="text-muted-foreground">Unable to load analytics data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <p className="text-muted-foreground">Monitor your store performance and insights</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={fetchAnalytics} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Ksh. {analytics.totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Last {timeRange} days
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalOrders}</div>
              <p className="text-xs text-muted-foreground">
                {analytics.totalOrders > 0 ? `Avg. Ksh. ${(analytics.totalRevenue / analytics.totalOrders).toFixed(2)} per order` : 'No orders yet'}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalProducts}</div>
              <p className="text-xs text-muted-foreground">
                Products in catalog
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                Registered in period
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Products</CardTitle>
              <CardDescription>Best selling products by revenue</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.topProducts.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No sales data available</p>
              ) : (
                <div className="space-y-4">
                  {analytics.topProducts.map((product, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center">
                          {index + 1}
                        </Badge>
                        <div>
                          <p className="font-medium text-sm">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.sales} units sold</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">Ksh. {product.revenue.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Latest customer orders</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.recentOrders.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No orders yet</p>
              ) : (
                <div className="space-y-4">
                  {analytics.recentOrders.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">Order #{order.id.slice(-8)}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(order.created_at), 'MMM dd, HH:mm')}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                          {order.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          Ksh. {order.order_items?.reduce((sum: number, item: any) =>
                            sum + (item.quantity * item.price), 0).toFixed(2) || '0.00'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Daily revenue for the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.revenueByDay.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No revenue data available for this period</p>
            ) : (
              <div className="space-y-2">
                {analytics.revenueByDay.slice(-10).map((day) => (
                  <div key={day.date} className="flex items-center justify-between">
                    <span className="text-sm">{format(new Date(day.date), 'MMM dd')}</span>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-muted rounded-full h-2 max-w-32">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{
                            width: `${Math.min((day.revenue / Math.max(...analytics.revenueByDay.map(d => d.revenue))) * 100, 100)}%`
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">Ksh. {day.revenue.toFixed(0)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Registrations */}
        <Card>
          <CardHeader>
            <CardTitle>User Registrations</CardTitle>
            <CardDescription>New user signups over time</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.userRegistrations.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No user registration data available</p>
            ) : (
              <div className="space-y-2">
                {analytics.userRegistrations.slice(-10).map((day) => (
                  <div key={day.date} className="flex items-center justify-between">
                    <span className="text-sm">{format(new Date(day.date), 'MMM dd')}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{day.count} new users</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
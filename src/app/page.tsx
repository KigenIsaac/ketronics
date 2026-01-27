"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingPage } from "@/components/loading";
import { Laptop, Printer, Tv, Monitor, Wrench, Shield, Network, Headphones, ArrowRight, Star } from "lucide-react";
import { useUserStore } from "@/lib/stores/userStore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

export default function Home() {
  const { user, loading: userLoading } = useUserStore();
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (!userLoading && user) {
      setRedirecting(true);
      toast.info("Redirecting to your dashboard...");
      setTimeout(() => {
        if (user.role === 'manager') {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
      }, 1500);
    }
  }, [user, userLoading, router]);

  if (userLoading) {
    return <LoadingPage message="Loading your experience..." />;
  }

  if (user && redirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-lg">Welcome back, {user.full_name || user.email}!</p>
          <p className="text-muted-foreground">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  const handleBrowseProducts = () => {
    toast.success("Exploring our product catalog!");
    router.push('/products');
  };

  const handleGetStarted = () => {
    toast.info("Let's get you started!");
    router.push('/auth/signup');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5"></div>
        <div className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Star className="h-4 w-4 mr-2" />
            Welcome to Ketronics LTD
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Your Tech Partner in <span className="text-primary">Kenya</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Discover premium tech products and expert services. From cutting-edge laptops to professional installations, we deliver excellence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="text-lg px-8 py-3 h-auto group"
              onClick={handleBrowseProducts}
            >
              Browse Products
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-3 h-auto"
              onClick={handleGetStarted}
            >
              Get Started
            </Button>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-foreground">Featured Products</h2>
            <p className="text-lg text-muted-foreground">Explore our premium selection of tech products</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Laptop className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="group-hover:text-primary transition-colors">Laptops</CardTitle>
                <CardDescription>High-performance laptops for work and play</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="secondary" className="mb-4">New Arrivals</Badge>
                <Button variant="ghost" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors" asChild>
                  <Link href="/products?category=laptops">
                    View Laptops
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
            <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Printer className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="group-hover:text-primary transition-colors">Printers</CardTitle>
                <CardDescription>Reliable printing solutions for home and office</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="secondary" className="mb-4">Best Sellers</Badge>
                <Button variant="ghost" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors" asChild>
                  <Link href="/products?category=printers">
                    View Printers
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
            <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Tv className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="group-hover:text-primary transition-colors">TVs</CardTitle>
                <CardDescription>Crystal clear displays for entertainment</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="secondary" className="mb-4">4K Available</Badge>
                <Button variant="ghost" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors" asChild>
                  <Link href="/products?category=tvs">
                    View TVs
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
            <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Monitor className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="group-hover:text-primary transition-colors">PCs</CardTitle>
                <CardDescription>Custom-built computers for every need</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="secondary" className="mb-4">Custom Config</Badge>
                <Button variant="ghost" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors" asChild>
                  <Link href="/products?category=pcs">
                    View PCs
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-foreground">Expert Services</h2>
            <p className="text-lg text-muted-foreground">Professional tech services you can trust</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="group hover:shadow-lg transition-all duration-300">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 rounded-full bg-green-100 dark:bg-green-900/20">
                  <Wrench className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle>Maintenance & Repairs</CardTitle>
                <CardDescription>Keep your devices running smoothly with our expert repair services</CardDescription>
              </CardHeader>
            </Card>
            <Card className="group hover:shadow-lg transition-all duration-300">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 rounded-full bg-blue-100 dark:bg-blue-900/20">
                  <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle>CCTV Installation</CardTitle>
                <CardDescription>Secure your property with professional CCTV systems</CardDescription>
              </CardHeader>
            </Card>
            <Card className="group hover:shadow-lg transition-all duration-300">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 rounded-full bg-purple-100 dark:bg-purple-900/20">
                  <Network className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle>Network Setup</CardTitle>
                <CardDescription>Reliable network solutions for homes and businesses</CardDescription>
              </CardHeader>
            </Card>
            <Card className="group hover:shadow-lg transition-all duration-300">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 rounded-full bg-orange-100 dark:bg-orange-900/20">
                  <Headphones className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                </div>
                <CardTitle>Software Support</CardTitle>
                <CardDescription>Expert software installation and troubleshooting</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">500+</div>
              <div className="text-muted-foreground">Happy Customers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">1000+</div>
              <div className="text-muted-foreground">Products Sold</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">50+</div>
              <div className="text-muted-foreground">Expert Technicians</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">24/7</div>
              <div className="text-muted-foreground">Support Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-primary text-primary-foreground">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-lg opacity-90 mb-8">
            Join thousands of satisfied customers. Contact us today for all your tech needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              className="text-lg px-8"
              onClick={() => router.push("/contact")}
            >
              Contact Us
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 border-primary-foreground/20 hover:bg-primary-foreground/10"
              onClick={() => router.push("/products")}
            >
              Shop Now
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
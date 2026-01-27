import { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Target,
  Award,
  Shield,
  Zap,
  Globe,
  Heart,
  Star,
  CheckCircle,
  TrendingUp,
  Cpu,
  Monitor,
  Smartphone,
  Wifi
} from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us - Ketronics LTD",
  description: "Learn about Ketronics LTD - Kenya's leading technology solutions provider specializing in electronics, security systems, and smart home automation.",
};

export default function AboutUsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="flex items-center justify-center mb-6">
          <Zap className="h-16 w-16 text-primary mr-4" />
          <h1 className="text-5xl font-bold">About Ketronics LTD</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
          Kenya's premier technology solutions provider, delivering cutting-edge electronics,
          security systems, and smart home automation to homes and businesses across East Africa.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Badge variant="secondary" className="text-sm px-4 py-2">
            <Star className="h-4 w-4 mr-1" />
            Trusted Since 2024
          </Badge>
          <Badge variant="secondary" className="text-sm px-4 py-2">
            <Award className="h-4 w-4 mr-1" />
            Certified Experts
          </Badge>
          <Badge variant="secondary" className="text-sm px-4 py-2">
            <Globe className="h-4 w-4 mr-1" />
            Pan-African Reach
          </Badge>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
        <Card className="border-primary/20">
          <CardHeader>
            <div className="flex items-center">
              <Target className="h-6 w-6 text-primary mr-3" />
              <CardTitle className="text-2xl">Our Mission</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-lg leading-relaxed">
              To empower Kenyan businesses and homes with innovative technology solutions that enhance
              security, productivity, and quality of life. We bridge the gap between cutting-edge
              technology and practical, affordable solutions tailored for the African market.
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader>
            <div className="flex items-center">
              <Heart className="h-6 w-6 text-primary mr-3" />
              <CardTitle className="text-2xl">Our Vision</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-lg leading-relaxed">
              To be East Africa's most trusted technology partner, recognized for excellence in
              service delivery, innovation, and customer satisfaction. We envision a connected
              Africa where technology seamlessly integrates with daily life.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* What We Do */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">What We Do</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Security Systems</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Advanced CCTV, access control, and alarm systems for comprehensive protection.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Monitor className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Smart Home Automation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Intelligent home systems for lighting, climate control, and energy management.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Cpu className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Electronics Solutions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Latest consumer electronics, computers, and networking equipment.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Wifi className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Network Infrastructure</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Professional networking solutions and IT infrastructure services.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">Why Choose Ketronics LTD?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Award className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Expertise & Certification</h3>
            <p className="text-muted-foreground">
              Our team consists of certified professionals with years of experience in technology
              solutions and system integration.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Latest Technology</h3>
            <p className="text-muted-foreground">
              We stay ahead of the curve, offering cutting-edge solutions from leading global
              brands and emerging technologies.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Customer-Centric Approach</h3>
            <p className="text-muted-foreground">
              Your satisfaction is our priority. We provide personalized solutions and ongoing
              support for all our clients.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Quality Assurance</h3>
            <p className="text-muted-foreground">
              Every installation and service meets our rigorous quality standards, backed by
              comprehensive warranties.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Globe className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Local & Regional Support</h3>
            <p className="text-muted-foreground">
              Based in Nairobi with service coverage across Kenya and partnerships throughout
              East Africa.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Reliable & Secure</h3>
            <p className="text-muted-foreground">
              We prioritize data security and system reliability, ensuring your technology
              investments are protected.
            </p>
          </div>
        </div>
      </div>

      {/* Our Story */}
      <div className="mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6">Our Story</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Founded in 2024, Ketronics LTD began as a small electronics shop in Nairobi's
                Westlands area. What started as a passion for technology has grown into Kenya's
                most trusted technology solutions provider.
              </p>
              <p>
                Over the years, we've expanded our services from basic electronics sales to
                comprehensive technology solutions, including advanced security systems, smart
                home automation, and enterprise IT infrastructure.
              </p>
              <p>
                Today, we serve thousands of satisfied customers across Kenya, from individual
                homeowners to large corporations, all while maintaining our commitment to
                quality, innovation, and exceptional customer service.
              </p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">2+</div>
              <p className="text-lg font-semibold mb-4">Years of Excellence</p>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">1,000+</div>
                  <p className="text-sm">Happy Customers</p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">50+</div>
                  <p className="text-sm">Projects Completed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Our Team */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">Meet Our Leadership Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="text-center">
            <CardHeader>
              <div className="w-24 h-24 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Users className="h-12 w-12 text-primary" />
              </div>
              <CardTitle>Wilson Keter</CardTitle>
              <CardDescription>Founder & CEO</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Technology visionary with 15+ years in electronics and system integration.
                Leads strategic direction and innovation initiatives.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-24 h-24 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Users className="h-12 w-12 text-primary" />
              </div>
              <CardTitle>Isaac Kigen</CardTitle>
              <CardDescription>Operations Director</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Expert in project management and customer relations. Ensures seamless
                execution of all client projects and services.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-24 h-24 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Users className="h-12 w-12 text-primary" />
              </div>
              <CardTitle>Michael Oduya</CardTitle>
              <CardDescription>Technical Director</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Certified security systems specialist and network engineer. Oversees
                all technical installations and quality assurance.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-12">
        <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Space?</h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          Join thousands of satisfied customers who trust Ketronics LTD for their technology needs.
          Let's discuss how we can help you achieve your goals.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild>
            <Link href="/contact">Get Started Today</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/support">Learn More</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
import { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Phone,
  Mail,
  MessageSquare,
  MapPin,
  HelpCircle,
  Wrench,
  Shield,
  Truck
} from "lucide-react";

export const metadata: Metadata = {
  title: "Support - Ketronics LTD",
  description: "Get help and support for your Ketronics LTD products and services.",
};

export default function SupportPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center mb-4">
          <HelpCircle className="h-12 w-12 text-primary mr-3" />
          <h1 className="text-4xl font-bold">Customer Support</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Get help with your orders and products. Our dedicated support team is here to assist you with any questions or issues you may have.
        </p>
      </div>

      {/* Quick Support Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="text-center">
            <Phone className="h-8 w-8 text-primary mx-auto mb-2" />
            <CardTitle className="text-lg">Call Us</CardTitle>
            <CardDescription>Direct phone support</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="font-semibold">+254 728 097 922</p>
            <p className="text-sm text-muted-foreground">Mon-Fri: 8AM-6PM</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="text-center">
            <Mail className="h-8 w-8 text-primary mx-auto mb-2" />
            <CardTitle className="text-lg">Email Support</CardTitle>
            <CardDescription>24/7 email assistance</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="font-semibold">support@ketronics.co.ke</p>
            <p className="text-sm text-muted-foreground">Response within 24hrs</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="text-center">
            <MessageSquare className="h-8 w-8 text-primary mx-auto mb-2" />
            <CardTitle className="text-lg">Live Chat</CardTitle>
            <CardDescription>Instant messaging</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button className="w-full">Start Chat</Button>
            <p className="text-sm text-muted-foreground mt-2">Available 9AM-5PM</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="text-center">
            <MapPin className="h-8 w-8 text-primary mx-auto mb-2" />
            <CardTitle className="text-lg">Visit Us</CardTitle>
            <CardDescription>In-person support</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="font-semibold">Eldoret, Kenya AA building floor room F6A</p>
            <p className="text-sm text-muted-foreground">Walk-ins welcome</p>
          </CardContent>
        </Card>
      </div>

      {/* Support Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div>
          <h2 className="text-2xl font-semibold mb-6">Common Support Topics</h2>
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center">
                  <Truck className="h-5 w-5 text-primary mr-3" />
                  <CardTitle className="text-lg">Order & Shipping</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Track your order status</li>
                  <li>• Shipping timeframes and costs</li>
                  <li>• Order modifications or cancellations</li>
                  <li>• Delivery issues and solutions</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-primary mr-3" />
                  <CardTitle className="text-lg">Product Support</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Product setup and installation</li>
                  <li>• Warranty claims and coverage</li>
                  <li>• Product troubleshooting</li>
                  <li>• Compatibility questions</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center">
                  <Wrench className="h-5 w-5 text-primary mr-3" />
                  <CardTitle className="text-lg">Technical Services</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• CCTV installation and setup</li>
                  <li>• Network configuration</li>
                  <li>• Hardware repairs and maintenance</li>
                  <li>• Software troubleshooting</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-6">Contact Support</h2>
          <Card>
            <CardHeader>
              <CardTitle>Send us a message</CardTitle>
              <CardDescription>
                Can't find what you're looking for? Send us a detailed message and we'll get back to you.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <Input placeholder="Your name" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <Input type="email" placeholder="your@email.com" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Subject</label>
                <Input placeholder="Brief description of your issue" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Message</label>
                <Textarea
                  placeholder="Please provide details about your question or issue..."
                  rows={4}
                />
              </div>
              <Button className="w-full">
                Send Message
              </Button>
            </CardContent>
          </Card>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Response Times</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Phone calls</span>
                <Badge variant="secondary">Immediate</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Live chat</span>
                <Badge variant="secondary">Within 5 minutes</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Email support</span>
                <Badge variant="secondary">Within 24 hours</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-6 text-center">Frequently Asked Questions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">How do I track my order?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Once your order ships, you'll receive a tracking number via email and SMS. You can also check your order status in your account dashboard.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">What's your return policy?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                We offer a 30-day return policy for unused products in original packaging. Custom installations and certain software licenses are non-refundable.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Do you offer warranties?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Yes, all our products come with manufacturer warranties. We also provide a 90-day workmanship guarantee on all our installation and repair services.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">How do I schedule a service?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                You can schedule services by calling us, sending an email, or using our online booking system. We offer same-day service in Nairobi for urgent issues.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Service Areas */}
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Service Areas</h2>
        <p className="text-muted-foreground mb-6">
          We provide comprehensive tech support and services across Kenya
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Badge variant="outline">Nairobi</Badge>
          <Badge variant="outline">Mombasa</Badge>
          <Badge variant="outline">Kisumu</Badge>
          <Badge variant="outline">Nakuru</Badge>
          <Badge variant="outline">Eldoret</Badge>
          <Badge variant="outline">Thika</Badge>
          <Badge variant="outline">Kilimani</Badge>
          <Badge variant="outline">Westlands</Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          Don't see your area? Contact us - we may still be able to help!
        </p>
      </div>
    </div>
  );
}
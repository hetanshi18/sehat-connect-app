import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Heart, Video, Calendar, TrendingUp, FileText, Clock, Shield, Users } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Sehat Sathi</span>
          </div>
          <Button onClick={() => navigate("/auth")}>Get Started</Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
              Your Health,
              <span className="text-primary"> Anytime, Anywhere</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Smart telemedicine kiosk platform for instant doctor consultations, symptom analysis, and comprehensive health tracking.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" onClick={() => navigate("/auth")}>
                Start Consultation
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/auth")}>
                Learn More
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <Heart className="h-48 w-48 text-primary/40" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted/50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Complete Healthcare Solution</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need for quality healthcare at your fingertips
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-2 hover:border-primary transition-colors">
              <CardContent className="pt-6 space-y-3">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Video className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Video Consultations</h3>
                <p className="text-muted-foreground">
                  Connect face-to-face with specialist doctors through secure video calls
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardContent className="pt-6 space-y-3">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Symptom Analysis</h3>
                <p className="text-muted-foreground">
                  AI-powered symptom checker with medicine recommendations
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardContent className="pt-6 space-y-3">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Easy Scheduling</h3>
                <p className="text-muted-foreground">
                  Book appointments instantly with available doctors
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardContent className="pt-6 space-y-3">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Health Tracking</h3>
                <p className="text-muted-foreground">
                  Monitor your health trends and maintain complete medical history
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground">Get started in three simple steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-2xl font-bold text-primary">
                1
              </div>
              <h3 className="text-xl font-semibold">Record Symptoms</h3>
              <p className="text-muted-foreground">
                Use our kiosk or app to record your symptoms and health concerns
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-2xl font-bold text-primary">
                2
              </div>
              <h3 className="text-xl font-semibold">Book Consultation</h3>
              <p className="text-muted-foreground">
                Choose from available specialists and book your appointment
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-2xl font-bold text-primary">
                3
              </div>
              <h3 className="text-xl font-semibold">Get Treatment</h3>
              <p className="text-muted-foreground">
                Connect with your doctor and receive personalized care
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-muted/50 py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Save Time</h3>
                  <p className="text-muted-foreground">
                    No waiting rooms or travel time. Get consultations from anywhere.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Secure & Private</h3>
                  <p className="text-muted-foreground">
                    Your health data is encrypted and protected with industry-leading security.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Expert Doctors</h3>
                  <p className="text-muted-foreground">
                    Access to qualified healthcare professionals across specialties.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
                <Video className="h-48 w-48 text-primary/40" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="bg-primary text-primary-foreground border-0">
            <CardContent className="py-12 text-center space-y-6">
              <h2 className="text-3xl lg:text-4xl font-bold">Ready to Get Started?</h2>
              <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto">
                Join thousands of patients who trust Sehat Sathi for their healthcare needs
              </p>
              <Button 
                size="lg" 
                variant="secondary"
                onClick={() => navigate("/auth")}
                className="text-lg px-8"
              >
                Start Your Journey
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              <span className="font-semibold">Sehat Sathi</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 Sehat Sathi. Your trusted healthcare partner.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

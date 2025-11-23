import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Heart, Clock, Shield, Users, Video, Activity, Calendar, TrendingUp } from "lucide-react";
import Lottie from "lottie-react";
import HeroSection from "@/components/ui/hero-section";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { BokehLights } from "@/components/ui/bokeh-lights";
import { motion } from "framer-motion";

const Index = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Lottie animation data for healthcare features
  const videoAnimation = {
    v: "5.7.4",
    fr: 30,
    ip: 0,
    op: 60,
    w: 100,
    h: 100,
    nm: "Video Camera",
    ddd: 0,
    assets: [],
    layers: [
      {
        ddd: 0,
        ind: 1,
        ty: 4,
        nm: "Camera",
        sr: 1,
        ks: {
          o: { a: 1, k: [{ t: 0, s: [100] }, { t: 30, s: [60] }, { t: 60, s: [100] }] },
          p: { a: 0, k: [50, 50] },
          s: { a: 1, k: [{ t: 0, s: [100, 100] }, { t: 30, s: [95, 95] }, { t: 60, s: [100, 100] }] }
        },
        shapes: [
          {
            ty: "gr",
            it: [
              {
                ty: "rc",
                d: 1,
                s: { a: 0, k: [50, 35] },
                p: { a: 0, k: [0, 0] },
                r: { a: 0, k: 5 }
              },
              {
                ty: "fl",
                c: { a: 0, k: [0.3, 0.6, 1, 1] },
                o: { a: 0, k: 100 }
              }
            ]
          }
        ]
      }
    ]
  };

  const documentAnimation = {
    v: "5.7.4",
    fr: 30,
    ip: 0,
    op: 90,
    w: 100,
    h: 100,
    nm: "Medical Document",
    ddd: 0,
    assets: [],
    layers: [
      {
        ddd: 0,
        ind: 1,
        ty: 4,
        nm: "Pulse Line",
        sr: 1,
        ks: {
          o: { a: 0, k: 100 },
          p: { a: 0, k: [50, 50] }
        },
        shapes: [
          {
            ty: "gr",
            it: [
              {
                ty: "sh",
                d: 1,
                ks: {
                  a: 1,
                  k: [
                    {
                      t: 0,
                      s: [{ i: [[0, 0]], o: [[0, 0]], v: [[-25, 0], [-15, 0], [-10, -10], [-5, 10], [0, 0], [25, 0]] }]
                    },
                    {
                      t: 45,
                      s: [{ i: [[0, 0]], o: [[0, 0]], v: [[-25, 0], [-15, 2], [-10, -8], [-5, 12], [0, 0], [25, 0]] }]
                    },
                    {
                      t: 90,
                      s: [{ i: [[0, 0]], o: [[0, 0]], v: [[-25, 0], [-15, 0], [-10, -10], [-5, 10], [0, 0], [25, 0]] }]
                    }
                  ]
                }
              },
              {
                ty: "st",
                c: { a: 0, k: [0.3, 0.6, 1, 1] },
                o: { a: 0, k: 100 },
                w: { a: 0, k: 3 }
              }
            ]
          }
        ]
      }
    ]
  };

  const calendarAnimation = {
    v: "5.7.4",
    fr: 30,
    ip: 0,
    op: 120,
    w: 100,
    h: 100,
    nm: "Calendar",
    ddd: 0,
    assets: [],
    layers: [
      {
        ddd: 0,
        ind: 1,
        ty: 4,
        nm: "Calendar Page",
        sr: 1,
        ks: {
          o: { a: 0, k: 100 },
          p: { a: 1, k: [{ t: 0, s: [50, 50] }, { t: 60, s: [50, 48] }, { t: 120, s: [50, 50] }] }
        },
        shapes: [
          {
            ty: "gr",
            it: [
              {
                ty: "rc",
                d: 1,
                s: { a: 0, k: [50, 50] },
                p: { a: 0, k: [0, 0] },
                r: { a: 0, k: 8 }
              },
              {
                ty: "fl",
                c: { a: 0, k: [0.3, 0.6, 1, 1] },
                o: { a: 0, k: 100 }
              }
            ]
          }
        ]
      }
    ]
  };

  const trendAnimation = {
    v: "5.7.4",
    fr: 30,
    ip: 0,
    op: 90,
    w: 100,
    h: 100,
    nm: "Trend Line",
    ddd: 0,
    assets: [],
    layers: [
      {
        ddd: 0,
        ind: 1,
        ty: 4,
        nm: "Arrow",
        sr: 1,
        ks: {
          o: { a: 0, k: 100 },
          p: { a: 1, k: [{ t: 0, s: [50, 55] }, { t: 45, s: [50, 45] }, { t: 90, s: [50, 55] }] }
        },
        shapes: [
          {
            ty: "gr",
            it: [
              {
                ty: "sh",
                d: 1,
                ks: {
                  a: 0,
                  k: {
                    i: [[0, 0]],
                    o: [[0, 0]],
                    v: [[-20, 10], [0, -10], [20, 5]]
                  }
                }
              },
              {
                ty: "st",
                c: { a: 0, k: [0.3, 0.6, 1, 1] },
                o: { a: 0, k: 100 },
                w: { a: 0, k: 3 }
              }
            ]
          }
        ]
      }
    ]
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Animation */}
      <HeroSection 
        onGetStarted={() => navigate("/auth")}
        onLearnMore={scrollToFeatures}
      />

      {/* Features Section */}
      <section id="features" className="bg-muted/50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">{t('features.title')}</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('features.subtitle')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <SpotlightCard className="transition-all duration-300 hover:-translate-y-2 hover:scale-[1.04]">
              <div className="space-y-3">
                <div className="absolute bottom-3 right-3 text-[60px] font-bold text-primary/5 group-hover:text-primary/10 transition-colors pointer-events-none select-none leading-none">
                  1
                </div>
                <div className="h-14 w-14 rounded-lg bg-primary/10 flex items-center justify-center relative z-10 group-hover:bg-primary/15 transition-all">
                  <Video className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold relative z-10">{t('features.videoConsult.title')}</h3>
                <p className="text-muted-foreground relative z-10 text-sm leading-relaxed">
                  {t('features.videoConsult.description')}
                </p>
              </div>
            </SpotlightCard>

            <SpotlightCard className="transition-all duration-300 hover:-translate-y-2 hover:scale-[1.04]">
              <div className="space-y-3">
                <div className="absolute bottom-3 right-3 text-[60px] font-bold text-primary/5 group-hover:text-primary/10 transition-colors pointer-events-none select-none leading-none">
                  2
                </div>
                <div className="h-14 w-14 rounded-lg bg-primary/10 flex items-center justify-center relative z-10 group-hover:bg-primary/15 transition-all">
                  <Activity className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold relative z-10">{t('features.symptomAnalysis.title')}</h3>
                <p className="text-muted-foreground relative z-10 text-sm leading-relaxed">
                  {t('features.symptomAnalysis.description')}
                </p>
              </div>
            </SpotlightCard>

            <SpotlightCard className="transition-all duration-300 hover:-translate-y-2 hover:scale-[1.04]">
              <div className="space-y-3">
                <div className="absolute bottom-3 right-3 text-[60px] font-bold text-primary/5 group-hover:text-primary/10 transition-colors pointer-events-none select-none leading-none">
                  3
                </div>
                <div className="h-14 w-14 rounded-lg bg-primary/10 flex items-center justify-center relative z-10 group-hover:bg-primary/15 transition-all">
                  <Calendar className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold relative z-10">{t('features.easyScheduling.title')}</h3>
                <p className="text-muted-foreground relative z-10 text-sm leading-relaxed">
                  {t('features.easyScheduling.description')}
                </p>
              </div>
            </SpotlightCard>

            <SpotlightCard className="transition-all duration-300 hover:-translate-y-2 hover:scale-[1.04]">
              <div className="space-y-3">
                <div className="absolute bottom-3 right-3 text-[60px] font-bold text-primary/5 group-hover:text-primary/10 transition-colors pointer-events-none select-none leading-none">
                  4
                </div>
                <div className="h-14 w-14 rounded-lg bg-primary/10 flex items-center justify-center relative z-10 group-hover:bg-primary/15 transition-all">
                  <TrendingUp className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold relative z-10">{t('features.healthTracking.title')}</h3>
                <p className="text-muted-foreground relative z-10 text-sm leading-relaxed">
                  {t('features.healthTracking.description')}
                </p>
              </div>
            </SpotlightCard>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative py-20 overflow-hidden bg-muted/30">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground">Get started in three simple steps</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <SpotlightCard>
                <div className="space-y-4">
                  <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-gradient-to-r from-primary/80 to-primary text-primary-foreground text-sm font-semibold">
                    Step 1
                  </div>
                  <h3 className="text-2xl font-semibold">Record Symptoms</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Use our kiosk or app to record your symptoms and health concerns with our AI-powered analysis
                  </p>
                </div>
              </SpotlightCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <SpotlightCard>
                <div className="space-y-4">
                  <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-gradient-to-r from-primary/80 to-primary text-primary-foreground text-sm font-semibold">
                    Step 2
                  </div>
                  <h3 className="text-2xl font-semibold">Book Consultation</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Choose from available specialists and book your appointment at a time that works for you
                  </p>
                </div>
              </SpotlightCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <SpotlightCard>
                <div className="space-y-4">
                  <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-gradient-to-r from-primary/80 to-primary text-primary-foreground text-sm font-semibold">
                    Step 3
                  </div>
                  <h3 className="text-2xl font-semibold">Get Treatment</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Connect with your doctor via video call and receive personalized care and treatment plans
                  </p>
                </div>
              </SpotlightCard>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-muted/50 py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="flex-1 space-y-8 order-2 lg:order-1">
              <div className="flex gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{t('howItWorks.saveTimeTitle')}</h3>
                  <p className="text-muted-foreground">
                    {t('howItWorks.saveTimeDesc')}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{t('howItWorks.secureTitle')}</h3>
                  <p className="text-muted-foreground">
                    {t('howItWorks.secureDesc')}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{t('howItWorks.expertDoctorsTitle')}</h3>
                  <p className="text-muted-foreground">
                    {t('howItWorks.expertDoctorsDesc')}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 relative order-1 lg:order-2 w-full">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center shadow-medium">
                <Video className="h-48 w-48 text-primary/40" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <Card className="bg-primary text-primary-foreground border-0 relative overflow-hidden">
            <BokehLights />
            <CardContent className="py-12 text-center space-y-6 relative z-10">
              <h2 className="text-3xl lg:text-4xl font-bold">{t('cta.title')}</h2>
              <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto">
                {t('cta.subtitle')}
              </p>
              <Button 
                size="lg" 
                variant="secondary"
                onClick={() => navigate("/auth")}
                className="text-lg px-8 hover:animate-heartbeat"
              >
                {t('cta.button')}
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

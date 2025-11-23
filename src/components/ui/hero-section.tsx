import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Boxes } from "@/components/ui/background-boxes";

interface HeroSectionProps {
  onGetStarted: () => void;
  onLearnMore: () => void;
}

export default function HeroSection({ onGetStarted, onLearnMore }: HeroSectionProps) {
  const { t } = useLanguage();

  return (
    <div className="relative mx-auto flex max-w-7xl flex-col items-center justify-center overflow-hidden">
      {/* Background boxes effect */}
      <div className="absolute inset-0 w-full h-full bg-background z-0 [mask-image:radial-gradient(transparent,white)] pointer-events-none" />
      <Boxes />
      
      <HeroNavbar onGetStarted={onGetStarted} />
      
      {/* Decorative borders */}
      <div className="absolute inset-y-0 left-0 h-full w-px bg-border/80">
        <div className="absolute top-0 h-40 w-px bg-gradient-to-b from-transparent via-primary to-transparent" />
      </div>
      <div className="absolute inset-y-0 right-0 h-full w-px bg-border/80">
        <div className="absolute h-40 w-px bg-gradient-to-b from-transparent via-primary to-transparent" />
      </div>
      <div className="absolute inset-x-0 bottom-0 h-px w-full bg-border/80">
        <div className="absolute mx-auto h-px w-40 bg-gradient-to-r from-transparent via-primary to-transparent" />
      </div>

      <div className="px-4 py-10 md:py-20">
        {/* Animated heading */}
        <h1 className="relative z-10 mx-auto max-w-4xl text-center text-2xl font-bold text-foreground md:text-4xl lg:text-7xl">
          {t('hero.title')
            .split(" ")
            .map((word, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, filter: "blur(4px)", y: 10 }}
                animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.1,
                  ease: "easeInOut",
                }}
                className="mr-2 inline-block"
              >
                {word}
              </motion.span>
            ))}
        </h1>

        {/* Animated description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.8 }}
          className="relative z-10 mx-auto max-w-xl py-4 text-center text-lg font-normal text-muted-foreground"
        >
          {t('hero.subtitle')}
        </motion.p>

        {/* Animated buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 1 }}
          className="relative z-10 mt-8 flex flex-wrap items-center justify-center gap-4"
        >
          <Button
            size="lg"
            onClick={onGetStarted}
            className="w-60 transform transition-all duration-300 hover:-translate-y-0.5"
          >
            {t('hero.cta')}
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={onLearnMore}
            className="w-60 transform transition-all duration-300 hover:-translate-y-0.5"
          >
            {t('nav.features')}
          </Button>
        </motion.div>

        {/* Animated preview image */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 1.2 }}
          className="relative z-10 mt-20 rounded-3xl border border-border bg-muted p-4 shadow-md"
        >
          <div className="w-full overflow-hidden rounded-xl border border-border">
            <div className="aspect-[16/9] flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
              <Heart className="h-48 w-48 text-primary/40" />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

const HeroNavbar = ({ onGetStarted }: { onGetStarted: () => void }) => {
  const { t } = useLanguage();
  
  return (
    <nav className="relative z-20 flex w-full items-center justify-between border-t border-b border-border px-4 py-4">
      <div className="flex items-center gap-2">
        <Heart className="h-6 w-6 text-primary" />
        <h1 className="text-base font-bold md:text-2xl">Sehat Sathi</h1>
      </div>
      <div className="flex items-center gap-2">
        <LanguageSwitcher />
        <Button
          onClick={onGetStarted}
          className="w-24 transform transition-all duration-300 hover:-translate-y-0.5 md:w-32"
        >
          {t('nav.login')}
        </Button>
      </div>
    </nav>
  );
};

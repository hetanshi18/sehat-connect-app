import { motion } from "framer-motion";

export const BokehLights = () => {
  const bokehCount = 12;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: bokehCount }).map((_, index) => {
        const randomX1 = Math.random() * 100;
        const randomX2 = Math.random() * 100;
        const randomX3 = Math.random() * 100;
        const randomY1 = Math.random() * 100;
        const randomY2 = Math.random() * 100;
        const randomY3 = Math.random() * 100;
        const scale1 = Math.random() * 0.5 + 0.5;
        const scale2 = Math.random() * 0.8 + 0.6;
        const scale3 = Math.random() * 0.5 + 0.5;
        const duration = 20 + index * 2;
        
        return (
          <motion.div
            key={index}
            className="absolute rounded-full blur-3xl"
            style={{
              width: `${100 + index * 20}px`,
              height: `${100 + index * 20}px`,
              background: `radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)`,
            }}
            initial={{
              x: `${randomX1}%`,
              y: `${randomY1}%`,
              scale: scale1,
              opacity: 0.05,
            }}
            animate={{
              x: [`${randomX1}%`, `${randomX2}%`, `${randomX3}%`],
              y: [`${randomY1}%`, `${randomY2}%`, `${randomY3}%`],
              scale: [scale1, scale2, scale3],
            }}
            transition={{
              duration: duration,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        );
      })}
    </div>
  );
};

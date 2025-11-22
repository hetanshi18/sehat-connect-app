import React, { useEffect, useRef, useState } from 'react';

interface NavItem {
  label: string;
  href: string;
}

interface GooeyNavProps {
  items: NavItem[];
  particleCount?: number;
  particleDistances?: [number, number];
  particleR?: number;
  initialActiveIndex?: number;
  animationTime?: number;
  timeVariance?: number;
  colors?: number[];
}

const GooeyNav: React.FC<GooeyNavProps> = ({
  items,
  particleCount = 15,
  particleDistances = [90, 10],
  particleR = 100,
  initialActiveIndex = 0,
  animationTime = 600,
  timeVariance = 300,
  colors = [1, 2, 3, 1, 2, 3, 1, 4],
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeIndex, setActiveIndex] = useState(initialActiveIndex);
  const [particles, setParticles] = useState<any[]>([]);

  // Blue color palette
  const colorPalette = {
    1: 'hsl(217, 91%, 60%)', // Bright blue
    2: 'hsl(221, 83%, 53%)', // Medium blue
    3: 'hsl(224, 76%, 48%)', // Deep blue
    4: 'hsl(226, 71%, 40%)', // Dark blue
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Initialize particles
    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      radius: Math.random() * 3 + 2,
      color: colorPalette[colors[i % colors.length] as keyof typeof colorPalette],
    }));

    setParticles(newParticles);

    let animationFrame: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      newParticles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
      });

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [particleCount, colors]);

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ filter: 'blur(8px) contrast(20)' }}
      />
      <div className="relative z-10 flex items-center justify-center h-full gap-8">
        {items.map((item, index) => (
          <a
            key={index}
            href={item.href}
            onClick={(e) => {
              e.preventDefault();
              setActiveIndex(index);
            }}
            className={`
              px-6 py-3 rounded-full font-semibold transition-all duration-300
              ${
                activeIndex === index
                  ? 'bg-primary text-primary-foreground scale-110 shadow-lg'
                  : 'bg-primary/10 text-foreground hover:bg-primary/20 hover:scale-105'
              }
            `}
          >
            {item.label}
          </a>
        ))}
      </div>
    </div>
  );
};

export default GooeyNav;

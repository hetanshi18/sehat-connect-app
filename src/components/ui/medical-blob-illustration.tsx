import { motion } from "framer-motion";
import { Shield, Heart, Activity } from "lucide-react";

export const MedicalBlobIllustration = () => {
  return (
    <div className="relative w-full aspect-square flex items-center justify-center">
      {/* Main 3D Gradient Blob */}
      <motion.div
        className="absolute inset-0 rounded-[40%_60%_70%_30%/40%_50%_60%_50%]"
        style={{
          background: `
            radial-gradient(circle at 30% 30%, hsl(220, 70%, 85%) 0%, transparent 50%),
            radial-gradient(circle at 70% 60%, hsl(280, 60%, 85%) 0%, transparent 50%),
            radial-gradient(circle at 50% 80%, hsl(340, 70%, 88%) 0%, transparent 50%),
            linear-gradient(135deg, hsl(220, 65%, 82%) 0%, hsl(280, 55%, 82%) 50%, hsl(340, 65%, 85%) 100%)
          `,
          filter: "blur(40px)",
          transform: "scale(0.9)",
        }}
        animate={{
          borderRadius: [
            "40% 60% 70% 30% / 40% 50% 60% 50%",
            "60% 40% 30% 70% / 50% 60% 40% 60%",
            "40% 60% 70% 30% / 40% 50% 60% 50%",
          ],
          rotate: [0, 5, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Secondary Blob Layer */}
      <motion.div
        className="absolute inset-[10%] rounded-[60%_40%_30%_70%/60%_30%_70%_40%]"
        style={{
          background: `
            radial-gradient(circle at 60% 40%, hsl(260, 60%, 88%) 0%, transparent 60%),
            radial-gradient(circle at 30% 70%, hsl(200, 70%, 88%) 0%, transparent 60%)
          `,
          filter: "blur(30px)",
        }}
        animate={{
          borderRadius: [
            "60% 40% 30% 70% / 60% 30% 70% 40%",
            "40% 60% 70% 30% / 30% 60% 40% 70%",
            "60% 40% 30% 70% / 60% 30% 70% 40%",
          ],
          rotate: [0, -3, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Floating Medical Icons */}
      {/* Shield Icon */}
      <motion.div
        className="absolute"
        style={{ opacity: 0.08 }}
        initial={{ x: -60, y: -40 }}
        animate={{
          x: [-60, -50, -60],
          y: [-40, -50, -40],
          rotate: [0, 10, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Shield className="w-20 h-20 text-primary" strokeWidth={1.5} />
      </motion.div>

      {/* Heart Icon */}
      <motion.div
        className="absolute"
        style={{ opacity: 0.08 }}
        initial={{ x: 70, y: -30 }}
        animate={{
          x: [70, 80, 70],
          y: [-30, -20, -30],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
      >
        <Heart className="w-24 h-24 text-primary" strokeWidth={1.5} fill="currentColor" />
      </motion.div>

      {/* Stethoscope/Activity Icon */}
      <motion.div
        className="absolute"
        style={{ opacity: 0.08 }}
        initial={{ x: 0, y: 70 }}
        animate={{
          x: [0, 10, 0],
          y: [70, 60, 70],
          rotate: [0, -5, 0],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      >
        <Activity className="w-22 h-22 text-primary" strokeWidth={1.5} />
      </motion.div>

      {/* Subtle Glow Effect */}
      <div
        className="absolute inset-[15%] rounded-full"
        style={{
          background: "radial-gradient(circle, hsl(var(--primary) / 0.03) 0%, transparent 70%)",
          filter: "blur(20px)",
        }}
      />
    </div>
  );
};

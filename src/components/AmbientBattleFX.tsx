import { motion } from "motion/react";

const particles = [
  { left: "4%", top: "17%", size: 3, delay: 0.2, duration: 7 },
  { left: "9%", top: "48%", size: 2, delay: 2.1, duration: 9 },
  { left: "16%", top: "78%", size: 3, delay: 1.1, duration: 8 },
  { left: "27%", top: "24%", size: 2, delay: 3.2, duration: 10 },
  { left: "34%", top: "63%", size: 4, delay: 0.8, duration: 11 },
  { left: "47%", top: "14%", size: 2, delay: 2.7, duration: 8 },
  { left: "53%", top: "84%", size: 3, delay: 1.8, duration: 10 },
  { left: "64%", top: "22%", size: 3, delay: 3.6, duration: 9 },
  { left: "71%", top: "72%", size: 2, delay: 0.4, duration: 8 },
  { left: "78%", top: "39%", size: 4, delay: 2.2, duration: 11 },
  { left: "87%", top: "18%", size: 2, delay: 1.3, duration: 7 },
  { left: "92%", top: "68%", size: 3, delay: 4, duration: 10 },
];

export function AmbientBattleFX() {
  return (
    <div
      className="ambient-battle"
      aria-hidden="true"
    >
      {/* slow moving particles */}
      <div className="ambient-battle__particles">
        {particles.map((particle, index) => (
          <span
            key={index}
            className="ambient-battle__particle"
            style={{
              left: particle.left,
              top: particle.top,
              width: particle.size,
              height: particle.size,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
            }}
          />
        ))}
      </div>

      {/* cyan scan sweep */}
      <motion.div
        initial={{ x: "-130%" }}
        animate={{ x: "150%" }}
        transition={{
          duration: 5.5,
          repeat: Infinity,
          repeatDelay: 5,
          ease: "easeInOut",
        }}
        className="ambient-battle__scan ambient-battle__scan--cyan"
      />

      {/* pink reverse sweep */}
      <motion.div
        initial={{ x: "140%" }}
        animate={{ x: "-150%" }}
        transition={{
          duration: 7,
          repeat: Infinity,
          repeatDelay: 7,
          delay: 2.4,
          ease: "easeInOut",
        }}
        className="ambient-battle__scan ambient-battle__scan--pink"
      />

      {/* thin slash burst */}
      <motion.div
        initial={{
          opacity: 0,
          scaleX: 0.1,
        }}
        animate={{
          opacity: [0, 0.55, 0],
          scaleX: [0.1, 1, 1.15],
        }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          repeatDelay: 8,
          delay: 1.5,
        }}
        className="ambient-battle__slash"
      />

      {/* top-right energy marks */}
      <div className="ambient-battle__speed-marks ambient-battle__speed-marks--top">
        <span />
        <span />
        <span />
      </div>

      {/* bottom-left energy marks */}
      <div className="ambient-battle__speed-marks ambient-battle__speed-marks--bottom">
        <span />
        <span />
        <span />
      </div>

      {/* slow vignette pulse */}
      <div className="ambient-battle__pulse" />
    </div>
  );
}
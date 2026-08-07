import { useEffect } from "react";
import { motion } from "motion/react";

interface GamesBeginProps {
  onFinished: () => void;
}

export function GamesBegin({ onFinished }: GamesBeginProps) {
  useEffect(() => {
    const timer = window.setTimeout(onFinished, 3200);

    return () => {
      window.clearTimeout(timer);
    };
  }, [onFinished]);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.08 }}
      transition={{ duration: 0.24 }}
      className="fixed inset-0 z-50 grid place-items-center overflow-hidden bg-[#02040c] text-white"
    >
      <div className="show-ambient pointer-events-none absolute inset-0" />
      <div className="show-grid pointer-events-none absolute inset-0 opacity-30" />
      <div className="show-scanlines pointer-events-none absolute inset-0 opacity-25" />

      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="pointer-events-none absolute inset-0 z-30 bg-white"
      />

      <motion.div
        initial={{ x: "-135%", skewX: -24 }}
        animate={{ x: "145%", skewX: -24 }}
        transition={{ duration: 0.65, delay: 0.35, ease: "easeInOut" }}
        className="pointer-events-none absolute top-[35%] h-20 w-[75%] bg-cyan-300/80 shadow-[0_0_50px_#22d3ee]"
      />
      <motion.div
        initial={{ x: "145%", skewX: 24 }}
        animate={{ x: "-135%", skewX: 24 }}
        transition={{ duration: 0.6, delay: 0.45, ease: "easeInOut" }}
        className="pointer-events-none absolute top-[47%] h-12 w-[70%] bg-pink-500/80 shadow-[0_0_50px_#ec4899]"
      />

      <div className="relative z-20 px-5 text-center">
        <motion.p
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.25 }}
          className="mb-4 text-[0.65rem] font-black uppercase tracking-[0.6em] text-cyan-200 sm:text-sm"
        >
          All teams locked in
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, x: -120, scale: 1.45, skewX: -8 }}
          animate={{ opacity: 1, x: 0, scale: 1, skewX: -5 }}
          transition={{ delay: 0.72, type: "spring", stiffness: 320, damping: 19, mass: 0.7 }}
          className="impact-title text-[clamp(3.8rem,12.5vw,11rem)] font-black uppercase leading-[0.76] tracking-[-0.075em]"
        >
          Let The Games
          <br />
          <span className="text-pink-300">Begin</span>
        </motion.h1>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 1.25, duration: 0.38 }}
          className="mx-auto mt-8 h-[3px] w-[min(72vw,760px)] origin-center bg-gradient-to-r from-cyan-300 via-white to-pink-500 shadow-[0_0_30px_rgba(236,72,153,0.7)]"
        />
      </div>
    </motion.section>
  );
}

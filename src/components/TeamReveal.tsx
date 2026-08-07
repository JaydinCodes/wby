import { useRef } from "react";
import { motion } from "motion/react";
import type { TeamRevealData } from "../data/teamReveals";

interface TeamRevealProps {
  team: TeamRevealData;
  onFinished: () => void;
}

const TEAM_PLAYBACK_RATE = 1.5;

export function TeamReveal({ team, onFinished }: TeamRevealProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.06, filter: "blur(12px)" }}
      transition={{ duration: 0.28 }}
      className="fixed inset-0 z-50 overflow-hidden bg-black text-white"
    >
      <motion.video
        ref={videoRef}
        src={team.video}
        autoPlay
        muted
        playsInline
        preload="auto"
        onLoadedMetadata={() => {
          if (videoRef.current) {
            videoRef.current.playbackRate = TEAM_PLAYBACK_RATE;
          }
        }}
        onEnded={onFinished}
        onError={() => {
          console.error(`Failed to load ${team.video}`);
          onFinished();
        }}
        initial={{ scale: 1.045 }}
        animate={{ scale: 1 }}
        transition={{ duration: 2.1, ease: "easeOut" }}
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Film grade + fighting-game HUD atmosphere */}
      <div className="absolute inset-0 bg-black/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#001b3a]/80 via-black/5 to-[#4a002d]/70" />
      <div className="absolute inset-x-0 bottom-0 h-[64%] bg-gradient-to-t from-black/95 via-black/35 to-transparent" />
      <div className="show-grid absolute inset-0 opacity-20" />
      <div className="show-scanlines absolute inset-0 opacity-25" />

      {/* Opening impact flash */}
      <motion.div
        initial={{ opacity: 0.9 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="pointer-events-none absolute inset-0 z-20 bg-white"
      />

      {/* Diagonal impact slabs */}
      <motion.div
        initial={{ x: "-130%", skewX: -20 }}
        animate={{ x: "145%", skewX: -20 }}
        transition={{ duration: 0.55, delay: 0.58, ease: "easeInOut" }}
        className="pointer-events-none absolute top-[24%] z-10 h-14 w-[72%] bg-cyan-300/80 shadow-[0_0_45px_rgba(34,211,238,0.75)]"
      />
      <motion.div
        initial={{ x: "150%", skewX: 22 }}
        animate={{ x: "-135%", skewX: 22 }}
        transition={{ duration: 0.5, delay: 0.72, ease: "easeInOut" }}
        className="pointer-events-none absolute top-[31%] z-10 h-8 w-[68%] bg-pink-500/70 shadow-[0_0_40px_rgba(236,72,153,0.7)]"
      />

      {/* HUD header */}
      <motion.div
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.42, duration: 0.25 }}
        className="absolute left-5 right-5 top-5 z-20 flex items-center justify-between sm:left-9 sm:right-9 sm:top-8 lg:left-16 lg:right-16"
      >
        <div className="flex items-center gap-3">
          <span className="h-2 w-2 rotate-45 bg-cyan-300 shadow-[0_0_14px_#22d3ee]" />
          <p className="text-[0.58rem] font-black uppercase tracking-[0.4em] text-cyan-100 sm:text-xs">
            WBY // Team Reveal
          </p>
        </div>

        <p className="font-mono text-xs font-black tracking-[0.28em] text-white/55 sm:text-sm">
          {team.number} / 04
        </p>
      </motion.div>

      {/* Team number stamp */}
      <motion.p
        initial={{ opacity: 0, x: 80, scale: 1.4 }}
        animate={{ opacity: 0.16, x: 0, scale: 1 }}
        transition={{ delay: 0.9, type: "spring", stiffness: 260, damping: 18 }}
        className="pointer-events-none absolute right-[-0.04em] top-[8%] z-[5] font-black leading-none tracking-[-0.09em] text-white text-[clamp(8rem,24vw,22rem)]"
      >
        {team.number}
      </motion.p>

      {/* Team name slam */}
      <div className="absolute inset-x-0 bottom-0 z-20 px-5 pb-8 sm:px-9 sm:pb-12 lg:px-16 lg:pb-14">
        <motion.div
          initial={{ opacity: 0, x: -180, rotate: -2.5, scale: 1.16 }}
          animate={{ opacity: 1, x: 0, rotate: 0, scale: 1 }}
          transition={{ delay: 1.05, type: "spring", stiffness: 330, damping: 20, mass: 0.65 }}
          className="origin-left"
        >
          <div className="mb-2 flex items-center gap-3 sm:mb-3">
            <span className="h-[2px] w-10 bg-cyan-300 shadow-[0_0_18px_#22d3ee] sm:w-16" />
            <p className="text-[0.58rem] font-black uppercase tracking-[0.38em] text-cyan-200 sm:text-xs lg:text-sm">
              Westridge Baptist Youth Games
            </p>
          </div>

          <h1 className="impact-title max-w-[88vw] text-[clamp(3.35rem,10.4vw,9.6rem)] font-black uppercase leading-[0.78] tracking-[-0.07em]">
            {team.name}
          </h1>
        </motion.div>

        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 1.28, duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          className="mt-3 h-[3px] max-w-4xl origin-left bg-gradient-to-r from-cyan-300 via-white to-pink-500 shadow-[0_0_24px_rgba(34,211,238,0.55)] sm:mt-5"
        />

        <motion.div
          initial={{ opacity: 0, y: 24, x: -12 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          transition={{ delay: 2.55, duration: 0.42, ease: "easeOut" }}
          className="mt-4 flex max-w-4xl items-start gap-3 sm:mt-5 sm:gap-5"
        >
          <div className="mt-1 hidden min-w-16 border border-cyan-300/45 bg-cyan-300/10 px-2 py-1 text-center font-mono text-[0.6rem] font-black tracking-[0.22em] text-cyan-100 sm:block">
            WORD
          </div>

          <div className="border-l-2 border-pink-400 pl-3 sm:pl-5">
            <p className="text-xs font-bold leading-relaxed text-white/88 sm:text-lg lg:text-xl">
              “{team.verse}”
            </p>
            <p className="mt-1.5 text-[0.6rem] font-black uppercase tracking-[0.28em] text-pink-300 sm:text-xs">
              {team.verseReference}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Crest slam — screen blend removes the generated dark rectangle feel */}
      <motion.div
        initial={{ opacity: 0, scale: 1.65, rotate: -8, x: 80, filter: "blur(16px)" }}
        animate={{ opacity: 1, scale: 1, rotate: 0, x: 0, filter: "blur(0px)" }}
        transition={{ delay: 4.15, type: "spring", stiffness: 250, damping: 16, mass: 0.72 }}
        className="pointer-events-none absolute right-2 top-[13%] z-[15] w-[clamp(9rem,22vw,22rem)] sm:right-8 lg:right-14"
      >
        <div className="absolute inset-0 scale-75 rounded-full bg-gradient-to-br from-cyan-400/20 to-pink-500/20 blur-3xl" />
        <img
          src={team.logo}
          alt=""
          aria-hidden="true"
          className="team-crest-integrated relative w-full object-contain drop-shadow-[0_0_26px_rgba(34,211,238,0.5)]"
        />
      </motion.div>

      {/* READY pulse near the cut */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: [0, 1, 0.72], x: 0 }}
        transition={{ delay: 5.2, duration: 0.55 }}
        className="absolute right-5 top-[58%] z-20 hidden border-r-4 border-pink-400 pr-3 text-right sm:block lg:right-16"
      >
        <p className="text-xs font-black uppercase tracking-[0.45em] text-white/55">Locked In</p>
        <p className="mt-1 text-3xl font-black italic uppercase tracking-[-0.04em] text-white drop-shadow-[4px_3px_0_rgba(236,72,153,0.7)] lg:text-5xl">
          Ready
        </p>
      </motion.div>

      {/* Edge strikes */}
      <div className="pointer-events-none absolute inset-0 z-30 border border-cyan-300/20 shadow-[inset_0_0_55px_rgba(34,211,238,0.1)]" />
      <div className="pointer-events-none absolute bottom-0 left-0 z-30 h-1 w-1/2 bg-gradient-to-r from-cyan-300 to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 z-30 h-1 w-1/2 bg-gradient-to-l from-pink-500 to-transparent" />
    </motion.section>
  );
}

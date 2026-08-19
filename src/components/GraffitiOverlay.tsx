// src/components/GraffitiOverlay.tsx

export function GraffitiOverlay() {
  return (
    <svg
      className="graffiti-overlay"
      viewBox="0 0 1600 900"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="graffiti-cyan"
          x1="0"
          x2="1"
        >
          <stop offset="0%" stopColor="#20e7ff" />
          <stop offset="60%" stopColor="#20e7ff" stopOpacity="0.65" />
          <stop offset="100%" stopColor="#20e7ff" stopOpacity="0" />
        </linearGradient>

        <linearGradient
          id="graffiti-pink"
          x1="0"
          x2="1"
        >
          <stop offset="0%" stopColor="#ff2aa8" stopOpacity="0" />
          <stop offset="35%" stopColor="#ff2aa8" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#ff2aa8" />
        </linearGradient>

        <filter id="roughPaint">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.018 0.09"
            numOctaves="3"
            seed="9"
            result="noise"
          />

          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="22"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>

        <filter id="roughPaintSmall">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.04 0.14"
            numOctaves="2"
            seed="16"
            result="noise"
          />

          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="9"
          />
        </filter>

        <filter id="paintGlow">
          <feGaussianBlur
            stdDeviation="8"
            result="blur"
          />

          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* ================================
          TOP LEFT CYAN BRUSH
      ================================= */}

      <g
        className="graffiti-group graffiti-group--cyan"
        filter="url(#roughPaint)"
      >
        <path
          d="
            M -100 148
            C 65 80, 280 105, 530 124
            C 397 145, 233 172, -40 206
            Z
          "
          fill="url(#graffiti-cyan)"
        />

        <path
          d="
            M -40 177
            C 165 132, 360 142, 648 154
            L 590 163
            C 340 174, 124 204, -30 231
            Z
          "
          fill="#20e7ff"
          opacity="0.17"
        />
      </g>

      {/* cyan dry-brush streaks */}

      <g
        stroke="#25e7ff"
        strokeLinecap="round"
        filter="url(#roughPaintSmall)"
      >
        <path
          d="M 30 121 L 552 138"
          strokeWidth="9"
          opacity="0.24"
        />

        <path
          d="M 11 207 L 461 158"
          strokeWidth="5"
          opacity="0.2"
        />

        <path
          d="M 92 234 L 657 173"
          strokeWidth="3"
          opacity="0.25"
        />

        <path
          d="M 304 107 L 766 127"
          strokeWidth="2"
          opacity="0.42"
        />
      </g>

      {/* ================================
          TITLE MAGENTA PAINT
      ================================= */}

      <g filter="url(#roughPaint)">
        <path
          d="
            M 370 206
            C 598 132, 834 155, 1120 184
            C 930 198, 734 222, 423 258
            Z
          "
          fill="#ff22a6"
          opacity="0.15"
        />

        <path
          d="
            M 608 192
            C 831 162, 1027 174, 1285 190
            L 1100 213
            L 676 220
            Z
          "
          fill="#ff2aa8"
          opacity="0.16"
        />
      </g>

      {/* ================================
          RANDOM SPLATTER — CYAN
      ================================= */}

      <g
        fill="#27e9ff"
        opacity="0.35"
        filter="url(#paintGlow)"
      >
        <circle cx="65" cy="285" r="5" />
        <circle cx="84" cy="270" r="2.5" />
        <circle cx="103" cy="302" r="3" />
        <circle cx="36" cy="318" r="2" />
        <circle cx="125" cy="252" r="2" />

        <circle cx="1290" cy="96" r="3" />
        <circle cx="1335" cy="79" r="2" />
        <circle cx="1360" cy="112" r="4" />
      </g>

      {/* ================================
          RANDOM SPLATTER — PINK
      ================================= */}

      <g
        fill="#ff2aa8"
        opacity="0.34"
      >
        <circle cx="1155" cy="151" r="5" />
        <circle cx="1191" cy="138" r="2" />
        <circle cx="1220" cy="169" r="3.5" />
        <circle cx="1248" cy="132" r="2" />

        <circle cx="1480" cy="432" r="5" />
        <circle cx="1511" cy="397" r="2.5" />
        <circle cx="1530" cy="448" r="3" />
        <circle cx="1451" cy="471" r="2" />
      </g>

      {/* ================================
          DIAGONAL SCRATCHES
      ================================= */}

      <g
        fill="none"
        strokeLinecap="round"
      >
        <path
          d="M 1080 20 L 914 201"
          stroke="#22e7ff"
          strokeWidth="3"
          opacity="0.2"
        />

        <path
          d="M 1120 12 L 952 198"
          stroke="#22e7ff"
          strokeWidth="1"
          opacity="0.34"
        />

        <path
          d="M 1180 31 L 1004 207"
          stroke="#ff2aa8"
          strokeWidth="4"
          opacity="0.16"
        />

        <path
          d="M 1264 36 L 1099 188"
          stroke="#ff2aa8"
          strokeWidth="2"
          opacity="0.3"
        />
      </g>

      {/* ================================
          BETWEEN ROWS PAINT
      ================================= */}

      <g filter="url(#roughPaintSmall)">
        <path
          d="
            M -80 436
            C 120 393, 261 401, 458 411
            C 286 430, 128 455, -44 472
            Z
          "
          fill="#20e7ff"
          opacity="0.075"
        />

        <path
          d="
            M 1160 470
            C 1328 430, 1486 428, 1660 444
            L 1640 504
            C 1450 487, 1314 490, 1180 521
            Z
          "
          fill="#ff2aa8"
          opacity="0.08"
        />

        <path
          d="
            M -30 617
            C 130 588, 248 590, 377 604
            L 310 631
            C 162 626, 66 647, -30 673
            Z
          "
          fill="#ff2aa8"
          opacity="0.055"
        />
      </g>

      {/* ================================
          LOWER RIGHT GIANT MAGENTA SWEEP
      ================================= */}

      <g filter="url(#roughPaint)">
        <path
          d="
            M 1040 663
            C 1210 596, 1407 610, 1688 626
            L 1650 760
            C 1443 721, 1254 723, 1022 789
            Z
          "
          fill="url(#graffiti-pink)"
          opacity="0.11"
        />
      </g>

      {/* ================================
          WHITE DRY-BRUSH SCRATCHES
      ================================= */}

      <g
        stroke="white"
        strokeLinecap="round"
        opacity="0.09"
        filter="url(#roughPaintSmall)"
      >
        <path
          d="M 436 325 L 791 296"
          strokeWidth="4"
        />

        <path
          d="M 470 337 L 716 317"
          strokeWidth="2"
        />

        <path
          d="M 1000 570 L 1322 549"
          strokeWidth="3"
        />

        <path
          d="M 965 584 L 1260 565"
          strokeWidth="1.5"
        />
      </g>

      {/* ================================
          CORNER SPEED MARKS
      ================================= */}

      <g
        fill="none"
        stroke="#20e7ff"
        opacity="0.55"
      >
        <path
          d="M 28 40 H 160"
          strokeWidth="4"
        />

        <path
          d="M 28 40 V 100"
          strokeWidth="4"
        />
      </g>

      <g
        fill="none"
        stroke="#ff2aa8"
        opacity="0.5"
      >
        <path
          d="M 1572 42 H 1456"
          strokeWidth="4"
        />

        <path
          d="M 1572 42 V 106"
          strokeWidth="4"
        />
      </g>

      <g
        fill="none"
        stroke="#20e7ff"
        opacity="0.38"
      >
        <path
          d="M 28 858 H 180"
          strokeWidth="4"
        />

        <path
          d="M 28 858 V 812"
          strokeWidth="4"
        />
      </g>

      <g
        fill="none"
        stroke="#ff2aa8"
        opacity="0.42"
      >
        <path
          d="M 1572 858 H 1438"
          strokeWidth="4"
        />

        <path
          d="M 1572 858 V 805"
          strokeWidth="4"
        />
      </g>
    </svg>
  );
}
"use client";

import React, { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";

interface TransactionConfirmCardProps {
  totalAmount: number;
  currency: string;
  arrivalTimeSeconds: number;
  feesAmount: number;
  feesCurrency: string;
  onConfirm: () => void;
  onCancel: () => void;
  enableAnimations?: boolean;
}

const SYMBOLS: Record<string, string> = { USD: "$", EUR: "€", GBP: "£", USDC: "" };

/**
 * High-performance rolling money counter with ease-out exponential deceleration
 */
function RollingMoney({
  target,
  currency,
  symbol,
  shouldAnimate,
}: {
  target: number;
  currency: string;
  symbol: string;
  shouldAnimate: boolean;
}) {
  const [val, setVal] = useState(shouldAnimate ? 0 : target);
  const [done, setDone] = useState(!shouldAnimate);

  useEffect(() => {
    if (!shouldAnimate) {
      setVal(target);
      setDone(true);
      return;
    }

    let start: number | null = null;
    const duration = 1200; // ms
    let frameId: number;

    const tick = (now: number) => {
      if (!start) start = now;
      const progress = Math.min((now - start) / duration, 1);
      // Ease out expo for high-end fintech deceleration
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setVal(eased * target);

      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      } else {
        setDone(true);
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [target, shouldAnimate]);

  const formatted = val.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <motion.span
      className="inline-block tabular-nums"
      animate={done ? { scale: [1, 1.04, 1] } : {}}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      {currency === "USDC" ? `${formatted} USDC` : `${symbol}${formatted}`}
    </motion.span>
  );
}

export function TransactionConfirmCard({
  totalAmount,
  currency,
  arrivalTimeSeconds,
  feesAmount,
  feesCurrency,
  onConfirm,
  onCancel,
  enableAnimations = true,
}: TransactionConfirmCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const shouldAnimate = enableAnimations && !shouldReduceMotion;

  const sym = SYMBOLS[currency] ?? "";
  const grandTotal = totalAmount + feesAmount;

  const formatArrival = () => {
    if (arrivalTimeSeconds) {
      if (arrivalTimeSeconds < 60) return `~${Math.round(arrivalTimeSeconds)} secs`;
      if (arrivalTimeSeconds < 3600) return `~${Math.round(arrivalTimeSeconds / 60)} mins`;
      return `~${Math.round(arrivalTimeSeconds / 3600)} hours`;
    }
    if (grandTotal < 500) return "1-3 secs";
    if (grandTotal < 2500) return "3-5 secs";
    if (grandTotal < 10000) return "1-2 mins";
    if (grandTotal < 50000) return "5-15 mins";
    return "1-2 hours";
  };

  const formatCurrencyStatic = (val: number) => {
    if (currency === "USDC") return `${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC`;
    return `${sym}${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formattedTotalStatic = formatCurrencyStatic(grandTotal);
  const textLength = formattedTotalStatic.length;

  // ─────────────────────────────────────────────────────────────
  // DYNAMIC CIRCLE DIAMETER CALCULATION
  // Fixed SVG coordinate space: 1000 x 1000 with center at (500, 500)
  // Radii scale dynamically with both transaction amount & text length
  // ─────────────────────────────────────────────────────────────
  const viewBoxSize = 1000;
  const center = 500;

  // amountTier: 0 at <= $1, 0.4 at $100, 0.8 at $10k, 1.0 at $100k+
  const amountTier = Math.min(1, Math.max(0, Math.log10(Math.max(1, grandTotal)) / 5));
  // Additional radius bonus per character beyond 6
  const charBonus = Math.max(0, textLength - 6) * 15;

  // Scale inner radius to be much larger relative to the viewbox
  const innerRadius = Math.min(430, Math.round(360 + amountTier * 50 + charBonus));
  const ringGap = 45;
  const outerRadius = Math.min(485, innerRadius + ringGap);

  // Dynamically calculate dot counts so spacing along circumference stays perfectly consistent
  const outerDotsCount = Math.round((2 * Math.PI * outerRadius) / 46);
  const innerDotsCount = Math.round((2 * Math.PI * innerRadius) / 46);

  const generateDots = (count: number, radius: number, cX: number, cY: number) => {
    const dots = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * 2 * Math.PI - Math.PI / 2; // start from top
      const x = Math.round((cX + radius * Math.cos(angle)) * 100) / 100;
      const y = Math.round((cY + radius * Math.sin(angle)) * 100) / 100;
      dots.push({ x, y });
    }
    return dots;
  };

  const outerDots = generateDots(outerDotsCount, outerRadius, center, center);
  const innerDots = generateDots(innerDotsCount, innerRadius, center, center);

  // Dynamic font sizing so text never collides (slightly reduced to ensure safety)
  const getTextSizeClass = (len: number) => {
    if (len <= 7) return "text-5xl";
    if (len <= 10) return "text-4xl";
    if (len <= 12) return "text-3xl";
    return "text-2xl";
  };

  // Dynamic container max width: expands gracefully for large numbers
  const containerMaxWidth = textLength >= 10 ? "max-w-xl" : "max-w-lg";

  return (
    <motion.div
      className={`w-full ${containerMaxWidth} mx-auto transition-all duration-300`}
      initial={shouldAnimate ? { opacity: 0, y: 15, scale: 0.96 } : {}}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 25 }}
    >
      <div className="relative">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
          <motion.div
            className="rounded-full bg-gradient-to-tr from-blue-500/15 via-indigo-500/15 to-emerald-500/15 blur-3xl"
            style={{ width: `${(outerRadius / 500) * 100}%`, height: `${(outerRadius / 500) * 100}%` }}
            animate={shouldAnimate ? { scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] } : {}}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* Dynamic Dots Visualization */}
        <div className="relative w-full aspect-square max-w-[390px] sm:max-w-[430px] md:max-w-[460px] mx-auto overflow-visible -mt-4">
          <svg className="w-full h-full" viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}>
            {/* Outer Blue Dots */}
            <motion.g
              animate={shouldAnimate ? { rotate: 360 } : {}}
              transition={{ duration: 60, ease: "linear", repeat: Infinity }}
              style={{ transformOrigin: "500px 500px" }}
            >
              {outerDots.map((dot, index) => (
                <motion.circle
                  key={`outer-${index}`}
                  cx={dot.x}
                  cy={dot.y}
                  r="7"
                  fill="#4a72ff"
                  initial={shouldAnimate ? { opacity: 0, scale: 0 } : {}}
                  animate={{ opacity: 0.55, scale: 1 }}
                  transition={
                    shouldAnimate
                      ? {
                          type: "spring",
                          stiffness: 300,
                          damping: 22,
                          delay: 0.05 + (index / outerDotsCount) * 0.25,
                        }
                      : {}
                  }
                />
              ))}
            </motion.g>

            {/* Inner Emerald Dots */}
            <motion.g
              animate={shouldAnimate ? { rotate: -360 } : {}}
              transition={{ duration: 80, ease: "linear", repeat: Infinity }}
              style={{ transformOrigin: "500px 500px" }}
            >
              {innerDots.map((dot, index) => (
                <motion.circle
                  key={`inner-${index}`}
                  cx={dot.x}
                  cy={dot.y}
                  r="7"
                  fill="#10b981"
                  initial={shouldAnimate ? { opacity: 0, scale: 0 } : {}}
                  animate={{ opacity: 0.55, scale: 1 }}
                  transition={
                    shouldAnimate
                      ? {
                          type: "spring",
                          stiffness: 300,
                          damping: 22,
                          delay: 0.1 + (index / innerDotsCount) * 0.25,
                        }
                      : {}
                  }
                />
              ))}
            </motion.g>
          </svg>

          {/* Center: TOTAL label + Rolling Money Amount */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center px-4 max-w-[90%]">
              <motion.div
                className="text-xs sm:text-sm font-bold text-slate-500 tracking-[0.25em] uppercase mb-1.5"
                initial={shouldAnimate ? { opacity: 0, y: -8 } : {}}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 350, damping: 25 }}
              >
                TOTAL
              </motion.div>

              <div className={`${getTextSizeClass(textLength)} font-black text-slate-900 tracking-tight leading-none`}>
                <RollingMoney
                  target={grandTotal}
                  currency={currency}
                  symbol={sym}
                  shouldAnimate={shouldAnimate}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stats row: Arrives In & Fees */}
        <div className="flex items-center justify-between px-6 sm:px-12 mt-1">
          {/* Arrives In */}
          <motion.div
            className="flex flex-col items-center text-center gap-0.5"
            initial={shouldAnimate ? { opacity: 0, y: 12 } : {}}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <span className="text-xs font-bold text-slate-500">Arrives in</span>
            <span className="text-lg sm:text-xl font-black text-slate-900">{formatArrival()}</span>
          </motion.div>

          {/* Fees */}
          <motion.div
            className="flex flex-col items-center text-center gap-0.5"
            initial={shouldAnimate ? { opacity: 0, y: 12 } : {}}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            <span className="text-xs font-bold text-slate-500">Fees (0.2%)</span>
            <span className="text-lg sm:text-xl font-black text-slate-900">{formatCurrencyStatic(feesAmount)}</span>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <motion.div
          className="flex gap-3.5 mt-6 px-4 sm:px-6"
          initial={shouldAnimate ? { opacity: 0, y: 15 } : {}}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <motion.button
            className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 font-bold text-base px-4 py-3 rounded-xl transition-all shadow-sm active:scale-[0.98]"
            whileHover={shouldAnimate ? { scale: 1.02 } : {}}
            whileTap={shouldAnimate ? { scale: 0.98 } : {}}
            onClick={onCancel}
          >
            Cancel
          </motion.button>
          <motion.button
            className="flex-1 bg-[#4a72ff] hover:bg-[#3b63f0] text-white font-bold text-base px-4 py-3 rounded-xl transition-all shadow-lg shadow-[#4a72ff]/25 active:scale-[0.98]"
            whileHover={shouldAnimate ? { scale: 1.02, y: -1 } : {}}
            whileTap={shouldAnimate ? { scale: 0.98 } : {}}
            onClick={onConfirm}
          >
            Send
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
}

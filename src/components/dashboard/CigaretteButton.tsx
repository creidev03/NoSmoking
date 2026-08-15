"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface CigaretteButtonProps {
  currentCount: number;
  threshold: number;
  onRegister: () => void;
}

/**
 * SVG-based circular button with bottom-to-top fill animation.
 *
 * Progress is shown via a clip-path mask: a circle clips a rectangle whose
 * height animates from 0% (empty) to 100% (full).  The border ring uses
 * stroke-dasharray to leave a small gap at the bottom.
 */
export function CigaretteButton({
  currentCount,
  threshold,
  onRegister,
}: CigaretteButtonProps) {
  const [fillPercent, setFillPercent] = useState(0);
  const [isResetting, setIsResetting] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);
  const prevCountRef = useRef(currentCount);

  // ── Sync fill with server count ──────────────────────────────────────
  useEffect(() => {
    const prev = prevCountRef.current;
    prevCountRef.current = currentCount;

    // Detect penalty reset: was at threshold-1, now back to 0
    if (prev === threshold - 1 && currentCount === 0) {
      setIsResetting(true);
      // Drain the fill downward over 500ms
      setFillPercent(100); // jump to full so transition down is visible
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setFillPercent(0);
        });
      });
      setTimeout(() => setIsResetting(false), 600);
    } else {
      setFillPercent((currentCount / threshold) * 100);
    }
  }, [currentCount, threshold]);

  // ── Pulse on click ──────────────────────────────────────────────────
  const handleClick = useCallback(() => {
    if (isResetting) return;
    setIsPulsing(true);
    setTimeout(() => setIsPulsing(false), 150);
    onRegister();
  }, [isResetting, onRegister]);

  // ── SVG constants ───────────────────────────────────────────────────
  const size = 120;
  const stroke = 5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  // Gap at the bottom: ~12% of circumference (360° * 0.12 ≈ 43°)
  const gapLen = circumference * 0.12;
  const arcLen = circumference - gapLen;
  // Dashed pattern: 12px dash, 12px gap (equal)
  const dashLen = 12;
  const dashGap = 12;
  // Inner radius for fill (separate from border)
  const innerRadius = radius - stroke - 10;

  // Color interpolation: orange → red as fill grows
  const fillColor =
    fillPercent === 0
      ? "var(--color-warning)"
      : fillPercent < 50
        ? "var(--color-warning)"
        : "var(--color-danger)";

  const borderColor =
    fillPercent === 0
      ? "var(--color-warning)"
      : fillPercent < 50
        ? "var(--color-warning)"
        : "var(--color-danger)";

  return (
    <div className="flex flex-col items-center gap-2">
      {/* ── Button ─────────────────────────────────────────────────── */}
      <button
        onClick={handleClick}
        data-testid="cigarette-button"
        className="group relative flex items-center justify-center rounded-full transition-transform duration-150 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        style={{
          width: size,
          height: size,
          transform: isPulsing ? "scale(0.93)" : "scale(1)",
        }}
        aria-label={`Registrar cigarro (${currentCount}/${threshold})`}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="absolute inset-0"
        >
          {/* ── Clip mask for the fill ─────────────────────────────── */}
          <defs>
            <clipPath id="cig-circle-clip">
              <circle cx={size / 2} cy={size / 2} r={innerRadius} />
            </clipPath>
          </defs>

          {/* ── Background fill (rises from bottom) ────────────────── */}
          <g clipPath="url(#cig-circle-clip)">
            <rect
              x={0}
              y={size}
              width={size}
              height={size}
              fill={fillColor}
              opacity={0.25}
              style={{
                transition: isResetting
                  ? "y 500ms ease-in, height 500ms ease-in"
                  : "y 300ms ease, height 300ms ease",
                y: size - (size * fillPercent) / 100,
                height: (size * fillPercent) / 100,
              }}
            />
          </g>

          {/* ── Border ring with dashed style and bottom gap ──────────── */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={borderColor}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${dashLen} ${dashGap}`}
            strokeDashoffset={gapLen / 2}
            transform={`rotate(90 ${size / 2} ${size / 2})`}
            style={{ transition: "stroke 300ms ease" }}
          />
        </svg>

        {/* ── Pixel Cigarette Icon ──────────────────────────────────── */}
        <svg
          width={40}
          height={40}
          viewBox="0 0 16 16"
          className="relative z-10"
          style={{
            filter:
              fillPercent > 0
                ? "drop-shadow(0 1px 2px rgba(0,0,0,0.15))"
                : undefined,
            imageRendering: "pixelated",
          }}
          aria-hidden="true"
        >
          {/* Smoke pixels - animated upward with more detail */}
          {/* Column 1 - left side */}
          <rect x="2" y="2" width="1" height="1" fill={fillColor} opacity="0.3">
            <animate attributeName="y" values="4;-3;4" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite" />
          </rect>
          <rect x="2" y="0" width="1" height="1" fill={fillColor} opacity="0.2">
            <animate attributeName="y" values="2;-4;2" dur="2.8s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.3;0;0.3" dur="2.8s" repeatCount="indefinite" />
          </rect>
          
          {/* Column 2 - center */}
          <rect x="3" y="1" width="1" height="1" fill={fillColor} opacity="0.35">
            <animate attributeName="y" values="3;-2;3" dur="2.2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.4;0;0.4" dur="2.2s" repeatCount="indefinite" />
          </rect>
          <rect x="3" y="-1" width="1" height="1" fill={fillColor} opacity="0.25">
            <animate attributeName="y" values="1;-5;1" dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.3;0;0.3" dur="3s" repeatCount="indefinite" />
          </rect>
          <rect x="3" y="-2" width="1" height="1" fill={fillColor} opacity="0.15">
            <animate attributeName="y" values="0;-6;0" dur="3.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.2;0;0.2" dur="3.5s" repeatCount="indefinite" />
          </rect>
          
          {/* Column 3 - right side */}
          <rect x="4" y="2" width="1" height="1" fill={fillColor} opacity="0.3">
            <animate attributeName="y" values="4;-2;4" dur="2.4s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.35;0;0.35" dur="2.4s" repeatCount="indefinite" />
          </rect>
          <rect x="4" y="0" width="1" height="1" fill={fillColor} opacity="0.2">
            <animate attributeName="y" values="2;-4;2" dur="3.2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.25;0;0.25" dur="3.2s" repeatCount="indefinite" />
          </rect>
          
          {/* Wispy trail - very faint, rises high */}
          <rect x="2" y="-3" width="1" height="1" fill={fillColor} opacity="0.1">
            <animate attributeName="y" values="-1;-7;-1" dur="4s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.15;0;0.15" dur="4s" repeatCount="indefinite" />
          </rect>
          <rect x="4" y="-4" width="1" height="1" fill={fillColor} opacity="0.08">
            <animate attributeName="y" values="-2;-8;-2" dur="4.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.1;0;0.1" dur="4.5s" repeatCount="indefinite" />
          </rect>
          
          {/* Cigarette body - white with orange fill as progress */}
          <rect x="2" y="5" width="10" height="3" fill="#F3F4F6" />
          <rect x="2" y="5" width="10" height="3" fill={fillColor} opacity="0.3" />
          
          {/* Filter - brown */}
          <rect x="12" y="5" width="3" height="3" fill="#92400E" />
          
          {/* Burning tip - changes to ash at 3/5 */}
          {currentCount >= 3 ? (
            // Ash state - grey
            <rect x="0" y="5" width="2" height="3" fill="var(--color-text-muted)">
              <animate
                attributeName="opacity"
                values="1;0.8;1"
                dur="2s"
                repeatCount="indefinite"
              />
            </rect>
          ) : (
            // Burning state - red with glow
            <rect x="0" y="5" width="2" height="3" fill="var(--color-danger)">
              <animate
                attributeName="opacity"
                values="1;0.7;1"
                dur="1s"
                repeatCount="indefinite"
              />
            </rect>
          )}
          
          {/* Ash particles when burning */}
          {currentCount >= 3 && (
            <>
              <rect x="0" y="8" width="1" height="1" fill="var(--color-text-muted)" opacity="0.6">
                <animate
                  attributeName="y"
                  values="8;10;8"
                  dur="1.5s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.6;0;0.6"
                  dur="1.5s"
                  repeatCount="indefinite"
                />
              </rect>
              <rect x="1" y="8" width="1" height="1" fill="var(--color-text-muted)" opacity="0.4">
                <animate
                  attributeName="y"
                  values="8;11;8"
                  dur="2s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.4;0;0.4"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </rect>
            </>
          )}
        </svg>
      </button>

      {/* ── Count label ────────────────────────────────────────────── */}
      {/* <p className="text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF]">
        {currentCount}/{threshold} cigarros
      </p> */}
    </div>
  );
}

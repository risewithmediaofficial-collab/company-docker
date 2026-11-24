import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, AlertTriangle } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

/**
 * FragmentedStackIllustration
 * Recreates the chaotic tangled spaghetti illustration from the reference design:
 * - A looping, criss-crossing tangled wireframe line
 * - Scattered, tilted icons (Spreadsheets, Lost WhatsApp, Manual Tax, Missed Deadlines, Lost Passwords, Cash Leak)
 * - Zero dense text paragraphs — purely visual, intuitive, and immediate
 */
const FragmentedStackIllustration = () => (
  <div className="w-full py-2 flex items-center justify-center select-none">
    <svg
      viewBox="0 0 500 330"
      className="w-full h-auto max-h-[330px] overflow-visible"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Soft pastel shadow filter */}
        <filter id="frag-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.06" floodColor="#0f172a" />
        </filter>
        <filter id="cyan-accent-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="3" dy="3" stdDeviation="0" floodColor="#12B7D4" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* ── 1. THE TANGLED, SPAGHETTI WIREFRAME PATH (Rose / Slate Tint) ── */}
      {/* Background chaotic looping wireframe line */}
      <path
        d="M 85 240 C 30 180 50 70 145 55 C 220 40 250 170 120 195 C 40 210 65 95 180 80 C 290 65 310 230 420 180 C 470 155 450 75 375 60 C 290 45 220 135 270 215 C 310 280 430 270 450 160 C 465 90 380 40 275 35 C 160 30 115 140 185 245 C 225 305 345 295 385 235"
        stroke="#CBD5E1"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="5 5"
        className="opacity-70"
      />

      {/* Main tangled foreground loop */}
      <path
        d="M 75 95 C 145 20 285 25 330 110 C 375 195 240 260 170 200 C 115 155 170 65 295 70 C 390 75 440 190 355 240 C 275 285 130 260 95 150 C 70 85 160 35 240 45 C 340 55 425 145 365 210 C 320 260 215 255 180 180 C 150 120 220 70 310 90"
        stroke="#94A3B8"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Tangled crossing arrow indicator 1 */}
      <path
        d="M 235 44 L 255 46 L 245 58"
        fill="none"
        stroke="#94A3B8"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Tangled crossing arrow indicator 2 */}
      <path
        d="M 125 190 L 115 202 L 132 205"
        fill="none"
        stroke="#F43F5E"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* ── 2. SCATTERED / TILTED ICONS (MATCHING IMAGE 2 LEFT SIDE) ── */}

      {/* Icon A: Messy Spreadsheets (Tilted -9deg) */}
      <g transform="translate(60, 160) rotate(-9)">
        {/* Soft cyan drop block accent like reference */}
        <rect x="2" y="3" width="50" height="42" rx="8" fill="#E0F2FE" />
        <rect
          x="0"
          y="0"
          width="50"
          height="42"
          rx="8"
          fill="#FFFFFF"
          stroke="#0F172A"
          strokeWidth="1.8"
          filter="url(#frag-shadow)"
        />
        {/* Table grid lines */}
        <line x1="0" y1="14" x2="50" y2="14" stroke="#0F172A" strokeWidth="1.5" />
        <line x1="17" y1="14" x2="17" y2="42" stroke="#CBD5E1" strokeWidth="1.5" />
        <line x1="33" y1="14" x2="33" y2="42" stroke="#CBD5E1" strokeWidth="1.5" />
        <line x1="0" y1="27" x2="50" y2="27" stroke="#CBD5E1" strokeWidth="1.5" />
        {/* Pencil tilted */}
        <g transform="translate(36, 24) rotate(45)">
          <rect x="0" y="0" width="5" height="18" rx="1" fill="#0EA5E9" stroke="#0F172A" strokeWidth="1.4" />
          <polygon points="0,18 2.5,23 5,18" fill="#0F172A" />
        </g>
        {/* Label */}
        <text x="25" y="58" textAnchor="middle" fill="#64748B" fontSize="11" fontWeight="700" fontFamily="sans-serif">
          Spreadsheets
        </text>
      </g>

      {/* Icon B: Manual TAX Invoice (Tilted 11deg) */}
      <g transform="translate(160, 95) rotate(11)">
        <rect x="3" y="3" width="46" height="52" rx="7" fill="#E0F2FE" />
        <rect
          x="0"
          y="0"
          width="46"
          height="52"
          rx="7"
          fill="#FFFFFF"
          stroke="#0F172A"
          strokeWidth="1.8"
          filter="url(#frag-shadow)"
        />
        {/* Tax Tag */}
        <rect x="8" y="9" width="30" height="15" rx="4" fill="#FEE2E2" stroke="#F43F5E" strokeWidth="1.3" />
        <text x="23" y="20" textAnchor="middle" fill="#E11D48" fontSize="9" fontWeight="900" fontFamily="sans-serif">
          TAX
        </text>
        {/* Skeleton lines */}
        <line x1="9" y1="31" x2="37" y2="31" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="9" y1="38" x2="28" y2="38" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
        {/* Label */}
        <text x="23" y="68" textAnchor="middle" fill="#64748B" fontSize="11" fontWeight="700" fontFamily="sans-serif">
          Manual Billing
        </text>
      </g>

      {/* Icon C: Scattered WhatsApp / Messages (Tilted -16deg) */}
      <g transform="translate(195, 25) rotate(-16)">
        <rect
          x="0"
          y="0"
          width="48"
          height="38"
          rx="10"
          fill="#FFFFFF"
          stroke="#0F172A"
          strokeWidth="1.8"
          filter="url(#frag-shadow)"
        />
        {/* Paper airplane inside message */}
        <path
          d="M 12 18 L 36 10 L 26 28 L 22 20 Z"
          fill="#10B981"
          stroke="#0F172A"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <text x="24" y="52" textAnchor="middle" fill="#64748B" fontSize="11" fontWeight="700" fontFamily="sans-serif">
          Lost Chats
        </text>
      </g>

      {/* Icon D: Deadline Clock with Dashed Alert (Tilted 8deg) */}
      <g transform="translate(325, 40) rotate(8)">
        <circle cx="26" cy="26" r="23" stroke="#CBD5E1" strokeWidth="1.8" strokeDasharray="3 3" />
        <circle
          cx="26"
          cy="26"
          r="19"
          fill="#FFFFFF"
          stroke="#0F172A"
          strokeWidth="1.8"
          filter="url(#frag-shadow)"
        />
        <circle cx="26" cy="26" r="2.5" fill="#F43F5E" />
        {/* Clock Hands pointing to urgent time */}
        <line x1="26" y1="26" x2="26" y2="13" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" />
        <line x1="26" y1="26" x2="35" y2="28" stroke="#F43F5E" strokeWidth="2" strokeLinecap="round" />
        {/* Label */}
        <text x="26" y="66" textAnchor="middle" fill="#64748B" fontSize="11" fontWeight="700" fontFamily="sans-serif">
          Deadlines
        </text>
      </g>

      {/* Icon E: Cash Leaking / Multiple Subscriptions (Tilted -12deg) */}
      <g transform="translate(320, 160) rotate(-12)">
        <rect x="3" y="3" width="48" height="34" rx="7" fill="#E0F2FE" />
        <rect
          x="0"
          y="0"
          width="48"
          height="34"
          rx="7"
          fill="#FFFFFF"
          stroke="#0F172A"
          strokeWidth="1.8"
          filter="url(#frag-shadow)"
        />
        <circle cx="24" cy="17" r="9" fill="#ECFDF5" stroke="#10B981" strokeWidth="1.5" />
        <text x="24" y="21" textAnchor="middle" fill="#059669" fontSize="11" fontWeight="900" fontFamily="sans-serif">
          ₹
        </text>
        {/* Label */}
        <text x="24" y="50" textAnchor="middle" fill="#64748B" fontSize="11" fontWeight="700" fontFamily="sans-serif">
          SaaS Waste
        </text>
      </g>

      {/* Icon F: Lost Password Sticky / Document with Ribbon (Tilted 15deg) */}
      <g transform="translate(400, 105) rotate(15)">
        <rect x="3" y="3" width="44" height="48" rx="6" fill="#FEF3C7" />
        <rect
          x="0"
          y="0"
          width="44"
          height="48"
          rx="6"
          fill="#FFFFFF"
          stroke="#0F172A"
          strokeWidth="1.8"
          filter="url(#frag-shadow)"
        />
        {/* Ribbon bookmark in corner */}
        <path d="M 28 0 L 28 14 L 33 10 L 38 14 L 38 0 Z" fill="#F59E0B" stroke="#0F172A" strokeWidth="1.4" />
        <line x1="8" y1="20" x2="26" y2="20" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="8" y1="28" x2="36" y2="28" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
        {/* Label */}
        <text x="22" y="64" textAnchor="middle" fill="#64748B" fontSize="11" fontWeight="700" fontFamily="sans-serif">
          Unsafe Logins
        </text>
      </g>
    </svg>
  </div>
);

/**
 * UnifiedFlowIllustration
 * Clean, organized 9-node serpentine agency operating system workflow:
 * - Tier 1 (Acquisition & Onboarding: Left -> Right): Proposals -> Contracts -> Client Vault
 * - Tier 2 (Fulfillment & Execution: Right -> Left): Projects -> Tasks -> Content & SMM
 * - Tier 3 (Billing & Financial Health: Left -> Right): Invoices -> Expenses -> Accounting / P&L
 * - Connected via continuous #12B7D4 line with directional flow arrows and Apple-minimalist styling
 */
const UnifiedFlowIllustration = () => (
  <div className="w-full py-2 flex items-center justify-center select-none">
    <svg
      viewBox="0 0 540 330"
      className="w-full h-auto max-h-[330px] overflow-visible"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id="uni-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.07" floodColor="#0f172a" />
        </filter>
        <filter id="cyan-block-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="3" dy="3" stdDeviation="0" floodColor="#12B7D4" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* ── 1. THE CONTINUOUS SERPENTINE CONNECTING PIPELINE (LOGO CYAN #12B7D4) ── */}
      {/* Tier 1: Proposals -> Contracts -> Client Vault */}
      <line x1="104" y1="45" x2="246" y2="45" stroke="#12B7D4" strokeWidth="2.4" strokeLinecap="round" />
      <line x1="294" y1="45" x2="436" y2="45" stroke="#12B7D4" strokeWidth="2.4" strokeLinecap="round" />

      {/* Directional Flow Arrows: Tier 1 (Left -> Right) */}
      <polygon points="172,41 179,45 172,49" fill="#12B7D4" />
      <polygon points="362,41 369,45 362,49" fill="#12B7D4" />

      {/* Right Curve Downward: Tier 1 to Tier 2 (Client Vault -> Projects) */}
      <path
        d="M 484 45 C 528 45 528 155 484 155"
        stroke="#12B7D4"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      {/* Directional Arrow on Right Curve */}
      <polygon points="518,96 523,103 527,96" fill="#12B7D4" />

      {/* Tier 2: Projects -> Tasks -> Content & SMM (Right -> Left) */}
      <line x1="436" y1="155" x2="294" y2="155" stroke="#12B7D4" strokeWidth="2.4" strokeLinecap="round" />
      <line x1="246" y1="155" x2="104" y2="155" stroke="#12B7D4" strokeWidth="2.4" strokeLinecap="round" />

      {/* Directional Flow Arrows: Tier 2 (Right -> Left) */}
      <polygon points="369,151 362,155 369,159" fill="#12B7D4" />
      <polygon points="179,151 172,155 179,159" fill="#12B7D4" />

      {/* Left Curve Downward: Tier 2 to Tier 3 (Content & SMM -> Invoices) */}
      <path
        d="M 56 155 C 12 155 12 265 56 265"
        stroke="#12B7D4"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      {/* Directional Arrow on Left Curve */}
      <polygon points="13,206 17,213 22,206" fill="#12B7D4" />

      {/* Tier 3: Invoices -> Expenses -> Accounting / P&L (Left -> Right) */}
      <line x1="104" y1="265" x2="246" y2="265" stroke="#12B7D4" strokeWidth="2.4" strokeLinecap="round" />
      <line x1="294" y1="265" x2="436" y2="265" stroke="#12B7D4" strokeWidth="2.4" strokeLinecap="round" />

      {/* Directional Flow Arrows: Tier 3 (Left -> Right) */}
      <polygon points="172,261 179,265 172,269" fill="#12B7D4" />
      <polygon points="362,261 369,265 362,269" fill="#12B7D4" />

      {/* ── 2. THE 9 ORGANIZED FLOW MILESTONE NODES ── */}

      {/* ── TIER 1: ACQUISITION & ONBOARDING ── */}

      {/* NODE 1: Proposals (x=56, y=22) */}
      <g transform="translate(56, 22)">
        <rect x="3" y="3" width="48" height="46" rx="8" fill="#E0F2FE" />
        <rect
          x="0"
          y="0"
          width="48"
          height="46"
          rx="8"
          fill="#FFFFFF"
          stroke="#0F172A"
          strokeWidth="1.8"
          filter="url(#uni-shadow)"
        />
        <path
          d="M 11 23 L 37 12 L 26 34 L 22 24 Z"
          fill="#12B7D4"
          stroke="#0F172A"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path d="M 22 24 L 37 12" stroke="#0F172A" strokeWidth="1.5" />
        <text x="24" y="62" textAnchor="middle" fill="#334155" fontSize="11" fontWeight="800" fontFamily="sans-serif">
          Proposals
        </text>
      </g>

      {/* NODE 2: Contracts (x=246, y=22) */}
      <g transform="translate(246, 22)">
        <rect x="3" y="3" width="48" height="46" rx="8" fill="#BAE6FD" />
        <rect
          x="0"
          y="0"
          width="48"
          height="46"
          rx="8"
          fill="#FFFFFF"
          stroke="#0F172A"
          strokeWidth="1.8"
          filter="url(#uni-shadow)"
        />
        <path d="M 30 0 L 30 14 L 34 10 L 38 14 L 38 0 Z" fill="#10B981" stroke="#0F172A" strokeWidth="1.4" />
        <line x1="9" y1="18" x2="24" y2="18" stroke="#94A3B8" strokeWidth="1.6" strokeLinecap="round" />
        <line x1="9" y1="26" x2="38" y2="26" stroke="#CBD5E1" strokeWidth="1.6" strokeLinecap="round" />
        <line x1="9" y1="33" x2="28" y2="33" stroke="#CBD5E1" strokeWidth="1.6" strokeLinecap="round" />
        <text x="24" y="62" textAnchor="middle" fill="#334155" fontSize="11" fontWeight="800" fontFamily="sans-serif">
          Contracts
        </text>
      </g>

      {/* NODE 3: Client Vault (x=436, y=22) */}
      <g transform="translate(436, 22)">
        <rect x="3" y="3" width="48" height="46" rx="8" fill="#BAE6FD" />
        <path
          d="M 0 6 C 0 3 3 0 6 0 L 19 0 C 21 0 23 2 25 4 L 28 7 L 42 7 C 45 7 48 9 48 12 L 48 40 C 48 43 45 46 42 46 L 6 46 C 3 46 0 43 0 40 Z"
          fill="#FFFFFF"
          stroke="#0F172A"
          strokeWidth="1.8"
          filter="url(#uni-shadow)"
        />
        <circle cx="24" cy="27" r="7" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="1.4" />
        <rect x="22" y="26" width="4" height="5" rx="1" fill="#0F172A" />
        <path d="M 21.5 26 C 21.5 23.5 26.5 23.5 26.5 26" fill="none" stroke="#0F172A" strokeWidth="1.3" />
        <text x="24" y="62" textAnchor="middle" fill="#334155" fontSize="11" fontWeight="800" fontFamily="sans-serif">
          Client Vault
        </text>
      </g>

      {/* ── TIER 2: FULFILLMENT & EXECUTION (INCL. PROJECTS) ── */}

      {/* NODE 4: Projects (x=436, y=132) */}
      <g transform="translate(436, 132)">
        <rect x="3" y="3" width="48" height="46" rx="8" fill="#E0F2FE" />
        <rect
          x="0"
          y="0"
          width="48"
          height="46"
          rx="8"
          fill="#FFFFFF"
          stroke="#0F172A"
          strokeWidth="1.8"
          filter="url(#uni-shadow)"
        />
        {/* Project Header Bar */}
        <rect x="6" y="8" width="36" height="6" rx="2" fill="#0284C7" />
        {/* Milestone Circular Progress */}
        <circle cx="16" cy="28" r="8" fill="#F0F9FF" stroke="#0284C7" strokeWidth="1.8" strokeDasharray="38 12" />
        <circle cx="16" cy="28" r="3" fill="#10B981" />
        {/* Milestone Tracks */}
        <line x1="28" y1="24" x2="41" y2="24" stroke="#0F172A" strokeWidth="1.6" strokeLinecap="round" />
        <line x1="28" y1="31" x2="38" y2="31" stroke="#94A3B8" strokeWidth="1.4" strokeLinecap="round" />
        <text x="24" y="62" textAnchor="middle" fill="#334155" fontSize="11" fontWeight="800" fontFamily="sans-serif">
          Projects
        </text>
      </g>

      {/* NODE 5: Tasks Database (x=246, y=132) */}
      <g transform="translate(246, 132)">
        <rect x="3" y="3" width="48" height="46" rx="8" fill="#BAE6FD" />
        <rect
          x="0"
          y="0"
          width="48"
          height="46"
          rx="8"
          fill="#FFFFFF"
          stroke="#0F172A"
          strokeWidth="1.8"
          filter="url(#uni-shadow)"
        />
        <rect x="7" y="9" width="9" height="28" rx="2" fill="#F1F5F9" />
        <rect x="7" y="11" width="9" height="11" rx="1.5" fill="#12B7D4" />
        <rect x="19.5" y="9" width="9" height="28" rx="2" fill="#F1F5F9" />
        <rect x="19.5" y="16" width="9" height="9" rx="1.5" fill="#F59E0B" />
        <rect x="32" y="9" width="9" height="28" rx="2" fill="#F1F5F9" />
        <rect x="32" y="10" width="9" height="15" rx="1.5" fill="#10B981" />
        <text x="24" y="62" textAnchor="middle" fill="#334155" fontSize="11" fontWeight="800" fontFamily="sans-serif">
          Tasks
        </text>
      </g>

      {/* NODE 6: Content & SMM (x=56, y=132) */}
      <g transform="translate(56, 132)">
        <rect x="3" y="3" width="48" height="46" rx="8" fill="#FEF3C7" />
        <rect
          x="0"
          y="0"
          width="48"
          height="46"
          rx="8"
          fill="#FFFFFF"
          stroke="#0F172A"
          strokeWidth="1.8"
          filter="url(#uni-shadow)"
        />
        {/* Calendar top binder rings */}
        <line x1="14" y1="0" x2="14" y2="7" stroke="#0F172A" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="34" y1="0" x2="34" y2="7" stroke="#0F172A" strokeWidth="1.8" strokeLinecap="round" />
        <rect x="0" y="6" width="48" height="6" fill="#F43F5E" />
        {/* Reels Play Triangle */}
        <polygon points="15,22 15,34 25,28" fill="#8B5CF6" stroke="#0F172A" strokeWidth="1.4" strokeLinejoin="round" />
        {/* Approved badge */}
        <circle cx="34" cy="28" r="6.5" fill="#10B981" stroke="#0F172A" strokeWidth="1.4" />
        <path d="M 31.5 28 L 33.5 30 L 36.5 26" fill="none" stroke="#FFFFFF" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        <text x="24" y="62" textAnchor="middle" fill="#334155" fontSize="11" fontWeight="800" fontFamily="sans-serif">
          Content & SMM
        </text>
      </g>

      {/* ── TIER 3: BILLING & FINANCIAL HEALTH ── */}

      {/* NODE 7: Invoices (x=56, y=242) */}
      <g transform="translate(56, 242)">
        <rect x="3" y="3" width="48" height="46" rx="8" fill="#CCFBF1" />
        <rect
          x="0"
          y="0"
          width="48"
          height="46"
          rx="8"
          fill="#FFFFFF"
          stroke="#0F172A"
          strokeWidth="1.8"
          filter="url(#uni-shadow)"
        />
        <path d="M 0 11 L 24 28 L 48 11" stroke="#0F172A" strokeWidth="1.6" fill="none" />
        <circle cx="24" cy="24" r="9" fill="#10B981" stroke="#0F172A" strokeWidth="1.5" />
        <text x="24" y="28" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="900" fontFamily="sans-serif">
          ₹
        </text>
        <text x="24" y="62" textAnchor="middle" fill="#334155" fontSize="11" fontWeight="800" fontFamily="sans-serif">
          Invoices
        </text>
      </g>

      {/* NODE 8: Expenses (x=246, y=242) */}
      <g transform="translate(246, 242)">
        <rect x="3" y="3" width="48" height="46" rx="8" fill="#CCFBF1" />
        <path
          d="M 0 6 C 0 3 3 0 6 0 L 42 0 C 45 0 48 3 48 6 L 48 40 L 42 36 L 36 40 L 30 36 L 24 40 L 18 36 L 12 40 L 6 36 L 0 40 Z"
          fill="#FFFFFF"
          stroke="#0F172A"
          strokeWidth="1.8"
          filter="url(#uni-shadow)"
        />
        <circle cx="24" cy="17" r="7.5" fill="#ECFDF5" stroke="#10B981" strokeWidth="1.5" />
        <text x="24" y="21" textAnchor="middle" fill="#059669" fontSize="9" fontWeight="900" fontFamily="sans-serif">
          ₹
        </text>
        <line x1="10" y1="28" x2="38" y2="28" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
        <text x="24" y="62" textAnchor="middle" fill="#334155" fontSize="11" fontWeight="800" fontFamily="sans-serif">
          Expenses
        </text>
      </g>

      {/* NODE 9: Accounting / Live P&L (x=436, y=242) */}
      <g transform="translate(436, 242)">
        <rect x="3" y="3" width="48" height="46" rx="8" fill="#CCFBF1" />
        <rect
          x="0"
          y="0"
          width="48"
          height="46"
          rx="8"
          fill="#FFFFFF"
          stroke="#0F172A"
          strokeWidth="1.8"
          filter="url(#uni-shadow)"
        />
        <rect x="16" y="0" width="16" height="5" rx="2" fill="#0F172A" />
        <circle cx="12" cy="17" r="4" fill="#10B981" />
        <path d="M 10 17 L 11.5 18.5 L 14 15.5" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="20" y1="17" x2="38" y2="17" stroke="#0F172A" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="12" cy="27" r="4" fill="#10B981" />
        <path d="M 10 27 L 11.5 28.5 L 14 25.5" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="20" y1="27" x2="34" y2="27" stroke="#0F172A" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M 26 37 L 34 32 L 38 35 L 43 28" fill="none" stroke="#10B981" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <text x="24" y="62" textAnchor="middle" fill="#334155" fontSize="11" fontWeight="800" fontFamily="sans-serif">
          Accounting
        </text>
      </g>
    </svg>
  </div>
);

export const SoftwareComparison = () => {
  return (
    <section className="py-14 sm:py-20 px-4 sm:px-8 max-w-6xl mx-auto">
      <ScrollReveal delay={0}>
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <p className="text-xs sm:text-sm font-extrabold tracking-widest text-[#12B7D4] uppercase mb-2">
            The Agency Difference
          </p>
          <h2 className="font-extrabold text-2xl sm:text-4xl lg:text-[40px] text-slate-950 tracking-tight leading-[1.2]">
            Other Softwares vs <span className="marker-highlight">RiseWithMedia OS</span>
          </h2>
          <p className="mt-2.5 sm:mt-3 text-sm sm:text-base text-slate-600 font-medium leading-relaxed max-w-xl mx-auto">
            Why managing retainers in 6 disconnected apps costs you deals, time, and sanity.
          </p>
        </div>
      </ScrollReveal>

      {/* ── SIDE-BY-SIDE GRAPHIC INFOGRAPHIC (EXACT IMAGE 2 RECREATION) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch animate-fade-up">
        {/* ── COLUMN 1: THE FRAGMENTED STACK (CHAOTIC TANGLED WEB) ── */}
        <div className="flex flex-col justify-between">
          <div>
            {/* Header Topline */}
            <div className="flex items-center justify-between gap-2 h-5 mb-3">
              <span className="text-[11px] font-black uppercase tracking-wider text-rose-600">
                The Fragmented Stack
              </span>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                What They Have
              </span>
            </div>

            {/* Title & Disconnected Tool Stack */}
            <div className="min-h-[58px] flex flex-col justify-start">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                5 to 8 Disconnected Apps
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1 leading-normal">
                Trello • WhatsApp • HubSpot • QuickBooks • Spreadsheets
              </p>
            </div>

            {/* Metrics Tag */}
            <div className="mt-3.5 px-4 py-2.5 min-h-[42px] rounded-xl bg-rose-50/90 flex items-center justify-between text-xs font-bold text-rose-600">
              <span className="flex items-center gap-1.5 text-rose-600">
                <AlertTriangle size={13} className="text-rose-500 shrink-0" />
                <span>Cost Penalty:</span>
              </span>
              <span className="font-extrabold text-rose-700">₹25,000 – ₹45,000/mo • 12 hrs lost/wk</span>
            </div>

            {/* THE TANGLED GRAPHIC ILLUSTRATION (NO TEXT PARAGRAPHS) */}
            <div className="my-4">
              <FragmentedStackIllustration />
            </div>
          </div>

          {/* Bottom Summary */}
          <div className="pt-3 mt-2 min-h-[42px] flex items-center justify-center text-center text-xs font-bold text-slate-400">
            Result: Lost client deals, data leaks & endless tool switching
          </div>
        </div>

        {/* ── COLUMN 2: RISEWITHMEDIA OS (CLEAN SERPENTINE PIPELINE) ── */}
        <div className="flex flex-col justify-between relative">
          <div className="relative z-10">
            {/* Header Topline */}
            <div className="flex items-center justify-between gap-2 h-5 mb-3">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#12B7D4]">
                All-in-One Operating System
              </span>
              <span className="text-[11px] font-bold text-[#12B7D4] uppercase tracking-wider">
                What We Do
              </span>
            </div>

            {/* Title & Core Modules */}
            <div className="min-h-[58px] flex flex-col justify-start">
              <h3 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight leading-tight">
                RiseWithMedia OS
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1 leading-normal">
                Proposals • Contracts • Vault • Projects • Tasks • SMM • Invoices • P&L
              </p>
            </div>

            {/* Value Pill */}
            <div className="mt-3.5 px-4 py-2.5 min-h-[42px] rounded-xl bg-[#12B7D4]/10 flex items-center justify-between text-xs font-bold text-slate-900">
              <span className="flex items-center gap-1.5 text-[#0d99b2]">
                <Zap size={13} className="fill-[#12B7D4] shrink-0" />
                <span>14-Day Free Trial:</span>
              </span>
              <span className="font-extrabold text-slate-950">Zero Credit Card • Complete Access</span>
            </div>

            {/* THE SERPENTINE PIPELINE ILLUSTRATION (NO TEXT PARAGRAPHS) */}
            <div className="my-4">
              <UnifiedFlowIllustration />
            </div>
          </div>

          {/* Bottom Footer with CTA */}
          <div className="pt-3 mt-2 min-h-[42px] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 relative z-10">
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <span>✓ Save 12+ hours every week</span>
            </span>
            <Link
              to="/register-company"
              className="px-5 py-2.5 rounded-full bg-[#12B7D4] hover:bg-[#0ea5c6] text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-none shrink-0"
            >
              <span>Get Started Free</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SoftwareComparison;

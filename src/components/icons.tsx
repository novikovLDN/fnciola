/**
 * Кастомный набор линейных иконок Holdy (без дефолтных эмодзи).
 * Единый стиль: viewBox 24, stroke currentColor, скруглённые концы.
 */
import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 24, children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      {children}
    </svg>
  );
}

// --- UI ---------------------------------------------------------------------
export const IconPlus = (p: IconProps) => <Svg {...p}><path d="M12 5v14M5 12h14" /></Svg>;
export const IconMinus = (p: IconProps) => <Svg {...p}><path d="M5 12h14" /></Svg>;
export const IconHome = (p: IconProps) => <Svg {...p}><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /><path d="M9.5 21v-6h5v6" /></Svg>;
export const IconList = (p: IconProps) => <Svg {...p}><path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01" /></Svg>;
export const IconChart = (p: IconProps) => <Svg {...p}><path d="M4 19V5M4 19h16M8 16l4-5 3 3 4-6" /></Svg>;
export const IconPie = (p: IconProps) => <Svg {...p}><path d="M12 3a9 9 0 1 0 9 9h-9V3Z" /><path d="M14 3.5A9 9 0 0 1 20.5 10H14V3.5Z" /></Svg>;
export const IconWallet = (p: IconProps) => <Svg {...p}><path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H18a1 1 0 0 1 1 1v1" /><path d="M3 7.5V18a2 2 0 0 0 2 2h14a1 1 0 0 0 1-1v-3" /><path d="M21 10v4h-4a2 2 0 0 1 0-4h4Z" /></Svg>;
export const IconCard = (p: IconProps) => <Svg {...p}><rect x="2.5" y="5" width="19" height="14" rx="3" /><path d="M2.5 10h19" /></Svg>;
export const IconGear = (p: IconProps) => <Svg {...p}><circle cx="12" cy="12" r="3" /><path d="M12 2.5v2.5M12 19v2.5M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2.5 12H5M19 12h2.5M4.2 19.8 6 18M18 6l1.8-1.8" /></Svg>;
export const IconImport = (p: IconProps) => <Svg {...p}><path d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14" /></Svg>;
export const IconLogout = (p: IconProps) => <Svg {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></Svg>;
export const IconArrowUp = (p: IconProps) => <Svg {...p}><path d="M12 19V5M6 11l6-6 6 6" /></Svg>;
export const IconArrowDown = (p: IconProps) => <Svg {...p}><path d="M12 5v14M6 13l6 6 6-6" /></Svg>;
export const IconTrash = (p: IconProps) => <Svg {...p}><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" /></Svg>;
export const IconSearch = (p: IconProps) => <Svg {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" /></Svg>;
export const IconSpark = (p: IconProps) => <Svg {...p}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" /></Svg>;
export const IconGlobe = (p: IconProps) => <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18" /></Svg>;
export const IconShield = (p: IconProps) => <Svg {...p}><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3Z" /><path d="m9 12 2 2 4-4" /></Svg>;
export const IconKey = (p: IconProps) => <Svg {...p}><circle cx="8" cy="15" r="4" /><path d="m11 12 9-9M17 6l2 2M14 9l2 2" /></Svg>;

// --- Категории --------------------------------------------------------------
export const IconSalary = (p: IconProps) => <Svg {...p}><rect x="3" y="6" width="18" height="12" rx="2" /><circle cx="12" cy="12" r="2.5" /><path d="M6 9.5v5M18 9.5v5" /></Svg>;
export const IconFreelance = (p: IconProps) => <Svg {...p}><path d="M4 7h16v12H4z" /><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M4 12h16" /></Svg>;
export const IconGroceries = (p: IconProps) => <Svg {...p}><path d="M4 7h16l-1.5 11.5a1 1 0 0 1-1 .9H6.5a1 1 0 0 1-1-.9L4 7Z" /><path d="M8 7a4 4 0 0 1 8 0" /></Svg>;
export const IconCafe = (p: IconProps) => <Svg {...p}><path d="M4 8h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8Z" /><path d="M17 9h2.5a2.5 2.5 0 0 1 0 5H17M8 3.5v1.5M11.5 3.5v1.5" /></Svg>;
export const IconTransport = (p: IconProps) => <Svg {...p}><path d="M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11" /><path d="M5 11h14v5a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1H8v1a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-5Z" /><path d="M7.5 14h.01M16.5 14h.01" /></Svg>;
export const IconHealth = (p: IconProps) => <Svg {...p}><path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10Z" /><path d="M12 8.5v5M9.5 11h5" /></Svg>;
export const IconSubs = (p: IconProps) => <Svg {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m10 9.5 5 2.5-5 2.5v-5Z" /></Svg>;
export const IconFuel = (p: IconProps) => <Svg {...p}><path d="M5 21V5a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v16M4 21h11" /><path d="M14 8h2.5L18 9.5V17a1.5 1.5 0 0 1-3 0v-3" /></Svg>;
export const IconShopping = (p: IconProps) => <Svg {...p}><path d="M6 8h12l-1 12H7L6 8Z" /><path d="M9 8a3 3 0 0 1 6 0" /></Svg>;
export const IconUtilities = (p: IconProps) => <Svg {...p}><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" /></Svg>;
export const IconGift = (p: IconProps) => <Svg {...p}><path d="M4 11h16v9H4z" /><path d="M3 7h18v4H3zM12 7v13" /><path d="M12 7S10.5 3 8.5 4.2 9.5 7 12 7Zm0 0s1.5-4 3.5-2.8S14.5 7 12 7Z" /></Svg>;
export const IconOther = (p: IconProps) => <Svg {...p}><circle cx="5" cy="12" r="1.4" /><circle cx="12" cy="12" r="1.4" /><circle cx="19" cy="12" r="1.4" /></Svg>;

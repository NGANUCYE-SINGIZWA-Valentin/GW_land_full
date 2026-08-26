import React from 'react';

const NAVY = '#0A1F44';
const iconProps = { width: 40, height: 40, viewBox: '0 0 64 64', fill: 'none', 'aria-hidden': true } as const;

const MountainMark: React.FC = () => (
  <svg {...iconProps}>
    <circle cx="32" cy="32" r="29" stroke={NAVY} strokeWidth="2.5" />
    <path d="M13 43 L26 22 L34 33 L41 23 L51 43 Z" fill={NAVY} />
  </svg>
);

const HexagonMark: React.FC = () => (
  <svg {...iconProps}>
    <polygon points="26,18 38,25 38,39 26,46 14,39 14,25" stroke={NAVY} strokeWidth="2.5" />
    <polygon points="38,18 50,25 50,39 38,46 26,39 26,25" stroke={NAVY} strokeWidth="2.5" />
  </svg>
);

const SignalMark: React.FC = () => (
  <svg {...iconProps}>
    <circle cx="32" cy="44" r="3" fill={NAVY} />
    <path d="M22 34 a14 14 0 0 1 20 0" stroke={NAVY} strokeWidth="3" strokeLinecap="round" />
    <path d="M15 27 a26 26 0 0 1 34 0" stroke={NAVY} strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const ShieldMark: React.FC = () => (
  <svg {...iconProps}>
    <path
      d="M32 10 L50 18 V32 C50 44 42 52 32 56 C22 52 14 44 14 32 V18 Z"
      stroke={NAVY}
      strokeWidth="2.5"
    />
    <path d="M24 32 L29 38 L41 24" stroke={NAVY} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PARTNERS: { name: string; Mark: React.FC }[] = [
  { name: 'ALPINE', Mark: MountainMark },
  { name: 'NEXUS', Mark: HexagonMark },
  { name: 'ORBIT', Mark: SignalMark },
  { name: 'VANTAGE', Mark: ShieldMark },
];

const LogoItem: React.FC<{ name: string; Mark: React.FC }> = ({ name, Mark }) => (
  <div className="flex shrink-0 flex-col items-center gap-2.5 px-10 md:px-16">
    <Mark />
    <span className="text-xs font-bold tracking-[0.15em] text-[#0A1F44]">{name}</span>
  </div>
);

export const PartnerLogo: React.FC = () => (
  <div className="overflow-hidden">
    <div className="flex w-max animate-[partner-logo-marquee_22s_linear_infinite] hover:[animation-play-state:paused]">
      {[...PARTNERS, ...PARTNERS].map(({ name, Mark }, i) => (
        <LogoItem key={`${name}-${i}`} name={name} Mark={Mark} />
      ))}
    </div>
  </div>
);

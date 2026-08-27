import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, MapPin, Phone, type LucideIcon } from 'lucide-react';
import GWLandLogo from '@/components/ui/GWLandLogo';
import GWLogo from '@/assets/getway logo.png';
import callImage from '@/assets/call_transparent.png';
import { navLinks } from '@/config/navigationLinks';
import { useLocations } from '@/hooks/useLocations';

const FOOTER_FONT = "'Poppins', sans-serif";

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#54B5BB] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111111] rounded-sm';

const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

interface FooterLinkProps {
  to: string;
  onClick?: () => void;
  children: React.ReactNode;
}

const FooterLink: React.FC<FooterLinkProps> = ({ to, onClick, children }) => (
  <li>
    <Link
      to={to}
      onClick={onClick}
      className={`inline-block text-sm text-[#b1b1b1] transition-colors duration-300 hover:text-[#54B5BB] ${focusRing}`}
    >
      {children}
    </Link>
  </li>
);

interface ContactItemProps {
  icon: LucideIcon;
  label: string;
  children: React.ReactNode;
}

const ContactItem: React.FC<ContactItemProps> = ({ icon: Icon, label, children }) => (
  <li className="flex items-start gap-3">
    <div
      aria-hidden="true"
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#54B5BB]/15 text-[#54B5BB]"
    >
      <Icon size={18} />
    </div>
    <div className="mt-2 text-sm text-[#b1b1b1]">
      <span className="sr-only">{label}: </span>
      {children}
    </div>
  </li>
);

type SocialIcon = React.FC<React.SVGProps<SVGSVGElement>>;

const InstagramIcon: SocialIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" stroke="none" />
  </svg>
);

const LinkedInIcon: SocialIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M5.1 8.2H2.2V21h2.9V8.2ZM3.65 3A1.7 1.7 0 1 0 3.65 6.4 1.7 1.7 0 0 0 3.65 3ZM8.3 8.2H11v1.75h.04c.38-.72 1.32-2.1 3.66-2.1 3.91 0 4.63 2.57 4.63 5.9V21h-2.9v-6.42c0-1.53-.03-3.5-2.13-3.5-2.13 0-2.46 1.66-2.46 3.38V21H8.3V8.2Z" />
  </svg>
);

const XIcon: SocialIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M18.9 2H22l-6.77 7.74L23.2 22h-6.24l-4.89-6.39L6.48 22H3.37l7.24-8.28L3 2h6.4l4.42 5.84L18.9 2Zm-1.1 17.8h1.73L8.47 4.1H6.62L17.8 19.8Z" />
  </svg>
);

const socialLinks: { label: string; href: string; Icon: SocialIcon }[] = [
  { label: 'Instagram', href: '#', Icon: InstagramIcon },
  { label: 'LinkedIn', href: '#', Icon: LinkedInIcon },
  { label: 'X (Twitter)', href: '#', Icon: XIcon },
];

export const Footer: React.FC = () => {
  const { t } = useTranslation();
  const { districts } = useLocations();
  const popularDistricts = (districts || []).slice(0, 5);

  return (
    <div className="relative bg-[#111111]" style={{ fontFamily: FOOTER_FONT }}>
      {/* Floating CTA banner */}
      <div className="relative z-10 mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 overflow-visible">
        <div className="-mt-[72px] relative rounded-2xl md:rounded-3xl border border-white/10 bg-[linear-gradient(110deg,#0a1f44_0%,#1B395F_60%,#1d4e68_100%)] text-white overflow-visible">
          {/* Seamless Overlapping Image Container - Centered between left text and right button */}
          <div className="absolute left-[58%] -translate-x-1/2 bottom-0 top-[-36px] md:top-[-48px] h-[calc(100%+36px)] md:h-[calc(100%+48px)] w-36 sm:w-44 md:w-48 lg:w-52 z-10 pointer-events-none hidden md:flex items-end justify-center overflow-visible">
            <img
              src={callImage}
              alt="Real Estate Expert"
              className="w-full h-full object-contain object-bottom filter drop-shadow-[0_-8px_20px_rgba(0,0,0,0.45)] shrink-0"
            />
          </div>

          {/* Inner Card Content Container */}
          <div className="relative z-20 rounded-2xl md:rounded-3xl p-6 sm:p-8 md:px-10 md:py-8 flex flex-col md:flex-row items-center justify-between gap-6 min-h-[160px] md:min-h-[180px]">
            {/* Left Column: Heading & Subtitle */}
            <div className="max-w-md md:max-w-lg text-center md:text-left z-20">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-snug">
                {t('footer.ctaTitle')}
              </h3>
              <p className="mt-2 text-sm text-white/90 font-normal leading-relaxed">
                {t('footer.ctaSubtitle')}
              </p>
            </div>

            {/* Right Column: CTA Button */}
            <div className="shrink-0 z-20">
              <Link
                to="/login"
                className={`inline-flex shrink-0 items-center justify-center rounded-xl bg-brand-primary hover:bg-brand-primary-hover px-8 py-3.5 text-sm font-bold text-white transition duration-300 hover:scale-105 active:scale-95 ${focusRing}`}
              >
                {t('nav.getStarted')}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <footer aria-label="Site footer" className="text-[#b1b1b1]">
        {/* Main grid */}
        <div className="mx-auto max-w-[1200px] px-6 pb-12 pt-20 lg:px-8">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
            {/* Column 1: About */}
            <div className="flex flex-col">
              <Link
                to="/"
                onClick={scrollToTop}
                aria-label="GW Homes home"
                className={`mb-6 flex items-center gap-2 sm:gap-2.5 w-fit h-10 sm:h-11 overflow-visible group ${focusRing}`}
              >
                <GWLandLogo variant="white" className="h-full w-auto max-w-[135px] max-h-11 object-contain object-center transition-transform duration-300 group-hover:scale-105" />
                <span className="text-lg sm:text-xl md:text-2xl font-black tracking-tight text-white flex items-center whitespace-nowrap">
                  GW<span className="text-brand-secondary ml-1">Homes</span>
                </span>
              </Link>
              <p className="max-w-[280px] text-sm leading-relaxed text-[#b1b1b1]">
                {t('footer.tagline')}
              </p>
              <ul className="mt-6 flex items-center gap-3">
                {socialLinks.map(({ label, href, Icon }) => (
                  <li key={label}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className={`flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white transition-colors duration-300 hover:bg-white/20 hover:text-white ${focusRing}`}
                    >
                      <Icon width={14} height={14} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 2: Quick Links */}
            <nav aria-label="Quick links">
              <h4 className="mb-6 text-lg font-semibold text-white">{t('nav.quickLinks')}</h4>
              <ul className="space-y-3.5">
                {navLinks
                  .filter((link) => !link.children)
                  .map((link) => {
                    const to = link.route || `/?section=${link.sectionId}`;
                    return (
                      <FooterLink key={link.labelKey} to={to} onClick={() => link.route && scrollToTop()}>
                        {t(link.labelKey)}
                      </FooterLink>
                    );
                  })}
              </ul>
            </nav>

            {/* Column 3: Popular Districts */}
            <nav aria-label="Popular districts">
              <h4 className="mb-6 text-lg font-semibold text-white">{t('nav.popularDistricts')}</h4>
              <ul className="space-y-3.5">
                {popularDistricts.map((district) => (
                  <FooterLink key={district.id} to={`/properties?district_id=${district.id}`} onClick={scrollToTop}>
                    {district.name}
                  </FooterLink>
                ))}
              </ul>
            </nav>

            {/* Column 4: Contact */}
            <div>
              <h4 className="mb-6 text-lg font-semibold text-white">{t('nav.contactUs')}</h4>
              <ul className="space-y-4">
                <ContactItem icon={MapPin} label="Address">
                  Norrsken House, Kigali, Rwanda
                </ContactItem>
                <ContactItem icon={Phone} label="Phone">
                  <a href="tel:+250782576686" className={focusRing}>
                    +250 782 576 686
                  </a>
                </ContactItem>
                <ContactItem icon={Mail} label="Email">
                  <a href="mailto:getwayconnection@gmail.com" className={`break-all ${focusRing}`}>
                    getwayconnection@gmail.com
                  </a>
                </ContactItem>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="bg-[#0a0a0a]">
          <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-4 px-6 py-6 text-xs text-[#8a8a8a] md:flex-row md:justify-between lg:px-8">
            <p className="order-1">
              {t('footer.rights', { year: 2026 })}
            </p>

            <a
              href="https://getwayconnection.com/"
              target="_blank"
              rel="noopener noreferrer"
              className={`order-2 flex items-center gap-2.5 transition-opacity hover:opacity-90 ${focusRing}`}
            >
              <span className="text-xs text-[#8a8a8a]">{t('footer.developedBy')}</span>
              <img src={GWLogo} alt="Gateway Connection" className="h-10 sm:h-12 w-auto object-contain brightness-110" />
            </a>

            <div className="order-3 flex items-center gap-6 font-medium">
              <Link
                to="/terms-conditions"
                onClick={scrollToTop}
                className={`transition-colors duration-300 hover:text-[#f38118] ${focusRing}`}
              >
                {t('nav.terms')}
              </Link>
              <Link
                to="/privacy-policy"
                onClick={scrollToTop}
                className={`transition-colors duration-300 hover:text-[#f38118] ${focusRing}`}
              >
                {t('nav.privacy')}
              </Link>
            </div>

          </div>
        </div>
      </footer>
    </div>
  );
};

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, ChevronDown, Sun, Moon, Globe, LayoutDashboard } from 'lucide-react';
import GWLandLogo from '@/components/ui/GWLandLogo';
import { NavLink, navLinks, TRANSPARENT_HERO_ROUTES } from '@/config/navigationLinks';
import { useAuth, ROLE_REDIRECTS } from '@/components/auth/AuthContext';

interface HeaderProps {
  onMenuOpen: () => void;
}

// Header becomes solid once the user scrolls past this many pixels.
const SCROLL_THRESHOLD = 60;

const trackedSectionIds = navLinks
  .filter((l): l is NavLink & { sectionId: string } => !!l.sectionId)
  .map((l) => l.sectionId);

const LANGUAGES = [
  { code: 'en', name: 'English', label: 'EN' },
  { code: 'rw', name: 'Kinyarwanda', label: 'RW' },
  { code: 'fr', name: 'French', label: 'FR' },
];

export const Header: React.FC<HeaderProps> = ({ onMenuOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [pagesOpen, setPagesOpen] = useState(false);
  const pagesRef = useRef<HTMLDivElement>(null);

  const [langOpen, setLangOpen] = useState(false);
  const currentLang = i18n.language;
  const langRef = useRef<HTMLDivElement>(null);

  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') ||
        localStorage.getItem('theme') === 'dark';
    }
    return false;
  });

  useEffect(() => {
    const currentTheme = localStorage.getItem('theme');
    const targetTheme = darkMode ? 'dark' : 'light';
    
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    if (currentTheme !== targetTheme) {
      localStorage.setItem('theme', targetTheme);
      window.dispatchEvent(new Event('storage'));
    }
  }, [darkMode]);

  // Synchronize dark mode on local storage updates (e.g. toggled from the mobile drawer)
  useEffect(() => {
    const handleStorageUpdate = () => {
      const isDark = document.documentElement.classList.contains('dark') ||
        localStorage.getItem('theme') === 'dark';
      setDarkMode(isDark);
    };
    window.addEventListener('storage', handleStorageUpdate);
    return () => window.removeEventListener('storage', handleStorageUpdate);
  }, []);

  const isHeroRoute = TRANSPARENT_HERO_ROUTES.includes(location.pathname);
  const isTransparent = isHeroRoute && !scrolled;

  // Handle scroll-to-section after navigation
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const section = params.get('section');
    if (section && location.pathname === '/') {
      setTimeout(() => {
        document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [location]);

  // Track scroll position to switch the navbar from transparent to solid
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY + 120; // offset pour le header sticky

      let current: string | null = null;
      for (const id of trackedSectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          const bottom = top + el.offsetHeight;
          if (scrollY >= top && scrollY < bottom) {
            current = id;
            break;
          }
        }
      }
      setActiveSection(current);
    };

    handleScroll(); // vérifier au montage
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  // Close the dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pagesRef.current && !pagesRef.current.contains(e.target as Node)) {
        setPagesOpen(false);
      }
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLangChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setLangOpen(false);
  };

  const handleNavClick = useCallback(
    (link: NavLink) => {
      if (link.route) {
        if (link.route === '/' && location.pathname === '/') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          navigate(link.route);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } else if (link.sectionId) {
        if (location.pathname === '/') {
          document.getElementById(link.sectionId)?.scrollIntoView({ behavior: 'smooth' });
        } else {
          navigate(`/?section=${link.sectionId}`);
        }
      }
    },
    [navigate, location.pathname]
  );

  const isActive = (link: NavLink): boolean => {
    if (link.sectionId) {
      if (location.pathname !== '/') return false;
      return activeSection === link.sectionId;
    }
    if (link.route) {
      return location.pathname === link.route;
    }
    return false;
  };

  return (
    <header
      className={`sticky top-0 left-0 right-0 z-[100] w-full min-h-[60px] md:min-h-[70px] px-3 sm:px-6 lg:px-8 xl:px-12 transition-all duration-300 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md py-2 sm:py-2.5 border-b border-slate-200/80 dark:border-slate-800/80`}
    >
      <div className="flex justify-between items-center w-full min-h-[44px] md:min-h-[50px]">
        {/* Logo & Brand Name Container */}
        <div
          onClick={() => {
            navigate('/');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center justify-start flex-shrink-0 gap-2 sm:gap-2.5 cursor-pointer group select-none h-10 sm:h-11 md:h-12 overflow-visible"
        >
          <GWLandLogo
            variant="color"
            className="h-full w-auto max-w-[120px] sm:max-w-[150px] md:max-w-[180px] max-h-12 object-contain object-center transition-transform duration-300 group-hover:scale-105"
          />
          <span className="text-base sm:text-xl md:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center whitespace-nowrap">
            GW<span className="text-brand-primary dark:text-brand-secondary ml-1">Homes</span>
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden xl:flex items-center gap-8 text-sm font-medium transition-colors duration-300 text-slate-700 dark:text-slate-200">
          {navLinks.map((link) => {
            if (link.children) {
              return (
                <div key={link.labelKey} ref={pagesRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setPagesOpen((p) => !p)}
                    className="flex items-center gap-1 py-1 cursor-pointer font-semibold transition-colors text-slate-700 dark:text-slate-200 hover:text-brand-primary dark:hover:text-brand-secondary"
                  >
                    {t(link.labelKey)}
                    <ChevronDown size={14} className={`transition-transform duration-200 ${pagesOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <div
                    className={`absolute left-0 top-full mt-3 w-52 bg-white dark:bg-slate-800 rounded-2xl shadow-[0_20px_50px_-12px_rgba(148,163,184,0.32)] border border-gray-100 dark:border-slate-700 p-2 origin-top transition-all duration-200 ${
                      pagesOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
                    }`}
                  >
                    {link.children.map((child) => (
                      <button
                        key={child.labelKey}
                        type="button"
                        onClick={() => {
                          setPagesOpen(false);
                          if (child.route) {
                            navigate(child.route);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }
                        }}
                        className="w-full text-left px-3 py-2.5 text-sm font-medium text-gray-600 dark:text-slate-300 hover:text-brand-primary dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded-xl transition-colors cursor-pointer"
                      >
                        {t(child.labelKey)}
                      </button>
                    ))}
                  </div>
                </div>
              );
            }

            const active = isActive(link);
            return (
              <button
                key={link.labelKey}
                onClick={() => handleNavClick(link)}
                className={`relative py-1 cursor-pointer transition-colors antialiased font-semibold ${
                  active
                    ? 'text-brand-primary dark:text-brand-secondary after:scale-x-100'
                    : 'text-slate-700 dark:text-slate-200 hover:text-brand-primary dark:hover:text-brand-secondary after:scale-x-0 hover:after:scale-x-100'
                } after:content-[""] after:absolute after:top-[calc(100%+4px)] after:left-0 after:w-full after:h-[2px] after:transition-transform after:duration-200 after:origin-center after:bg-brand-primary dark:after:bg-brand-secondary`}
              >
                {t(link.labelKey)}
              </button>
            );
          })}
        </nav>

        {/* Desktop right side: Lang selector, Dark mode toggle & Get Started CTA */}
        <div className="hidden xl:flex items-center gap-6">
          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <div className="relative" ref={langRef}>
              <button
                type="button"
                onClick={() => setLangOpen((prev) => !prev)}
                className="flex items-center gap-1.5 py-2 px-3.5 rounded-full border text-xs font-bold cursor-pointer transition-all duration-300 text-gray-700 dark:text-slate-200 border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800"
              >
                <Globe size={15} />
                <span>{LANGUAGES.find((l) => l.code === currentLang)?.label}</span>
                <ChevronDown size={12} className={`transition-transform duration-200 ${langOpen ? 'rotate-180' : ''}`} />
              </button>

              <div
                className={`absolute right-0 top-full mt-2 w-44 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 p-2 origin-top-right transition-all duration-200 ${
                  langOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
                }`}
              >
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => handleLangChange(lang.code)}
                    className="w-full text-left px-3.5 py-2 text-xs font-semibold text-gray-600 dark:text-slate-300 hover:text-brand-primary dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded-xl transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <span>{lang.name}</span>
                    {currentLang === lang.code && <span className="w-1.5 h-1.5 bg-brand-secondary rounded-full" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Dark Mode Toggle */}
            <button
              type="button"
              onClick={() => setDarkMode((prev) => !prev)}
              className="p-2 rounded-full border cursor-pointer transition-all duration-300 text-gray-700 dark:text-slate-200 border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>

          {user ? (
            <button
              type="button"
              onClick={() => navigate(ROLE_REDIRECTS[user.role])}
              className="px-7 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 cursor-pointer border shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-300 bg-brand-primary border-brand-primary text-white hover:bg-brand-primary-hover"
            >
              <LayoutDashboard size={16} />
              Dashboard
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="px-7 py-2.5 rounded-full font-bold text-sm cursor-pointer border shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-300 bg-brand-primary border-brand-primary text-white hover:bg-brand-primary-hover"
            >
              {t('nav.getStarted')}
            </button>
          )}
        </div>

        {/* Mobile/tablet hamburger */}
        <button
          onClick={onMenuOpen}
          className="xl:hidden p-2 rounded-lg transition-colors cursor-pointer text-gray-700 dark:text-slate-300 hover:text-brand-text dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
      </div>
    </header>
  );
};

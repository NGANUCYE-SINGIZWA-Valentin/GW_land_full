import React, { useCallback, useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Sun, Moon, Languages } from 'lucide-react';
import { Header } from '@/layouts/public/Header';
import { Footer } from '@/layouts/public/Footer';
import { MobileDrawer } from '@/layouts/public/MobileDrawer';
import { ChatWidget } from '@/components/chatbot';
import { NavLink, navLinks, TRANSPARENT_HERO_ROUTES } from '@/config/navigationLinks';
import { useAuth, ROLE_REDIRECTS } from '@/components/auth/AuthContext';

const LANGUAGES = [
  { code: 'en', name: 'English', label: 'EN' },
  { code: 'rw', name: 'Kinyarwanda', label: 'RW' },
  { code: 'fr', name: 'French', label: 'FR' },
];

/** IDs of sections that map to a nav link */
const trackedSectionIds = navLinks
  .filter((l): l is NavLink & { sectionId: string } => !!l.sectionId)
  .map((l) => l.sectionId);

/** All homepage sections we observe — tracked ones plus non-tracked (explore) */
const allSectionIds = [...trackedSectionIds, 'explore'];

export const PublicLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [pagesExpanded, setPagesExpanded] = useState(false);

  const currentLang = i18n.language;

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

  // Synchronize dark mode on local storage updates
  useEffect(() => {
    const handleStorageUpdate = () => {
      const isDark = document.documentElement.classList.contains('dark') ||
        localStorage.getItem('theme') === 'dark';
      setDarkMode(isDark);
    };
    window.addEventListener('storage', handleStorageUpdate);
    return () => window.removeEventListener('storage', handleStorageUpdate);
  }, []);

  const handleLangChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
  };

  // Handle scroll-to-section after navigation (e.g. from Properties page to Homepage section)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const section = params.get('section');
    if (section && location.pathname === '/') {
      // Small delay to ensure DOM is rendered
      setTimeout(() => {
        document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [location]);

  // Observe scroll position to highlight active section
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const intersectingTracked = entries.filter(
          (e) => e.isIntersecting && trackedSectionIds.includes(e.target.id)
        );

        if (intersectingTracked.length > 0) {
          const best = intersectingTracked.reduce((a, b) =>
            a.intersectionRatio > b.intersectionRatio ? a : b
          );
          setActiveSection(best.target.id);
        } else {
          setActiveSection(null);
        }
      },
      { rootMargin: '-50% 0px -50% 0px' }
    );

    allSectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [location.pathname]);

  const isActive = useCallback(
    (link: NavLink): boolean => {
      if (link.sectionId) {
        // Section links are active only on homepage when that section is in view
        if (location.pathname !== '/') return false;
        return activeSection === link.sectionId;
      }
      // Route-based links: check if current pathname matches
      if (link.route) {
        return location.pathname === link.route;
      }
      return false;
    },
    [activeSection, location.pathname]
  );

  const handleNavClick = useCallback(
    (link: NavLink) => {
      setMobileMenuOpen(false);
      
      if (link.route) {
        // Route-based navigation (Home, Properties)
        if (link.route === '/' && location.pathname === '/') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          navigate(link.route);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } else if (link.sectionId) {
        // Section-based navigation (Featured, How it Works)
        if (location.pathname === '/') {
          // Already on homepage, just scroll
          document.getElementById(link.sectionId)?.scrollIntoView({ behavior: 'smooth' });
        } else {
          // Navigate to homepage with section param to scroll after render
          navigate(`/?section=${link.sectionId}`);
        }
      }
    },
    [navigate, location.pathname]
  );

  return (
    <div className="min-h-screen flex flex-col bg-brand-surface dark:bg-slate-950 font-sans antialiased text-slate-800 dark:text-slate-100 transition-colors duration-300">
      <Header onMenuOpen={() => setMobileMenuOpen(true)} />

      <main className="flex-grow">
        <Outlet />
      </main>
      
      <Footer />

      {/* Website Assistant — available on public pages only */}
      <ChatWidget />



      {/* Mobile Drawer — placé en dehors du header pour être au-dessus de tout */}
      <MobileDrawer isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)}>
        <nav className="flex flex-col gap-2">
          {navLinks.map((link) => {
            if (link.children) {
              return (
                <div key={link.labelKey}>
                  <button
                    onClick={() => setPagesExpanded((p) => !p)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium text-gray-600 dark:text-slate-300 hover:text-brand-text dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                  >
                    {t(link.labelKey)}
                    <ChevronDown size={16} className={`transition-transform duration-200 ${pagesExpanded ? 'rotate-180' : ''}`} />
                  </button>
                  {pagesExpanded && (
                    <div className="pl-4 flex flex-col gap-1 mt-1">
                      {link.children.map((child) => (
                        <button
                          key={child.labelKey}
                          onClick={() => {
                            setMobileMenuOpen(false);
                            if (child.route) {
                              navigate(child.route);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }
                          }}
                          className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium text-gray-500 dark:text-slate-400 hover:text-brand-text dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                        >
                          {t(child.labelKey)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            const active = isActive(link);
            return (
              <button
                key={link.labelKey}
                onClick={() => handleNavClick(link)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                  active
                    ? 'text-brand-primary dark:text-brand-secondary bg-brand-primary/5 dark:bg-brand-secondary/5 font-semibold'
                    : 'text-gray-600 dark:text-slate-300 hover:text-brand-text dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800/50'
                }`}
              >
                {t(link.labelKey)}
              </button>
            );
          })}
        </nav>

        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-slate-800 space-y-5">
          {/* Preferences Section */}
          <div className="space-y-4">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 dark:text-slate-500">{t('common.preferences')}</p>

            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700 dark:text-slate-300">{t('common.darkMode')}</span>
              <button
                type="button"
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-full border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-center transition-colors"
                aria-label="Toggle dark mode"
              >
                {darkMode ? <Sun size={15} /> : <Moon size={15} />}
              </button>
            </div>

            {/* Language Selector */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-700 dark:text-slate-300 flex items-center gap-1.5">
                <Languages size={13} /> {t('common.language')}
              </span>
              <div className="grid grid-cols-3 gap-2">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => handleLangChange(lang.code)}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                      currentLang === lang.code
                        ? 'bg-brand-primary border-brand-primary text-white dark:bg-brand-secondary dark:border-brand-secondary dark:text-slate-900 font-extrabold'
                        : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {user ? (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                navigate(ROLE_REDIRECTS[user.role]);
              }}
              className="w-full py-3.5 rounded-full text-sm font-bold bg-brand-primary text-white hover:bg-brand-primary-hover hover:scale-[1.02] active:scale-95 transition-all duration-300 cursor-pointer shadow-sm flex items-center justify-center gap-2"
            >
              Dashboard
            </button>
          ) : (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('/login');
              }}
              className="w-full py-3.5 rounded-full text-sm font-bold bg-brand-primary text-white hover:bg-brand-primary-hover hover:scale-[1.02] active:scale-95 transition-all duration-300 cursor-pointer shadow-sm"
            >
              {t('nav.getStarted')}
            </button>
          )}
        </div>
      </MobileDrawer>
    </div>
  );
};
import React, { useState, useEffect, createContext, useContext } from 'react';
import { Outlet } from 'react-router-dom';
import Topbar from './Topbar';
import { Sidebar } from './Sidebar';
import { ImpersonationBanner } from './ImpersonationBanner';

interface DashboardLayoutContextType {
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  toggleSidebarCollapse: () => void;
}

const DashboardLayoutContext = createContext<DashboardLayoutContextType>({
  sidebarOpen: false,
  setSidebarOpen: () => {},
  sidebarCollapsed: false,
  setSidebarCollapsed: () => {},
  toggleSidebarCollapse: () => {},
});

export const useDashboardLayout = () => useContext(DashboardLayoutContext);

export const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Initialize sidebar collapsed state from localStorage or auto-collapse for smaller screens (md/lg)
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('gw_sidebar_collapsed');
      if (stored !== null) return JSON.parse(stored);
      // Auto-collapse on medium/smaller desktop screens to maximize table real-estate
      if (typeof window !== 'undefined' && window.innerWidth < 1280) {
        return true;
      }
      return false;
    } catch {
      return false;
    }
  });

  // Save preference
  const toggleSidebarCollapse = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('gw_sidebar_collapsed', JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  // Listen to screen resizes to auto-collapse on smaller viewport widths if no explicit preference
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        // Mobile/tablet: reset mobile drawer if open
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <DashboardLayoutContext.Provider
      value={{
        sidebarOpen,
        setSidebarOpen,
        sidebarCollapsed,
        setSidebarCollapsed,
        toggleSidebarCollapse,
      }}
    >
      <div className="flex h-screen w-full max-w-[100vw] bg-brand-bg text-slate-800 font-sans antialiased overflow-hidden">
        {/* Collapsible Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={toggleSidebarCollapse}
        />

        {/* Main Content Area */}
        <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
          <ImpersonationBanner />
          <Topbar
            onToggleMobileSidebar={() => setSidebarOpen((v) => !v)}
            onToggleCollapseSidebar={toggleSidebarCollapse}
            isSidebarCollapsed={sidebarCollapsed}
          />

          <main className="flex-1 overflow-y-auto overflow-x-hidden bg-brand-bg min-w-0 w-full">
            <div className="w-full min-w-0 max-w-7xl mx-auto px-3 sm:px-5 lg:px-8 py-5 lg:py-7">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </DashboardLayoutContext.Provider>
  );
};

export default DashboardLayout;

import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';

export const AuthLayout: React.FC = () => {
  // Synchroniser le theme sur le document element au montage pour les navigations directes
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark') ||
      localStorage.getItem('theme') === 'dark';
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#54B5BB]/15 via-slate-50 to-[#1B395F]/10 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 flex items-center justify-center p-4 sm:p-6 transition-colors duration-300">
      <Outlet />
    </div>
  );
};
import React from 'react';
import { Outlet } from 'react-router-dom';
import Topbar from './Topbar';
import { ImpersonationBanner } from './ImpersonationBanner';

export const DashboardLayout: React.FC = () => {
  return (
    <div className="flex flex-col h-screen w-full max-w-[100vw] bg-brand-bg text-slate-800 font-sans antialiased overflow-hidden">
      <ImpersonationBanner />
      <Topbar />
      <main className="flex-1 overflow-y-auto overflow-x-hidden bg-brand-bg min-w-0 w-full">
        <div className="w-full min-w-0 max-w-7xl mx-auto px-3 sm:px-5 lg:px-8 py-5 lg:py-7">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
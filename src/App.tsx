import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import { PublicLayout } from '@/layouts/public/PublicLayout';
import { DashboardLayout } from '@/layouts/dashboard/DashboardLayout';
import { AuthLayout } from '@/layouts/auth/AuthLayout';

// Pages
import { HomePage } from '@/pages/public/HomePage';
import { PropertiesPage } from '@/pages/public/PropertiesPage';
import { PropertyDetailsPage } from '@/pages/public/PropertyDetailsPage';
import { PrivacyPolicyPage } from '@/pages/public/PrivacyPolicyPage';
import { TermsConditionsPage } from '@/pages/public/TermsConditionsPage';
import { ContactPage } from '@/pages/public/ContactPage';
import { AboutPage } from '@/pages/public/AboutPage';
import { BlogPage } from '@/pages/public/BlogPage';
import { UnauthorizedPage } from '@/pages/public/UnauthorizedPage';
import { SellerPricing } from '@/pages/dashboard/SellerPricing';
import { BuyerDashboard } from '@/pages/dashboard/BuyerDashboard';
import { BuyerMessages } from '@/pages/dashboard/BuyerMessages';
import { BuyerFavorites } from '@/pages/dashboard/BuyerFavorites';
import { AddPropertyWizard } from '@/pages/dashboard/AddPropertyWizard';
import { SellerInquiries } from '@/pages/dashboard/SellerInquiries';
import { AdminDashboard } from '@/pages/dashboard/AdminDashboard';
import { SubAdminDashboard } from '@/pages/dashboard/SubAdminDashboard';
import { SellerDashboard } from '@/pages/dashboard/SellerDashboard';
import { SellerPropertyManagement } from '@/pages/dashboard/SellerPropertyManagement';
import { PropertyManagement } from '@/pages/dashboard/PropertyManagement';
import { UserManagement } from '@/pages/dashboard/UserManagement';
import { AdminAuditLog } from '@/pages/dashboard/AdminAuditLog';
import { ReportedContentManagement } from '@/pages/dashboard/ReportedContentManagement';
import { AdminRevenue } from '@/pages/dashboard/AdminRevenue';
import { TopAgentsPage } from '@/pages/dashboard/TopAgentsPage';
import { AdminMessages } from '@/pages/dashboard/AdminMessages';
import { AdminSettings } from '@/pages/dashboard/AdminSettings';
import { AccountSettings } from '@/pages/dashboard/AccountSettings';
import { SellerTopPerforming } from '@/pages/dashboard/SellerTopPerforming';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { OAuthCallbackPage } from '@/pages/auth/OAuthCallbackPage';
import { AuthProvider } from '@/components/auth';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { FavoritesProvider } from '@/components/favorites/FavoritesContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <FavoritesProvider>
          <BrowserRouter>
            <Routes>

        {/* PUBLIC PAGES */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/properties" element={<PropertiesPage />} />
          <Route path="/properties/:slug" element={<PropertyDetailsPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/terms-conditions" element={<TermsConditionsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
        </Route>

        {/* AUTH PAGES */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/oauth-callback" element={<OAuthCallbackPage />} />
        </Route>

        {/* DASHBOARD PAGES - ADMIN + SUB ADMIN */}
        <Route element={<ProtectedRoute allowedRoles={['Administrator', 'SubAdmin']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/sub-dashboard" element={<SubAdminDashboard />} />
            <Route path="/admin/properties" element={<PropertyManagement />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/revenue" element={<AdminRevenue />} />
            <Route path="/admin/reported-content" element={<ReportedContentManagement />} />
            <Route path="/admin/top-agents" element={<TopAgentsPage />} />
            <Route path="/admin/audit-logs" element={<AdminAuditLog />} />
            <Route path="/admin/messages" element={<AdminMessages />} />
          </Route>
        </Route>

        {/* DASHBOARD PAGES - ADMIN ONLY */}
        <Route element={<ProtectedRoute allowedRoles={['Administrator']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/admin/settings" element={<AdminSettings />} />
          </Route>
        </Route>

        {/* DASHBOARD PAGES - SELLER ONLY (only sellers list land) */}
        <Route element={<ProtectedRoute allowedRoles={['Seller']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard/properties/new" element={<AddPropertyWizard />} />
            <Route path="/seller/inquiries" element={<SellerInquiries />} />
            <Route path="/seller/pricing" element={<SellerPricing />} />
            <Route path="/seller/properties" element={<SellerPropertyManagement />} />
            <Route path="/seller/dashboard" element={<SellerDashboard />} />
            <Route path="/seller/top-performing" element={<SellerTopPerforming />} />
          </Route>
        </Route>

        {/* DASHBOARD PAGE - BUYER ONLY */}
        <Route element={<ProtectedRoute allowedRoles={['Buyer']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<BuyerDashboard />} />
            <Route path="/messages" element={<BuyerMessages />} />
            <Route path="/favorites" element={<BuyerFavorites />} />
          </Route>
        </Route>

        {/* Account settings — same page, every signed-in role */}
        <Route element={<ProtectedRoute allowedRoles={['Administrator', 'SubAdmin', 'Seller', 'Buyer']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/account" element={<AccountSettings />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>

    </BrowserRouter>
    </FavoritesProvider>
    </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
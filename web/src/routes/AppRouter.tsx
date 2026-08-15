import { Navigate, Route, Routes } from 'react-router-dom'
import { ClientLayout } from '@/layouts/ClientLayout'
import { BrokerLayout } from '@/layouts/BrokerLayout'
import { AdminLayout } from '@/layouts/AdminLayout'

import { LandingPage } from '@/pages/public/LandingPage'
import { LoginPage } from '@/pages/public/LoginPage'
import { RegisterPage } from '@/pages/public/RegisterPage'
import { ForgotPasswordPage } from '@/pages/public/ForgotPasswordPage'

// Client pages
import { ClientHomePage } from '@/pages/client/ClientHomePage'
import { ClientSearchPage } from '@/pages/client/ClientSearchPage'
import { ClientPropertyDetailPage } from '@/pages/client/ClientPropertyDetailPage'
import { ClientChatPage } from '@/pages/client/ClientChatPage'
import { ClientProfilePage } from '@/pages/client/ClientProfilePage'
import { ClientActivityPage } from '@/pages/client/ClientActivityPage'
import { ClientSavedPage } from '@/pages/client/ClientSavedPage'
import { ClientDealsPage } from '@/pages/client/ClientDealsPage'

// Broker pages
import { BrokerDashboardPage } from '@/pages/broker/BrokerDashboardPage'
import { BrokerPropertiesPage } from '@/pages/broker/BrokerPropertiesPage'
import { BrokerBookingsPage } from '@/pages/broker/BrokerBookingsPage'
import { BrokerCustomersPage } from '@/pages/broker/BrokerCustomersPage'
import { BrokerProfilePage } from '@/pages/broker/BrokerProfilePage'
import { BrokerNewPropertyPage } from '@/pages/broker/BrokerNewPropertyPage'
import { BrokerDealsPage } from '@/pages/broker/BrokerDealsPage'
import { AgentAnalytics } from '@/pages/agent/AgentAnalytics'

// Admin pages
import { AdminOverviewPage } from '@/pages/admin-portal/AdminOverviewPage'
import { AdminModerationPage } from '@/pages/admin-portal/AdminModerationPage'
import { AdminUsersPage } from '@/pages/admin-portal/AdminUsersPage'
import { AdminTransactionsPage } from '@/pages/admin-portal/AdminTransactionsPage'
import { AdminOperationsPage } from '@/pages/admin-portal/AdminOperationsPage'
import { AdminLogsPage } from '@/pages/admin-portal/AdminLogsPage'
import { AdminSettingsPage } from '@/pages/admin-portal/AdminSettingsPage'

import { PropertyDetailView } from '@/pages/shared/PropertyDetailView'
import { EditListingForm } from '@/pages/shared/EditListingForm'

export function AppRouter() {
  return (
    <Routes>
      {/* Public marketing */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* ── CLIENT LAYOUT ── */}
      <Route path="/client" element={<ClientLayout />}>
        <Route index element={<ClientHomePage />} />
        <Route path="tim-kiem" element={<ClientSearchPage />} />
        <Route path="hoat-dong" element={<ClientActivityPage />} />
        <Route path="da-luu" element={<ClientSavedPage />} />
        <Route path="giao-dich" element={<ClientDealsPage />} />
        <Route path="ca-nhan" element={<ClientProfilePage />} />
        <Route path="chat" element={<ClientChatPage />} />
        <Route path="property/:id" element={<ClientPropertyDetailPage />} />
        {/* Legacy redirects */}
        <Route path="buy" element={<Navigate to="/client/tim-kiem?loai=mua" replace />} />
        <Route path="rent" element={<Navigate to="/client/tim-kiem?loai=thue" replace />} />
        <Route path="search" element={<Navigate to="/client/tim-kiem" replace />} />
        <Route path="map" element={<Navigate to="/client/tim-kiem" replace />} />
        <Route path="bookings" element={<Navigate to="/client/hoat-dong?tab=lich-hen" replace />} />
        <Route path="profile" element={<Navigate to="/client/ca-nhan" replace />} />
        <Route path="chatbot" element={<Navigate to="/client/chat" replace />} />
      </Route>

      {/* ── BROKER LAYOUT ── */}
      <Route path="/broker" element={<BrokerLayout />}>
        <Route index element={<BrokerDashboardPage />} />
        <Route path="properties" element={<BrokerPropertiesPage />} />
        <Route path="properties/create" element={<BrokerNewPropertyPage />} />
        <Route path="properties/new" element={<Navigate to="/broker/properties/create" replace />} />
        <Route path="properties/:id/edit" element={<EditListingForm role="agent" />} />
        <Route path="bookings" element={<BrokerBookingsPage />} />
        <Route path="khach-hang" element={<BrokerCustomersPage />} />
        <Route path="giao-dich" element={<BrokerDealsPage />} />
        <Route path="phan-tich" element={<AgentAnalytics />} />
        <Route path="profile" element={<BrokerProfilePage />} />
        <Route path="property/:id" element={<PropertyDetailView role="agent" basePath="/broker" />} />
        {/* Legacy redirects */}
        <Route path="leads" element={<Navigate to="/broker/khach-hang?tab=lead" replace />} />
        <Route path="inbox" element={<Navigate to="/broker/khach-hang?tab=hop-thu" replace />} />
        <Route path="analytics" element={<Navigate to="/broker/phan-tich" replace />} />
      </Route>

      {/* ── ADMIN LAYOUT ── */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminOverviewPage />} />
        <Route path="moderation" element={<AdminModerationPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="transactions" element={<AdminTransactionsPage />} />
        <Route path="van-hanh" element={<AdminOperationsPage />} />
        <Route path="logs" element={<AdminLogsPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
        <Route path="property/:id" element={<PropertyDetailView role="admin" basePath="/admin" />} />
      </Route>

      <Route path="/chat" element={<Navigate to="/client/chat" replace />} />
      <Route path="/buyer/*" element={<Navigate to="/client" replace />} />
      <Route path="/agent/*" element={<Navigate to="/broker" replace />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

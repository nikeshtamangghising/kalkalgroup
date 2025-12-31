'use client'

import AdminProtectedRoute from '@/components/admin/admin-protected-route'
import AdminDashboardTabs from '@/components/admin/admin-dashboard-tabs'
import AdminErrorBoundary from '@/components/admin/admin-error-boundary'
import { AdminProvider } from '@/contexts/admin-context'

export default function AdminDashboard() {
  return (
    <AdminErrorBoundary>
      <AdminProtectedRoute>
        <AdminProvider>
          <AdminDashboardTabs />
        </AdminProvider>
      </AdminProtectedRoute>
    </AdminErrorBoundary>
  )
}

import { AdminShell } from '@/components/admin/admin-shell'
import { AdminDashboard } from '@/components/admin/dashboard'

export default function AdminPage() {
  return (
    <AdminShell>
      <AdminDashboard />
    </AdminShell>
  )
}

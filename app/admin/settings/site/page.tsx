import { AdminShell } from '@/components/admin/admin-shell'
import { SiteSettings } from '@/components/admin/settings/site-settings'

export default function AdminSitePage() {
  return (
    <AdminShell>
      <SiteSettings />
    </AdminShell>
  )
}

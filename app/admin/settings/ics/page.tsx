import { AdminShell } from '@/components/admin/admin-shell'
import { IcsSettings } from '@/components/admin/settings/ics-settings'

export default function AdminIcsPage() {
  return (
    <AdminShell>
      <IcsSettings />
    </AdminShell>
  )
}

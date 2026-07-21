import { AdminShell } from '@/components/admin/admin-shell'
import { FaqSettings } from '@/components/admin/settings/faq-settings'

export default function AdminFaqPage() {
  return (
    <AdminShell>
      <FaqSettings />
    </AdminShell>
  )
}

import { AdminShell } from '@/components/admin/admin-shell'
import { PricesSettings } from '@/components/admin/settings/prices-settings'

export default function AdminPricesPage() {
  return (
    <AdminShell>
      <PricesSettings />
    </AdminShell>
  )
}

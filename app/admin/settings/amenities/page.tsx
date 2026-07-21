import { AdminShell } from '@/components/admin/admin-shell'
import { AmenitiesSettings } from '@/components/admin/settings/amenities-settings'

export default function AdminAmenitiesPage() {
  return (
    <AdminShell>
      <AmenitiesSettings />
    </AdminShell>
  )
}

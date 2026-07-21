import { AdminShell } from '@/components/admin/admin-shell'
import { GallerySettings } from '@/components/admin/settings/gallery-settings'

export default function AdminGalleryPage() {
  return (
    <AdminShell>
      <GallerySettings />
    </AdminShell>
  )
}

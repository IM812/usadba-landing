import { AdminShell } from '@/components/admin/admin-shell'
import { ReviewsSettings } from '@/components/admin/settings/reviews-settings'

export default function AdminReviewsPage() {
  return (
    <AdminShell>
      <ReviewsSettings />
    </AdminShell>
  )
}

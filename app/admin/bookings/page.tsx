import { AdminShell } from '@/components/admin/admin-shell'
import { BookingsManager } from '@/components/admin/bookings-manager'

export default function AdminBookingsPage() {
  return (
    <AdminShell>
      <BookingsManager />
    </AdminShell>
  )
}

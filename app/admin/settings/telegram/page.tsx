import { AdminShell } from '@/components/admin/admin-shell'
import { TelegramSettings } from '@/components/admin/settings/telegram-settings'

export default function AdminTelegramPage() {
  return (
    <AdminShell>
      <TelegramSettings />
    </AdminShell>
  )
}

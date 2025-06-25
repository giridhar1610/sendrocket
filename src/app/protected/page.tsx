import { LogoutButton } from '@/components/logout-button'

export default async function ProtectedPage() {
  return (
    <div className="flex h-svh w-full items-center justify-center gap-2">
      <LogoutButton />
    </div>
  )
}

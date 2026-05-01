import { Navbar } from '@/components/navbar'
import { Toaster } from '@/components/ui/sonner'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Toaster position="bottom-right" richColors />
    </>
  )
}

// app/(with-navbar)/layout.tsx
import Navbar from '@/components/Navbar/Navbar'

export default function WithNavbarLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Navbar />
      {children}
    </>
  )
}

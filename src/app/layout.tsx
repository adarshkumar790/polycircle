import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

import { headers } from 'next/headers'
import ContextProvider from '@/context'
import Navbar from '@/components/Navbar/Navbar'
import { Providers } from './providers'
import Provider from './provider'
import Footer from '@/components/home/Footer'
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PolyCircle',
  description: 'PolyCircle is a decentralized, audited smart contract matrix on Polygon that auto-distributes rewards transparently.',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const headersObj = await headers(); 
  const cookies = headersObj.get('cookie') ?? '' 

  return (
    <html lang="en">
      <body className={inter.className}>
        
        <ContextProvider cookies={cookies}>
          <Providers>
            <Provider>
              <ToastContainer position="top-center" autoClose={2000} />
          {children}
          </Provider>
          <Footer/>
          </Providers>
          </ContextProvider>
      </body>
    </html>
  )
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
//import { Navbar } from './components/nav'
//import Footer from './components/footer'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Author Mapper",
  description: "Author Mapper, Created by Miles Jaffee",

  openGraph: {
    title: "Author Mapper",
    description: "Author Mapper, Created by Miles Jaffee",
    locale: 'en_US',
    type: 'website',
  }
  
}

const cx = (...classes: string[]) => classes.filter(Boolean).join(' ')

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={cx(
        'text-black',
        geistSans.variable,
        geistMono.variable
      )}
    >
      <body 
        className="antialiased mx-4 my-8 lg:mx-auto"
        style={{
          background: `repeating-linear-gradient(
            1deg,
            rgb(158, 241, 145),  
          rgb(0, 152, 36),
          rgb(158, 241, 145)
          350px
        )`,
      backgroundSize: "100% 200px",
      animation: "scrollBackground 30s linear infinite",
      }}
      >
        <style>
        {`
          @keyframes scrollBackground {
            from {
              background-position: 0 0;
            }
            to {
              background-position: 0 200px;
            }
          }
        `}
      </style>
      <main className="relative flex flex-col items-center justify-items-center h-screen p-8 mb-20 sm:px-20 lg:px-60 gap-16 font-[family-name:var(--font-geist-sans)]">
        <div className="w-full px-10 pb-5 bg-[rgba(255,255,255,0.4)] backdrop-blur-lg rounded-2xl shadow-xl">
          {children}
          </div>
        </main>
      </body>
    </html>
  )
}

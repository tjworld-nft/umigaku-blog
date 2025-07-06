import React from 'react'
import Header from './Header'
import Footer from './Footer'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto px-4 py-10 w-full">
        {children}
      </main>
      <Footer />
    </div>
  )
}

export default Layout
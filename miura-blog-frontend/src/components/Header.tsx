import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3">
        <Link to="/" className="text-xl font-bold tracking-wide text-gray-900">
          三浦 海の学校のブログ
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-6 text-sm font-medium">
          <a href="https://miura-diving.com" className="text-gray-700 hover:text-blue-600 transition-colors">
            ホーム
          </a>
          <a href="https://miura-diving.com/license" className="text-gray-700 hover:text-blue-600 transition-colors">
            ライセンス
          </a>
          <a href="https://miura-diving.com/fundive" className="text-gray-700 hover:text-blue-600 transition-colors">
            ファンダイビング
          </a>
          <a href="https://miura-diving.com/activity" className="text-gray-700 hover:text-blue-600 transition-colors">
            マリンアクティビティ
          </a>
          <a href="https://miura-diving.com/contact" className="text-gray-700 hover:text-blue-600 transition-colors">
            お問い合わせ
          </a>
        </nav>

        {/* Mobile menu button */}
        <button
          className="md:hidden flex flex-col space-y-1"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span className="w-6 h-0.5 bg-gray-600"></span>
          <span className="w-6 h-0.5 bg-gray-600"></span>
          <span className="w-6 h-0.5 bg-gray-600"></span>
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <nav className="flex flex-col space-y-1 px-6 py-4">
            <a href="https://miura-diving.com" className="text-gray-700 hover:text-blue-600 py-2">
              ホーム
            </a>
            <a href="https://miura-diving.com/license" className="text-gray-700 hover:text-blue-600 py-2">
              ライセンス
            </a>
            <a href="https://miura-diving.com/fundive" className="text-gray-700 hover:text-blue-600 py-2">
              ファンダイビング
            </a>
            <a href="https://miura-diving.com/activity" className="text-gray-700 hover:text-blue-600 py-2">
              マリンアクティビティ
            </a>
            <a href="https://miura-diving.com/contact" className="text-gray-700 hover:text-blue-600 py-2">
              お問い合わせ
            </a>
          </nav>
        </div>
      )}
    </header>
  )
}

export default Header
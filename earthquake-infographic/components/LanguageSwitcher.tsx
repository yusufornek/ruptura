"use client"

import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)

  const languages = [
    {
      code: 'en' as const,
      name: 'English',
      flag: '🇬🇧',
      country: 'United Kingdom'
    },
    {
      code: 'tr' as const,
      name: 'Türkçe',
      flag: '🇹🇷',
      country: 'Türkiye'
    }
  ]

  const currentLanguage = languages.find(lang => lang.code === language)

  const handleLanguageChange = (langCode: 'en' | 'tr') => {
    setLanguage(langCode)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      {/* Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 text-white hover:bg-white/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/30"
      >
        <span className="text-lg">{currentLanguage?.flag}</span>
        <span className="text-sm font-medium hidden sm:block">{currentLanguage?.name}</span>
        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-200">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150 ${
                  language === lang.code ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                }`}
              >
                <span className="text-xl">{lang.flag}</span>
                <div className="flex-1">
                  <div className={`font-medium ${language === lang.code ? 'text-blue-700' : 'text-gray-900'}`}>
                    {lang.name}
                  </div>
                  <div className={`text-xs ${language === lang.code ? 'text-blue-600' : 'text-gray-500'}`}>
                    {lang.country}
                  </div>
                </div>
                {language === lang.code && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default LanguageSwitcher

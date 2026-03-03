'use client';

import { useLanguage } from '@/context/LanguageContext';
import { ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function LanguageToggle() {
  const { locale, setLocale } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const languages = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' }
  ];

  const current = languages.find(l => l.code === locale);

  return (
    <div className="language-dropdown" ref={dropdownRef}>
      <button 
        className="lang-trigger" 
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span className="current-flag">{current?.flag}</span>
        <span className="current-label">{current?.label}</span>
        <ChevronDown size={13} className={`chevron ${isOpen ? 'open' : ''}`} />
      </button>

      {isOpen && (
        <div className="dropdown-menu">
          {languages.map((lang) => (
            <button
              key={lang.code}
              className={`dropdown-item ${locale === lang.code ? 'active' : ''}`}
              onClick={() => {
                setLocale(lang.code as any);
                setIsOpen(false);
              }}
            >
              <span className="item-flag">{lang.flag}</span>
              <span className="item-label">{lang.label}</span>
              {locale === lang.code && <div className="active-dot" />}
            </button>
          ))}
        </div>
      )}

      <style jsx>{`
        .language-dropdown { position: relative; }

        .lang-trigger {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 0 10px;
          border-radius: var(--radius-md);
          background: var(--bg-app);
          border: 1px solid var(--border-subtle);
          color: var(--text-secondary);
          font-size: 0.75rem;
          font-weight: 600;
          transition: all var(--transition-fast);
          height: 34px;
          white-space: nowrap;
        }

        .lang-trigger:hover {
          background: var(--accent-soft);
          border-color: var(--accent-primary);
          color: var(--accent-primary);
        }

        .current-flag { font-size: 1rem; line-height: 1; }

        .chevron {
          transition: transform var(--transition-base);
          opacity: 0.5;
          flex-shrink: 0;
        }
        .chevron.open { transform: rotate(180deg); }

        .dropdown-menu {
          position: absolute;
          top: calc(100% + 6px);
          right: 0;
          min-width: 150px;
          background: var(--bg-elevated);
          border: 1px solid var(--border-base);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lg);
          padding: 4px;
          z-index: 200;
          overflow: hidden;
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          width: 100%;
          padding: 8px var(--space-md);
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          font-size: 0.875rem;
          font-weight: 500;
          transition: all var(--transition-fast);
          text-align: left;
        }

        .dropdown-item:hover { background: var(--accent-soft); color: var(--accent-primary); }
        .dropdown-item.active { color: var(--accent-primary); background: var(--accent-soft); font-weight: 700; }

        .item-flag { font-size: 1rem; }

        .active-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--accent-primary);
          margin-left: auto;
          flex-shrink: 0;
        }

        @media (max-width: 640px) {
          .current-label { display: none; }
        }
      `}</style>
    </div>
  );
}

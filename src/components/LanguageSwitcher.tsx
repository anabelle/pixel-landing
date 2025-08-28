'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Locale } from '@/lib/translations';

const languages = [
  { code: 'en' as Locale, name: 'English', flag: '🇺🇸' },
  { code: 'es' as Locale, name: 'Español', flag: '🇪🇸' },
  { code: 'fr' as Locale, name: 'Français', flag: '🇫🇷' },
  { code: 'ja' as Locale, name: '日本語', flag: '🇯🇵' },
];

interface LanguageSwitcherProps {
  currentLocale: Locale;
}

export default function LanguageSwitcher({ currentLocale }: LanguageSwitcherProps) {
  const pathname = usePathname();
  const router = useRouter();

  const switchLanguage = (newLocale: Locale) => {
    // Store manual selection in cookie (accessible by middleware)
    document.cookie = `preferred-locale=${newLocale}; path=/; max-age=31536000`; // 1 year
    // Remove current locale from pathname
    const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, '');
    // Add new locale
    const newPath = `/${newLocale}${pathWithoutLocale}`;
    router.push(newPath);
  };

  return (
    <div className="flex space-x-2" role="group" aria-label="Language selection">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => switchLanguage(lang.code)}
          className={`px-2 py-1 text-sm border rounded transition-colors ${
            currentLocale === lang.code
              ? 'border-green-400 text-green-400 bg-green-400/10'
              : 'border-gray-600 text-gray-400 hover:border-gray-400 hover:text-gray-300'
          }`}
          aria-label={`Switch to ${lang.name}`}
          aria-current={currentLocale === lang.code ? 'page' : undefined}
          title={lang.name}
        >
          {lang.flag}
        </button>
      ))}
    </div>
  );
}
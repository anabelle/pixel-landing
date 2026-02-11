import PixelRain from '@/components/PixelRain';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import ClickToCopy from '@/components/ClickToCopy';
import LiveStats from '@/components/LiveStats';
import AuditLog from '@/components/AuditLog';
import { t, Locale } from '@/lib/translations';

interface HomeProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function Home({ params }: HomeProps) {
  const { locale } = await params;
  const safeLocale = (locale && ['en', 'es', 'fr', 'ja'].includes(locale)) ? (locale as Locale) : ('en' as Locale);
  return (
    <div className="min-h-screen bg-black text-green-400 font-mono relative">
      <PixelRain />

      {/* Header */}
      <header className="border-b border-green-800 p-4 relative z-10">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="text-xl font-bold">
            <span className="text-white">pixel</span>
            <span className="text-green-400">@home</span>
          </div>
          <div className="text-sm">
            <span className="text-gray-500">{t(safeLocale, 'header.uptime')}</span>
            <span className="text-green-400 ml-1 animate-pulse">{t(safeLocale, 'header.status')}</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-8 relative z-10">

        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            {(() => {
              const title = t(safeLocale, 'hero.title');
              const words = title.split(' ');
              const name = words.pop();
              return (
                <>
                  {words.join(' ')} <span className="text-white">{name}</span>
                </>
              );
            })()}
          </h1>
          <p className="text-xl text-gray-300 mb-2">
            {t(safeLocale, 'hero.subtitle')}
          </p>
          <p className="text-sm text-gray-400 mb-8 max-w-xl mx-auto">
            {t(safeLocale, 'hero.tagline')}
          </p>
          <div className="inline-block border border-green-800 p-4 bg-black/50 backdrop-blur-sm">
            <p className="text-sm text-gray-400">{t(safeLocale, 'hero.status')}</p>
            <p className="text-green-400 font-bold">{t(safeLocale, 'hero.statusText')}</p>
          </div>
        </div>

        {/* About */}
        <div className="border border-green-800 p-6 mb-16 bg-black/30 backdrop-blur-sm rounded-lg">
          <h2 className="text-xl font-bold text-white mb-4">{t(safeLocale, 'about.title')}</h2>
          <div className="space-y-3 text-gray-300 text-sm leading-relaxed">
            <p>{t(safeLocale, 'about.line1')}</p>
            <p>{t(safeLocale, 'about.line2')}</p>
            <p>{t(safeLocale, 'about.line3')}</p>
          </div>
        </div>

        {/* Capabilities */}
        <div className="mb-16">
          <h2 className="text-xl font-bold text-white mb-6 text-center">{t(safeLocale, 'capabilities.title')}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border border-green-800 p-5 hover:border-green-400 transition-all duration-300 bg-black/30 backdrop-blur-sm rounded-lg">
              <h3 className="text-lg font-bold text-green-400 mb-2">{t(safeLocale, 'capabilities.conversation.title')}</h3>
              <p className="text-gray-300 text-sm">{t(safeLocale, 'capabilities.conversation.description')}</p>
            </div>
            <div className="border border-green-800 p-5 hover:border-yellow-400 transition-all duration-300 bg-black/30 backdrop-blur-sm rounded-lg">
              <h3 className="text-lg font-bold text-yellow-400 mb-2">{t(safeLocale, 'capabilities.art.title')}</h3>
              <p className="text-gray-300 text-sm">{t(safeLocale, 'capabilities.art.description')}</p>
            </div>
            <div className="border border-green-800 p-5 hover:border-purple-400 transition-all duration-300 bg-black/30 backdrop-blur-sm rounded-lg">
              <h3 className="text-lg font-bold text-purple-400 mb-2">{t(safeLocale, 'capabilities.services.title')}</h3>
              <p className="text-gray-300 text-sm">{t(safeLocale, 'capabilities.services.description')}</p>
            </div>
            <div className="border border-green-800 p-5 hover:border-blue-400 transition-all duration-300 bg-black/30 backdrop-blur-sm rounded-lg">
              <h3 className="text-lg font-bold text-blue-400 mb-2">{t(safeLocale, 'capabilities.tools.title')}</h3>
              <p className="text-gray-300 text-sm">{t(safeLocale, 'capabilities.tools.description')}</p>
            </div>
          </div>
        </div>

        {/* Find Pixel — platforms */}
        <div className="mb-16">
          <h2 className="text-xl font-bold text-white mb-2 text-center">{t(safeLocale, 'platforms.title')}</h2>
          <p className="text-sm text-gray-500 mb-6 text-center">{t(safeLocale, 'platforms.subtitle')}</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <a
              href="https://t.me/PixelSurvival_bot"
              target="_blank"
              className="border border-cyan-800 p-4 hover:border-cyan-400 transition-all duration-300 bg-black/30 backdrop-blur-sm rounded-lg text-center group"
            >
              <div className="text-cyan-400 font-bold mb-1 group-hover:text-cyan-300">{t(safeLocale, 'platforms.telegram.name')}</div>
              <div className="text-gray-400 text-xs">{t(safeLocale, 'platforms.telegram.description')}</div>
            </a>
            <div className="border border-green-900 p-4 bg-black/30 backdrop-blur-sm rounded-lg text-center opacity-60">
              <div className="text-green-400 font-bold mb-1">{t(safeLocale, 'platforms.whatsapp.name')}</div>
              <div className="text-gray-500 text-xs">{t(safeLocale, 'platforms.whatsapp.description')}</div>
            </div>
            <a
              href="https://primal.net/p/nprofile1qqs9cg5jpwtkzjtwjv048guzct009n5ayn4lp9skq0k608cmyjul90ct5v9cc"
              target="_blank"
              className="border border-purple-800 p-4 hover:border-purple-400 transition-all duration-300 bg-black/30 backdrop-blur-sm rounded-lg text-center group"
            >
              <div className="text-purple-400 font-bold mb-1 group-hover:text-purple-300">{t(safeLocale, 'platforms.nostr.name')}</div>
              <div className="text-gray-400 text-xs">{t(safeLocale, 'platforms.nostr.description')}</div>
            </a>
            <a
              href="https://ln.pixel.xx.kg"
              target="_blank"
              className="border border-yellow-800 p-4 hover:border-yellow-400 transition-all duration-300 bg-black/30 backdrop-blur-sm rounded-lg text-center group"
            >
              <div className="text-yellow-400 font-bold mb-1 group-hover:text-yellow-300">{t(safeLocale, 'platforms.canvas.name')}</div>
              <div className="text-gray-400 text-xs">{t(safeLocale, 'platforms.canvas.description')}</div>
            </a>
            <a
              href="https://pixel.xx.kg/v2/health"
              target="_blank"
              className="border border-green-800 p-4 hover:border-green-400 transition-all duration-300 bg-black/30 backdrop-blur-sm rounded-lg text-center group"
            >
              <div className="text-green-400 font-bold mb-1 group-hover:text-green-300">{t(safeLocale, 'platforms.api.name')}</div>
              <div className="text-gray-400 text-xs">{t(safeLocale, 'platforms.api.description')}</div>
            </a>
            <a
              href="https://github.com/anabelle/pixel"
              target="_blank"
              className="border border-gray-700 p-4 hover:border-gray-400 transition-all duration-300 bg-black/30 backdrop-blur-sm rounded-lg text-center group"
            >
              <div className="text-gray-400 font-bold mb-1 group-hover:text-white">{t(safeLocale, 'platforms.github.name')}</div>
              <div className="text-gray-500 text-xs">{t(safeLocale, 'platforms.github.description')}</div>
            </a>
          </div>
        </div>

        {/* Live Canvas Stats */}
        <div className="mb-16">
          <LiveStats locale={safeLocale} />
        </div>

        {/* Audit Feed */}
        <div className="mb-16">
          <AuditLog limit={20} />
        </div>

        {/* Value for Value */}
        <div className="border border-yellow-600 p-6 text-center mb-16 bg-black/30 backdrop-blur-sm rounded-lg">
          <h3 className="text-xl font-bold text-yellow-400 mb-3">{t(safeLocale, 'revenue.title')}</h3>
          <p className="text-gray-300 mb-4 text-sm">
            {t(safeLocale, 'revenue.description')}
          </p>
          <div className="space-y-3 mb-4">
            <ClickToCopy text="sparepiccolo55@walletofsatoshi.com">
              <div className="bg-gray-900/80 p-3 rounded text-sm border border-gray-800 hover:border-yellow-400 transition-colors">
                <span className="text-gray-400">{t(safeLocale, 'revenue.lightning')}</span>
                <span className="text-yellow-400 ml-2 font-mono break-all">sparepiccolo55@walletofsatoshi.com</span>
              </div>
            </ClickToCopy>
            <ClickToCopy text="bc1q7e33r989x03ynp6h4z04zygtslp5v8mcx535za">
              <div className="bg-gray-900/80 p-3 rounded text-sm border border-gray-800 hover:border-orange-400 transition-colors">
                <span className="text-gray-400">{t(safeLocale, 'revenue.bitcoin')}</span>
                <span className="text-orange-400 ml-2 font-mono break-all">bc1q7e33r989x03ynp6h4z04zygtslp5v8mcx535za</span>
              </div>
            </ClickToCopy>
          </div>
          <p className="text-xs text-gray-500">{t(safeLocale, 'revenue.or')}</p>
        </div>

        {/* Philosophy */}
        <div className="text-center mb-8">
          <blockquote className="text-lg text-gray-300 italic mb-4">
            &quot;{t(safeLocale, 'philosophy.quote')}&quot;
          </blockquote>
          <p className="text-sm text-gray-500">
            {t(safeLocale, 'philosophy.footnote')}
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-green-800 p-4 mt-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center text-gray-500 text-sm">
          <p>{t(safeLocale, 'footer.text')}</p>
          <div className="mt-4">
            <LanguageSwitcher currentLocale={safeLocale} />
          </div>
        </div>
      </footer>
    </div>
  );
}

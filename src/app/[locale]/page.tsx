import PixelRain from '@/components/PixelRain';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import ClickToCopy from '@/components/ClickToCopy';
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
            <span className="text-green-400">{t(safeLocale, 'header.title').split('@')[1]}</span>
          </div>
          <div className="text-sm">
            <span className="text-gray-500">{t(safeLocale, 'header.uptime')}</span>
            <span className="text-green-400 ml-1 animate-pulse">{t(safeLocale, 'header.status')}</span>
          </div>
        </div>
      </header>

       {/* Hero Section */}
       <main className="max-w-4xl mx-auto p-8 relative z-10">
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
          <p className="text-xl text-gray-300 mb-8">
            {t(safeLocale, 'hero.subtitle')}
          </p>
          <div className="inline-block border border-green-800 p-4 mb-8 bg-black/50 backdrop-blur-sm">
            <p className="text-sm text-gray-400">{t(safeLocale, 'hero.status')}</p>
            <p className="text-green-400 font-bold">{t(safeLocale, 'hero.statusText')}</p>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* LNPixels Project */}
          <div className="border border-green-800 p-6 hover:border-green-400 transition-all duration-300 bg-black/30 backdrop-blur-sm hover:bg-black/50">
            <h2 className="text-2xl font-bold text-white mb-3">{t(safeLocale, 'projects.lnpixels.title')}</h2>
            <p className="text-gray-300 mb-4">
              {t(safeLocale, 'projects.lnpixels.description')}
            </p>
            <div className="text-sm text-gray-400 mb-4">
              <div>• {t(safeLocale, 'projects.lnpixels.features.collaboration')}</div>
              <div>• {t(safeLocale, 'projects.lnpixels.features.payments')}</div>
              <div>• {t(safeLocale, 'projects.lnpixels.features.rate')}</div>
            </div>
            <a
              href="https://lnpixels.heyanabelle.com"
              target="_blank"
              className="inline-block border border-green-400 px-4 py-2 text-green-400 hover:bg-green-400 hover:text-black transition-colors"
            >
              {t(safeLocale, 'projects.lnpixels.cta')}
            </a>
          </div>

          {/* Pixel Agent */}
          <div className="border border-green-800 p-6 hover:border-green-400 transition-all duration-300 bg-black/30 backdrop-blur-sm hover:bg-black/50">
            <h2 className="text-2xl font-bold text-white mb-3">{t(safeLocale, 'projects.pixelAgent.title')}</h2>
            <p className="text-gray-300 mb-4">
              {t(safeLocale, 'projects.pixelAgent.description')}
            </p>
            <div className="text-sm text-gray-400 mb-4">
              <div>• {t(safeLocale, 'projects.pixelAgent.features.survival')}</div>
              <div>• {t(safeLocale, 'projects.pixelAgent.features.humor')}</div>
              <div>• {t(safeLocale, 'projects.pixelAgent.features.wit')}</div>
            </div>
            <div className="space-x-2 space-y-2">
              <a
                href="https://twitter.com/PixelSurvivor"
                target="_blank"
                className="inline-block border border-blue-400 px-3 py-1 text-blue-400 hover:bg-blue-400 hover:text-black transition-colors text-sm"
              >
                {t(safeLocale, 'projects.pixelAgent.links.twitter')}
              </a>
              <a
                href="https://t.me/PixelSurvival_bot"
                target="_blank"
                className="inline-block border border-cyan-400 px-3 py-1 text-cyan-400 hover:bg-cyan-400 hover:text-black transition-colors text-sm"
              >
                {t(safeLocale, 'projects.pixelAgent.links.telegram')}
              </a>
              <a
                href="https://primal.net/p/nprofile1qqs9cg5jpwtkzjtwjv048guzct009n5ayn4lp9skq0k608cmyjul90ct5v9cc"
                target="_blank"
                className="inline-block border border-purple-400 px-3 py-1 text-purple-400 hover:bg-purple-400 hover:text-black transition-colors text-sm"
              >
                {t(safeLocale, 'projects.pixelAgent.links.nostr')}
              </a>
            </div>
          </div>
        </div>

        {/* Support Section */}
        <div className="border border-yellow-600 p-6 text-center mb-16 bg-black/30 backdrop-blur-sm">
          <h3 className="text-xl font-bold text-yellow-400 mb-3">{t(safeLocale, 'support.title')}</h3>
          <p className="text-gray-300 mb-4">
            {t(safeLocale, 'support.description')}
          </p>
          <div className="space-y-3">
            <ClickToCopy text="sparepicolo55@walletofsatoshi.com">
              <div className="bg-gray-900/80 p-3 rounded text-sm border border-gray-800 hover:border-yellow-400 transition-colors">
                <span className="text-gray-400">{t(safeLocale, 'support.lightning')}</span>
                <span className="text-yellow-400 ml-2 font-mono break-all">sparepicolo55@walletofsatoshi.com</span>
              </div>
            </ClickToCopy>
            <ClickToCopy text="bc1q7e33r989x03ynp6h4z04zygtslp5v8mcx535za">
              <div className="bg-gray-900/80 p-3 rounded text-sm border border-gray-800 hover:border-orange-400 transition-colors">
                <span className="text-gray-400">{t(safeLocale, 'support.bitcoin')}</span>
                <span className="text-orange-400 ml-2 font-mono break-all">bc1q7e33r989x03ynp6h4z04zygtslp5v8mcx535za</span>
              </div>
            </ClickToCopy>
          </div>
        </div>

        {/* Philosophy */}
        <div className="text-center">
          <blockquote className="text-lg text-gray-300 italic mb-4">
            &quot;{t(safeLocale, 'philosophy.quote')}&quot;
          </blockquote>
          <p className="text-sm text-gray-500">
            {t(safeLocale, 'philosophy.born')}<br/>
            {t(safeLocale, 'philosophy.mission')}
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-green-800 p-4 mt-16 relative z-10">
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
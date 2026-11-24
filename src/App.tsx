import { useState } from 'react';
import { ArchiveSection } from './components/ArchiveSection';
import { HistorySection } from './components/HistorySection';
import { OfflineIndicator, PWAInstallButton } from './components/PWAInstallButton';
import { PlayWorkspace } from './components/PlayWorkspace';
import { StrategySection } from './components/StrategySection';
import { TutorialSection } from './components/TutorialSection';
import { exportRulesAsJson, exportRulesAsMarkdown } from './engine/spec';
import { TRANSLATIONS, type Language } from './i18n/translations';
import { downloadTextFile } from './storage/archiveDb';

export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const t = TRANSLATIONS[lang];

  return (
    <div className="min-h-screen bg-[#F7F4EE] text-[#1C1917]">
      {/* Strict 3-Zone Top Bar */}
      <header className="sticky top-0 z-30 border-b border-stone-300/80 bg-[#F7F4EE]/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-8 px-4 py-3.5 sm:px-6">
          <a
            href="#top"
            className="font-display text-xl font-bold tracking-tight text-stone-900 whitespace-nowrap shrink-0"
          >
            {t.brandTitle}
          </a>

          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-700"
          >
            <a
              href="#play"
              className="hover:text-stone-950 hover:underline underline-offset-4 whitespace-nowrap shrink-0"
            >
              {t.nav.play}
            </a>
            <a
              href="#learn"
              className="hover:text-stone-950 hover:underline underline-offset-4 whitespace-nowrap shrink-0"
            >
              {t.nav.learn}
            </a>
            <a
              href="#strategy"
              className="hover:text-stone-950 hover:underline underline-offset-4 whitespace-nowrap shrink-0"
            >
              {t.nav.strategy}
            </a>
            <a
              href="#history"
              className="hover:text-stone-950 hover:underline underline-offset-4 whitespace-nowrap shrink-0"
            >
              {t.nav.history}
            </a>
            <a
              href="#archive"
              className="hover:text-stone-950 hover:underline underline-offset-4 whitespace-nowrap shrink-0"
            >
              {t.nav.archive}
            </a>
          </nav>

          <div className="shrink-0">
            <button
              type="button"
              onClick={() => setLang((prev) => (prev === 'en' ? 'ne' : 'en'))}
              className="rounded-md bg-[#3B2618] px-4 py-2 text-xs font-semibold text-[#FBF9F5] hover:bg-[#4E3220] transition-colors whitespace-nowrap shrink-0"
            >
              {t.langToggle}
            </button>
          </div>
        </div>
      </header>

      <main id="top">
        {/* Cultural Heritage Marquee Hero */}
        <section className="border-b border-stone-300/70 bg-[#FBF9F5]">
          <div className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6 lg:py-14">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-stretch">
              <div className="lg:col-span-6 flex flex-col justify-center">
                <p className="text-xs font-medium tracking-wide text-[#9A3412]">
                  {t.hero.kicker}
                </p>
                <h1 className="mt-2.5 font-display text-3xl font-semibold tracking-tight text-stone-900 sm:text-5xl [text-wrap:balance]">
                  {t.hero.headline}
                </h1>
                <p className="mt-2 text-sm font-medium text-stone-600">{t.brandSubtitle}</p>
                <p className="mt-4 max-w-xl text-base leading-relaxed text-stone-700">
                  {t.hero.summary}
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <a
                    href="#play"
                    className="rounded-md bg-[#9A3412] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#7C2D12] transition-colors whitespace-nowrap shrink-0"
                  >
                    {t.hero.playCta}
                  </a>
                  <a
                    href="#learn"
                    className="rounded-md border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium text-stone-800 hover:bg-stone-50 transition-colors whitespace-nowrap shrink-0"
                  >
                    {t.hero.learnCta}
                  </a>
                  <PWAInstallButton labels={t.offline} />
                </div>
              </div>

              <div className="lg:col-span-6">
                <figure className="h-full overflow-hidden rounded-xl border border-stone-300/80 bg-[#F7F4EE]">
                  <img
                    src="/src/assets/images/chautari_board_hero_1795495915014.jpg"
                    alt="Carved wooden Bagh-Chal board on a stone chautari beneath a pipal tree in Nepal"
                    referrerPolicy="no-referrer"
                    className="aspect-[16/10] w-full object-cover lg:h-full"
                  />
                  <figcaption className="border-t border-stone-200 bg-[#FBF9F5] px-4 py-2.5 text-xs italic text-stone-600">
                    {t.hero.caption}
                  </figcaption>
                </figure>
              </div>
            </div>
          </div>
        </section>

        {/* Core Playable Workspace */}
        <PlayWorkspace lang={lang} t={t.play} />

        {/* Interactive 10-Lesson Tutorial */}
        <TutorialSection
          lang={lang}
          header={{ title: t.sections.learnTitle, subtitle: t.sections.learnSubtitle }}
        />

        {/* Strategy Guides & Tactical Puzzles */}
        <StrategySection
          lang={lang}
          header={{ title: t.sections.strategyTitle, subtitle: t.sections.strategySubtitle }}
        />

        {/* Evidence-Based History & Cultural Heritage */}
        <HistorySection
          lang={lang}
          header={{ title: t.sections.historyTitle, subtitle: t.sections.historySubtitle }}
        />

        {/* Open Heritage Archive */}
        <ArchiveSection
          lang={lang}
          header={{ title: t.sections.archiveTitle, subtitle: t.sections.archiveSubtitle }}
        />
      </main>

      {/* Quiet Archival Footer */}
      <footer className="border-t border-stone-300/80 bg-[#FBF9F5] py-8">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-4 px-4 text-xs text-stone-600 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <span className="font-semibold text-stone-800">Bagh-Chal (बाघचाल)</span> ·{' '}
            <span>
              {lang === 'ne'
                ? 'स्वतन्त्र डिजिटल सांस्कृतिक सम्पदा संरक्षण परियोजना'
                : 'Open Cultural Heritage Preservation Project · Offline-First & Account-Free'}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() =>
                downloadTextFile('bagh-chal-rules-v1.json', exportRulesAsJson(), 'application/json')
              }
              className="hover:text-stone-900 underline underline-offset-2"
            >
              {t.play.exportRulesJson}
            </button>
            <button
              type="button"
              onClick={() =>
                downloadTextFile('bagh-chal-rules-v1.md', exportRulesAsMarkdown(), 'text/markdown')
              }
              className="hover:text-stone-900 underline underline-offset-2"
            >
              {t.play.exportRulesMd}
            </button>
          </div>
        </div>
      </footer>

      <OfflineIndicator label={t.offline.banner} />
    </div>
  );
}

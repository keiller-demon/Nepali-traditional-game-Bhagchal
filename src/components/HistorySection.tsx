import React from 'react';
import { ExternalLink } from 'lucide-react';
import { GLOSSARY_TERMS, HISTORICAL_REFERENCES } from '../data/educationalContent';
import type { Language } from '../i18n/translations';

interface HistorySectionProps {
  lang: Language;
  header: { title: string; subtitle: string };
}

export const HistorySection: React.FC<HistorySectionProps> = ({ lang, header }) => {
  const milestones = [
    {
      year: lang === 'ne' ? 'अज्ञात प्राचीन उत्पत्ति (लिखित मिति अप्राप्त)' : 'Pre-20th Century Oral Tradition',
      status: lang === 'ne' ? 'मौखिक परम्परा / अप्रामाणिक मिति' : 'Oral Tradition · Undated Origin',
      text:
        lang === 'ne'
          ? 'बाघचाल शताब्दीयौँदेखि नेपालका पहाडी र उपत्यकाका चौतारी, आँगन र ग्रामीण समुदायमा मौखिक रूपमा पुस्तान्तरण हुँदै आएको मानिन्छ। यद्यपि यसको ठ्याक्कै उत्पत्ति वर्ष प्रमाणित गर्ने पुरातात्विक वा लिखित शिलालेख फेला परेको छैन।'
          : 'Oral tradition across Nepal’s hills and valleys passes Bagh-Chal down across generations on village chautaris and courtyards. No dated archaeological inscription establishes an exact century of invention; claims of multi-millennial origin remain unverified.',
    },
    {
      year: '1952',
      status: lang === 'ne' ? 'तुलनात्मक इतिहास' : 'Historical Survey',
      text:
        lang === 'ne'
          ? 'एच. जे. आर. मरेले "अ हिस्ट्री अफ बोर्ड-गेम्स अदर द्यान चेस" मा हिमालय र दक्षिण एसियाका बाघ-बाख्रा खेलहरूको वर्गीकरण गर्दै ५×५ अल्केर्क पाटीसँगको संरचनागत सम्बन्ध उल्लेख गरे।'
          : 'H. J. R. Murray’s "A History of Board-Games Other Than Chess" (Oxford University Press) systematically classifies South Asian tiger-and-goat hunt games within the broader Alquerque-grid family.',
    },
    {
      year: '2004',
      status: lang === 'ne' ? 'शैक्षिक अनुसन्धान' : 'Documented Research',
      text:
        lang === 'ne'
          ? 'लिम यु-जिन र जर्ग निभर्गल्टले ICGA जर्नलमा "कम्प्युटिङ टाइगर्स एण्ड गोट्स" प्रकाशित गरी बाघचालको २५-बिन्दु ग्राफ, D4 सिमेट्री र अल्फा-बिटा खोज विधिको औपचारिक अध्ययन गरे।'
          : 'Lim Yew-Jin and Jurg Nievergelt publish "Computing Tigers and Goats" (ICGA Journal), formalizing the 25-node graph, dihedral symmetry reduction, and search-based AI evaluation.',
    },
    {
      year: '2021',
      status: lang === 'ne' ? 'पत्रकारिता अभिलेख' : 'Journalistic Investigation',
      text:
        lang === 'ne'
          ? 'द काठमाण्डू पोस्टको सन् २०२१ को विशेष रिपोर्टले नेपालमा परम्परागत काठे पाटी र डिजिटल पुस्ताबीच बाघचाल संरक्षणको महत्त्व र ऐतिहासिक प्रमाणको अवस्थाबारे प्रकाश पार्‍यो।'
          : 'The Kathmandu Post’s 2021 heritage feature documents contemporary efforts in Nepal to preserve Bagh-Chal craftsmanship while emphasizing the distinction between folklore and documented history.',
    },
  ];

  return (
    <section id="history" className="border-t border-stone-300/70 bg-[#FBF9F5] py-12 lg:py-16">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <div className="max-w-2xl">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">
            {header.title}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">{header.subtitle}</p>
        </div>

        {/* Two-Column Editorial Essay + Archival Photography */}
        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7 space-y-6 text-base leading-relaxed text-stone-800 max-w-prose">
            <div>
              <h3 className="font-display text-xl font-semibold text-stone-900">
                {lang === 'ne' ? 'नामको अर्थ र सांस्कृतिक महत्त्व' : 'Etymology & Chautari Culture'}
              </h3>
              <p className="mt-2.5">
                {lang === 'ne'
                  ? 'नेपाली भाषामा "बाघचाल" शब्द दुई शब्द "बाघ" र "चाल" (चल्ने गति वा रणनीतिक कदम) मिलेर बनेको छ। यो खेल केवल मनोरञ्जन मात्र नभई ग्रामीण चौतारी, मेलापात र चाडपर्वमा सामाजिक संवादको माध्यम रहिआएको छ। चार बाघ र बीस बाख्राबीचको असमान सन्तुलनले सामूहिक सहकार्यले कसरी ठूलो शक्तिलाई पनि नियन्त्रण गर्न सक्छ भन्ने व्यावहारिक दर्शन बोकेको छ।'
                  : 'In Nepali, "Bagh-Chal" combines "Bagh" (बाघ, tiger) and "Chal" (चाल, move or tactical gait). Beyond leisure, the game served as a quiet social gathering ritual on stone chautaris beneath pipal and banyan trees, where travelers and village elders gathered over carved wooden boards or grid lines scratched directly into flat stone slabs.'}
              </p>
            </div>

            <div>
              <h3 className="font-display text-xl font-semibold text-stone-900">
                {lang === 'ne' ? 'परम्परागत सामग्री र पाटी' : 'Traditional Materials & Physical Craft'}
              </h3>
              <p className="mt-2.5">
                {lang === 'ne'
                  ? 'सहर तथा काष्ठकलाका केन्द्रहरूमा सिसौ, साल वा अन्य स्थानीय काठबाट हातले कुँदिएका बाघ र बाख्राका गोटीहरू र पाटी बनाइन्छ। गाउँघरमा भने खरी, कोइला वा ढुङ्गामा कुँदिएको रेखामा मकैका दाना, भटमास, इमलीका बियाँ वा खोलाका साना ढुङ्गाहरू प्रयोग गरी खेलिन्छ।'
                  : 'Urban woodcarvers craft portable boards (paati) from sal or rosewood with sculpted tiger and goat figures, while rural players adapt effortlessly with chalk, charcoal, or chiselled stone surfaces paired with smooth river pebbles, corn kernels, or dried seeds.'}
              </p>
            </div>

            {/* Epistemological Distinction Matrix */}
            <div className="rounded-lg border border-stone-300/80 bg-[#F7F4EE] p-5 space-y-3">
              <h4 className="font-display text-base font-semibold text-stone-900">
                {lang === 'ne'
                  ? 'ऐतिहासिक प्रमाणको स्पष्ट वर्गीकरण'
                  : 'Epistemological Note: Fact vs. Oral Claim'}
              </h4>
              <ul className="space-y-2 text-sm text-stone-700">
                <li>
                  <strong className="text-stone-900">
                    {lang === 'ne' ? 'प्रमाणित तथ्य: ' : 'Verified Fact: '}
                  </strong>
                  {lang === 'ne'
                    ? '५×५ २५-बिन्दु पाटी, ४ बाघ र २० बाख्राको मानक संरचना र नेपालभर प्रचलित चौतारी खेल परम्परा।'
                    : 'The 5×5 twenty-five-intersection topology, 4-tiger vs. 20-goat asymmetry, and living stone/wood play traditions across Nepal.'}
                </li>
                <li>
                  <strong className="text-stone-900">
                    {lang === 'ne' ? 'शैक्षिक अनुसन्धान: ' : 'Documented Research: '}
                  </strong>
                  {lang === 'ne'
                    ? 'सन् १९५२ को तुलनात्मक खेल वर्गीकरण र सन् २००४ को लिम–निभर्गल्टको कम्प्युटर विश्लेषण।'
                    : 'Comparative hunt-game taxonomy (Murray, 1952) and formal game-tree & symmetry analysis (Lim & Nievergelt, 2004).'}
                </li>
                <li>
                  <strong className="text-stone-900">
                    {lang === 'ne' ? 'अनिश्चित वा अप्रामाणिक दाबी: ' : 'Uncertain Origin Claims: '}
                  </strong>
                  {lang === 'ne'
                    ? 'महाभारत काल वा १०००+ वर्ष पुरानो भन्ने जस्ता दाबीहरूको हालसम्म मिति प्रमाणित गर्ने ऐतिहासिक दस्तावेज छैन।'
                    : 'Popular claims assigning an exact ancient year or epic origin lack dated archaeological or textual verification and are explicitly marked unverified here.'}
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column: Curated Artifact Figures */}
          <div className="lg:col-span-5 space-y-6">
            <figure className="overflow-hidden rounded-lg border border-stone-300/80 bg-[#F7F4EE]">
              <img
                src="/src/assets/images/stone_chautari_archive_1795495916284.jpg"
                alt="Traditional stone chautari slab etched with a 5x5 Bagh-Chal grid and played with pebbles and seeds"
                referrerPolicy="no-referrer"
                className="aspect-[4/3] w-full object-cover"
              />
              <figcaption className="p-3.5 text-xs italic text-stone-600">
                {lang === 'ne'
                  ? 'चित्र २ — पहाडी चौतारीको ढुङ्गामा कुँदिएको परम्परागत ५×५ पाटी र प्राकृतिक गोटीहरू।'
                  : 'Fig. 2 — Chiselled stone chautari slab grid played with smooth pebbles and dried seeds.'}
              </figcaption>
            </figure>

            <div className="grid grid-cols-2 gap-4">
              <figure className="overflow-hidden rounded-lg border border-stone-300/80 bg-[#F7F4EE]">
                <img
                  src="/src/assets/images/carved_wooden_tiger_1795495915633.jpg"
                  alt="Hand-carved dark rosewood Nepali tiger game piece"
                  referrerPolicy="no-referrer"
                  className="aspect-square w-full object-cover"
                />
                <figcaption className="p-2.5 text-xs italic text-stone-600">
                  {lang === 'ne' ? 'काठको बाघ गोटी' : 'Fig. 3 — Carved Rosewood Tiger'}
                </figcaption>
              </figure>
              <figure className="overflow-hidden rounded-lg border border-stone-300/80 bg-[#F7F4EE]">
                <img
                  src="/src/assets/images/carved_wooden_goat_1795495915877.jpg"
                  alt="Hand-carved pale boxwood Nepali goat game piece"
                  referrerPolicy="no-referrer"
                  className="aspect-square w-full object-cover"
                />
                <figcaption className="p-2.5 text-xs italic text-stone-600">
                  {lang === 'ne' ? 'काठको बाख्रा गोटी' : 'Fig. 4 — Carved Boxwood Goat'}
                </figcaption>
              </figure>
            </div>
          </div>
        </div>

        {/* Evidence-Supported Timeline */}
        <div className="mt-14">
          <h3 className="font-display text-xl font-semibold text-stone-900">
            {lang === 'ne' ? 'प्रमाणमा आधारित कालक्रम' : 'Documented Scholarship & Record Timeline'}
          </h3>
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {milestones.map((m) => (
              <div
                key={m.year}
                className="rounded-lg border border-stone-300/80 bg-[#F7F4EE] p-4"
              >
                <div className="font-mono-tabular text-sm font-semibold text-[#9A3412]">{m.year}</div>
                <div className="mt-0.5 text-xs font-medium text-stone-500">{m.status}</div>
                <p className="mt-2.5 text-xs leading-relaxed text-stone-700">{m.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Nepali Terminology Glossary & Cited Sources */}
        <div className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <h3 className="font-display text-xl font-semibold text-stone-900">
              {lang === 'ne' ? 'बाघचाल शब्दावली' : 'Traditional Nepali Terminology'}
            </h3>
            <dl className="mt-4 divide-y divide-stone-200 rounded-lg border border-stone-300/80 bg-[#F7F4EE]">
              {GLOSSARY_TERMS.map((term) => (
                <div key={term.translit} className="p-3.5">
                  <dt className="flex items-baseline gap-2 text-sm font-semibold text-stone-900">
                    <span>{term.nepali}</span>
                    <span className="text-xs font-normal text-stone-500">· {term.translit}</span>
                  </dt>
                  <dd className="mt-1 text-xs leading-relaxed text-stone-700">
                    {lang === 'ne' ? term.neMeaning : term.en}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="lg:col-span-6">
            <h3 className="font-display text-xl font-semibold text-stone-900">
              {lang === 'ne' ? 'सन्दर्भ सामग्री तथा शोधपत्रहरू' : 'Verified Publications & Academic References'}
            </h3>
            <div className="mt-4 space-y-3">
              {HISTORICAL_REFERENCES.map((ref) => (
                <div
                  key={ref.id}
                  className="rounded-lg border border-stone-300/80 bg-[#F7F4EE] p-4"
                >
                  <div className="text-xs text-stone-500">
                    {ref.epistemicStatus} · {ref.publication} · {ref.date}
                  </div>
                  <div className="mt-1 flex items-start justify-between gap-3">
                    <h4 className="text-sm font-semibold text-stone-900">{ref.title}</h4>
                    <a
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-[#9A3412] hover:underline shrink-0"
                    >
                      Source
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <div className="mt-0.5 text-xs font-medium text-stone-600">{ref.author}</div>
                  <p className="mt-2 text-xs leading-relaxed text-stone-700">
                    {lang === 'ne' ? ref.noteNe : ref.noteEn}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

import React, { useEffect, useMemo, useState } from 'react';
import { Download, Plus, ShieldCheck } from 'lucide-react';
import type { Language } from '../i18n/translations';
import {
  archiveToMarkdown,
  downloadTextFile,
  loadArchiveRecords,
  saveArchiveRecord,
  SEED_ARCHIVE_RECORDS,
  type ArchiveCategory,
  type ArchiveLicense,
  type ArchiveRecord,
} from '../storage/archiveDb';

interface ArchiveSectionProps {
  lang: Language;
  header: { title: string; subtitle: string };
}

const CATEGORY_LABELS: Record<ArchiveCategory | 'ALL', { en: string; ne: string }> = {
  ALL: { en: 'All Records', ne: 'सबै अभिलेख' },
  HISTORICAL_DOCUMENT: { en: 'Historical Documents', ne: 'ऐतिहासिक दस्तावेज' },
  PHYSICAL_BOARD: { en: 'Physical Boards', ne: 'भौतिक पाटीहरू' },
  HANDMADE_PIECES: { en: 'Handmade Pieces', ne: 'हाते गोटीहरू' },
  ORAL_HISTORY: { en: 'Oral Histories & Interviews', ne: 'मौखिक इतिहास' },
  REGIONAL_RULES: { en: 'Regional Rules', ne: 'क्षेत्रीय नियम' },
  TERMINOLOGY: { en: 'Terminology', ne: 'शब्दावली' },
  TOURNAMENT_RECORD: { en: 'Tournament Records', ne: 'प्रतियोगिता अभिलेख' },
  EDUCATIONAL_RESOURCE: { en: 'Educational Resources', ne: 'शैक्षिक सामग्री' },
};

export const ArchiveSection: React.FC<ArchiveSectionProps> = ({ lang, header }) => {
  const [records, setRecords] = useState<ArchiveRecord[]>(SEED_ARCHIVE_RECORDS);
  const [filter, setFilter] = useState<ArchiveCategory | 'ALL'>('ALL');
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [category, setCategory] = useState<ArchiveCategory>('ORAL_HISTORY');
  const [titleEn, setTitleEn] = useState('');
  const [titleNe, setTitleNe] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [descriptionNe, setDescriptionNe] = useState('');
  const [contributor, setContributor] = useState('');
  const [location, setLocation] = useState('');
  const [dateRecorded, setDateRecorded] = useState(new Date().toISOString().slice(0, 10));
  const [license, setLicense] = useState<ArchiveLicense>('CC BY-SA 4.0');
  const [sourceReference, setSourceReference] = useState('');
  const [consentConfirmed, setConsentConfirmed] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);

  useEffect(() => {
    loadArchiveRecords().then(setRecords).catch(() => {});
  }, []);

  const filtered = useMemo(
    () => (filter === 'ALL' ? records : records.filter((r) => r.category === filter)),
    [filter, records]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(false);

    if (!consentConfirmed) {
      setFormError(
        lang === 'ne'
          ? 'योगदान सुरक्षित गर्न स्पष्ट अनुमति तथा अधिकार पुष्टि अनिवार्य छ।'
          : 'Explicit contributor permission and open-licensing consent must be confirmed.'
      );
      return;
    }

    if (!titleEn.trim() || !descriptionEn.trim() || !contributor.trim()) {
      setFormError(
        lang === 'ne'
          ? 'कृपया शीर्षक, विवरण र योगदानकर्ताको नाम भर्नुहोस्।'
          : 'Please complete the title, description, and contributor attribution.'
      );
      return;
    }

    const newRecord: ArchiveRecord = {
      id: `contrib-${Date.now()}`,
      category,
      titleEn: titleEn.trim(),
      titleNe: titleNe.trim() || titleEn.trim(),
      descriptionEn: descriptionEn.trim(),
      descriptionNe: descriptionNe.trim() || descriptionEn.trim(),
      contributor: contributor.trim(),
      location: location.trim() || undefined,
      dateRecorded,
      license,
      consentConfirmed: true,
      sourceReference: sourceReference.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    const updated = await saveArchiveRecord(newRecord);
    setRecords(updated);
    setTitleEn('');
    setTitleNe('');
    setDescriptionEn('');
    setDescriptionNe('');
    setSourceReference('');
    setConsentConfirmed(false);
    setFormSuccess(true);
    setShowForm(false);
  };

  return (
    <section id="archive" className="border-t border-stone-300/70 bg-[#F7F4EE] py-12 lg:py-16">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <h2 className="font-display text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">
              {header.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-stone-600">{header.subtitle}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() =>
                downloadTextFile(
                  'bagh-chal-heritage-archive.json',
                  JSON.stringify(records, null, 2),
                  'application/json'
                )
              }
              className="inline-flex items-center gap-1.5 rounded-md border border-stone-300 bg-white px-3 py-2 text-xs font-medium text-stone-800 hover:bg-stone-50 whitespace-nowrap"
            >
              <Download className="h-3.5 w-3.5" />
              {lang === 'ne' ? 'अभिलेख JSON' : 'Archive JSON'}
            </button>
            <button
              type="button"
              onClick={() =>
                downloadTextFile(
                  'bagh-chal-heritage-archive.md',
                  archiveToMarkdown(records),
                  'text/markdown'
                )
              }
              className="inline-flex items-center gap-1.5 rounded-md border border-stone-300 bg-white px-3 py-2 text-xs font-medium text-stone-800 hover:bg-stone-50 whitespace-nowrap"
            >
              <Download className="h-3.5 w-3.5" />
              {lang === 'ne' ? 'अभिलेख Markdown' : 'Archive Markdown'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm((s) => !s)}
              className="inline-flex items-center gap-1.5 rounded-md bg-[#3B2618] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#4E3220] whitespace-nowrap"
            >
              <Plus className="h-3.5 w-3.5" />
              {lang === 'ne' ? 'अभिलेख थप्नुहोस्' : 'Contribute Record'}
            </button>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="mt-6 flex flex-wrap gap-1.5">
          {(Object.keys(CATEGORY_LABELS) as Array<ArchiveCategory | 'ALL'>).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilter(cat)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                filter === cat
                  ? 'bg-[#3B2618] text-white'
                  : 'border border-stone-300/80 bg-[#FBF9F5] text-stone-700 hover:bg-stone-200/50'
              }`}
            >
              {lang === 'ne' ? CATEGORY_LABELS[cat].ne : CATEGORY_LABELS[cat].en}
            </button>
          ))}
        </div>

        {formSuccess && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-700/30 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-950">
            <ShieldCheck className="h-4 w-4 text-emerald-700" />
            <span>
              {lang === 'ne'
                ? 'तपाईंको अभिलेख स्थानीय सम्पदा सङ्ग्रहमा सुरक्षित गरियो र डाउनलोडका लागि उपलब्ध छ।'
                : 'Archive record saved locally with attribution, consent verification, and open license metadata.'}
            </span>
          </div>
        )}

        {/* Contribution Form */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="mt-6 rounded-xl border border-stone-300 bg-[#FBF9F5] p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold text-stone-900">
                {lang === 'ne'
                  ? 'सम्पदा सङ्ग्रहमा नयाँ अभिलेख थप्नुहोस्'
                  : 'Submit Open Cultural Archive Record'}
              </h3>
              <span className="text-xs text-stone-500">
                {lang === 'ne' ? 'स्थानीय अफलाइन भण्डारण' : 'Stored locally in IndexedDB · Exportable'}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  {lang === 'ne' ? 'श्रेणी' : 'Category'}
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ArchiveCategory)}
                  className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-xs text-stone-900"
                >
                  {(Object.keys(CATEGORY_LABELS) as Array<ArchiveCategory | 'ALL'>)
                    .filter((k) => k !== 'ALL')
                    .map((k) => (
                      <option key={k} value={k}>
                        {lang === 'ne' ? CATEGORY_LABELS[k].ne : CATEGORY_LABELS[k].en}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  {lang === 'ne' ? 'योगदानकर्ता / श्रेय' : 'Contributor Attribution *'}
                </label>
                <input
                  type="text"
                  required
                  value={contributor}
                  onChange={(e) => setContributor(e.target.value)}
                  placeholder="Full name or community group"
                  className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-xs text-stone-900"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  {lang === 'ne' ? 'इजाजतपत्र (License)' : 'Open License'}
                </label>
                <select
                  value={license}
                  onChange={(e) => setLicense(e.target.value as ArchiveLicense)}
                  className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-xs text-stone-900"
                >
                  <option value="CC BY-SA 4.0">CC BY-SA 4.0</option>
                  <option value="CC BY 4.0">CC BY 4.0</option>
                  <option value="CC0 1.0 Public Domain">CC0 1.0 Public Domain</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Title (English) *
                </label>
                <input
                  type="text"
                  required
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-xs text-stone-900"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  शीर्षक (नेपाली)
                </label>
                <input
                  type="text"
                  value={titleNe}
                  onChange={(e) => setTitleNe(e.target.value)}
                  className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-xs text-stone-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Description (English) *
                </label>
                <textarea
                  rows={3}
                  required
                  value={descriptionEn}
                  onChange={(e) => setDescriptionEn(e.target.value)}
                  className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-xs text-stone-900"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  विवरण (नेपाली)
                </label>
                <textarea
                  rows={3}
                  value={descriptionNe}
                  onChange={(e) => setDescriptionNe(e.target.value)}
                  className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-xs text-stone-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  {lang === 'ne' ? 'स्थान' : 'Location (Optional)'}
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="District / Village / City"
                  className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-xs text-stone-900"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  {lang === 'ne' ? 'मिति' : 'Date Recorded'}
                </label>
                <input
                  type="date"
                  value={dateRecorded}
                  onChange={(e) => setDateRecorded(e.target.value)}
                  className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-xs text-stone-900"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  {lang === 'ne' ? 'स्रोत / सन्दर्भ' : 'Source / Citation'}
                </label>
                <input
                  type="text"
                  value={sourceReference}
                  onChange={(e) => setSourceReference(e.target.value)}
                  className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-xs text-stone-900"
                />
              </div>
            </div>

            <label className="flex items-start gap-2.5 rounded-md border border-stone-300/80 bg-[#F7F4EE] p-3 text-xs text-stone-800 cursor-pointer">
              <input
                type="checkbox"
                checked={consentConfirmed}
                onChange={(e) => setConsentConfirmed(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-stone-400 text-[#9A3412]"
              />
              <span>
                {lang === 'ne'
                  ? 'म पुष्टि गर्छु कि यो अभिलेख, तस्बिर वा मौखिक इतिहास साझा गर्न मसँग स्पष्ट अनुमति र अधिकार छ, र यसलाई छानिएको खुला इजाजतपत्र अन्तर्गत अभिलेख गर्न सहमत छु।'
                  : 'I confirm explicit contributor and interviewee consent to preserve this record openly, and no private personal recordings or unpermitted photographs are included.'}
              </span>
            </label>

            {formError && <p className="text-xs font-medium text-red-700">{formError}</p>}

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-md border border-stone-300 bg-white px-4 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50"
              >
                {lang === 'ne' ? 'रद्द गर्नुहोस्' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="rounded-md bg-[#9A3412] px-4 py-2 text-xs font-semibold text-white hover:bg-[#7C2D12]"
              >
                {lang === 'ne' ? 'सङ्ग्रहमा सुरक्षित गर्नुहोस्' : 'Save Archive Record'}
              </button>
            </div>
          </form>
        )}

        {/* Archive Records Grid */}
        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <article
              key={item.id}
              className="flex flex-col justify-between rounded-lg border border-stone-300/80 bg-[#FBF9F5] overflow-hidden"
            >
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt={lang === 'ne' ? item.titleNe : item.titleEn}
                  referrerPolicy="no-referrer"
                  className="aspect-[16/10] w-full object-cover border-b border-stone-200"
                />
              )}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-xs text-stone-500">
                    {lang === 'ne'
                      ? CATEGORY_LABELS[item.category].ne
                      : CATEGORY_LABELS[item.category].en}{' '}
                    · <span className="font-mono-tabular">{item.dateRecorded}</span>
                  </div>
                  <h3 className="mt-1.5 font-display text-lg font-semibold text-stone-900">
                    {lang === 'ne' ? item.titleNe : item.titleEn}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-stone-700">
                    {lang === 'ne' ? item.descriptionNe : item.descriptionEn}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-200 flex items-center justify-between gap-2 text-xs text-stone-500">
                  <div className="truncate">
                    <span className="font-medium text-stone-700">{item.contributor}</span> ·{' '}
                    <span>{item.license}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      downloadTextFile(
                        `${item.id}.json`,
                        JSON.stringify(item, null, 2),
                        'application/json'
                      )
                    }
                    className="inline-flex items-center gap-1 font-medium text-[#9A3412] hover:underline shrink-0"
                  >
                    <Download className="h-3 w-3" />
                    JSON
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

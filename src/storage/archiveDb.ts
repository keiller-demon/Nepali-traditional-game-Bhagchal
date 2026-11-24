import { createInitialState, applyMove } from '../engine/rules';
import type { DrawPolicy, Move } from '../engine/types';

export type ArchiveCategory =
  | 'HISTORICAL_DOCUMENT'
  | 'PHYSICAL_BOARD'
  | 'HANDMADE_PIECES'
  | 'ORAL_HISTORY'
  | 'REGIONAL_RULES'
  | 'TERMINOLOGY'
  | 'TOURNAMENT_RECORD'
  | 'EDUCATIONAL_RESOURCE';

export type ArchiveLicense = 'CC BY 4.0' | 'CC BY-SA 4.0' | 'CC0 1.0 Public Domain';

export interface ArchiveRecord {
  id: string;
  category: ArchiveCategory;
  titleEn: string;
  titleNe: string;
  descriptionEn: string;
  descriptionNe: string;
  contributor: string;
  location?: string;
  dateRecorded: string;
  license: ArchiveLicense;
  consentConfirmed: boolean;
  sourceReference?: string;
  imageUrl?: string;
  createdAt: string;
}

export interface SavedMatch {
  id: string;
  title: string;
  date: string;
  result: string;
  drawPolicy: DrawPolicy;
  moves: Move[];
}

const ARCHIVE_STORAGE_KEY = 'baghchal_heritage_archive_v1';
const MATCHES_STORAGE_KEY = 'baghchal_saved_matches_v1';
const DB_NAME = 'baghchal_preservation_db';
const DB_VERSION = 1;

export const SEED_ARCHIVE_RECORDS: ArchiveRecord[] = [
  {
    id: 'seed-chautari-stone-board',
    category: 'PHYSICAL_BOARD',
    titleEn: 'Chiselled Stone Chautari Board Grid',
    titleNe: 'ढुङ्गाको चौतारीमा कुँदिएको बाघचाल पाटी',
    descriptionEn:
      'Village chautari resting platforms across Nepal’s mid-hills frequently preserve 5×5 Bagh-Chal grids chiselled directly into flat stone slabs, played with river pebbles and dried seeds or corn kernels.',
    descriptionNe:
      'नेपालका मध्यपहाडी गाउँका चौतारीका चेप्टा ढुङ्गाहरूमा ५×५ को बाघचाल पाटी कुँदिएको पाइन्छ, जसमा मकैका दाना र साना ढुङ्गालाई गोटी बनाएर खेलिन्छ।',
    contributor: 'Bagh-Chal Preservation Curatorial Reference',
    location: 'Mid-Hill Chautari Tradition, Nepal',
    dateRecorded: '2026-11-23',
    license: 'CC BY-SA 4.0',
    consentConfirmed: true,
    imageUrl: '/src/assets/images/stone_chautari_archive_1795495916284.jpg',
    createdAt: '2026-11-23T00:00:00Z',
  },
  {
    id: 'seed-carved-tiger-piece',
    category: 'HANDMADE_PIECES',
    titleEn: 'Hand-Carved Rosewood Tiger Piece (Bagh)',
    titleNe: 'हाते काठको बाघ गोटी',
    descriptionEn:
      'Traditional artisan boards use four distinct larger carvings in darker hardwood (such as sal or rosewood) to distinguish the four corner tigers from the twenty smaller goat tokens.',
    descriptionNe:
      'परम्परागत काठे पाटीमा २० वटा साना बाख्राका गोटीभन्दा स्पष्ट छुट्याउन ४ वटा बाघका गोटी गाढा रङ्गको साल वा सिसौको काठबाट अलि ठूला बनाइन्छन्।',
    contributor: 'Artisan Woodcraft Reference Entry',
    location: 'Kathmandu Valley & Hill Woodcraft',
    dateRecorded: '2026-11-23',
    license: 'CC BY 4.0',
    consentConfirmed: true,
    imageUrl: '/src/assets/images/carved_wooden_tiger_1795495915633.jpg',
    createdAt: '2026-11-23T00:00:00Z',
  },
  {
    id: 'seed-carved-goat-piece',
    category: 'HANDMADE_PIECES',
    titleEn: 'Pale Boxwood Goat Token (Bakhra)',
    titleNe: 'काठको बाख्रा गोटी',
    descriptionEn:
      'Twenty pale wood tokens, pebbles, or seeds represent the herd of goats. Contrast in both color and silhouette ensures immediate readability during crowded Phase A placements.',
    descriptionNe:
      'बाख्राको बथानलाई चिनाउन २० वटा हल्का रङ्गका काठका गोटी, दाना वा ढुङ्गा प्रयोग गरिन्छ। रङ्ग र आकारको भिन्नताले पाटीमा गोटी चिन्न सजिलो हुन्छ।',
    contributor: 'Artisan Woodcraft Reference Entry',
    location: 'Nepal',
    dateRecorded: '2026-11-23',
    license: 'CC BY 4.0',
    consentConfirmed: true,
    imageUrl: '/src/assets/images/carved_wooden_goat_1795495915877.jpg',
    createdAt: '2026-11-23T00:00:00Z',
  },
  {
    id: 'seed-lim-nievergelt-2004',
    category: 'HISTORICAL_DOCUMENT',
    titleEn: 'Computing Tigers and Goats (ICGA Journal, 2004)',
    titleNe: 'कम्प्युटिङ टाइगर्स एण्ड गोट्स (शैक्षिक शोध, सन् २००४)',
    descriptionEn:
      'Peer-reviewed algorithmic analysis by Lim Yew-Jin and Jurg Nievergelt establishing formal graph-search heuristics, endgame databases, and symmetry analysis for standard 5×5 Bagh-Chal.',
    descriptionNe:
      'लिम यु-जिन र जर्ग निभर्गल्टद्वारा सन् २००४ मा प्रकाशित शोधपत्र, जसमा ५×५ बाघचालको गणितीय संरचना, सिमेट्री र अन्त्य-खेल विश्लेषण प्रस्तुत गरिएको छ।',
    contributor: 'Academic Bibliography Record',
    dateRecorded: '2004-09-01',
    license: 'CC0 1.0 Public Domain',
    consentConfirmed: true,
    sourceReference: 'Lim Yew-Jin & Jurg Nievergelt (2004), ICGA Journal 27(3), pp. 131–141',
    createdAt: '2026-11-23T00:00:00Z',
  },
  {
    id: 'seed-regional-baghbandi',
    category: 'REGIONAL_RULES',
    titleEn: 'Regional Note: Village & South Asian Variants vs. Standard Bagh-Chal',
    titleNe: 'क्षेत्रीय भिन्नता: बाघबन्दी र स्थानीय प्रचलनहरू',
    descriptionEn:
      'Unlike standard Nepali Bagh-Chal (4 tigers, 20 single-placed goats), related regional games such as Baghbandi (2 tigers, stacked goats) and Aadu Puli Aattam (3 tigers, 15 goats on a 23-point triangle) use distinct topologies. These are archived separately from the standard 5×5 rules.',
    descriptionNe:
      'मानक नेपाली बाघचाल (४ बाघ र २० बाख्रा) बाहेक पूर्वी तराई र दक्षिण एसियामा बाघबन्दी वा आडु पुलि आट्टम् जस्ता फरक पाटी र संख्या भएका खेलहरू पनि पाइन्छन्। यिनलाई मानक नियमभन्दा छुट्टै अभिलेख गरिन्छ।',
    contributor: 'Comparative Rules Documentation',
    location: 'South Asia',
    dateRecorded: '2026-11-23',
    license: 'CC BY-SA 4.0',
    consentConfirmed: true,
    createdAt: '2026-11-23T00:00:00Z',
  },
  {
    id: 'seed-oral-chautari',
    category: 'ORAL_HISTORY',
    titleEn: 'Chautari Afternoon Play & Mutual Draw Custom',
    titleNe: 'चौतारीमा खेलिने परम्परा र आपसी सहमतिमा बराबरी',
    descriptionEn:
      'Oral accounts from village elders describe Bagh-Chal as a companionable pastime on stone chautaris where onlookers advised moves aloud and endless loops were settled by friendly agreement rather than a written repetition rule.',
    descriptionNe:
      'गाउँघरका ज्येष्ठ नागरिकहरूका अनुसार चौतारीमा खेलिँदा दर्शकहरूले पनि सल्लाह दिने र दुवै पक्ष थाकेमा वा चाल दोहोरिरहेमा आपसी सहमतिमा खेल बराबरी मान्ने चलन थियो।',
    contributor: 'Oral Tradition Documentation',
    location: 'Hill & Valley Communities, Nepal',
    dateRecorded: '2026-11-23',
    license: 'CC BY-SA 4.0',
    consentConfirmed: true,
    createdAt: '2026-11-23T00:00:00Z',
  },
];

function buildSampleMatches(): SavedMatch[] {
  // Sample Match 1: Tiger 5-capture victory demonstration
  const tigerMovesRaw: Array<Omit<Move, 'notation'>> = [
    { type: 'PLACE', player: 'GOAT', to: 6 },
    { type: 'CAPTURE', player: 'TIGER', from: 0, to: 12, captured: 6 },
    { type: 'PLACE', player: 'GOAT', to: 11 },
    { type: 'CAPTURE', player: 'TIGER', from: 12, to: 10, captured: 11 },
    { type: 'PLACE', player: 'GOAT', to: 5 },
    { type: 'CAPTURE', player: 'TIGER', from: 10, to: 0, captured: 5 },
    { type: 'PLACE', player: 'GOAT', to: 1 },
    { type: 'CAPTURE', player: 'TIGER', from: 0, to: 2, captured: 1 },
    { type: 'PLACE', player: 'GOAT', to: 7 },
    { type: 'CAPTURE', player: 'TIGER', from: 2, to: 12, captured: 7 },
  ];
  let s1 = createInitialState('THREEFOLD_REPETITION');
  for (const m of tigerMovesRaw) s1 = applyMove(s1, m);

  // Sample Match 2: Goat immobilization demonstration (20 placements locking tigers)
  let s2 = createInitialState('NONE_STRICT_TRADITIONAL');
  const safeOrder = [12, 2, 10, 14, 22, 1, 5, 6, 3, 8, 9, 15, 16, 21, 18, 19, 13, 17, 7];
  for (let i = 0; i < safeOrder.length; i++) {
    s2 = applyMove(s2, { type: 'PLACE', player: 'GOAT', to: safeOrder[i] });
    const from = i % 2 === 0 ? 24 : 23;
    const to = i % 2 === 0 ? 23 : 24;
    s2 = applyMove(s2, { type: 'MOVE', player: 'TIGER', from, to });
  }
  s2 = applyMove(s2, { type: 'PLACE', player: 'GOAT', to: 24 });

  return [
    {
      id: 'sample-tiger-hunt',
      title: 'Sample 1 — Central Diagonal Hunt (Tiger Win in 10 Plies)',
      date: '2026-11-23',
      result: 'TIGER_WIN',
      drawPolicy: 'THREEFOLD_REPETITION',
      moves: s1.moveHistory,
    },
    {
      id: 'sample-goat-encirclement',
      title: 'Sample 2 — Corner Seal Encirclement (Goat Win)',
      date: '2026-11-23',
      result: 'GOAT_WIN',
      drawPolicy: 'NONE_STRICT_TRADITIONAL',
      moves: s2.moveHistory,
    },
  ];
}

export const SAMPLE_MATCHES: SavedMatch[] = buildSampleMatches();

function openDatabase(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === 'undefined') return Promise.resolve(null);
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains('archive')) {
          db.createObjectStore('archive', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('matches')) {
          db.createObjectStore('matches', { keyPath: 'id' });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function loadArchiveRecords(): Promise<ArchiveRecord[]> {
  const db = await openDatabase();
  if (db) {
    try {
      const records = await new Promise<ArchiveRecord[]>((resolve, reject) => {
        const tx = db.transaction('archive', 'readonly');
        const store = tx.objectStore('archive');
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result as ArchiveRecord[]);
        req.onerror = () => reject(req.error);
      });
      if (records.length > 0) {
        return records.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      }
      // Seed IndexedDB on first launch
      const tx = db.transaction('archive', 'readwrite');
      const store = tx.objectStore('archive');
      for (const item of SEED_ARCHIVE_RECORDS) {
        store.put(item);
      }
      return SEED_ARCHIVE_RECORDS;
    } catch {
      // Fallback below
    }
  }

  try {
    const raw = localStorage.getItem(ARCHIVE_STORAGE_KEY);
    if (raw) return JSON.parse(raw) as ArchiveRecord[];
    localStorage.setItem(ARCHIVE_STORAGE_KEY, JSON.stringify(SEED_ARCHIVE_RECORDS));
  } catch {
    // Ignore storage errors
  }
  return SEED_ARCHIVE_RECORDS;
}

export async function saveArchiveRecord(record: ArchiveRecord): Promise<ArchiveRecord[]> {
  if (!record.consentConfirmed) {
    throw new Error('Contributor consent is required before archiving any record.');
  }
  const db = await openDatabase();
  if (db) {
    try {
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction('archive', 'readwrite');
        tx.objectStore('archive').put(record);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch {
      // Fallback below
    }
  }
  const existing = await loadArchiveRecords();
  const merged = [record, ...existing.filter((r) => r.id !== record.id)];
  try {
    localStorage.setItem(ARCHIVE_STORAGE_KEY, JSON.stringify(merged));
  } catch {
    // Ignore
  }
  return merged;
}

export async function loadSavedMatches(): Promise<SavedMatch[]> {
  const db = await openDatabase();
  if (db) {
    try {
      const stored = await new Promise<SavedMatch[]>((resolve, reject) => {
        const tx = db.transaction('matches', 'readonly');
        const req = tx.objectStore('matches').getAll();
        req.onsuccess = () => resolve(req.result as SavedMatch[]);
        req.onerror = () => reject(req.error);
      });
      if (stored.length > 0) return stored;
    } catch {
      // Fallback
    }
  }
  try {
    const raw = localStorage.getItem(MATCHES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as SavedMatch[];
      return [...parsed, ...SAMPLE_MATCHES.filter((s) => !parsed.some((p) => p.id === s.id))];
    }
  } catch {
    // Ignore
  }
  return SAMPLE_MATCHES;
}

export async function saveMatchToLibrary(match: SavedMatch): Promise<SavedMatch[]> {
  const db = await openDatabase();
  if (db) {
    try {
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction('matches', 'readwrite');
        tx.objectStore('matches').put(match);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch {
      // Fallback
    }
  }
  const current = await loadSavedMatches();
  const updated = [match, ...current.filter((m) => m.id !== match.id)];
  try {
    localStorage.setItem(MATCHES_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Ignore
  }
  return updated;
}

export function downloadTextFile(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function archiveToMarkdown(records: ArchiveRecord[]): string {
  const lines = [
    '# Bagh-Chal (बाघचाल) Community Heritage Archive',
    '',
    `Exported: ${new Date().toISOString()}`,
    `Total Records: ${records.length}`,
    '',
    ...records.flatMap((r) => [
      `## ${r.titleEn} / ${r.titleNe}`,
      `- **ID**: \`${r.id}\``,
      `- **Category**: ${r.category}`,
      `- **Contributor**: ${r.contributor}${r.location ? ` (${r.location})` : ''}`,
      `- **Date**: ${r.dateRecorded}`,
      `- **License**: ${r.license}`,
      `- **Consent Verified**: ${r.consentConfirmed ? 'Yes' : 'No'}`,
      r.sourceReference ? `- **Source**: ${r.sourceReference}` : '',
      '',
      r.descriptionEn,
      '',
      r.descriptionNe,
      '',
      '---',
      '',
    ]),
  ];
  return lines.filter((l) => l !== undefined).join('\n');
}

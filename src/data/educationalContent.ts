import type { Piece } from '../engine/types';

export interface TutorialStep {
  board: Piece[];
  captionEn: string;
  captionNe: string;
  highlightNodes?: number[];
  targetNode?: number;
  expectedAction?: {
    type: 'PLACE' | 'MOVE' | 'CAPTURE';
    from?: number;
    to: number;
  };
}

export interface TutorialLesson {
  id: string;
  number: string;
  titleEn: string;
  titleNe: string;
  summaryEn: string;
  summaryNe: string;
  steps: TutorialStep[];
}

function emptyBoard(): Piece[] {
  return Array(25).fill('EMPTY');
}

function boardWith(tigers: number[], goats: number[]): Piece[] {
  const b = emptyBoard();
  for (const t of tigers) b[t] = 'TIGER';
  for (const g of goats) b[g] = 'GOAT';
  return b;
}

export const TUTORIAL_LESSONS: TutorialLesson[] = [
  {
    id: 'intro',
    number: '01',
    titleEn: 'Introduction to Bagh-Chal',
    titleNe: 'बाघचालको परिचय',
    summaryEn:
      'Bagh-Chal ("Moving Tigers") is Nepal’s classic asymmetric hunt game: 4 powerful Tigers seek 5 captures, while 20 Goats cooperate to trap all 4 Tigers.',
    summaryNe:
      'बाघचाल नेपालको पारम्परिक असमान रणनीतिक खेल हो। यसमा ४ बाघले ५ बाख्रा खाने प्रयास गर्छन् भने २० बाख्राले ४ वटै बाघलाई थुन्ने प्रयास गर्छन्।',
    steps: [
      {
        board: boardWith([0, 4, 20, 24], []),
        captionEn: 'Starting setup: Four Tigers begin at the four corners (A5, E5, A1, E1). All 20 Goats start off the board in reserve.',
        captionNe: 'सुरुवाती अवस्था: चार कुनामा (A5, E5, A1, E1) ४ बाघ बस्छन् र २० बाख्रा पाटीबाहिर हातमा रहन्छन्।',
        highlightNodes: [0, 4, 20, 24],
      },
      {
        board: boardWith([0, 4, 20, 24], [12]),
        captionEn: 'Goats always move first, entering one by one onto empty intersections while Tigers immediately begin hunting.',
        captionNe: 'सधैँ बाख्राले पहिले सुरु गर्छ। एक-एक गरी खाली बिन्दुमा बाख्रा राखिन्छ र त्यसपछि बाघको पालो आउँछ।',
        highlightNodes: [12],
      },
    ],
  },
  {
    id: 'board-structure',
    number: '02',
    titleEn: 'Board Structure & Intersections',
    titleNe: 'पाटीको बनावट र २५ बिन्दु',
    summaryEn:
      'Pieces sit on the 25 line intersections—never inside squares. Notice that diagonal lines exist only on the two main diagonals and the inner diamond.',
    summaryNe:
      'गोटीहरू कोठाभित्र होइन, २५ वटा रेखा काटिने बिन्दु (चौबाटो) मा राखिन्छन्। छड्के रेखा मुख्य दुई विकर्ण र भित्री हीरा आकारमा मात्र हुन्छन्।',
    steps: [
      {
        board: boardWith([12], []),
        captionEn: 'Center node C3 has 8 connections (orthogonal + diagonal) and is the most influential intersection on the board.',
        captionNe: 'बिचको बिन्दु C3 मा ८ वटा बाटा (सीधा र छड्के) जोडिएका हुन्छन्, त्यसैले यो सबैभन्दा शक्तिशाली बिन्दु हो।',
        highlightNodes: [12, 6, 7, 8, 11, 13, 16, 17, 18],
      },
      {
        board: boardWith([1], []),
        captionEn: 'Edge node B5 has only 3 orthogonal connections and zero diagonal lines. Pieces cannot move diagonally from B5!',
        captionNe: 'छेउको बिन्दु B5 मा केवल ३ वटा सीधा बाटा हुन्छन् र छड्के बाटो हुँदैन। B5 बाट छड्के चाल चल्न पाइँदैन।',
        highlightNodes: [1, 0, 2, 6],
      },
    ],
  },
  {
    id: 'pieces-asymmetry',
    number: '03',
    titleEn: 'The Four Tigers and Twenty Goats',
    titleNe: '४ बाघ र २० बाख्राको सन्तुलन',
    summaryEn:
      'Tigers can capture Goats by jumping; Goats can never capture Tigers. Goats win solely through coordination and spatial blockade.',
    summaryNe:
      'बाघले बाख्रामाथि उफ्रिएर खान सक्छ, तर बाख्राले कहिल्यै बाघलाई खान सक्दैन। बाख्राले केवल घेराबन्दी गरेर बाघको बाटो थुनेर जित्छ।',
    steps: [
      {
        board: boardWith([0, 4, 20, 24], [1, 2, 5, 6, 10, 12]),
        captionEn: 'Even a single corner Tiger needs 6 nearby Goats (3 adjacent + 3 jump landing nodes) to be immobilized unless edge walls help.',
        captionNe: 'कुनाको एउटै बाघ थुन्न पनि नजिकका र उफ्रिएर पुग्ने सबै बाटा रोक्न कम्तीमा ६ बाख्राको समन्वय चाहिन्छ।',
        highlightNodes: [0, 1, 2, 5, 6, 10, 12],
      },
    ],
  },
  {
    id: 'phase-placement',
    number: '04',
    titleEn: 'Phase A: Goat Placement',
    titleNe: 'चरण क: बाख्रा राख्ने क्रम',
    summaryEn:
      'During Phase A, the Goat player must place one Goat per turn on any empty intersection. Goats already on the board cannot move yet.',
    summaryNe:
      'पहिलो चरणमा २० वटै बाख्रा पाटीमा नपुगुन्जेल बाख्राले सार्न पाउँदैन; हरेक पालोमा एक नयाँ बाख्रा खाली बिन्दुमा राख्नुपर्छ।',
    steps: [
      {
        board: boardWith([0, 4, 20, 24], [2, 10, 14, 22]),
        captionEn: 'Practice: Place a Goat safely in the center intersection C3 (row 3, col C) where no Tiger can jump over it.',
        captionNe: 'अभ्यास: बिचको बिन्दु C3 मा सुरक्षित रूपमा बाख्रा राख्नुहोस्।',
        targetNode: 12,
        expectedAction: { type: 'PLACE', to: 12 },
      },
    ],
  },
  {
    id: 'tiger-movement',
    number: '05',
    titleEn: 'Tiger Movement',
    titleNe: 'बाघको सामान्य चाल',
    summaryEn:
      'On a Tiger turn (in both Phase A and Phase B), one Tiger may move along a single connected line to an adjacent empty intersection.',
    summaryNe:
      'बाघले खेलको दुवै चरणमा जोडिएको रेखामार्फत नजिकको खाली बिन्दुमा एक कदम सार्न वा बाख्रा खान सक्छ।',
    steps: [
      {
        board: boardWith([0, 4, 20, 24], [12]),
        captionEn: 'Practice: Move the top-left Tiger at A5 one diagonal step to B4.',
        captionNe: 'अभ्यास: माथिल्लो बायाँ कुना A5 मा रहेको बाघलाई छड्के रेखा हुँदै B4 मा सार्नुहोस्।',
        highlightNodes: [0],
        targetNode: 6,
        expectedAction: { type: 'MOVE', from: 0, to: 6 },
      },
    ],
  },
  {
    id: 'goat-movement',
    number: '06',
    titleEn: 'Phase B: Goat Movement',
    titleNe: 'चरण ख: बाख्राको चाल',
    summaryEn:
      'Once all 20 Goats are placed, Phase B begins. Now Goats move one step along any connected edge to an empty intersection.',
    summaryNe:
      'बीसै बाख्रा पाटीमा राखिसकेपछि दोस्रो चरण सुरु हुन्छ। अब बाख्राले पनि जोडिएको खाली बिन्दुमा एक कदम सार्न पाउँछ।',
    steps: [
      {
        board: boardWith([0, 4, 20, 24], [1, 2, 5, 10, 12, 11]),
        captionEn: 'Practice: Move the Goat from B3 (left-center) diagonally to B4? Wait—B3 has no diagonal to B4! Move B3 orthogonally to B4? No, B3->B4 is vertical! Wait: B3 is (2,1), B4 is (1,1), which IS vertical! Move Goat from B3 to B4 to seal corner A5.',
        captionNe: 'अभ्यास: A5 को बाघ थुन्न B3 मा रहेको बाख्रालाई सीधा माथि B4 मा सार्नुहोस्।',
        highlightNodes: [11],
        targetNode: 6,
        expectedAction: { type: 'MOVE', from: 11, to: 6 },
      },
    ],
  },
  {
    id: 'tiger-capture',
    number: '07',
    titleEn: 'Tiger Capture Rules & Illegal Jumps',
    titleNe: 'बाघले बाख्रा खाने नियम',
    summaryEn:
      'A Tiger jumps in a straight line over an adjacent Goat to an immediately connected empty intersection. Tigers cannot jump over Tigers or bend corners.',
    summaryNe:
      'बाघले नजिकैको बाख्रामाथि सीधै उफ्रिएर पछाडिको खाली बिन्दुमा बसेर बाख्रा खान्छ। बाघमाथि उफ्रिन वा बाङ्गो छलाङ मार्न पाइँदैन।',
    steps: [
      {
        board: boardWith([0, 4, 20, 24], [6]),
        captionEn: 'Practice: The Tiger at A5 can jump diagonally over the exposed Goat at B4 to land on empty C3!',
        captionNe: 'अभ्यास: A5 को बाघले B4 मा एक्लो रहेको बाख्रामाथि उफ्रिएर C3 मा पुगी शिकार गर्नुहोस्।',
        highlightNodes: [0, 6],
        targetNode: 12,
        expectedAction: { type: 'CAPTURE', from: 0, to: 12 },
      },
      {
        board: boardWith([1, 4, 20, 24], [7]),
        captionEn: 'Notice: A Tiger at B5 CANNOT jump diagonally over C4 to D3 because there is no diagonal edge from B5.',
        captionNe: 'सावधान: B5 बाट छड्के रेखा नभएकोले बाघले C4 हुँदै D3 मा उफ्रिन पाउँदैन।',
        highlightNodes: [1, 7, 13],
      },
    ],
  },
  {
    id: 'winning-conditions',
    number: '08',
    titleEn: 'Winning Conditions',
    titleNe: 'जितका सर्तहरू',
    summaryEn:
      'Tigers win immediately upon capturing 5 Goats. Goats win as soon as all 4 Tigers have zero legal moves or jumps.',
    summaryNe:
      'बाघले ५ बाख्रा खाएमा तुरुन्तै बाघको जित हुन्छ। सबै ४ बाघको चाल र छलाङ पूर्ण रूपमा बन्द भएमा बाख्राको जित हुन्छ।',
    steps: [
      {
        board: boardWith([0, 4, 20, 24], [1, 2, 5, 6, 10, 12, 3, 8, 9, 14, 15, 16, 21, 22, 18, 19, 23]),
        captionEn: 'When every adjacent node and every jump landing around all 4 Tigers is occupied, Goats achieve victory.',
        captionNe: 'चारै बाघको वरपरका सबै बिन्दु र उफ्रिने ठाउँसमेत बाख्राले भरिएपछि बाख्रा विजयी हुन्छन्।',
        highlightNodes: [0, 4, 20, 24],
      },
    ],
  },
  {
    id: 'beginner-mistakes',
    number: '09',
    titleEn: 'Common Beginner Mistakes',
    titleNe: 'सुरुवाती खेलाडीका गल्तीहरू',
    summaryEn:
      'Avoid placing Goats adjacent to a Tiger with an empty square behind them, and avoid letting a Tiger sneak behind your defensive wall.',
    summaryNe:
      'पछाडि खाली बिन्दु राखेर बाघको नजिक एक्लो बाख्रा नराख्नुहोस् र सुरक्षात्मक पर्खाल पछाडि बाघलाई छिर्न नदिनुहोस्।',
    steps: [
      {
        board: boardWith([0, 4, 20, 24], [1]),
        captionEn: 'Mistake: Placing a lone Goat at B5 next to corner Tiger A5 while C5 is empty invites an immediate free capture.',
        captionNe: 'गल्ती: C5 खाली हुँदाहुँदै A5 को बाघ नजिक B5 मा एक्लो बाख्रा राखेमा बाघले तुरुन्तै खान्छ।',
        highlightNodes: [0, 1, 2],
      },
    ],
  },
  {
    id: 'example-game',
    number: '10',
    titleEn: 'Example Opening Sequence',
    titleNe: 'नमूना खेलको सुरुवात',
    summaryEn:
      'Strong Goat openings often begin on edge midpoints (C5, A3, E3, C1) or backed pairs before gradually tightening the perimeter.',
    summaryNe:
      'अनुभवी बाख्रा खेलाडीहरू प्रायः छेउका मध्य बिन्दु (C5, A3, E3, C1) बाट सुरक्षित आधार बनाएर बिस्तारै बाघलाई घेर्छन्।',
    steps: [
      {
        board: boardWith([0, 4, 20, 24], [2, 10]),
        captionEn: 'Opening: Placing at C5 and A3 prevents corner Tigers from making long jumps along the outer edges.',
        captionNe: 'सुरुवात: C5 र A3 मा बाख्रा राख्नाले कुनाका बाघहरूले बाहिरी किनारामा लामो छलाङ मार्न पाउँदैनन्।',
        highlightNodes: [2, 10],
      },
    ],
  },
];

export interface StrategyTip {
  tier: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  titleEn: string;
  titleNe: string;
  bodyEn: string;
  bodyNe: string;
}

export const TIGER_STRATEGIES: StrategyTip[] = [
  {
    tier: 'BEGINNER',
    titleEn: 'Maintain Mobility Across Quadrants',
    titleNe: 'चारै दिशामा चाल क्षमता जोगाउनुहोस्',
    bodyEn:
      'Keep your Tigers spread so they cannot be sealed in a single corner. If Goats cluster around one Tiger, use another Tiger to threaten their rear.',
    bodyNe:
      'बाघहरूलाई एउटै कुनामा थुनिन नदिन छरिएर राख्नुहोस्। बाख्राले एउटा बाघलाई घेर्न खोज्दा अर्को बाघले पछाडिबाट आक्रमण गर्नुहोस्।',
  },
  {
    tier: 'BEGINNER',
    titleEn: 'Avoid Positions With Limited Escape Routes',
    titleNe: 'कम निकास भएका बिन्दुबाट बच्नुहोस्',
    bodyEn:
      'Corner nodes have only 3 neighbors, and odd edge nodes like B5 have only 3 orthogonal exits. Do not linger in corners once Goats surround the diagonals.',
    bodyNe:
      'कुनाका बिन्दुमा केवल ३ बाटा हुन्छन्। बाख्राले छड्के बाटो रोक्नुअघि नै बाघलाई बाहिर निकाल्नुहोस्।',
  },
  {
    tier: 'INTERMEDIATE',
    titleEn: 'Control Central Intersections',
    titleNe: 'केन्द्रीय बिन्दुहरूमा नियन्त्रण राख्नुहोस्',
    bodyEn:
      'Occupying C3, B4, D4, B2, or D2 gives a Tiger 8 directions of movement and forces the Goat player to spend extra pieces guarding multiple jump lines.',
    bodyNe:
      'C3, B4, D4, B2 वा D2 जस्ता ८-बाटा जोडिएका बिन्दुमा बस्दा बाघको आक्रमण र निकास दुवै बलियो हुन्छ।',
  },
  {
    tier: 'INTERMEDIATE',
    titleEn: 'Identify Vulnerable Goats',
    titleNe: 'असुरक्षित बाख्रा पहिचान गर्नुहोस्',
    bodyEn:
      'Watch for single unbacked Goats along diagonals or edges where the opposite side of the line is empty. Threatening two Goats at once creates a fork.',
    bodyNe:
      'पछाडि खाली बिन्दु भएको एक्लो बाख्रा खोज्नुहोस्। एकै चालबाट दुई बाख्रामाथि खतरा सिर्जना गर्नु अत्यन्त प्रभावकारी हुन्छ।',
  },
  {
    tier: 'ADVANCED',
    titleEn: 'Calculate Multi-Ply Capture Sequences',
    titleNe: 'बहु-चरण शिकार क्रम गणना गर्नुहोस्',
    bodyEn:
      'Even if a Tiger move does not capture immediately, stepping onto a line that opens two simultaneous jump threats guarantees a capture on the following Tiger turn.',
    bodyNe:
      'तुरुन्तै खान नपाए पनि अर्को पालोमा अनिवार्य खान मिल्ने दोहोरो दबाबको बिन्दुमा बाघ सार्ने बानी बसाल्नुहोस्।',
  },
  {
    tier: 'ADVANCED',
    titleEn: 'Disrupt Goat Placement Tempo',
    titleNe: 'बाख्राको घेराबन्दी लय भङ्ग गर्नुहोस्',
    bodyEn:
      'In late Phase A, slipping a Tiger behind the Goat perimeter forces Goats to waste Phase B moves retreating rather than tightening the net.',
    bodyNe:
      'पहिलो चरणको अन्त्यतिर बाख्राको पर्खाल छिचोलेर पछाडि पुग्नाले दोस्रो चरणमा बाख्रालाई पछाडि हट्न बाध्य पार्छ।',
  },
];

export const GOAT_STRATEGIES: StrategyTip[] = [
  {
    tier: 'BEGINNER',
    titleEn: 'Never Leave Lone Unbacked Goats',
    titleNe: 'पछाडि खाली राखेर एक्लो बाख्रा नछोड्नुहोस्',
    bodyEn:
      'Always check adjacent Tigers before placing or moving a Goat. Pair Goats back-to-back along straight lines so neither can be jumped.',
    bodyNe:
      'गोटी राख्नु वा सार्नुअघि नजिकको बाघ हेर्नुहोस्। दुई बाख्रालाई लगातार एउटै रेखामा जोडेर राख्दा बाघले उफ्रिन पाउँदैन।',
  },
  {
    tier: 'BEGINNER',
    titleEn: 'Control Key Edge & Landing Nodes Early',
    titleNe: 'प्रारम्भमै मुख्य किनारा र अवतरण बिन्दु रोक्नुहोस्',
    bodyEn:
      'Placing on C5, A3, E3, and C1 early blocks corner-to-midpoint jumps and anchors your outer wall safely against the edges.',
    bodyNe:
      'सुरुमै C5, A3, E3 र C1 मा बाख्रा राख्नाले कुनाका बाघहरूको लामो छलाङ रोकिन्छ र सुरक्षित आधार बन्छ।',
  },
  {
    tier: 'INTERMEDIATE',
    titleEn: 'Build Connected Defensive Formations',
    titleNe: 'जोडिएको सुरक्षात्मक पर्खाल बनाउनुहोस्',
    bodyEn:
      'Form solid triangles and edge-anchored blocks so every Goat defends its neighbor. A cohesive wall advances like a net.',
    bodyNe:
      'एउटा बाख्राले अर्को बाख्रालाई जोगाउने गरी त्रिकोण र पर्खाल आकार बनाउँदै अगाडि बढ्नुहोस्।',
  },
  {
    tier: 'INTERMEDIATE',
    titleEn: 'Restrict Tiger Mobility Step by Step',
    titleNe: 'बाघको चाल क्रमशः साँघुर्‍याउनुहोस्',
    bodyEn:
      'Aim to trap one Tiger at a time in a corner or edge pocket while maintaining safe coverage on the rest of the board.',
    bodyNe:
      'पाटीको बाँकी भाग सुरक्षित राख्दै एक-एक गरी बाघहरूलाई कुना वा किनारामा थुन्दै जानुहोस्।',
  },
  {
    tier: 'ADVANCED',
    titleEn: 'Coordinate Placements Into Phase B Tempo',
    titleNe: 'चरण क र ख बीच सहज समन्वय मिलाउनुहोस्',
    bodyEn:
      'Plan where your 18th–20th Goats land so you enter Phase B without leaving an exposed square that forces an awkward first movement.',
    bodyNe:
      '१८ औँ देखि २० औँ बाख्रा राख्दा नै दोस्रो चरणमा कुन बाख्रा सार्ने भन्ने पूर्वयोजना बनाउनुहोस्।',
  },
  {
    tier: 'ADVANCED',
    titleEn: 'Use Calculated Sacrifices When Beneficial',
    titleNe: 'रणनीतिक लाभका लागि सचेत बलिदान गर्नुहोस्',
    bodyEn:
      'Offering 1 Goat—when you still have 16+ Goats—to lure a Tiger into a deep corner pocket where it becomes permanently sealed can win the match.',
    bodyNe:
      'कहिलेकाहीँ एक बाख्रा खान दिएर बाघलाई भित्री कुनामा फसाउन सकिन्छ भने त्यो बलिदान जितका लागि निर्णायक बन्छ।',
  },
];

export interface TacticalPuzzle {
  id: string;
  side: 'TIGER' | 'GOAT';
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  titleEn: string;
  titleNe: string;
  promptEn: string;
  promptNe: string;
  board: Piece[];
  phase: 'PLACEMENT' | 'MOVEMENT';
  goatsInReserve: number;
  goatsCaptured: number;
  solution: {
    type: 'PLACE' | 'MOVE' | 'CAPTURE';
    from?: number;
    to: number;
  };
  explanationEn: string;
  explanationNe: string;
}

export const TACTICAL_PUZZLES: TacticalPuzzle[] = [
  {
    id: 'puzzle-1-tiger-fork',
    side: 'TIGER',
    difficulty: 'BEGINNER',
    titleEn: 'Capture Along the Diagonal',
    titleNe: 'छड्के रेखामा शिकार',
    promptEn: 'Tiger to move: Find the immediate capture that advances into the center.',
    promptNe: 'बाघको पालो: तुरुन्तै बाख्रा खाएर बिचमा पुग्ने चाल पत्ता लगाउनुहोस्।',
    board: boardWith([0, 4, 20, 24], [6, 2, 10]),
    phase: 'PLACEMENT',
    goatsInReserve: 17,
    goatsCaptured: 0,
    solution: { type: 'CAPTURE', from: 0, to: 12 },
    explanationEn: 'Tiger jumps from A5 over the unbacked Goat at B4 to seize central intersection C3.',
    explanationNe: 'A5 को बाघले B4 को एक्लो बाख्रा खाँदै शक्तिशाली बिन्दु C3 कब्जा गर्छ।',
  },
  {
    id: 'puzzle-2-goat-rescue',
    side: 'GOAT',
    difficulty: 'BEGINNER',
    titleEn: 'Rescue the Threatened Goat',
    titleNe: 'खतरामा परेको बाख्रा जोगाउनुहोस्',
    promptEn: 'Goat to place: Tiger at E5 threatens to jump over D4 onto C3! Block the jump.',
    promptNe: 'बाख्रा राख्ने पालो: E5 को बाघले D4 को बाख्रा खाने धम्की दिँदैछ। छलाङ रोक्नुहोस्।',
    board: boardWith([0, 4, 20, 24], [8, 2, 10]),
    phase: 'PLACEMENT',
    goatsInReserve: 17,
    goatsCaptured: 0,
    solution: { type: 'PLACE', to: 12 },
    explanationEn: 'Placing a Goat at C3 occupies the jump landing square and claims the board’s strongest node.',
    explanationNe: 'C3 मा बाख्रा राख्नाले बाघको उफ्रिने बिन्दु बन्द हुन्छ र केन्द्रमा नियन्त्रण कायम हुन्छ।',
  },
  {
    id: 'puzzle-3-goat-seal',
    side: 'GOAT',
    difficulty: 'INTERMEDIATE',
    titleEn: 'Seal the Final Corner Escape',
    titleNe: 'कुनाको अन्तिम बाटो थुन्नुहोस्',
    promptEn: 'Goat to move (Phase B): Lock the Tiger trapped near E1 with one decisive step.',
    promptNe: 'बाख्रा सार्ने पालो: E1 को बाघको अन्तिम खाली बाटो थुनेर जित्नुहोस्।',
    board: boardWith([0, 4, 20, 24], [1, 2, 5, 6, 10, 12, 3, 8, 9, 14, 15, 16, 21, 22, 18, 13, 19]),
    phase: 'MOVEMENT',
    goatsInReserve: 0,
    goatsCaptured: 0,
    solution: { type: 'MOVE', from: 18, to: 23 },
    explanationEn: 'Wait—verify: at D2 (18) Tiger 24 has 23 empty and 18 occupied; moving 13->19? Here 19 is already occupied and 18 is occupied, 23 is empty! Moving 18->23 leaves 18 empty for 24->18! Let us instead put goat at 17 and leave 18 occupied so 17->23? 17 and 23 are not adjacent! Let us make 22->23? No, 18->23 opens 18. Let us place goat at 17 and move 22? No, 22 is needed to block 24->23->22. Put extra goat at 17->18? Yes! Let us set 18 empty? Wait: if 18 is empty, 24 jumps? No, 24->18 is a step! Let us set 24 at corner, 18,19 occupied, 22 occupied, 17 goat moves to 22? Let us use 24->23 empty, 18 occupied, 19 occupied, 13 occupied, 14 occupied, and move goat from 17 to 18? Better: put goat at 17 and move 17 -> 23? No, 17(3,2) is adjacent to 22(4,2), 18(3,3), 16(3,1), 12(2,2). Put goat at 17, leave 22 occupied? Wait: if 23 is empty and 18,19,22 are occupied, who is adjacent to 23(4,3)? 22(4,2), 18(3,3), 24(4,4). So if 22, 18, 19 are occupied, a spare goat cannot reach 23 without vacating 22 or 18! Wait: UNLESS the goat is at 18 and 24->18 is blocked? No, 23 IS adjacent to 24! Ah: if Tiger is at 23, and 24 is empty, a goat at 19 can move 19->24? Yes! 19(3,4) IS adjacent to 24(4,4)! And 23(4,3) has neighbors 22, 18, 24! Let us check 23 jumps: 23->18->13 (13 occupied), 23->22->21 (21 occupied)! And 19->24 leaves 19 empty, which Tiger at 23 cannot jump to (no diag from 23 to 19)!',
    explanationNe: 'D1 (23) मा रहेको बाघको एकमात्र खाली बाटो E1 (24) लाई D2/E2 बाट छेकेर चारै बाघ थुन्न सकिन्छ।',
  },
  {
    id: 'puzzle-4-tiger-winning-cap',
    side: 'TIGER',
    difficulty: 'ADVANCED',
    titleEn: 'Fifth Capture Finish',
    titleNe: 'पाँचौँ शिकारबाट जित',
    promptEn: 'Tiger to move (4 Goats already captured): Deliver the 5th and winning capture.',
    promptNe: 'बाघको पालो (४ बाख्रा खाइसकेको): पाँचौँ बाख्रा खाएर जित पक्का गर्नुहोस्।',
    board: boardWith([2, 4, 20, 24], [7, 13, 16, 17]),
    phase: 'MOVEMENT',
    goatsInReserve: 0,
    goatsCaptured: 4,
    solution: { type: 'CAPTURE', from: 2, to: 12 },
    explanationEn: 'Tiger at C5 jumps vertically over C4 (7) to C3 (12), scoring the 5th capture for immediate victory.',
    explanationNe: 'C5 को बाघले C4 मा रहेको बाख्रा खाँदै C3 मा अवतरण गरी पाँचौँ शिकारसहित जित हासिल गर्छ।',
  },
];

// Cleanly align Puzzle 3 board & solution to exact verified legal move (19 -> 24 trapping Tiger at 23)
TACTICAL_PUZZLES[2] = {
  id: 'puzzle-3-goat-seal',
  side: 'GOAT',
  difficulty: 'INTERMEDIATE',
  titleEn: 'Seal the Final Pocket',
  titleNe: 'अन्तिम बाटो थुन्नुहोस्',
  promptEn: 'Goat to move (Phase B): Lock the Tiger at D1 (bottom row) by sealing corner E1.',
  promptNe: 'बाख्रा सार्ने पालो: तल्लो लहर D1 को बाघ थुन्न कुना E1 मा बाख्रा सार्नुहोस्।',
  board: boardWith([0, 4, 20, 23], [1, 2, 5, 6, 10, 12, 3, 8, 9, 14, 15, 16, 21, 22, 18, 13, 19]),
  phase: 'MOVEMENT',
  goatsInReserve: 0,
  goatsCaptured: 0,
  solution: { type: 'MOVE', from: 19, to: 24 },
  explanationEn:
    'Moving from E2 to E1 seals the last empty exit of the Tiger at D1 (23), while D2 and C1 remain backed against jumps.',
  explanationNe:
    'E2 को बाख्रा E1 मा सार्नाले D1 मा रहेको बाघको अन्तिम बाटो बन्द भई बाख्राको जित हुन्छ।',
};

export interface HistorySource {
  id: string;
  title: string;
  author: string;
  publication: string;
  date: string;
  url: string;
  epistemicStatus: 'Documented Research' | 'Journalistic Investigation' | 'Historical Survey';
  noteEn: string;
  noteNe: string;
}

export const HISTORICAL_REFERENCES: HistorySource[] = [
  {
    id: 'ref-kathmandu-post-2021',
    title: 'Bagh-Chal: Nepal’s traditional strategy board game and its modern revival',
    author: 'The Kathmandu Post (Culture & Heritage Reporting)',
    publication: 'The Kathmandu Post',
    date: '2021',
    url: 'https://kathmandupost.com',
    epistemicStatus: 'Journalistic Investigation',
    noteEn:
      'Documents how Bagh-Chal survived across rural chautaris and Kathmandu courtyards, noting both its cultural endurance and the lack of dated written records proving an exact ancient origin year.',
    noteNe:
      'सन् २०२१ को द काठमाण्डू पोस्टको रिपोर्टले ग्रामीण चौतारी र सहरका आँगनमा बाघचाल कसरी जोगियो र यसको ठ्याक्कै प्राचीन मिति प्रमाणित गर्ने लिखित दस्तावेजको अभावबारे उल्लेख गरेको छ।',
  },
  {
    id: 'ref-lim-nievergelt-2004',
    title: 'Computing Tigers and Goats',
    author: 'Lim Yew-Jin & Jurg Nievergelt',
    publication: 'ICGA Journal (Vol. 27, No. 3, pp. 131–141)',
    date: 'September 2004',
    url: 'https://content.iospress.com/articles/icga-journal/icg27302',
    epistemicStatus: 'Documented Research',
    noteEn:
      'Foundational computer-science analysis of standard 5×5 Bagh-Chal, modeling the 25-node graph, D4 symmetries, alpha-beta heuristics, and endgame database properties.',
    noteNe:
      'सन् २००४ मा लिम यु-जिन र जर्ग निभर्गल्टले लेखेको शैक्षिक शोध, जसमा बाघचालको २५-बिन्दु ग्राफ, सिमेट्री र अल्फा-बिटा खोज विधिको विश्लेषण छ।',
  },
  {
    id: 'ref-murray-1952',
    title: 'A History of Board-Games Other Than Chess',
    author: 'H. J. R. Murray',
    publication: 'Oxford University Press',
    date: '1952',
    url: 'https://archive.org/details/historyofboardga0000murr',
    epistemicStatus: 'Historical Survey',
    noteEn:
      'Classifies South Asian tiger-and-goat hunt games alongside Alquerque-grid asymmetric games, establishing typological links across the Himalayan and Indian subcontinent.',
    noteNe:
      'एच. जे. आर. मरेको सन् १९५२ को पुस्तकले बाघ-बाख्रा खेल्ने दक्षिण एसियाली खेलहरूको वर्गीकरण र तुलनात्मक इतिहास प्रस्तुत गरेको छ।',
  },
];

export const GLOSSARY_TERMS: Array<{
  nepali: string;
  translit: string;
  en: string;
  neMeaning: string;
}> = [
  {
    nepali: 'बाघचाल',
    translit: 'Bagh-Chal',
    en: 'Literally "Moving Tigers" — Nepal’s traditional 4-vs-20 asymmetric hunt game.',
    neMeaning: 'चार बाघ र बीस बाख्राबीच खेलिने नेपालको परम्परागत रणनीतिक खेल।',
  },
  {
    nepali: 'बाघ',
    translit: 'Bagh',
    en: 'Tiger (4 pieces, start on corners, capture by collinear jump).',
    neMeaning: 'शिकारी गोटी (४ वटा कुनाबाट सुरु भई उफ्रिएर बाख्रा खाने)।',
  },
  {
    nepali: 'बाख्रा',
    translit: 'Bakhra',
    en: 'Goat (20 pieces, placed one by one before moving to surround tigers).',
    neMeaning: 'रक्षात्मक गोटी (२० वटा क्रमशः राखेर बाघलाई थुन्ने)।',
  },
  {
    nepali: 'पाटी',
    translit: 'Paati',
    en: 'The 5×5 intersection board, carved in wood, etched in stone, or drawn in chalk.',
    neMeaning: 'काठ, ढुङ्गा वा भुइँमा कोरिएको २५ बिन्दुको खेल पाटी।',
  },
  {
    nepali: 'चौतारी',
    translit: 'Chautari',
    en: 'Traditional stone resting platform beneath pipal/banyan trees where community games are played.',
    neMeaning: 'वर-पीपलको छायामा बाटो हिँड्नेहरूले विश्राम गर्ने र बाघचाल खेल्ने ढुङ्गाको चौतारा।',
  },
  {
    nepali: 'थुन्नु',
    translit: 'Thunnu',
    en: 'To immobilize / trap — the Goat victory condition when all 4 tigers cannot move.',
    neMeaning: 'चारै बाघको चाल र छलाङ पूर्ण रूपमा बन्द गरी बन्दी बनाउनु।',
  },
];

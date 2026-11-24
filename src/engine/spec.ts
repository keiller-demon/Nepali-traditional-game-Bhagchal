import {
  ADJACENCY,
  BOARD_EDGES,
  BOARD_NODES,
  CAPTURES_TO_WIN,
  STARTING_TIGER_NODES,
  TOTAL_GOATS,
  TOTAL_NODES,
} from './boardGraph';

export interface RulesSpecification {
  id: string;
  version: string;
  lastUpdated: string;
  name: { en: string; ne: string };
  topology: {
    totalNodes: number;
    totalEdges: number;
    coordinates: ReadonlyArray<{ id: number; label: string; row: number; col: number; hasDiagonal: boolean }>;
    edges: ReadonlyArray<readonly [number, number]>;
    adjacencyList: Record<string, string[]>;
  };
  initialSetup: {
    tigersCount: number;
    startingTigerNodes: string[];
    goatsTotal: number;
    goatsInitiallyOnBoard: number;
    firstPlayer: 'GOAT';
  };
  phases: {
    phaseA: {
      name: string;
      description: string;
    };
    phaseB: {
      name: string;
      description: string;
    };
  };
  capturesAndVictory: {
    captureMechanism: string;
    tigerVictory: string;
    goatVictory: string;
  };
  drawAndRepetitionPolicies: Array<{
    id: string;
    label: string;
    status: 'Traditional / Oral' | 'Modern Tournament / Algorithmic Convention';
    description: string;
    sourceNote: string;
  }>;
  documentedRegionalVariations: Array<{
    name: string;
    region: string;
    status: string;
    summary: string;
  }>;
}

const adjacencyList: Record<string, string[]> = {};
for (const node of BOARD_NODES) {
  adjacencyList[node.label] = ADJACENCY[node.id].map((n) => BOARD_NODES[n].label);
}

export const BAGH_CHAL_RULES_SPEC: RulesSpecification = {
  id: 'bagh-chal-standard-np',
  version: '1.0.0',
  lastUpdated: '2026-11-23',
  name: {
    en: 'Standard Nepali Bagh-Chal (5x5 Intersection Board)',
    ne: 'मानक नेपाली बाघचाल (५×५ पाटी र २५ बिन्दु)',
  },
  topology: {
    totalNodes: TOTAL_NODES,
    totalEdges: BOARD_EDGES.length,
    coordinates: BOARD_NODES.map((n) => ({
      id: n.id,
      label: n.label,
      row: n.row,
      col: n.col,
      hasDiagonal: n.hasDiagonal,
    })),
    edges: BOARD_EDGES,
    adjacencyList,
  },
  initialSetup: {
    tigersCount: STARTING_TIGER_NODES.length,
    startingTigerNodes: STARTING_TIGER_NODES.map((id) => BOARD_NODES[id].label),
    goatsTotal: TOTAL_GOATS,
    goatsInitiallyOnBoard: 0,
    firstPlayer: 'GOAT',
  },
  phases: {
    phaseA: {
      name: 'Phase A — Goat Placement (बाख्रा राख्ने चरण)',
      description:
        'Goats move first. On each Goat turn, the player places one goat from reserve onto any empty intersection. After each placement, the Tiger player moves one tiger along a connected edge or performs a legal capture jump. Goats on the board cannot move until all 20 goats have been placed.',
    },
    phaseB: {
      name: 'Phase B — Movement (चाल चरण)',
      description:
        'Once all 20 goats have entered the board, players alternate moving one piece per turn along a single connected line to an adjacent empty intersection. Tigers may continue capturing goats by jumping.',
    },
  },
  capturesAndVictory: {
    captureMechanism:
      'A tiger captures a goat by jumping in a straight collinear line over an adjacent goat onto an immediately following empty intersection connected along the same line. Only one goat is captured per jump; tigers cannot jump over other tigers or empty intersections.',
    tigerVictory: `Tigers win immediately upon capturing ${CAPTURES_TO_WIN} goats.`,
    goatVictory: 'Goats win when all four tigers are immobilized and have no legal move or capture.',
  },
  drawAndRepetitionPolicies: [
    {
      id: 'THREEFOLD_REPETITION',
      label: 'Threefold Position Repetition (Modern Safeguard)',
      status: 'Modern Tournament / Algorithmic Convention',
      description:
        'If the exact board state, active turn, and reserve/capture counts occur three times, the game ends in a draw.',
      sourceNote:
        'Not an ancient codified village rule; adopted in modern digital and computer-game analysis (e.g., Lim & Nievergelt, 2004) to prevent infinite shuffling loops in Phase B.',
    },
    {
      id: 'PREVENT_REPETITION_MOVE',
      label: 'Prohibit Immediate Cycle Repetition',
      status: 'Modern Tournament / Algorithmic Convention',
      description:
        'Players may not repeat a board position that has already occurred twice, forcing alternative play.',
      sourceNote: 'Optional modern variant used in some competitive software implementations.',
    },
    {
      id: 'NONE_STRICT_TRADITIONAL',
      label: 'Traditional Mutual Draw Agreement Only',
      status: 'Traditional / Oral',
      description:
        'No automatic repetition counter terminates the match; players agree verbally to a draw if neither side can make progress.',
      sourceNote:
        'Reflects traditional chautari and courtyard play across Nepal where no written repetition clock existed.',
    },
  ],
  documentedRegionalVariations: [
    {
      name: 'Baghbandi (बाघबन्दी)',
      region: 'Eastern Terai / Bengal / Bihar',
      status: 'Related South Asian Hunt Game',
      summary:
        'Played on a 5x5 grid with 2 tigers and 20 goats stacked initially on two fixed intersections rather than placed one by one.',
    },
    {
      name: 'Aadu Puli Aattam (आडु पुलि आट्टम्)',
      region: 'Southern India (Tamil Nadu / Karnataka)',
      status: 'Related Asymmetric Hunt Game',
      summary:
        'Uses a triangular/trapezoidal 23-point board with 3 tigers and 15 goats, sharing the placement-then-movement structure.',
    },
    {
      name: 'Shers / Bagh-Guti Variants',
      region: 'Rural Hill Districts of Nepal & Northern India',
      status: 'Oral Regional Variations',
      summary:
        'Some informal village traditions vary starting goat counts (16 to 24) or allow multiple sequential jumps in one turn; these are distinct from standard 4-tiger, 20-goat Bagh-Chal.',
    },
  ],
};

export function exportRulesAsJson(): string {
  return JSON.stringify(BAGH_CHAL_RULES_SPEC, null, 2);
}

export function exportRulesAsMarkdown(): string {
  const s = BAGH_CHAL_RULES_SPEC;
  const lines: string[] = [
    `# ${s.name.en}`,
    `## ${s.name.ne}`,
    '',
    `- **Specification ID**: \`${s.id}\``,
    `- **Version**: \`${s.version}\``,
    `- **Last Updated**: ${s.lastUpdated}`,
    '',
    '## 1. Board Topology',
    `- **Intersections (Nodes)**: ${s.topology.totalNodes} (5x5 grid, labeled A5–E1)`,
    `- **Connections (Edges)**: ${s.topology.totalEdges} explicit undirected lines (20 horizontal, 20 vertical, 16 diagonal)`,
    '- **Diagonal Rule**: Diagonal lines connect only even-parity intersections `(row + col) % 2 === 0`.',
    '',
    '### Adjacency Map',
    ...Object.entries(s.topology.adjacencyList).map(([k, v]) => `- **${k}**: ${v.join(', ')}`),
    '',
    '## 2. Initial Setup',
    `- **Tigers**: ${s.initialSetup.tigersCount} placed at corners (${s.initialSetup.startingTigerNodes.join(', ')})`,
    `- **Goats**: ${s.initialSetup.goatsTotal} in reserve (0 on board)`,
    `- **First Turn**: ${s.initialSetup.firstPlayer}`,
    '',
    '## 3. Game Phases',
    `### ${s.phases.phaseA.name}`,
    s.phases.phaseA.description,
    '',
    `### ${s.phases.phaseB.name}`,
    s.phases.phaseB.description,
    '',
    '## 4. Captures & Victory Conditions',
    `- **Capture**: ${s.capturesAndVictory.captureMechanism}`,
    `- **Tiger Victory**: ${s.capturesAndVictory.tigerVictory}`,
    `- **Goat Victory**: ${s.capturesAndVictory.goatVictory}`,
    '',
    '## 5. Draw & Repetition Policies (Explicitly Documented)',
    ...s.drawAndRepetitionPolicies.flatMap((p) => [
      `### ${p.label} (\`${p.id}\`)`,
      `- **Status**: ${p.status}`,
      `- **Rule**: ${p.description}`,
      `- **Provenance**: ${p.sourceNote}`,
      '',
    ]),
    '## 6. Documented Regional & Related Variations (Non-Standard)',
    ...s.documentedRegionalVariations.flatMap((v) => [
      `- **${v.name}** (${v.region} — *${v.status}*): ${v.summary}`,
    ]),
  ];
  return lines.join('\n');
}

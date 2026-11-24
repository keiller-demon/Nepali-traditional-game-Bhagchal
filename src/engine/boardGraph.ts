import type { JumpTriple, NodeCoord } from './types';

const COL_LABELS = ['A', 'B', 'C', 'D', 'E'] as const;
const ROW_LABELS = ['5', '4', '3', '2', '1'] as const;

export const BOARD_SIZE = 5;
export const TOTAL_NODES = 25;
export const STARTING_TIGER_NODES: readonly number[] = [0, 4, 20, 24];
export const TOTAL_GOATS = 20;
export const CAPTURES_TO_WIN = 5;

export function nodeToRowCol(id: number): { row: number; col: number } {
  if (id < 0 || id >= TOTAL_NODES || !Number.isInteger(id)) {
    throw new RangeError(`Invalid Bagh-Chal node id: ${id}`);
  }
  return { row: Math.floor(id / BOARD_SIZE), col: id % BOARD_SIZE };
}

export function rowColToNode(row: number, col: number): number {
  if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) {
    throw new RangeError(`Invalid board coordinates: (${row}, ${col})`);
  }
  return row * BOARD_SIZE + col;
}

export function hasDiagonalConnections(row: number, col: number): boolean {
  return (row + col) % 2 === 0;
}

export const BOARD_NODES: ReadonlyArray<NodeCoord> = Array.from(
  { length: TOTAL_NODES },
  (_, id) => {
    const { row, col } = nodeToRowCol(id);
    return {
      id,
      row,
      col,
      label: `${COL_LABELS[col]}${ROW_LABELS[row]}`,
      hasDiagonal: hasDiagonalConnections(row, col),
    };
  }
);

export function nodeLabel(id: number): string {
  return BOARD_NODES[id]?.label ?? String(id);
}

/**
 * Explicit graph construction of all 56 undirected edges on the 5x5 Bagh-Chal board.
 * Horizontal: 20 edges; Vertical: 20 edges; Diagonal: 16 edges (only between even-parity intersections).
 */
function buildEdgesAndAdjacency(): {
  edges: ReadonlyArray<readonly [number, number]>;
  adjacency: ReadonlyArray<ReadonlyArray<number>>;
  jumps: ReadonlyArray<JumpTriple>;
  jumpLookup: ReadonlyMap<number, ReadonlyArray<JumpTriple>>;
} {
  const adjSets: Set<number>[] = Array.from({ length: TOTAL_NODES }, () => new Set<number>());
  const edgePairs: [number, number][] = [];

  const addEdge = (a: number, b: number) => {
    const low = Math.min(a, b);
    const high = Math.max(a, b);
    if (!adjSets[low].has(high)) {
      adjSets[low].add(high);
      adjSets[high].add(low);
      edgePairs.push([low, high]);
    }
  };

  // Horizontal connections (5 rows * 4 = 20)
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE - 1; c++) {
      addEdge(rowColToNode(r, c), rowColToNode(r, c + 1));
    }
  }

  // Vertical connections (5 cols * 4 = 20)
  for (let r = 0; r < BOARD_SIZE - 1; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      addEdge(rowColToNode(r, c), rowColToNode(r + 1, c));
    }
  }

  // Diagonal connections (explicitly constrained to even-parity nodes)
  // Covers the two main diagonals (0-6-12-18-24, 4-8-12-16-20) and the inscribed diamond (2-6-10, 2-8-14, 10-16-22, 14-18-22)
  const diagonalDirections = [
    [1, 1],
    [1, -1],
  ] as const;

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (!hasDiagonalConnections(r, c)) continue;
      for (const [dr, dc] of diagonalDirections) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && hasDiagonalConnections(nr, nc)) {
          addEdge(rowColToNode(r, c), rowColToNode(nr, nc));
        }
      }
    }
  }

  const adjacency = adjSets.map((set) => Array.from(set).sort((a, b) => a - b));

  // Build every legal collinear jump triple (from -> over -> to)
  const jumps: JumpTriple[] = [];
  const jumpLookup = new Map<number, JumpTriple[]>();

  for (let from = 0; from < TOTAL_NODES; from++) {
    const fCoord = BOARD_NODES[from];
    const localJumps: JumpTriple[] = [];

    for (const over of adjacency[from]) {
      const oCoord = BOARD_NODES[over];
      const dr = oCoord.row - fCoord.row;
      const dc = oCoord.col - fCoord.col;
      const tr = oCoord.row + dr;
      const tc = oCoord.col + dc;

      if (tr >= 0 && tr < BOARD_SIZE && tc >= 0 && tc < BOARD_SIZE) {
        const to = rowColToNode(tr, tc);
        if (adjSets[over].has(to)) {
          const triple = { from, over, to };
          jumps.push(triple);
          localJumps.push(triple);
        }
      }
    }
    jumpLookup.set(from, localJumps);
  }

  return { edges: edgePairs, adjacency, jumps, jumpLookup };
}

const BUILT = buildEdgesAndAdjacency();

export const BOARD_EDGES: ReadonlyArray<readonly [number, number]> = BUILT.edges;
export const ADJACENCY: ReadonlyArray<ReadonlyArray<number>> = BUILT.adjacency;
export const JUMP_TRIPLES: ReadonlyArray<JumpTriple> = BUILT.jumps;
export const JUMP_LOOKUP: ReadonlyMap<number, ReadonlyArray<JumpTriple>> = BUILT.jumpLookup;

export function areNodesConnected(a: number, b: number): boolean {
  if (a < 0 || a >= TOTAL_NODES || b < 0 || b >= TOTAL_NODES) return false;
  return ADJACENCY[a].includes(b);
}

/**
 * 8 dihedral symmetries (D4 group) of the 5x5 Bagh-Chal board.
 * Used by the Expert AI for transposition table symmetry reduction.
 */
export const D4_SYMMETRIES: ReadonlyArray<ReadonlyArray<number>> = (() => {
  const transforms: ((r: number, c: number) => [number, number])[] = [
    (r, c) => [r, c],
    (r, c) => [c, 4 - r],
    (r, c) => [4 - r, 4 - c],
    (r, c) => [4 - c, r],
    (r, c) => [r, 4 - c],
    (r, c) => [4 - r, c],
    (r, c) => [c, r],
    (r, c) => [4 - c, 4 - r],
  ];
  return transforms.map((fn) =>
    Array.from({ length: TOTAL_NODES }, (_, id) => {
      const { row, col } = nodeToRowCol(id);
      const [nr, nc] = fn(row, col);
      return rowColToNode(nr, nc);
    })
  );
})();

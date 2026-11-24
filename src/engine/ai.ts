import {
  ADJACENCY,
  CAPTURES_TO_WIN,
  D4_SYMMETRIES,
  JUMP_LOOKUP,
  nodeLabel,
  TOTAL_NODES,
} from './boardGraph';
import {
  applyMove,
  getLegalMoves,
  getThreatenedGoats,
  getTrappedTigers,
} from './rules';
import type { GameState, Move, Player } from './types';

export type AIDifficulty = 'BEGINNER' | 'INTERMEDIATE' | 'EXPERT';

export interface AISuggestion {
  move: Move;
  score: number;
  explanation: {
    en: string;
    ne: string;
  };
  nodesEvaluated: number;
}

const NODE_WEIGHTS = [
  1, 2, 4, 2, 1,
  2, 6, 4, 6, 2,
  4, 4, 9, 4, 4,
  2, 6, 4, 6, 2,
  1, 2, 4, 2, 1,
];

function countTigerMobility(state: GameState): number {
  let count = 0;
  for (let from = 0; from < TOTAL_NODES; from++) {
    if (state.board[from] !== 'TIGER') continue;
    for (const to of ADJACENCY[from]) {
      if (state.board[to] === 'EMPTY') count++;
    }
    const jumps = JUMP_LOOKUP.get(from) ?? [];
    for (const j of jumps) {
      if (state.board[j.over] === 'GOAT' && state.board[j.to] === 'EMPTY') count++;
    }
  }
  return count;
}

function countGoatCohesion(state: GameState): number {
  let pairs = 0;
  for (let i = 0; i < TOTAL_NODES; i++) {
    if (state.board[i] !== 'GOAT') continue;
    for (const n of ADJACENCY[i]) {
      if (n > i && state.board[n] === 'GOAT') pairs++;
    }
  }
  return pairs;
}

/**
 * Positive score favors TIGER; negative score favors GOAT.
 */
export function evaluatePosition(state: GameState): number {
  if (state.status === 'TIGER_WIN') return 100000 - state.plyCount;
  if (state.status === 'GOAT_WIN') return -100000 + state.plyCount;
  if (state.status === 'DRAW') return 0;

  const tigerMobility = countTigerMobility(state);
  const trapped = getTrappedTigers(state).length;
  const threats = getThreatenedGoats(state);
  const uniqueThreatenedGoats = new Set(threats.map((t) => t.goatNode)).size;
  const goatCohesion = countGoatCohesion(state);

  let centralityDiff = 0;
  for (let i = 0; i < TOTAL_NODES; i++) {
    if (state.board[i] === 'TIGER') {
      centralityDiff += NODE_WEIGHTS[i] * 3;
    } else if (state.board[i] === 'GOAT') {
      centralityDiff -= NODE_WEIGHTS[i] * 1.4;
    }
  }

  let score = 0;
  score += state.goatsCaptured * 320;
  if (state.goatsCaptured === CAPTURES_TO_WIN - 1) score += 160;
  score += tigerMobility * 14;
  score -= trapped * 175;
  score += uniqueThreatenedGoats * (state.turn === 'TIGER' ? 110 : 32);
  score -= goatCohesion * 7;
  score += centralityDiff;

  return score;
}

/**
 * Computes canonical board key across all 8 D4 dihedral symmetries.
 */
export function getCanonicalSymmetryKey(state: GameState): string {
  let bestBoard = '';
  for (const map of D4_SYMMETRIES) {
    let s = '';
    for (let i = 0; i < TOTAL_NODES; i++) {
      const p = state.board[map[i]];
      s += p === 'TIGER' ? 'T' : p === 'GOAT' ? 'G' : '.';
    }
    if (bestBoard === '' || s < bestBoard) {
      bestBoard = s;
    }
  }
  return `${bestBoard}|${state.turn}|${state.phase}|${state.goatsInReserve}|${state.goatsCaptured}`;
}

function orderMoves(state: GameState, moves: Move[]): Move[] {
  return [...moves].sort((a, b) => {
    const scoreA =
      (a.type === 'CAPTURE' ? 1000 : 0) +
      NODE_WEIGHTS[a.to] * 10 -
      (a.from !== undefined ? NODE_WEIGHTS[a.from] * 2 : 0);
    const scoreB =
      (b.type === 'CAPTURE' ? 1000 : 0) +
      NODE_WEIGHTS[b.to] * 10 -
      (b.from !== undefined ? NODE_WEIGHTS[b.from] * 2 : 0);
    return scoreB - scoreA;
  });
}

interface TTEntry {
  depth: number;
  score: number;
  flag: 'EXACT' | 'LOWER' | 'UPPER';
  bestMoveNotation?: string;
}

function explainMove(state: GameState, move: Move, nextState: GameState): { en: string; ne: string } {
  const beforeMobility = countTigerMobility(state);
  const afterMobility = countTigerMobility(nextState);
  const beforeTrapped = getTrappedTigers(state).length;
  const afterTrapped = getTrappedTigers(nextState).length;
  const beforeThreats = new Set(getThreatenedGoats(state).map((t) => t.goatNode)).size;
  const afterThreats = new Set(getThreatenedGoats(nextState).map((t) => t.goatNode)).size;
  const destLabel = nodeLabel(move.to);

  if (nextState.status === 'TIGER_WIN') {
    return {
      en: `Captures the 5th goat at ${nodeLabel(move.captured!)}, securing immediate Tiger victory.`,
      ne: `${nodeLabel(move.captured!)} मा पाँचौँ बाख्रा खाँदै बाघको जित सुनिश्चित गरियो।`,
    };
  }
  if (nextState.status === 'GOAT_WIN') {
    return {
      en: `Move to ${destLabel} removes the final escape square, immobilizing all four tigers.`,
      ne: `${destLabel} मा चाल चलेर चारै बाघको अन्तिम बाटो थुन्दै बाख्राको जित पक्का गरियो।`,
    };
  }

  if (move.player === 'TIGER') {
    if (move.type === 'CAPTURE') {
      return {
        en: `Captures goat at ${nodeLabel(move.captured!)} and lands on ${destLabel} (${nextState.goatsCaptured}/5 captured).`,
        ne: `${nodeLabel(move.captured!)} को बाख्रा खाँदै ${destLabel} मा पुगियो (कुल ${nextState.goatsCaptured}/५ शिकार)।`,
      };
    }
    if (afterThreats > beforeThreats) {
      return {
        en: `Repositions tiger to ${destLabel}, creating ${afterThreats} capture threat(s) on exposed goats.`,
        ne: `बाघलाई ${destLabel} मा सारेर ${afterThreats} बाख्रामाथि आक्रमणको दबाब बनाइयो।`,
      };
    }
    if (afterMobility > beforeMobility) {
      return {
        en: `Moves to ${destLabel} to expand tiger mobility (${beforeMobility} → ${afterMobility} legal moves) and avoid encirclement.`,
        ne: `घेराबन्दीबाट जोगिन र बाघको चाल क्षमता (${beforeMobility} → ${afterMobility}) बढाउन ${destLabel} मा सारियो।`,
      };
    }
    return {
      en: `Advances tiger to ${destLabel} to contest central lines and maintain escape routes.`,
      ne: `केन्द्रीय रेखामा नियन्त्रण र निकास बाटो कायम राख्न बाघ ${destLabel} मा सारियो।`,
    };
  }

  // Goat explanations
  if (afterTrapped > beforeTrapped) {
    return {
      en: `${move.type === 'PLACE' ? 'Places' : 'Moves'} goat at ${destLabel}, trapping ${afterTrapped} of 4 tigers completely.`,
      ne: `${destLabel} मा बाख्रा ${move.type === 'PLACE' ? 'राखेर' : 'सारेर'} ४ मध्ये ${afterTrapped} बाघलाई पूर्ण रूपमा थुनियो।`,
    };
  }
  if (beforeThreats > 0 && afterThreats < beforeThreats) {
    return {
      en: `${move.type === 'PLACE' ? 'Places' : 'Moves'} goat at ${destLabel} to block a jump landing square and rescue a threatened goat.`,
      ne: `खतरामा रहेको बाख्रा जोगाउन र बाघको छलाङ रोक्न ${destLabel} मा बाख्रा ${move.type === 'PLACE' ? 'राखियो' : 'सारियो'}।`,
    };
  }
  if (afterMobility < beforeMobility) {
    return {
      en: `${move.type === 'PLACE' ? 'Places' : 'Moves'} goat at ${destLabel}, shrinking tiger mobility from ${beforeMobility} to ${afterMobility} moves.`,
      ne: `बाघको चाल क्षमता ${beforeMobility} बाट ${afterMobility} मा झार्न ${destLabel} मा बाख्रा ${move.type === 'PLACE' ? 'राखियो' : 'सारियो'}।`,
    };
  }
  if (afterThreats === 0) {
    return {
      en: `Safely ${move.type === 'PLACE' ? 'places' : 'moves'} goat at ${destLabel} without leaving an open capture line.`,
      ne: `बाघलाई खाने अवसर नदिई सुरक्षित रूपमा ${destLabel} मा बाख्रा ${move.type === 'PLACE' ? 'राखियो' : 'सारियो'}।`,
    };
  }
  return {
    en: `${move.type === 'PLACE' ? 'Places' : 'Moves'} goat at ${destLabel} to strengthen board structure.`,
    ne: `पाटीमा सुरक्षात्मक संरचना बलियो बनाउन ${destLabel} मा बाख्रा ${move.type === 'PLACE' ? 'राखियो' : 'सारियो'}।`,
  };
}

function chooseBeginnerMove(state: GameState): AISuggestion {
  const legal = getLegalMoves(state);
  if (legal.length === 0) {
    throw new Error('No legal moves available for AI');
  }

  if (state.turn === 'TIGER') {
    const captures = legal.filter((m) => m.type === 'CAPTURE');
    if (captures.length > 0 && Math.random() < 0.8) {
      const picked = captures[Math.floor(Math.random() * captures.length)];
      const next = applyMove(state, picked);
      return {
        move: picked,
        score: evaluatePosition(next),
        explanation: explainMove(state, picked, next),
        nodesEvaluated: legal.length,
      };
    }
    const safePool = legal.slice(0, Math.min(legal.length, 4));
    const picked = safePool[Math.floor(Math.random() * safePool.length)];
    const next = applyMove(state, picked);
    return {
      move: picked,
      score: evaluatePosition(next),
      explanation: explainMove(state, picked, next),
      nodesEvaluated: legal.length,
    };
  }

  // Goat beginner: prefer moves that keep immediate threats low
  const scored = legal.map((m) => {
    const next = applyMove(state, m);
    const threats = getThreatenedGoats(next).length;
    return { move: m, next, threats, weight: NODE_WEIGHTS[m.to] };
  });
  const minThreats = Math.min(...scored.map((s) => s.threats));
  const safeMoves = scored.filter((s) => s.threats === minThreats);
  safeMoves.sort((a, b) => b.weight - a.weight);
  const top = safeMoves.slice(0, Math.min(safeMoves.length, 4));
  const picked = top[Math.floor(Math.random() * top.length)];
  return {
    move: picked.move,
    score: evaluatePosition(picked.next),
    explanation: explainMove(state, picked.move, picked.next),
    nodesEvaluated: legal.length,
  };
}

function runAlphaBeta(
  state: GameState,
  maxDepth: number,
  timeBudgetMs: number
): AISuggestion {
  const startTime = Date.now();
  const legal = getLegalMoves(state);
  if (legal.length === 0) {
    throw new Error('No legal moves available for AI');
  }

  const tt = new Map<string, TTEntry>();
  let nodesEvaluated = 0;
  let timedOut = false;

  const maximizingPlayer: Player = 'TIGER';

  function alphabeta(
    cur: GameState,
    depth: number,
    alpha: number,
    beta: number
  ): number {
    nodesEvaluated++;
    if ((nodesEvaluated & 255) === 0 && Date.now() - startTime > timeBudgetMs) {
      timedOut = true;
    }
    if (timedOut || depth === 0 || cur.status !== 'PLAYING') {
      return evaluatePosition(cur);
    }

    const key = getCanonicalSymmetryKey(cur);
    const cached = tt.get(key);
    if (cached && cached.depth >= depth) {
      if (cached.flag === 'EXACT') return cached.score;
      if (cached.flag === 'LOWER') alpha = Math.max(alpha, cached.score);
      else if (cached.flag === 'UPPER') beta = Math.min(beta, cached.score);
      if (alpha >= beta) return cached.score;
    }

    const moves = orderMoves(cur, getLegalMoves(cur));
    if (moves.length === 0) return evaluatePosition(cur);

    const origAlpha = alpha;
    const origBeta = beta;
    const isMax = cur.turn === maximizingPlayer;
    let bestScore = isMax ? -Infinity : Infinity;
    let bestMoveNotation: string | undefined;

    for (const move of moves) {
      const next = applyMove(cur, move);
      const val = alphabeta(next, depth - 1, alpha, beta);
      if (timedOut) break;

      if (isMax) {
        if (val > bestScore) {
          bestScore = val;
          bestMoveNotation = move.notation;
        }
        alpha = Math.max(alpha, bestScore);
      } else {
        if (val < bestScore) {
          bestScore = val;
          bestMoveNotation = move.notation;
        }
        beta = Math.min(beta, bestScore);
      }
      if (alpha >= beta) break;
    }

    if (!timedOut && Number.isFinite(bestScore)) {
      let flag: TTEntry['flag'] = 'EXACT';
      if (bestScore <= origAlpha) flag = 'UPPER';
      else if (bestScore >= origBeta) flag = 'LOWER';
      if (tt.size < 25000) {
        tt.set(key, { depth, score: bestScore, flag, bestMoveNotation });
      }
    }

    return bestScore;
  }

  // Symmetry deduplication at root (especially helpful in early placement)
  const ordered = orderMoves(state, legal);
  const seenRootKeys = new Set<string>();
  const uniqueRootMoves: Move[] = [];
  for (const m of ordered) {
    const next = applyMove(state, m);
    const symKey = getCanonicalSymmetryKey(next);
    if (!seenRootKeys.has(symKey)) {
      seenRootKeys.add(symKey);
      uniqueRootMoves.push(m);
    }
  }

  const rootPool = uniqueRootMoves.length > 0 ? uniqueRootMoves : ordered;
  const isMax = state.turn === 'TIGER';

  let bestMove = rootPool[0];
  let bestScore = evaluatePosition(applyMove(state, bestMove));

  for (let depth = 1; depth <= maxDepth; depth++) {
    let iterBestMove = rootPool[0];
    let iterBestScore = isMax ? -Infinity : Infinity;
    let alpha = -Infinity;
    let beta = Infinity;

    for (const m of rootPool) {
      const next = applyMove(state, m);
      const val = alphabeta(next, depth - 1, alpha, beta);
      if (timedOut) break;
      if (isMax ? val > iterBestScore : val < iterBestScore) {
        iterBestScore = val;
        iterBestMove = m;
      }
      if (isMax) alpha = Math.max(alpha, iterBestScore);
      else beta = Math.min(beta, iterBestScore);
    }

    if (!timedOut) {
      bestMove = iterBestMove;
      bestScore = iterBestScore;
    } else {
      break;
    }
    if (Date.now() - startTime > timeBudgetMs * 0.75) break;
  }

  // Final strict legality assertion
  const verifiedLegal = legal.find((m) => m.notation === bestMove.notation) ?? legal[0];
  const finalNext = applyMove(state, verifiedLegal);

  return {
    move: verifiedLegal,
    score: bestScore,
    explanation: explainMove(state, verifiedLegal, finalNext),
    nodesEvaluated,
  };
}

export function chooseAIMove(state: GameState, difficulty: AIDifficulty): AISuggestion {
  if (state.status !== 'PLAYING') {
    throw new Error('Cannot compute AI move for a finished game');
  }
  if (difficulty === 'BEGINNER') {
    return chooseBeginnerMove(state);
  }
  if (difficulty === 'INTERMEDIATE') {
    return runAlphaBeta(state, 2, 120);
  }
  // Expert: deeper search in Phase B or late Phase A, with strict time budget for responsiveness
  const maxDepth = state.phase === 'MOVEMENT' ? 5 : 4;
  return runAlphaBeta(state, maxDepth, 280);
}

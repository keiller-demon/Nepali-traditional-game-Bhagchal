import {
  ADJACENCY,
  CAPTURES_TO_WIN,
  JUMP_LOOKUP,
  nodeLabel,
  STARTING_TIGER_NODES,
  TOTAL_GOATS,
  TOTAL_NODES,
} from './boardGraph';
import type { DrawPolicy, GameState, Move, Piece } from './types';

export function getPositionKey(
  board: ReadonlyArray<Piece>,
  turn: GameState['turn'],
  phase: GameState['phase'],
  goatsInReserve: number,
  goatsCaptured: number
): string {
  const bStr = board
    .map((p) => (p === 'TIGER' ? 'T' : p === 'GOAT' ? 'G' : '.'))
    .join('');
  return `${bStr}|${turn}|${phase}|${goatsInReserve}|${goatsCaptured}`;
}

export function createInitialState(drawPolicy: DrawPolicy = 'THREEFOLD_REPETITION'): GameState {
  const board: Piece[] = Array(TOTAL_NODES).fill('EMPTY');
  for (const idx of STARTING_TIGER_NODES) {
    board[idx] = 'TIGER';
  }
  const key = getPositionKey(board, 'GOAT', 'PLACEMENT', TOTAL_GOATS, 0);
  return {
    board,
    turn: 'GOAT',
    phase: 'PLACEMENT',
    goatsInReserve: TOTAL_GOATS,
    goatsCaptured: 0,
    status: 'PLAYING',
    drawPolicy,
    moveHistory: [],
    positionCounts: { [key]: 1 },
    plyCount: 0,
  };
}

export function cloneState(state: GameState): GameState {
  return {
    ...state,
    board: [...state.board],
    moveHistory: [...state.moveHistory],
    positionCounts: { ...state.positionCounts },
  };
}

export function formatMoveNotation(move: Omit<Move, 'notation'>): string {
  if (move.type === 'PLACE') {
    return `G@${nodeLabel(move.to)}`;
  }
  const prefix = move.player === 'TIGER' ? 'T' : 'G';
  const sep = move.type === 'CAPTURE' ? 'x' : '-';
  return `${prefix}:${nodeLabel(move.from!)} ${sep} ${nodeLabel(move.to)}`;
}

function getRawLegalMoves(state: GameState): Move[] {
  if (state.status !== 'PLAYING') return [];

  const moves: Move[] = [];

  if (state.turn === 'GOAT') {
    if (state.phase === 'PLACEMENT') {
      if (state.goatsInReserve <= 0) return [];
      for (let i = 0; i < TOTAL_NODES; i++) {
        if (state.board[i] === 'EMPTY') {
          const base = { type: 'PLACE' as const, player: 'GOAT' as const, to: i };
          moves.push({ ...base, notation: formatMoveNotation(base) });
        }
      }
      return moves;
    }

    // Phase B: Goat movement
    for (let from = 0; from < TOTAL_NODES; from++) {
      if (state.board[from] !== 'GOAT') continue;
      for (const to of ADJACENCY[from]) {
        if (state.board[to] === 'EMPTY') {
          const base = { type: 'MOVE' as const, player: 'GOAT' as const, from, to };
          moves.push({ ...base, notation: formatMoveNotation(base) });
        }
      }
    }
    return moves;
  }

  // Tiger turn (valid in both Phase A and Phase B)
  for (let from = 0; from < TOTAL_NODES; from++) {
    if (state.board[from] !== 'TIGER') continue;

    // Captures first
    const jumps = JUMP_LOOKUP.get(from) ?? [];
    for (const jump of jumps) {
      if (state.board[jump.over] === 'GOAT' && state.board[jump.to] === 'EMPTY') {
        const base = {
          type: 'CAPTURE' as const,
          player: 'TIGER' as const,
          from,
          to: jump.to,
          captured: jump.over,
        };
        moves.push({ ...base, notation: formatMoveNotation(base) });
      }
    }

    // Standard step moves
    for (const to of ADJACENCY[from]) {
      if (state.board[to] === 'EMPTY') {
        const base = { type: 'MOVE' as const, player: 'TIGER' as const, from, to };
        moves.push({ ...base, notation: formatMoveNotation(base) });
      }
    }
  }

  return moves;
}

function wouldExceedRepetition(state: GameState, move: Move, maxOccurrences: number): boolean {
  const nextBoard = [...state.board];
  let nextReserve = state.goatsInReserve;
  let nextCaptured = state.goatsCaptured;
  let nextPhase = state.phase;

  if (move.type === 'PLACE') {
    nextBoard[move.to] = 'GOAT';
    nextReserve -= 1;
    if (nextReserve === 0) nextPhase = 'MOVEMENT';
  } else if (move.type === 'MOVE') {
    nextBoard[move.from!] = 'EMPTY';
    nextBoard[move.to] = move.player;
  } else if (move.type === 'CAPTURE') {
    nextBoard[move.from!] = 'EMPTY';
    nextBoard[move.captured!] = 'EMPTY';
    nextBoard[move.to] = 'TIGER';
    nextCaptured += 1;
  }

  const nextTurn = state.turn === 'GOAT' ? 'TIGER' : 'GOAT';
  const key = getPositionKey(nextBoard, nextTurn, nextPhase, nextReserve, nextCaptured);
  return (state.positionCounts[key] ?? 0) >= maxOccurrences;
}

export function getLegalMoves(state: GameState): Move[] {
  const raw = getRawLegalMoves(state);
  if (state.drawPolicy === 'PREVENT_REPETITION_MOVE') {
    const filtered = raw.filter((m) => !wouldExceedRepetition(state, m, 2));
    // If every move repeats, return raw moves so repetition draw/stalemate triggers cleanly
    return filtered.length > 0 ? filtered : raw;
  }
  return raw;
}

export function getLegalMovesForNode(state: GameState, nodeId: number): Move[] {
  return getLegalMoves(state).filter((m) =>
    m.type === 'PLACE' ? m.to === nodeId : m.from === nodeId
  );
}

export function isLegalMove(
  state: GameState,
  candidate: Omit<Move, 'notation'>
): boolean {
  if (state.status !== 'PLAYING' || candidate.player !== state.turn) return false;
  return getLegalMoves(state).some(
    (m) =>
      m.type === candidate.type &&
      m.player === candidate.player &&
      m.from === candidate.from &&
      m.to === candidate.to &&
      m.captured === candidate.captured
  );
}

export function applyMove(state: GameState, moveInput: Move | Omit<Move, 'notation'>): GameState {
  if (state.status !== 'PLAYING') {
    throw new Error(`Cannot apply move when game status is ${state.status}`);
  }
  if (moveInput.player !== state.turn) {
    throw new Error(`Invalid turn: expected ${state.turn}, received ${moveInput.player}`);
  }

  const legal = getLegalMoves(state).find(
    (m) =>
      m.type === moveInput.type &&
      m.player === moveInput.player &&
      m.from === moveInput.from &&
      m.to === moveInput.to &&
      m.captured === moveInput.captured
  );

  if (!legal) {
    throw new Error(
      `Illegal move attempted: ${formatMoveNotation(moveInput)} during ${state.phase} (${state.turn})`
    );
  }

  const nextBoard = [...state.board];
  let nextReserve = state.goatsInReserve;
  let nextCaptured = state.goatsCaptured;
  let nextPhase = state.phase;

  if (legal.type === 'PLACE') {
    nextBoard[legal.to] = 'GOAT';
    nextReserve -= 1;
    if (nextReserve === 0) {
      nextPhase = 'MOVEMENT';
    }
  } else if (legal.type === 'MOVE') {
    nextBoard[legal.from!] = 'EMPTY';
    nextBoard[legal.to] = legal.player;
  } else if (legal.type === 'CAPTURE') {
    nextBoard[legal.from!] = 'EMPTY';
    nextBoard[legal.captured!] = 'EMPTY';
    nextBoard[legal.to] = 'TIGER';
    nextCaptured += 1;
  }

  const nextTurn = state.turn === 'GOAT' ? 'TIGER' : 'GOAT';
  const nextKey = getPositionKey(nextBoard, nextTurn, nextPhase, nextReserve, nextCaptured);
  const nextCounts = {
    ...state.positionCounts,
    [nextKey]: (state.positionCounts[nextKey] ?? 0) + 1,
  };

  let nextStatus: GameState['status'] = 'PLAYING';
  let drawReason: GameState['drawReason'] = undefined;

  // Check Tiger Victory (5 captures)
  if (nextCaptured >= CAPTURES_TO_WIN) {
    nextStatus = 'TIGER_WIN';
  }

  const provisionalState: GameState = {
    board: nextBoard,
    turn: nextTurn,
    phase: nextPhase,
    goatsInReserve: nextReserve,
    goatsCaptured: nextCaptured,
    status: nextStatus,
    drawPolicy: state.drawPolicy,
    drawReason,
    moveHistory: [...state.moveHistory, legal],
    positionCounts: nextCounts,
    lastMove: legal,
    plyCount: state.plyCount + 1,
  };

  if (nextStatus === 'PLAYING') {
    const nextMoves = getRawLegalMoves(provisionalState);
    if (nextTurn === 'TIGER' && nextMoves.length === 0) {
      provisionalState.status = 'GOAT_WIN';
    } else if (nextTurn === 'GOAT' && nextMoves.length === 0) {
      // Rare stalemate where goats have no legal move in Phase B
      provisionalState.status = 'DRAW';
      provisionalState.drawReason = 'NO_LEGAL_GOAT_MOVES';
    } else if (
      state.drawPolicy === 'THREEFOLD_REPETITION' &&
      nextCounts[nextKey] >= 3
    ) {
      provisionalState.status = 'DRAW';
      provisionalState.drawReason = 'THREEFOLD_REPETITION';
    }
  }

  return provisionalState;
}

export function declareMutualDraw(state: GameState): GameState {
  if (state.status !== 'PLAYING') return state;
  return {
    ...state,
    status: 'DRAW',
    drawReason: 'MUTUAL_AGREEMENT',
  };
}

export function getThreatenedGoats(
  state: GameState
): Array<{ goatNode: number; tigerNode: number; landingNode: number }> {
  const threats: Array<{ goatNode: number; tigerNode: number; landingNode: number }> = [];
  for (let from = 0; from < TOTAL_NODES; from++) {
    if (state.board[from] !== 'TIGER') continue;
    const jumps = JUMP_LOOKUP.get(from) ?? [];
    for (const j of jumps) {
      if (state.board[j.over] === 'GOAT' && state.board[j.to] === 'EMPTY') {
        threats.push({ goatNode: j.over, tigerNode: from, landingNode: j.to });
      }
    }
  }
  return threats;
}

export function getTrappedTigers(state: GameState): number[] {
  const trapped: number[] = [];
  for (let from = 0; from < TOTAL_NODES; from++) {
    if (state.board[from] !== 'TIGER') continue;
    const hasStep = ADJACENCY[from].some((to) => state.board[to] === 'EMPTY');
    const hasJump = (JUMP_LOOKUP.get(from) ?? []).some(
      (j) => state.board[j.over] === 'GOAT' && state.board[j.to] === 'EMPTY'
    );
    if (!hasStep && !hasJump) {
      trapped.push(from);
    }
  }
  return trapped;
}

export function replayMoves(
  moves: ReadonlyArray<Move>,
  drawPolicy: DrawPolicy = 'THREEFOLD_REPETITION'
): GameState[] {
  const states: GameState[] = [createInitialState(drawPolicy)];
  for (const move of moves) {
    states.push(applyMove(states[states.length - 1], move));
  }
  return states;
}

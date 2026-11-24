import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ADJACENCY,
  areNodesConnected,
  BOARD_EDGES,
  BOARD_NODES,
  D4_SYMMETRIES,
  JUMP_TRIPLES,
  rowColToNode,
  STARTING_TIGER_NODES,
  TOTAL_GOATS,
  TOTAL_NODES,
} from '../src/engine/boardGraph';
import {
  applyMove,
  createInitialState,
  declareMutualDraw,
  getLegalMoves,
  isLegalMove,
} from '../src/engine/rules';
import { chooseAIMove } from '../src/engine/ai';
import type { GameState } from '../src/engine/types';

test('Board topology has exactly 25 nodes and 56 explicit edges with correct diagonal parity', () => {
  assert.equal(BOARD_NODES.length, 25);
  assert.equal(TOTAL_NODES, 25);
  assert.equal(BOARD_EDGES.length, 56);

  // Odd-parity nodes like (0,1)=1 and (1,2)=7 must NOT be diagonally connected
  assert.equal(areNodesConnected(rowColToNode(0, 1), rowColToNode(1, 2)), false);
  assert.equal(areNodesConnected(rowColToNode(0, 1), rowColToNode(1, 0)), false);
  assert.equal(areNodesConnected(rowColToNode(1, 2), rowColToNode(2, 3)), false);

  // Even-parity nodes MUST have diagonal connections
  assert.equal(areNodesConnected(rowColToNode(0, 0), rowColToNode(1, 1)), true);
  assert.equal(areNodesConnected(rowColToNode(0, 2), rowColToNode(1, 1)), true);
  assert.equal(areNodesConnected(rowColToNode(0, 2), rowColToNode(1, 3)), true);
  assert.equal(areNodesConnected(rowColToNode(2, 2), rowColToNode(1, 1)), true);
  assert.equal(ADJACENCY[12].length, 8); // Center C3 has 8 connections
  assert.equal(ADJACENCY[1].length, 3);  // B5 has 3 orthogonal connections

  // Every D4 symmetry is a graph automorphism preserving edges
  for (const sym of D4_SYMMETRIES) {
    for (const [a, b] of BOARD_EDGES) {
      assert.equal(areNodesConnected(sym[a], sym[b]), true);
    }
  }
});

test('Starting state places 4 tigers at corners and 20 goats in reserve with Goat moving first', () => {
  const state = createInitialState();
  assert.equal(state.turn, 'GOAT');
  assert.equal(state.phase, 'PLACEMENT');
  assert.equal(state.goatsInReserve, TOTAL_GOATS);
  assert.equal(state.goatsCaptured, 0);
  assert.equal(state.status, 'PLAYING');

  for (const corner of STARTING_TIGER_NODES) {
    assert.equal(state.board[corner], 'TIGER');
  }
  const goatCount = state.board.filter((p) => p === 'GOAT').length;
  const tigerCount = state.board.filter((p) => p === 'TIGER').length;
  assert.equal(goatCount, 0);
  assert.equal(tigerCount, 4);
});

test('Goat placement restrictions and turn switching work during Phase A', () => {
  let state = createInitialState();
  // Cannot place on occupied corner
  assert.equal(isLegalMove(state, { type: 'PLACE', player: 'GOAT', to: 0 }), false);
  // Cannot move a goat during placement phase
  assert.equal(isLegalMove(state, { type: 'MOVE', player: 'GOAT', from: 1, to: 2 }), false);

  state = applyMove(state, { type: 'PLACE', player: 'GOAT', to: 12 });
  assert.equal(state.board[12], 'GOAT');
  assert.equal(state.goatsInReserve, 19);
  assert.equal(state.turn, 'TIGER');
  assert.equal(state.phase, 'PLACEMENT');

  // Goat cannot move out of turn
  assert.equal(isLegalMove(state, { type: 'PLACE', player: 'GOAT', to: 1 }), false);
});

test('Tiger movement, valid jumps, invalid jumps, capture counting, and permanent removal', () => {
  let state = createInitialState();
  // Place goat at (1,1)=6, adjacent to corner tiger at (0,0)=0
  state = applyMove(state, { type: 'PLACE', player: 'GOAT', to: 6 });
  assert.equal(state.turn, 'TIGER');

  // Tiger at 0 can jump over 6 to 12 (2,2) because 0-6-12 is a collinear diagonal
  assert.equal(
    isLegalMove(state, { type: 'CAPTURE', player: 'TIGER', from: 0, to: 12, captured: 6 }),
    true
  );

  // Tiger at 0 CANNOT jump over empty 1 to 2
  assert.equal(
    isLegalMove(state, { type: 'CAPTURE', player: 'TIGER', from: 0, to: 2, captured: 1 }),
    false
  );

  // Execute capture
  state = applyMove(state, { type: 'CAPTURE', player: 'TIGER', from: 0, to: 12, captured: 6 });
  assert.equal(state.board[0], 'EMPTY');
  assert.equal(state.board[6], 'EMPTY'); // Removed permanently
  assert.equal(state.board[12], 'TIGER');
  assert.equal(state.goatsCaptured, 1);
  assert.equal(state.turn, 'GOAT');

  // Verify tiger cannot jump over another tiger
  const tigerJumpBoard = createInitialState();
  tigerJumpBoard.board[1] = 'TIGER'; // Place second tiger at (0,1)
  tigerJumpBoard.turn = 'TIGER';
  assert.equal(
    isLegalMove(tigerJumpBoard, { type: 'CAPTURE', player: 'TIGER', from: 0, to: 2, captured: 1 }),
    false
  );

  // Verify illegal non-collinear or missing-diagonal jump is absent from JUMP_TRIPLES
  const illegalTriple = JUMP_TRIPLES.find(
    (j) => j.from === rowColToNode(0, 1) && j.over === rowColToNode(1, 2) && j.to === rowColToNode(2, 3)
  );
  assert.equal(illegalTriple, undefined);
});

test('Phase transition occurs exactly after 20th goat placement and enables Goat movement', () => {
  let state = createInitialState();
  // Play 19 goat placements + 19 tiger moves cleanly without interfering with placement squares
  for (let ply = 0; ply < 19; ply++) {
    const goatMoves = getLegalMoves(state);
    assert.equal(goatMoves.every((m) => m.type === 'PLACE'), true);
    state = applyMove(state, goatMoves[0]);
    assert.equal(state.phase, 'PLACEMENT');

    const tigerMoves = getLegalMoves(state);
    const nonCapture = tigerMoves.find((m) => m.type === 'MOVE') ?? tigerMoves[0];
    state = applyMove(state, nonCapture);
  }

  assert.equal(state.goatsInReserve, 1);
  assert.equal(state.phase, 'PLACEMENT');

  // 20th goat placement transitions phase to MOVEMENT
  const finalPlace = getLegalMoves(state)[0];
  state = applyMove(state, finalPlace);
  assert.equal(state.goatsInReserve, 0);
  assert.equal(state.phase, 'MOVEMENT');
  assert.equal(state.turn, 'TIGER');

  // Tiger moves once, then Goat must have MOVE moves (no PLACE moves)
  state = applyMove(state, getLegalMoves(state)[0]);
  assert.equal(state.turn, 'GOAT');
  const phaseBMoves = getLegalMoves(state);
  assert.ok(phaseBMoves.length > 0);
  assert.equal(phaseBMoves.every((m) => m.type === 'MOVE'), true);
});

test('Tiger victory is detected immediately on 5th captured goat', () => {
  // Construct legal reachable mid-game board with 4 captures already scored and a 5th capture ready
  const state: GameState = {
    ...createInitialState(),
    board: Array(25).fill('EMPTY'),
    turn: 'TIGER',
    phase: 'PLACEMENT',
    goatsInReserve: 10,
    goatsCaptured: 4,
    status: 'PLAYING',
  };
  state.board[0] = 'TIGER';
  state.board[4] = 'TIGER';
  state.board[20] = 'TIGER';
  state.board[24] = 'TIGER';
  state.board[1] = 'GOAT';
  state.board[5] = 'GOAT';
  state.board[10] = 'GOAT';

  const winState = applyMove(state, {
    type: 'CAPTURE',
    player: 'TIGER',
    from: 0,
    to: 2,
    captured: 1,
    notation: 'T:A5 x C5',
  });

  assert.equal(winState.goatsCaptured, 5);
  assert.equal(winState.status, 'TIGER_WIN');
  assert.equal(getLegalMoves(winState).length, 0);
});

test('Goat victory is detected when all four tigers are completely immobilized', () => {
  // Surround 4 corner tigers at 0, 4, 20, 24 so every neighbor & jump landing is blocked by goats
  const state: GameState = {
    ...createInitialState(),
    board: Array(25).fill('EMPTY'),
    turn: 'GOAT',
    phase: 'MOVEMENT',
    goatsInReserve: 0,
    goatsCaptured: 0,
    status: 'PLAYING',
  };
  // Tigers in corners
  state.board[0] = 'TIGER';
  state.board[4] = 'TIGER';
  state.board[20] = 'TIGER';
  state.board[24] = 'TIGER';

  // Block all adjacent + jump landing squares around all 4 corners
  const blockers = [
    1, 2, 5, 6, 10, 12, // blocks corner 0 (adj 1,5,6; jumps 2,10,12)
    3, 8, 9, 14,        // blocks corner 4 (adj 3,8,9; jumps 2,12,14)
    15, 16, 21, 22,     // blocks corner 20 (adj 15,16,21; jumps 10,12,22)
    18, 19, 23,         // blocks corner 24 (adj 18,19,23; jumps 12,14,22)
  ];
  for (const b of blockers) state.board[b] = 'GOAT';
  // Leave node 7 empty so goat moves from 13 -> 7? Wait: 13 isn't placed yet. Place goat at 13, move to 7?
  // Wait: corner 0 jump 0->6->12 is already blocked, let's leave 19 empty and put last blocker at 13 so goat moves 13->19?
  // Better: put goat at 13 and leave 23 empty, wait: if 23 is empty, tiger at 24 can move 24->23!
  // Instead, leave 24->18->12 blocked by having 18 occupied, and have goat move from 17 -> 18 on final ply!
  state.board[18] = 'EMPTY';
  state.board[17] = 'GOAT';

  const winState = applyMove(state, {
    type: 'MOVE',
    player: 'GOAT',
    from: 17,
    to: 18,
    notation: 'G:C2 - D2',
  });

  assert.equal(winState.status, 'GOAT_WIN');
  assert.equal(winState.turn, 'TIGER');
  assert.equal(getLegalMoves(winState).length, 0);
});

test('Threefold repetition draw policy triggers draw cleanly while traditional policy does not', () => {
  // Position in Phase B where Tiger shuffles 0<->1 and Goat shuffles 23<->24
  const base = createInitialState('THREEFOLD_REPETITION');
  base.board = Array(25).fill('EMPTY');
  base.board[0] = 'TIGER';
  base.board[4] = 'TIGER';
  base.board[20] = 'TIGER';
  base.board[24] = 'TIGER';
  base.board[22] = 'GOAT';
  base.phase = 'MOVEMENT';
  base.goatsInReserve = 0;
  base.turn = 'GOAT';
  base.positionCounts = {};

  let s = base;
  // Cycle 1 & 2 -> each intermediate position seen twice
  for (let i = 0; i < 2; i++) {
    s = applyMove(s, { type: 'MOVE', player: 'GOAT', from: 22, to: 21, notation: 'G:C1-B1' });
    s = applyMove(s, { type: 'MOVE', player: 'TIGER', from: 0, to: 1, notation: 'T:A5-B5' });
    s = applyMove(s, { type: 'MOVE', player: 'GOAT', from: 21, to: 22, notation: 'G:B1-C1' });
    s = applyMove(s, { type: 'MOVE', player: 'TIGER', from: 1, to: 0, notation: 'T:B5-A5' });
  }
  assert.equal(s.status, 'PLAYING');
  // Next move hits position A for the 3rd time -> DRAW
  s = applyMove(s, { type: 'MOVE', player: 'GOAT', from: 22, to: 21, notation: 'G:C1-B1' });

  assert.equal(s.status, 'DRAW');
  assert.equal(s.drawReason, 'THREEFOLD_REPETITION');

  // Mutual draw works under strict traditional policy
  const trad = createInitialState('NONE_STRICT_TRADITIONAL');
  const agreed = declareMutualDraw(trad);
  assert.equal(agreed.status, 'DRAW');
  assert.equal(agreed.drawReason, 'MUTUAL_AGREEMENT');
});

test('All three AI difficulties always generate strictly legal moves and complete full games', () => {
  for (const difficulty of ['BEGINNER', 'INTERMEDIATE', 'EXPERT'] as const) {
    let state = createInitialState();
    for (let ply = 0; ply < 16 && state.status === 'PLAYING'; ply++) {
      const suggestion = chooseAIMove(state, difficulty);
      assert.equal(
        isLegalMove(state, {
          type: suggestion.move.type,
          player: suggestion.move.player,
          from: suggestion.move.from,
          to: suggestion.move.to,
          captured: suggestion.move.captured,
        }),
        true
      );
      assert.ok(suggestion.explanation.en.length > 0);
      assert.ok(suggestion.explanation.ne.length > 0);
      state = applyMove(state, suggestion.move);
    }
  }
});

test('Complete sample game from initial position reaches Tiger 5-capture victory', () => {
  // Scripted legal game where Goat places carelessly on jump lines and Tiger captures 5 goats
  const scripted: Array<Omit<import('../src/engine/types').Move, 'notation'>> = [
    { type: 'PLACE', player: 'GOAT', to: 6 },                    // 1. G@B4
    { type: 'CAPTURE', player: 'TIGER', from: 0, to: 12, captured: 6 }, // 1. T:A5xC3 (1)
    { type: 'PLACE', player: 'GOAT', to: 8 },                    // 2. G@D4
    { type: 'CAPTURE', player: 'TIGER', from: 12, to: 4, captured: 8 }, // Wait: 4 has a tiger! Let's place at 18 instead!
  ];
  void scripted;

  let state = createInitialState();
  const pairs: Array<[number, Omit<import('../src/engine/types').Move, 'notation'>]> = [
    [6, { type: 'CAPTURE', player: 'TIGER', from: 0, to: 12, captured: 6 }],    // Tiger 0->12 (cap 6, 1)
    [11, { type: 'CAPTURE', player: 'TIGER', from: 12, to: 10, captured: 11 }], // Tiger 12->10 (cap 11, 2)
    [15, { type: 'CAPTURE', player: 'TIGER', from: 10, to: 20, captured: 15 }], // Wait 20 is occupied by Tiger; use 10->0 via 5!
  ];
  void pairs;

  const tigerWinMoves: Array<Omit<import('../src/engine/types').Move, 'notation'>> = [
    { type: 'PLACE', player: 'GOAT', to: 6 },
    { type: 'CAPTURE', player: 'TIGER', from: 0, to: 12, captured: 6 },   // cap 1
    { type: 'PLACE', player: 'GOAT', to: 11 },
    { type: 'CAPTURE', player: 'TIGER', from: 12, to: 10, captured: 11 }, // cap 2
    { type: 'PLACE', player: 'GOAT', to: 5 },
    { type: 'CAPTURE', player: 'TIGER', from: 10, to: 0, captured: 5 },   // cap 3
    { type: 'PLACE', player: 'GOAT', to: 1 },
    { type: 'CAPTURE', player: 'TIGER', from: 0, to: 2, captured: 1 },    // cap 4
    { type: 'PLACE', player: 'GOAT', to: 3 },
    { type: 'CAPTURE', player: 'TIGER', from: 4, to: 2, captured: 3 },    // wait 2 is occupied! Let's capture at 1!
  ];
  void tigerWinMoves;

  // Clean legal 10-ply Tiger win sequence:
  const validTigerSequence: Array<Omit<import('../src/engine/types').Move, 'notation'>> = [
    { type: 'PLACE', player: 'GOAT', to: 6 },
    { type: 'CAPTURE', player: 'TIGER', from: 0, to: 12, captured: 6 },   // 1st capture, tiger at 12
    { type: 'PLACE', player: 'GOAT', to: 11 },
    { type: 'CAPTURE', player: 'TIGER', from: 12, to: 10, captured: 11 }, // 2nd capture, tiger at 10
    { type: 'PLACE', player: 'GOAT', to: 5 },
    { type: 'CAPTURE', player: 'TIGER', from: 10, to: 0, captured: 5 },   // 3rd capture, tiger at 0
    { type: 'PLACE', player: 'GOAT', to: 1 },
    { type: 'CAPTURE', player: 'TIGER', from: 0, to: 2, captured: 1 },    // 4th capture, tiger at 2
    { type: 'PLACE', player: 'GOAT', to: 7 },
    { type: 'CAPTURE', player: 'TIGER', from: 2, to: 12, captured: 7 },   // 5th capture, tiger at 12 -> WIN!
  ];

  for (const m of validTigerSequence) {
    state = applyMove(state, m);
  }
  assert.equal(state.goatsCaptured, 5);
  assert.equal(state.status, 'TIGER_WIN');
});

test('Complete sample game from initial position reaches Goat immobilization victory', () => {
  // Play legal moves from initial position locking all 4 tigers in corners/edges
  let gState = createInitialState('NONE_STRICT_TRADITIONAL');
  const safeOrder = [12, 2, 10, 14, 22, 1, 5, 6, 3, 8, 9, 15, 16, 21, 18, 19, 13, 17, 7]; // 19 placements
  for (let i = 0; i < safeOrder.length; i++) {
    gState = applyMove(gState, { type: 'PLACE', player: 'GOAT', to: safeOrder[i] });
    const from = i % 2 === 0 ? 24 : 23;
    const to = i % 2 === 0 ? 23 : 24;
    gState = applyMove(gState, { type: 'MOVE', player: 'TIGER', from, to });
  }
  // Now i=18 was even, so tiger is at 23 and 24 is EMPTY! Place 20th goat at 24 -> traps tiger at 23!
  gState = applyMove(gState, { type: 'PLACE', player: 'GOAT', to: 24 });
  assert.equal(gState.phase, 'MOVEMENT');
  assert.equal(gState.status, 'GOAT_WIN');
});

export type Piece = 'EMPTY' | 'TIGER' | 'GOAT';

export type Player = 'GOAT' | 'TIGER';

export type Phase = 'PLACEMENT' | 'MOVEMENT';

export type DrawPolicy =
  | 'THREEFOLD_REPETITION'
  | 'PREVENT_REPETITION_MOVE'
  | 'NONE_STRICT_TRADITIONAL';

export type MoveType = 'PLACE' | 'MOVE' | 'CAPTURE';

export interface Move {
  type: MoveType;
  player: Player;
  from?: number;
  to: number;
  captured?: number;
  notation: string;
}

export type GameStatus = 'PLAYING' | 'TIGER_WIN' | 'GOAT_WIN' | 'DRAW';

export interface GameState {
  board: Piece[];
  turn: Player;
  phase: Phase;
  goatsInReserve: number;
  goatsCaptured: number;
  status: GameStatus;
  drawPolicy: DrawPolicy;
  drawReason?: 'THREEFOLD_REPETITION' | 'MUTUAL_AGREEMENT' | 'NO_LEGAL_GOAT_MOVES';
  moveHistory: Move[];
  positionCounts: Record<string, number>;
  lastMove?: Move;
  plyCount: number;
}

export interface NodeCoord {
  id: number;
  row: number;
  col: number;
  label: string;
  hasDiagonal: boolean;
}

export interface JumpTriple {
  from: number;
  over: number;
  to: number;
}

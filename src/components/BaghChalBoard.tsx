import React from 'react';
import { BOARD_EDGES, BOARD_NODES } from '../engine/boardGraph';
import type { Move, Piece } from '../engine/types';

interface BaghChalBoardProps {
  board: Piece[];
  selectedNode?: number | null;
  legalMovesForSelection?: Move[];
  placementTargets?: number[];
  lastMove?: Move;
  suggestedMove?: Move | null;
  highlightNodes?: number[];
  targetNode?: number | null;
  threatenedGoats?: number[];
  showCoordinates?: boolean;
  disabled?: boolean;
  onNodeClick?: (nodeId: number) => void;
  sizeClassName?: string;
}

const PADDING = 54;
const CELL = 98;
const VIEWBOX_SIZE = PADDING * 2 + CELL * 4; // 500

function nodeCenter(id: number): { x: number; y: number } {
  const n = BOARD_NODES[id];
  return {
    x: PADDING + n.col * CELL,
    y: PADDING + n.row * CELL,
  };
}

const COL_LABELS = ['A', 'B', 'C', 'D', 'E'];
const ROW_LABELS = ['5', '4', '3', '2', '1'];

export const BaghChalBoard: React.FC<BaghChalBoardProps> = ({
  board,
  selectedNode = null,
  legalMovesForSelection = [],
  placementTargets = [],
  lastMove,
  suggestedMove = null,
  highlightNodes = [],
  targetNode = null,
  threatenedGoats = [],
  showCoordinates = true,
  disabled = false,
  onNodeClick,
  sizeClassName = 'w-full max-w-[540px]',
}) => {
  const legalDestMap = new Map<number, Move>();
  for (const m of legalMovesForSelection) {
    legalDestMap.set(m.to, m);
  }
  const placementSet = new Set(placementTargets);
  const highlightSet = new Set(highlightNodes);
  const threatenedSet = new Set(threatenedGoats);

  return (
    <div
      className={`relative select-none rounded-xl border border-[#5C3A21] bg-[#3B2618] p-2.5 sm:p-4 shadow-md ${sizeClassName}`}
    >
      {/* Subtle carved outer wooden frame */}
      <div className="rounded-lg border border-[#8C6239]/50 bg-gradient-to-br from-[#4E3220] via-[#432B1B] to-[#362114] p-1 sm:p-1.5">
        <svg
          viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
          className="block h-auto w-full touch-manipulation"
          role="grid"
          aria-label="Bagh-Chal 5 by 5 intersection board"
        >
          <defs>
            <radialGradient id="woodGrainGlow" cx="50%" cy="45%" r="65%">
              <stop offset="0%" stopColor="#65432B" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#2F1C10" stopOpacity="0.2" />
            </radialGradient>
            <radialGradient id="tigerDisc" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#C2410C" />
              <stop offset="70%" stopColor="#9A3412" />
              <stop offset="100%" stopColor="#6C2109" />
            </radialGradient>
            <radialGradient id="goatDisc" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="75%" stopColor="#F5EFE6" />
              <stop offset="100%" stopColor="#D6CEBE" />
            </radialGradient>
          </defs>

          <rect
            x={8}
            y={8}
            width={VIEWBOX_SIZE - 16}
            height={VIEWBOX_SIZE - 16}
            rx={10}
            fill="url(#woodGrainGlow)"
            stroke="#9C734B"
            strokeOpacity={0.35}
            strokeWidth={1.5}
          />

          {/* Coordinate Labels */}
          {showCoordinates && (
            <g fill="#E7D8C1" fillOpacity={0.78} fontSize={12} fontFamily="JetBrains Mono, monospace">
              {COL_LABELS.map((lbl, idx) => (
                <text
                  key={`col-${lbl}`}
                  x={PADDING + idx * CELL}
                  y={24}
                  textAnchor="middle"
                >
                  {lbl}
                </text>
              ))}
              {ROW_LABELS.map((lbl, idx) => (
                <text
                  key={`row-${lbl}`}
                  x={22}
                  y={PADDING + idx * CELL + 4}
                  textAnchor="middle"
                >
                  {lbl}
                </text>
              ))}
            </g>
          )}

          {/* Explicit 56 Graph Connections */}
          <g stroke="#E6D5BC" strokeWidth={2.5} strokeLinecap="round" strokeOpacity={0.78}>
            {BOARD_EDGES.map(([a, b]) => {
              const p1 = nodeCenter(a);
              const p2 = nodeCenter(b);
              return <line key={`${a}-${b}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} />;
            })}
          </g>

          {/* Suggested Move Guide Line */}
          {suggestedMove && (
            <g>
              {suggestedMove.from !== undefined && (
                <line
                  x1={nodeCenter(suggestedMove.from).x}
                  y1={nodeCenter(suggestedMove.from).y}
                  x2={nodeCenter(suggestedMove.to).x}
                  y2={nodeCenter(suggestedMove.to).y}
                  stroke="#FBBF24"
                  strokeWidth={4}
                  strokeDasharray="6 5"
                  strokeLinecap="round"
                  opacity={0.9}
                />
              )}
              <circle
                cx={nodeCenter(suggestedMove.to).x}
                cy={nodeCenter(suggestedMove.to).y}
                r={24}
                fill="none"
                stroke="#FBBF24"
                strokeWidth={2.5}
                strokeDasharray="5 3"
              />
            </g>
          )}

          {/* Last Move Trail */}
          {lastMove && lastMove.from !== undefined && (
            <line
              x1={nodeCenter(lastMove.from).x}
              y1={nodeCenter(lastMove.from).y}
              x2={nodeCenter(lastMove.to).x}
              y2={nodeCenter(lastMove.to).y}
              stroke="#FDE68A"
              strokeWidth={3}
              strokeOpacity={0.45}
              strokeLinecap="round"
            />
          )}

          {/* 25 Interactive Intersection Nodes */}
          {BOARD_NODES.map((node) => {
            const { x, y } = nodeCenter(node.id);
            const piece = board[node.id];
            const isSelected = selectedNode === node.id;
            const destMove = legalDestMap.get(node.id);
            const isPlacementTarget = placementSet.has(node.id);
            const isHighlighted = highlightSet.has(node.id);
            const isTutorialTarget = targetNode === node.id;
            const isThreatened = threatenedSet.has(node.id) && piece === 'GOAT';
            const isLastMoveNode = lastMove?.to === node.id || lastMove?.from === node.id;

            const pieceLabel =
              piece === 'TIGER' ? 'Tiger' : piece === 'GOAT' ? 'Goat' : 'Empty';

            return (
              <g
                key={node.id}
                role="button"
                tabIndex={disabled ? -1 : 0}
                aria-label={`${node.label} ${pieceLabel}${destMove ? ' legal move' : ''}`}
                className={disabled ? 'cursor-default' : 'cursor-pointer focus:outline-none'}
                onClick={() => {
                  if (!disabled && onNodeClick) onNodeClick(node.id);
                }}
                onKeyDown={(e) => {
                  if (!disabled && onNodeClick && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    onNodeClick(node.id);
                  }
                }}
              >
                {/* Generous >= 44px transparent hit target */}
                <circle cx={x} cy={y} r={30} fill="transparent" />

                {/* Engraved intersection socket */}
                <circle
                  cx={x}
                  cy={y}
                  r={node.hasDiagonal ? 6.5 : 5}
                  fill="#29180D"
                  stroke="#D6BFA3"
                  strokeWidth={1.6}
                  strokeOpacity={0.85}
                />

                {/* Highlight / Tutorial / Last Move markers */}
                {isLastMoveNode && (
                  <circle
                    cx={x}
                    cy={y}
                    r={25}
                    fill="none"
                    stroke="#FDE68A"
                    strokeWidth={1.5}
                    strokeOpacity={0.55}
                  />
                )}

                {isHighlighted && (
                  <circle
                    cx={x}
                    cy={y}
                    r={26}
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth={2.5}
                    strokeOpacity={0.85}
                  />
                )}

                {isTutorialTarget && (
                  <circle
                    cx={x}
                    cy={y}
                    r={24}
                    fill="#10B981"
                    fillOpacity={0.18}
                    stroke="#34D399"
                    strokeWidth={2.5}
                    strokeDasharray="4 3"
                  />
                )}

                {/* Legal placement target (Phase A) */}
                {isPlacementTarget && piece === 'EMPTY' && (
                  <circle
                    cx={x}
                    cy={y}
                    r={11}
                    fill="#FBF9F5"
                    fillOpacity={0.22}
                    stroke="#FBF9F5"
                    strokeWidth={1.5}
                    strokeOpacity={0.6}
                  />
                )}

                {/* Legal movement / capture destination */}
                {destMove && (
                  <g>
                    <circle
                      cx={x}
                      cy={y}
                      r={18}
                      fill={destMove.type === 'CAPTURE' ? '#DC2626' : '#10B981'}
                      fillOpacity={0.28}
                      stroke={destMove.type === 'CAPTURE' ? '#FCA5A5' : '#6EE7B7'}
                      strokeWidth={2.4}
                    />
                    {destMove.type === 'CAPTURE' ? (
                      <text
                        x={x}
                        y={y + 5}
                        textAnchor="middle"
                        fill="#FEE2E2"
                        fontSize={16}
                        fontWeight={700}
                      >
                        ×
                      </text>
                    ) : (
                      <circle cx={x} cy={y} r={5.5} fill="#A7F3D0" />
                    )}
                  </g>
                )}

                {/* Threatened Goat Alert Ring */}
                {isThreatened && (
                  <circle
                    cx={x}
                    cy={y}
                    r={24}
                    fill="none"
                    stroke="#EF4444"
                    strokeWidth={2.2}
                    strokeDasharray="4 3"
                  />
                )}

                {/* Piece Rendering */}
                {piece === 'TIGER' && (
                  <g
                    style={{
                      transform: isSelected ? 'scale(1.08)' : 'scale(1)',
                      transformOrigin: `${x}px ${y}px`,
                      transition: 'transform 160ms cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                  >
                    {isSelected && (
                      <circle
                        cx={x}
                        cy={y}
                        r={26}
                        fill="none"
                        stroke="#FDE68A"
                        strokeWidth={2.8}
                      />
                    )}
                    <circle
                      cx={x}
                      cy={y + 2}
                      r={21}
                      fill="#1A0E06"
                      fillOpacity={0.45}
                    />
                    <circle
                      cx={x}
                      cy={y}
                      r={20.5}
                      fill="url(#tigerDisc)"
                      stroke="#FDE68A"
                      strokeWidth={2}
                    />
                    {/* Minimalist carved Tiger silhouette */}
                    <path
                      d={`M ${x - 8} ${y - 6} L ${x - 10} ${y - 11} L ${x - 4} ${y - 8} Q ${x} ${y - 9} ${x + 4} ${y - 8} L ${x + 10} ${y - 11} L ${x + 8} ${y - 6} Q ${x + 11} ${y + 1} ${x + 7} ${y + 8} Q ${x} ${y + 11} ${x - 7} ${y + 8} Q ${x - 11} ${y + 1} ${x - 8} ${y - 6} Z`}
                      fill="#FEF3C7"
                      fillOpacity={0.92}
                    />
                    {/* Tiger brow & stripe marks */}
                    <path
                      d={`M ${x - 4} ${y - 4} L ${x} ${y - 2} L ${x + 4} ${y - 4} M ${x - 5} ${y + 2} L ${x + 5} ${y + 2}`}
                      stroke="#7C2D12"
                      strokeWidth={1.8}
                      strokeLinecap="round"
                      fill="none"
                    />
                  </g>
                )}

                {piece === 'GOAT' && (
                  <g
                    style={{
                      transform: isSelected ? 'scale(1.08)' : 'scale(1)',
                      transformOrigin: `${x}px ${y}px`,
                      transition: 'transform 160ms cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                  >
                    {isSelected && (
                      <circle
                        cx={x}
                        cy={y}
                        r={24}
                        fill="none"
                        stroke="#14532D"
                        strokeWidth={2.8}
                      />
                    )}
                    <circle
                      cx={x}
                      cy={y + 2}
                      r={17.5}
                      fill="#1A0E06"
                      fillOpacity={0.35}
                    />
                    <circle
                      cx={x}
                      cy={y}
                      r={17}
                      fill="url(#goatDisc)"
                      stroke="#44403C"
                      strokeWidth={1.8}
                    />
                    {/* Minimalist horned Goat emblem */}
                    <path
                      d={`M ${x - 6} ${y - 5} Q ${x - 8} ${y - 10} ${x - 3} ${y - 9} M ${x + 6} ${y - 5} Q ${x + 8} ${y - 10} ${x + 3} ${y - 9}`}
                      stroke="#292524"
                      strokeWidth={2}
                      strokeLinecap="round"
                      fill="none"
                    />
                    <path
                      d={`M ${x - 6} ${y - 4} Q ${x} ${y - 6} ${x + 6} ${y - 4} Q ${x + 7} ${y + 3} ${x} ${y + 8} Q ${x - 7} ${y + 3} ${x - 6} ${y - 4} Z`}
                      fill="#292524"
                      fillOpacity={0.85}
                    />
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

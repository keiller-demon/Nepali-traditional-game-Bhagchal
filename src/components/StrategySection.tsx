import React, { useEffect, useState } from 'react';
import { CheckCircle2, RotateCcw } from 'lucide-react';
import {
  GOAT_STRATEGIES,
  TACTICAL_PUZZLES,
  TIGER_STRATEGIES,
} from '../data/educationalContent';
import { getLegalMovesForNode } from '../engine/rules';
import type { GameState, Move, Piece } from '../engine/types';
import type { Language } from '../i18n/translations';
import { BaghChalBoard } from './BaghChalBoard';

interface StrategySectionProps {
  lang: Language;
  header: { title: string; subtitle: string };
}

export const StrategySection: React.FC<StrategySectionProps> = ({ lang, header }) => {
  const [activeSide, setActiveSide] = useState<'TIGER' | 'GOAT'>('TIGER');
  const [puzzleIdx, setPuzzleIdx] = useState(0);
  const [selectedNode, setSelectedNode] = useState<number | null>(null);
  const [solved, setSolved] = useState(false);
  const [boardOverride, setBoardOverride] = useState<Piece[] | null>(null);
  const [puzzleMsg, setPuzzleMsg] = useState<string | null>(null);

  const puzzle = TACTICAL_PUZZLES[puzzleIdx];
  const strategies = activeSide === 'TIGER' ? TIGER_STRATEGIES : GOAT_STRATEGIES;
  const displayBoard = boardOverride ?? puzzle.board;

  useEffect(() => {
    setSelectedNode(null);
    setSolved(false);
    setBoardOverride(null);
    setPuzzleMsg(null);
  }, [puzzleIdx]);

  const puzzleState: GameState = {
    board: displayBoard,
    turn: puzzle.side,
    phase: puzzle.phase,
    goatsInReserve: puzzle.goatsInReserve,
    goatsCaptured: puzzle.goatsCaptured,
    status: 'PLAYING',
    drawPolicy: 'THREEFOLD_REPETITION',
    moveHistory: [],
    positionCounts: {},
    plyCount: 0,
  };

  const legalSelectionMoves: Move[] =
    selectedNode !== null && !solved
      ? getLegalMovesForNode(puzzleState, selectedNode)
      : [];

  const handlePuzzleClick = (nodeId: number) => {
    if (solved) return;
    const sol = puzzle.solution;

    if (sol.type === 'PLACE') {
      if (nodeId === sol.to && displayBoard[nodeId] === 'EMPTY') {
        const next = [...displayBoard];
        next[nodeId] = 'GOAT';
        setBoardOverride(next);
        setSolved(true);
        setPuzzleMsg(lang === 'ne' ? puzzle.explanationNe : puzzle.explanationEn);
      } else {
        setPuzzleMsg(
          lang === 'ne'
            ? 'त्यो बाख्रा अझै खतरामा छ—बाघको छलाङ रोक्ने बिन्दु छान्नुहोस्।'
            : 'That still leaves the capture open—find the intersection that blocks the jump.'
        );
      }
      return;
    }

    if (selectedNode === null) {
      if (displayBoard[nodeId] === puzzle.side) {
        setSelectedNode(nodeId);
      }
      return;
    }

    if (selectedNode === nodeId) {
      setSelectedNode(null);
      return;
    }

    const matchingMove = legalSelectionMoves.find((m) => m.to === nodeId);
    if (!matchingMove) {
      if (displayBoard[nodeId] === puzzle.side) {
        setSelectedNode(nodeId);
      } else {
        setSelectedNode(null);
      }
      return;
    }

    if (selectedNode === sol.from && nodeId === sol.to) {
      const next = [...displayBoard];
      const moving = next[selectedNode];
      next[selectedNode] = 'EMPTY';
      next[nodeId] = moving;
      if (matchingMove.type === 'CAPTURE' && matchingMove.captured !== undefined) {
        next[matchingMove.captured] = 'EMPTY';
      }
      setBoardOverride(next);
      setSelectedNode(null);
      setSolved(true);
      setPuzzleMsg(lang === 'ne' ? puzzle.explanationNe : puzzle.explanationEn);
    } else {
      setSelectedNode(null);
      setPuzzleMsg(
        lang === 'ne'
          ? 'यो चाल वैध छ तर पहेलीको निर्णायक चाल होइन—फेरि प्रयास गर्नुहोस्।'
          : 'Legal move, but not the decisive tactical continuation—try again.'
      );
    }
  };

  return (
    <section id="strategy" className="border-t border-stone-300/70 bg-[#F7F4EE] py-12 lg:py-16">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <h2 className="font-display text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">
              {header.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-stone-600">{header.subtitle}</p>
          </div>

          {/* Tiger / Goat Strategy Switch */}
          <div className="inline-flex items-center gap-1 rounded-lg border border-stone-300/80 bg-[#EDE8DE] p-1 self-start">
            <button
              type="button"
              onClick={() => setActiveSide('TIGER')}
              className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                activeSide === 'TIGER'
                  ? 'bg-[#9A3412] text-white'
                  : 'text-stone-700 hover:text-stone-950'
              }`}
            >
              {lang === 'ne' ? 'बाघ रणनीति' : 'Tiger Doctrine'}
            </button>
            <button
              type="button"
              onClick={() => setActiveSide('GOAT')}
              className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                activeSide === 'GOAT'
                  ? 'bg-[#14532D] text-white'
                  : 'text-stone-700 hover:text-stone-950'
              }`}
            >
              {lang === 'ne' ? 'बाख्रा रणनीति' : 'Goat Doctrine'}
            </button>
          </div>
        </div>

        {/* Strategy Cards Grid */}
        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {strategies.map((tip) => (
            <article
              key={tip.titleEn}
              className="rounded-lg border border-stone-300/80 bg-[#FBF9F5] p-5"
            >
              <div className="text-xs font-medium text-stone-500">
                {tip.tier === 'BEGINNER'
                  ? lang === 'ne'
                    ? 'सुरुवाती स्तर'
                    : 'Beginner'
                  : tip.tier === 'INTERMEDIATE'
                    ? lang === 'ne'
                      ? 'मध्यम स्तर'
                      : 'Intermediate'
                    : lang === 'ne'
                      ? 'उच्च स्तर'
                      : 'Advanced'}
              </div>
              <h3 className="mt-1.5 font-display text-lg font-semibold text-stone-900">
                {lang === 'ne' ? tip.titleNe : tip.titleEn}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-700">
                {lang === 'ne' ? tip.bodyNe : tip.bodyEn}
              </p>
            </article>
          ))}
        </div>

        {/* Interactive Tactical Puzzles */}
        <div className="mt-12 rounded-xl border border-stone-300/80 bg-[#FBF9F5] p-5 sm:p-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-6">
              <div className="text-xs font-medium text-stone-500">
                {lang === 'ne' ? 'रणकौशल पहेली' : 'Interactive Tactical Puzzles'} ·{' '}
                {puzzleIdx + 1} / {TACTICAL_PUZZLES.length}
              </div>
              <h3 className="mt-1.5 font-display text-2xl font-semibold text-stone-900">
                {lang === 'ne' ? puzzle.titleNe : puzzle.titleEn}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-700">
                {lang === 'ne' ? puzzle.promptNe : puzzle.promptEn}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {TACTICAL_PUZZLES.map((pz, idx) => (
                  <button
                    key={pz.id}
                    type="button"
                    onClick={() => setPuzzleIdx(idx)}
                    className={`rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors ${
                      idx === puzzleIdx
                        ? 'border-[#3B2618] bg-[#3B2618] text-white'
                        : 'border-stone-300 bg-white text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    #{idx + 1} · {pz.side === 'TIGER' ? (lang === 'ne' ? 'बाघ' : 'Tiger') : lang === 'ne' ? 'बाख्रा' : 'Goat'}
                  </button>
                ))}
              </div>

              {puzzleMsg && (
                <div
                  className={`mt-4 rounded-lg border p-3.5 text-sm leading-relaxed ${
                    solved
                      ? 'border-emerald-700/30 bg-emerald-50 text-emerald-950'
                      : 'border-amber-700/30 bg-amber-50 text-amber-950'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {solved && <CheckCircle2 className="h-4 w-4 text-emerald-700 mt-0.5 shrink-0" />}
                    <span>{puzzleMsg}</span>
                  </div>
                </div>
              )}

              <div className="mt-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedNode(null);
                    setSolved(false);
                    setBoardOverride(null);
                    setPuzzleMsg(null);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-md border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  {lang === 'ne' ? 'पुनः प्रयास' : 'Reset Puzzle'}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setPuzzleMsg(lang === 'ne' ? puzzle.explanationNe : puzzle.explanationEn)
                  }
                  className="text-xs font-medium text-[#9A3412] underline underline-offset-2 hover:text-[#7C2D12]"
                >
                  {lang === 'ne' ? 'समाधान व्याख्या हेर्नुहोस्' : 'Show Solution Note'}
                </button>
              </div>
            </div>

            <div className="lg:col-span-6 flex justify-center">
              <BaghChalBoard
                board={displayBoard}
                selectedNode={selectedNode}
                legalMovesForSelection={legalSelectionMoves}
                placementTargets={
                  puzzle.solution.type === 'PLACE' && !solved
                    ? displayBoard
                        .map((p, i) => (p === 'EMPTY' ? i : -1))
                        .filter((i) => i !== -1)
                    : []
                }
                disabled={solved}
                onNodeClick={handlePuzzleClick}
                sizeClassName="w-full max-w-[430px]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

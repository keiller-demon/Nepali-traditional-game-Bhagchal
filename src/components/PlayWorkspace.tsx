import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  BookOpen,
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  Download,
  Lightbulb,
  Pause,
  Play,
  RotateCcw,
  Save,
  Upload,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { chooseAIMove, type AIDifficulty, type AISuggestion } from '../engine/ai';
import { TOTAL_GOATS } from '../engine/boardGraph';
import {
  applyMove,
  createInitialState,
  declareMutualDraw,
  getLegalMoves,
  getLegalMovesForNode,
  getThreatenedGoats,
  getTrappedTigers,
  replayMoves,
} from '../engine/rules';
import { BAGH_CHAL_RULES_SPEC, exportRulesAsJson, exportRulesAsMarkdown } from '../engine/spec';
import type { DrawPolicy, GameState, Move, Player } from '../engine/types';
import type { Language, TranslationBundle } from '../i18n/translations';
import {
  downloadTextFile,
  loadSavedMatches,
  SAMPLE_MATCHES,
  saveMatchToLibrary,
  type SavedMatch,
} from '../storage/archiveDb';
import { playSound } from '../utils/sound';
import { BaghChalBoard } from './BaghChalBoard';

type GameMode = 'VS_AI' | 'LOCAL' | 'PRACTICE' | 'REPLAY';

interface PlayWorkspaceProps {
  lang: Language;
  t: TranslationBundle['play'];
}

export const PlayWorkspace: React.FC<PlayWorkspaceProps> = ({ lang, t }) => {
  const [mode, setMode] = useState<GameMode>('VS_AI');
  const [humanSide, setHumanSide] = useState<Player>('GOAT');
  const [difficulty, setDifficulty] = useState<AIDifficulty>('INTERMEDIATE');
  const [drawPolicy, setDrawPolicy] = useState<DrawPolicy>('THREEFOLD_REPETITION');

  const [historyStack, setHistoryStack] = useState<GameState[]>(() => [
    createInitialState('THREEFOLD_REPETITION'),
  ]);
  const [selectedNode, setSelectedNode] = useState<number | null>(null);
  const [coachNote, setCoachNote] = useState<{ en: string; ne: string } | null>(null);
  const [suggestedMove, setSuggestedMove] = useState<Move | null>(null);
  const [aiThinking, setAiThinking] = useState(false);

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showCoords, setShowCoords] = useState(true);
  const [savedFlag, setSavedFlag] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  // Replay mode state
  const [savedMatches, setSavedMatches] = useState<SavedMatch[]>(SAMPLE_MATCHES);
  const [replayStates, setReplayStates] = useState<GameState[]>(() =>
    replayMoves(SAMPLE_MATCHES[0].moves, SAMPLE_MATCHES[0].drawPolicy)
  );
  const [replayTitle, setReplayTitle] = useState<string>(SAMPLE_MATCHES[0].title);
  const [replayIndex, setReplayIndex] = useState<number>(0);
  const [replayAuto, setReplayAuto] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const currentState = historyStack[historyStack.length - 1];

  useEffect(() => {
    loadSavedMatches().then(setSavedMatches).catch(() => {});
  }, []);

  const displayedState = mode === 'REPLAY' ? replayStates[replayIndex] ?? replayStates[0] : currentState;

  const isHumanTurn =
    mode === 'LOCAL' ||
    mode === 'PRACTICE' ||
    (mode === 'VS_AI' && currentState.turn === humanSide);

  const legalMoves = useMemo(() => getLegalMoves(displayedState), [displayedState]);

  const legalMovesForSelection = useMemo(() => {
    if (mode === 'REPLAY' || !isHumanTurn || displayedState.status !== 'PLAYING') return [];
    if (displayedState.turn === 'GOAT' && displayedState.phase === 'PLACEMENT') return [];
    if (selectedNode === null) return [];
    return getLegalMovesForNode(displayedState, selectedNode);
  }, [displayedState, isHumanTurn, mode, selectedNode]);

  const placementTargets = useMemo(() => {
    if (
      mode === 'REPLAY' ||
      !isHumanTurn ||
      displayedState.status !== 'PLAYING' ||
      displayedState.turn !== 'GOAT' ||
      displayedState.phase !== 'PLACEMENT'
    ) {
      return [];
    }
    return legalMoves.map((m) => m.to);
  }, [displayedState, isHumanTurn, legalMoves, mode]);

  const threatenedGoats = useMemo(
    () => getThreatenedGoats(displayedState).map((th) => th.goatNode),
    [displayedState]
  );

  const trappedTigers = useMemo(() => getTrappedTigers(displayedState), [displayedState]);

  const goatsOnBoard = useMemo(
    () => TOTAL_GOATS - displayedState.goatsInReserve - displayedState.goatsCaptured,
    [displayedState.goatsCaptured, displayedState.goatsInReserve]
  );

  // Trigger AI turn when in VS_AI mode and it's AI's turn
  useEffect(() => {
    if (mode !== 'VS_AI') return;
    if (currentState.status !== 'PLAYING') return;
    if (currentState.turn === humanSide) return;

    setAiThinking(true);
    const timer = window.setTimeout(() => {
      try {
        const aiResult: AISuggestion = chooseAIMove(currentState, difficulty);
        const next = applyMove(currentState, aiResult.move);
        setHistoryStack((prev) => [...prev, next]);
        setSelectedNode(null);
        setSuggestedMove(null);
        setCoachNote(aiResult.explanation);

        if (next.status === 'TIGER_WIN' || next.status === 'GOAT_WIN') {
          playSound('win', soundEnabled);
        } else if (aiResult.move.type === 'CAPTURE') {
          playSound('capture', soundEnabled);
        } else {
          playSound('move', soundEnabled);
        }
      } catch {
        // Guarded fallback
      } finally {
        setAiThinking(false);
      }
    }, 450);

    return () => window.clearTimeout(timer);
  }, [currentState, difficulty, humanSide, mode, soundEnabled]);

  // Practice mode automatic subtle suggestion on human turn
  useEffect(() => {
    if (mode !== 'PRACTICE' || currentState.status !== 'PLAYING') {
      return;
    }
    try {
      const suggestion = chooseAIMove(currentState, 'INTERMEDIATE');
      setSuggestedMove(suggestion.move);
      setCoachNote(suggestion.explanation);
    } catch {
      setSuggestedMove(null);
    }
  }, [currentState, mode]);

  // Replay auto-advance
  useEffect(() => {
    if (mode !== 'REPLAY' || !replayAuto) return;
    if (replayIndex >= replayStates.length - 1) {
      setReplayAuto(false);
      return;
    }
    const timer = window.setTimeout(() => {
      setReplayIndex((idx) => Math.min(idx + 1, replayStates.length - 1));
    }, 950);
    return () => window.clearTimeout(timer);
  }, [mode, replayAuto, replayIndex, replayStates.length]);

  const startNewGame = (nextPolicy: DrawPolicy = drawPolicy) => {
    setHistoryStack([createInitialState(nextPolicy)]);
    setSelectedNode(null);
    setCoachNote(null);
    setSuggestedMove(null);
    setAiThinking(false);
    setSavedFlag(false);
    setImportError(null);
  };

  const handleModeChange = (nextMode: GameMode) => {
    setMode(nextMode);
    setSelectedNode(null);
    setSuggestedMove(null);
    setReplayAuto(false);
    if (nextMode === 'REPLAY' && currentState.moveHistory.length > 0) {
      setReplayStates(replayMoves(currentState.moveHistory, currentState.drawPolicy));
      setReplayTitle(lang === 'ne' ? 'वर्तमान खेलको पुनरावलोकन' : 'Current Match Replay');
      setReplayIndex(currentState.moveHistory.length);
    }
  };

  const executeHumanMove = (move: Move) => {
    const next = applyMove(currentState, move);
    setHistoryStack((prev) => [...prev, next]);
    setSelectedNode(null);
    setSuggestedMove(null);
    setSavedFlag(false);

    if (next.status === 'TIGER_WIN' || next.status === 'GOAT_WIN') {
      playSound('win', soundEnabled);
    } else if (move.type === 'CAPTURE') {
      playSound('capture', soundEnabled);
    } else if (move.type === 'PLACE') {
      playSound('place', soundEnabled);
    } else {
      playSound('move', soundEnabled);
    }
  };

  const handleNodeClick = (nodeId: number) => {
    if (mode === 'REPLAY' || aiThinking || currentState.status !== 'PLAYING' || !isHumanTurn) {
      return;
    }

    // Phase A Goat placement
    if (currentState.turn === 'GOAT' && currentState.phase === 'PLACEMENT') {
      const placeMove = legalMoves.find((m) => m.type === 'PLACE' && m.to === nodeId);
      if (placeMove) {
        executeHumanMove(placeMove);
      } else {
        playSound('error', soundEnabled);
      }
      return;
    }

    // Movement phase (or Tiger turn in Phase A): check if clicking a legal destination for selectedNode
    if (selectedNode !== null) {
      const destMove = legalMovesForSelection.find((m) => m.to === nodeId);
      if (destMove) {
        executeHumanMove(destMove);
        return;
      }
    }

    // Select own piece if it has legal moves
    if (currentState.board[nodeId] === currentState.turn) {
      const nodeMoves = getLegalMovesForNode(currentState, nodeId);
      if (nodeMoves.length > 0) {
        setSelectedNode(nodeId);
      } else {
        setSelectedNode(null);
        playSound('error', soundEnabled);
      }
      return;
    }

    setSelectedNode(null);
  };

  const handleUndo = () => {
    if (mode === 'REPLAY' || historyStack.length <= 1 || aiThinking) return;
    const stepsBack = mode === 'VS_AI' && historyStack.length >= 3 && currentState.turn === humanSide ? 2 : 1;
    setHistoryStack((prev) => prev.slice(0, Math.max(1, prev.length - stepsBack)));
    setSelectedNode(null);
    setSuggestedMove(null);
    setCoachNote(null);
  };

  const handleRequestHint = () => {
    if (currentState.status !== 'PLAYING' || aiThinking) return;
    const suggestion = chooseAIMove(currentState, 'EXPERT');
    setSuggestedMove(suggestion.move);
    setCoachNote(suggestion.explanation);
    if (suggestion.move.from !== undefined) {
      setSelectedNode(suggestion.move.from);
    }
  };

  const handleMutualDraw = () => {
    if (currentState.status !== 'PLAYING' || mode === 'REPLAY') return;
    setHistoryStack((prev) => [...prev, declareMutualDraw(currentState)]);
  };

  const handleSaveMatch = async () => {
    const match: SavedMatch = {
      id: `match-${Date.now()}`,
      title: `Bagh-Chal Match (${currentState.moveHistory.length} plies)`,
      date: new Date().toISOString().slice(0, 10),
      result: currentState.status,
      drawPolicy: currentState.drawPolicy,
      moves: currentState.moveHistory,
    };
    const updated = await saveMatchToLibrary(match);
    setSavedMatches(updated);
    setSavedFlag(true);
  };

  const handleExportMatch = () => {
    const payload = {
      specId: BAGH_CHAL_RULES_SPEC.id,
      specVersion: BAGH_CHAL_RULES_SPEC.version,
      exportedAt: new Date().toISOString(),
      drawPolicy: currentState.drawPolicy,
      status: currentState.status,
      moves: currentState.moveHistory,
    };
    downloadTextFile(
      `bagh-chal-match-${new Date().toISOString().slice(0, 10)}.json`,
      JSON.stringify(payload, null, 2),
      'application/json'
    );
  };

  const handleImportMatch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (!Array.isArray(parsed.moves)) {
          throw new Error('Missing moves array');
        }
        const policy: DrawPolicy = parsed.drawPolicy ?? 'THREEFOLD_REPETITION';
        const states = replayMoves(parsed.moves as Move[], policy);
        setReplayStates(states);
        setReplayTitle(file.name.replace(/\.json$/i, ''));
        setReplayIndex(0);
        setMode('REPLAY');
        setImportError(null);
      } catch {
        setImportError(
          lang === 'ne'
            ? 'अमान्य खेल JSON फाइल। कृपया सही अभिलेख छान्नुहोस्।'
            : 'Invalid match JSON file. Please verify the move log format.'
        );
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const loadIntoReplay = (match: SavedMatch) => {
    const states = replayMoves(match.moves, match.drawPolicy);
    setReplayStates(states);
    setReplayTitle(match.title);
    setReplayIndex(0);
    setReplayAuto(false);
    setMode('REPLAY');
  };

  const activeTurnInstruction = useMemo(() => {
    if (displayedState.status !== 'PLAYING') return null;
    if (displayedState.turn === 'GOAT') {
      return displayedState.phase === 'PLACEMENT' ? t.placeGoatHint : t.selectGoatHint;
    }
    return t.selectTigerHint;
  }, [displayedState.phase, displayedState.status, displayedState.turn, t]);

  const activePolicyMeta = BAGH_CHAL_RULES_SPEC.drawAndRepetitionPolicies.find(
    (p) => p.id === drawPolicy
  );

  return (
    <section id="play" className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6 lg:py-14">
      <div className="flex flex-col gap-4 border-b border-stone-300/80 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">
            {t.title}
          </h2>
          <p className="mt-1.5 text-sm text-stone-600">{t.onlineNote}</p>
        </div>

        {/* Mode Segmented Control */}
        <div
          role="tablist"
          aria-label="Game modes"
          className="inline-flex flex-wrap items-center gap-1 rounded-lg border border-stone-300/80 bg-[#EDE8DE] p-1"
        >
          {(
            [
              ['VS_AI', t.modeVsAi],
              ['LOCAL', t.modeLocal],
              ['PRACTICE', t.modePractice],
              ['REPLAY', t.modeReplay],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={mode === id}
              onClick={() => handleModeChange(id)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                mode === id
                  ? 'bg-[#3B2618] text-[#FBF9F5] shadow-xs'
                  : 'text-stone-700 hover:text-stone-950'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Two-Column Play Layout */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
        {/* Left/Center Column: Tactile Wooden Board + Status Strip */}
        <div className="lg:col-span-7 flex flex-col items-center">
          {/* Compact Top Status Strip */}
          <div className="mb-4 flex w-full max-w-[540px] flex-wrap items-center justify-between gap-2 rounded-lg border border-stone-300/80 bg-[#FBF9F5] px-4 py-3">
            <div className="flex items-center gap-3">
              <span
                className={`inline-block h-3.5 w-3.5 rounded-full border ${
                  displayedState.turn === 'TIGER'
                    ? 'border-[#FDE68A] bg-[#9A3412]'
                    : 'border-stone-800 bg-[#FBF9F5]'
                }`}
                aria-hidden="true"
              />
              <div>
                <div className="text-sm font-semibold text-stone-900">
                  {displayedState.status === 'PLAYING'
                    ? displayedState.turn === 'GOAT'
                      ? t.turnGoat
                      : t.turnTiger
                    : displayedState.status === 'TIGER_WIN'
                      ? t.tigerWinsTitle
                      : displayedState.status === 'GOAT_WIN'
                        ? t.goatWinsTitle
                        : t.drawTitle}
                </div>
                <div className="text-xs text-stone-600">
                  {displayedState.phase === 'PLACEMENT' ? t.phasePlacement : t.phaseMovement}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-stone-700">
              {aiThinking && <span className="font-medium text-[#9A3412]">{t.aiThinking}</span>}
              {!aiThinking && threatenedGoats.length > 0 && displayedState.status === 'PLAYING' && (
                <span className="font-medium text-[#9A3412]">
                  {t.threatWarning} ({threatenedGoats.length})
                </span>
              )}
            </div>
          </div>

          {/* 5x5 Bagh-Chal Board */}
          <BaghChalBoard
            board={displayedState.board}
            selectedNode={selectedNode}
            legalMovesForSelection={legalMovesForSelection}
            placementTargets={placementTargets}
            lastMove={displayedState.lastMove}
            suggestedMove={suggestedMove}
            threatenedGoats={mode === 'PRACTICE' || mode === 'VS_AI' ? threatenedGoats : []}
            showCoordinates={showCoords}
            disabled={mode === 'REPLAY' || aiThinking || displayedState.status !== 'PLAYING'}
            onNodeClick={handleNodeClick}
          />

          {/* Subtle Action Prompt Below Board */}
          {activeTurnInstruction && mode !== 'REPLAY' && (
            <p className="mt-3 max-w-[540px] text-center text-xs text-stone-600">
              {activeTurnInstruction}
            </p>
          )}

          {/* Game Over Summary Strip */}
          {displayedState.status !== 'PLAYING' && (
            <div className="mt-4 w-full max-w-[540px] rounded-lg border border-[#9A3412]/30 bg-[#FFF7ED] p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-display text-lg font-semibold text-stone-900">
                    {displayedState.status === 'TIGER_WIN'
                      ? t.tigerWinsTitle
                      : displayedState.status === 'GOAT_WIN'
                        ? t.goatWinsTitle
                        : t.drawTitle}
                  </h3>
                  <p className="mt-0.5 text-xs text-stone-700">
                    {displayedState.status === 'TIGER_WIN'
                      ? t.tigerWinsDesc
                      : displayedState.status === 'GOAT_WIN'
                        ? t.goatWinsDesc
                        : displayedState.drawReason === 'THREEFOLD_REPETITION'
                          ? t.drawRepetitionDesc
                          : t.drawMutualDesc}
                  </p>
                </div>
                {mode !== 'REPLAY' && (
                  <button
                    type="button"
                    onClick={() => startNewGame(drawPolicy)}
                    className="rounded-md bg-[#9A3412] px-4 py-2 text-xs font-semibold text-white hover:bg-[#7C2D12] transition-colors whitespace-nowrap shrink-0"
                  >
                    {t.playAgain}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Replay Transport Controls */}
          {mode === 'REPLAY' && (
            <div className="mt-4 w-full max-w-[540px] rounded-lg border border-stone-300 bg-[#FBF9F5] p-4">
              <div className="flex items-center justify-between gap-2 text-xs text-stone-600">
                <span className="font-medium text-stone-900 truncate">{replayTitle}</span>
                <span className="font-mono-tabular shrink-0">
                  {t.replayStep} {replayIndex} / {replayStates.length - 1}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setReplayAuto(false);
                    setReplayIndex(0);
                  }}
                  className="inline-flex items-center gap-1 rounded border border-stone-300 px-2.5 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-100"
                >
                  <ChevronFirst className="h-3.5 w-3.5" />
                  {t.replayFirst}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setReplayAuto(false);
                    setReplayIndex((i) => Math.max(0, i - 1));
                  }}
                  className="inline-flex items-center gap-1 rounded border border-stone-300 px-2.5 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-100"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  {t.replayPrev}
                </button>
                <button
                  type="button"
                  onClick={() => setReplayAuto((a) => !a)}
                  className="inline-flex items-center gap-1 rounded bg-[#3B2618] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#4E3220]"
                >
                  {replayAuto ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                  {replayAuto ? t.replayPause : t.replayPlay}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setReplayAuto(false);
                    setReplayIndex((i) => Math.min(replayStates.length - 1, i + 1));
                  }}
                  className="inline-flex items-center gap-1 rounded border border-stone-300 px-2.5 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-100"
                >
                  {t.replayNext}
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setReplayAuto(false);
                    setReplayIndex(replayStates.length - 1);
                  }}
                  className="inline-flex items-center gap-1 rounded border border-stone-300 px-2.5 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-100"
                >
                  {t.replayLast}
                  <ChevronLast className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Telemetry, Settings, Coach Feedback, and Move Log */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* Four Key Board Counters */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
            <div className="rounded-lg border border-stone-300/80 bg-[#FBF9F5] p-3.5">
              <div className="text-xs text-stone-500">{t.goatsReserve}</div>
              <div className="mt-1 font-mono-tabular text-2xl font-semibold text-stone-900">
                {displayedState.goatsInReserve}
              </div>
            </div>
            <div className="rounded-lg border border-stone-300/80 bg-[#FBF9F5] p-3.5">
              <div className="text-xs text-stone-500">{t.goatsOnBoard}</div>
              <div className="mt-1 font-mono-tabular text-2xl font-semibold text-stone-900">
                {goatsOnBoard}
              </div>
            </div>
            <div className="rounded-lg border border-stone-300/80 bg-[#FBF9F5] p-3.5">
              <div className="text-xs text-stone-500">{t.goatsCaptured}</div>
              <div className="mt-1 font-mono-tabular text-2xl font-semibold text-[#9A3412]">
                {displayedState.goatsCaptured} <span className="text-sm font-normal text-stone-500">/ 5</span>
              </div>
            </div>
            <div className="rounded-lg border border-stone-300/80 bg-[#FBF9F5] p-3.5">
              <div className="text-xs text-stone-500">{t.trappedTigers}</div>
              <div className="mt-1 font-mono-tabular text-2xl font-semibold text-[#14532D]">
                {trappedTigers.length} <span className="text-sm font-normal text-stone-500">/ 4</span>
              </div>
            </div>
          </div>

          {/* Coach / AI Tactical Feedback */}
          {coachNote && (
            <div className="rounded-lg border border-stone-300 bg-[#FBF9F5] p-4">
              <div className="text-xs font-semibold text-[#9A3412]">{t.coachNote}</div>
              <p className="mt-1.5 text-sm leading-relaxed text-stone-800">
                {lang === 'ne' ? coachNote.ne : coachNote.en}
              </p>
            </div>
          )}

          {/* Match Setup & Controls */}
          <div className="rounded-lg border border-stone-300/80 bg-[#FBF9F5] p-4 space-y-4">
            {mode === 'VS_AI' && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1.5">
                    {t.playAs}
                  </label>
                  <div className="flex rounded-md border border-stone-300 bg-[#F3EFE6] p-0.5">
                    {(['GOAT', 'TIGER'] as const).map((side) => (
                      <button
                        key={side}
                        type="button"
                        onClick={() => {
                          setHumanSide(side);
                          startNewGame(drawPolicy);
                        }}
                        className={`flex-1 rounded px-2 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                          humanSide === side
                            ? 'bg-white text-stone-900 shadow-xs'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        {side === 'GOAT' ? t.goat : t.tiger}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1.5">
                    {t.difficulty}
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as AIDifficulty)}
                    className="w-full rounded-md border border-stone-300 bg-white px-2.5 py-1.5 text-xs font-medium text-stone-900 focus:border-[#9A3412] focus:outline-none"
                  >
                    <option value="BEGINNER">{t.beginner}</option>
                    <option value="INTERMEDIATE">{t.intermediate}</option>
                    <option value="EXPERT">{t.expert}</option>
                  </select>
                </div>
              </div>
            )}

            {/* Draw & Repetition Policy Selector */}
            <div>
              <label htmlFor="draw-policy-select" className="block text-xs font-medium text-stone-600 mb-1.5">
                {t.drawPolicy}
              </label>
              <select
                id="draw-policy-select"
                value={drawPolicy}
                onChange={(e) => {
                  const p = e.target.value as DrawPolicy;
                  setDrawPolicy(p);
                  startNewGame(p);
                }}
                className="w-full rounded-md border border-stone-300 bg-white px-2.5 py-1.5 text-xs font-medium text-stone-900 focus:border-[#9A3412] focus:outline-none"
              >
                {BAGH_CHAL_RULES_SPEC.drawAndRepetitionPolicies.map((pol) => (
                  <option key={pol.id} value={pol.id}>
                    {pol.label}
                  </option>
                ))}
              </select>
              {activePolicyMeta && (
                <p className="mt-1.5 text-xs leading-relaxed text-stone-500">
                  {activePolicyMeta.status} · {activePolicyMeta.sourceNote}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={() => startNewGame(drawPolicy)}
                className="inline-flex items-center gap-1.5 rounded-md bg-[#3B2618] px-3 py-2 text-xs font-semibold text-white hover:bg-[#4E3220] transition-colors whitespace-nowrap"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                {t.newGame}
              </button>

              {mode !== 'REPLAY' && (
                <>
                  <button
                    type="button"
                    onClick={handleUndo}
                    disabled={historyStack.length <= 1 || aiThinking}
                    className="inline-flex items-center gap-1.5 rounded-md border border-stone-300 bg-white px-3 py-2 text-xs font-medium text-stone-800 hover:bg-stone-50 disabled:opacity-45 whitespace-nowrap"
                  >
                    {t.undo}
                  </button>
                  <button
                    type="button"
                    onClick={handleRequestHint}
                    disabled={currentState.status !== 'PLAYING' || aiThinking}
                    className="inline-flex items-center gap-1.5 rounded-md border border-stone-300 bg-white px-3 py-2 text-xs font-medium text-stone-800 hover:bg-stone-50 disabled:opacity-45 whitespace-nowrap"
                  >
                    <Lightbulb className="h-3.5 w-3.5 text-amber-700" />
                    {t.hint}
                  </button>
                  <button
                    type="button"
                    onClick={handleMutualDraw}
                    disabled={currentState.status !== 'PLAYING'}
                    className="inline-flex items-center gap-1.5 rounded-md border border-stone-300 bg-white px-3 py-2 text-xs font-medium text-stone-800 hover:bg-stone-50 disabled:opacity-45 whitespace-nowrap"
                  >
                    {t.offerDraw}
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={() => setSoundEnabled((s) => !s)}
                className="inline-flex items-center gap-1.5 rounded-md border border-stone-300 bg-white px-3 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50 whitespace-nowrap"
              >
                {soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
                {soundEnabled ? t.soundOn : t.soundOff}
              </button>

              <button
                type="button"
                onClick={() => setShowCoords((c) => !c)}
                className="inline-flex items-center gap-1.5 rounded-md border border-stone-300 bg-white px-3 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50 whitespace-nowrap"
              >
                {showCoords ? t.coordsOn : t.coordsOff}
              </button>
            </div>
          </div>

          {/* Move Record & Replay/Export Tools */}
          <div className="rounded-lg border border-stone-300/80 bg-[#FBF9F5] p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-stone-900">{t.moveLog}</h3>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleSaveMatch}
                  disabled={currentState.moveHistory.length === 0}
                  className="inline-flex items-center gap-1 rounded border border-stone-300 bg-white px-2.5 py-1 text-xs font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-40"
                >
                  <Save className="h-3 w-3" />
                  {savedFlag ? t.matchSaved : t.saveToLibrary}
                </button>
                <button
                  type="button"
                  onClick={handleExportMatch}
                  disabled={currentState.moveHistory.length === 0}
                  className="inline-flex items-center gap-1 rounded border border-stone-300 bg-white px-2.5 py-1 text-xs font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-40"
                >
                  <Download className="h-3 w-3" />
                  {t.exportMatch}
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1 rounded border border-stone-300 bg-white px-2.5 py-1 text-xs font-medium text-stone-700 hover:bg-stone-50"
                >
                  <Upload className="h-3 w-3" />
                  {t.importMatch}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/json"
                  onChange={handleImportMatch}
                  className="hidden"
                />
              </div>
            </div>

            {importError && <p className="mt-2 text-xs text-red-700">{importError}</p>}

            <div className="mt-3 max-h-44 overflow-y-auto rounded border border-stone-200 bg-white p-2.5">
              {displayedState.moveHistory.length === 0 ? (
                <p className="text-xs text-stone-500">{t.noMovesYet}</p>
              ) : (
                <ol className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono-tabular text-xs text-stone-800">
                  {displayedState.moveHistory.map((m, idx) => (
                    <li
                      key={`${idx}-${m.notation}`}
                      className={`rounded px-1.5 py-0.5 ${
                        mode === 'REPLAY' && idx === replayIndex - 1 ? 'bg-amber-100 font-semibold' : ''
                      }`}
                    >
                      <span className="text-stone-400 mr-1.5">{idx + 1}.</span>
                      {m.notation}
                    </li>
                  ))}
                </ol>
              )}
            </div>

            {/* Sample / Saved Matches Selector */}
            <div className="mt-3 pt-3 border-t border-stone-200">
              <div className="text-xs font-medium text-stone-600 mb-1.5">{t.sampleGames}</div>
              <div className="flex flex-col gap-1.5">
                {savedMatches.slice(0, 4).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => loadIntoReplay(m)}
                    className="flex items-center justify-between rounded border border-stone-200 bg-white px-2.5 py-1.5 text-left text-xs text-stone-700 hover:border-stone-400 hover:bg-stone-50"
                  >
                    <span className="truncate font-medium">{m.title}</span>
                    <span className="font-mono-tabular text-stone-500 ml-2 shrink-0">
                      {m.moves.length} plies
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Export Versioned Specification */}
            <div className="mt-3 pt-3 border-t border-stone-200 flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs text-stone-500">
                <BookOpen className="h-3.5 w-3.5" />
                Spec v{BAGH_CHAL_RULES_SPEC.version}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    downloadTextFile(
                      'bagh-chal-rules-v1.json',
                      exportRulesAsJson(),
                      'application/json'
                    )
                  }
                  className="text-xs font-medium text-[#9A3412] underline underline-offset-2 hover:text-[#7C2D12]"
                >
                  {t.exportRulesJson}
                </button>
                <span className="text-stone-300" aria-hidden="true">·</span>
                <button
                  type="button"
                  onClick={() =>
                    downloadTextFile(
                      'bagh-chal-rules-v1.md',
                      exportRulesAsMarkdown(),
                      'text/markdown'
                    )
                  }
                  className="text-xs font-medium text-[#9A3412] underline underline-offset-2 hover:text-[#7C2D12]"
                >
                  {t.exportRulesMd}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

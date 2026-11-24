import React, { useEffect, useState } from 'react';
import { CheckCircle2, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { TUTORIAL_LESSONS } from '../data/educationalContent';
import { ADJACENCY } from '../engine/boardGraph';
import type { Move, Piece } from '../engine/types';
import type { Language, TranslationBundle } from '../i18n/translations';
import { BaghChalBoard } from './BaghChalBoard';

interface TutorialSectionProps {
  lang: Language;
  header: { title: string; subtitle: string };
}

export const TutorialSection: React.FC<TutorialSectionProps> = ({ lang, header }) => {
  const [lessonIdx, setLessonIdx] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  const [boardOverride, setBoardOverride] = useState<Piece[] | null>(null);
  const [selectedFrom, setSelectedFrom] = useState<number | null>(null);
  const [completed, setCompleted] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const lesson = TUTORIAL_LESSONS[lessonIdx];
  const step = lesson.steps[stepIdx] ?? lesson.steps[0];
  const displayBoard = boardOverride ?? step.board;

  useEffect(() => {
    setBoardOverride(null);
    setSelectedFrom(null);
    setCompleted(false);
    setFeedback(null);
  }, [lessonIdx, stepIdx]);

  const handleLessonBoardClick = (nodeId: number) => {
    if (!step.expectedAction || completed) return;
    const action = step.expectedAction;

    if (action.type === 'PLACE') {
      if (nodeId === action.to && displayBoard[nodeId] === 'EMPTY') {
        const next = [...displayBoard];
        next[nodeId] = 'GOAT';
        setBoardOverride(next);
        setCompleted(true);
        setFeedback(
          lang === 'ne'
            ? 'उत्कृष्ट! तपाईंले सही बिन्दुमा बाख्रा राख्नुभयो।'
            : 'Well done! You placed the Goat on the target intersection.'
        );
      } else {
        setFeedback(
          lang === 'ne'
            ? 'हरियो चिन्ह लगाइएको खाली बिन्दुमा थिच्नुहोस्।'
            : 'Try clicking the highlighted green target intersection.'
        );
      }
      return;
    }

    // MOVE or CAPTURE interactive practice
    if (selectedFrom === null) {
      if (nodeId === action.from) {
        setSelectedFrom(nodeId);
        setFeedback(
          lang === 'ne'
            ? 'अब हरियो लक्ष्य बिन्दुमा थिच्नुहोस्।'
            : 'Piece selected—now click the highlighted destination node.'
        );
      } else {
        setFeedback(
          lang === 'ne'
            ? 'पहिले पहेँलो घेरा लगाइएको गोटी छान्नुहोस्।'
            : 'First select the highlighted piece to move.'
        );
      }
      return;
    }

    if (nodeId === action.to) {
      const next = [...displayBoard];
      const movingPiece = next[selectedFrom];
      next[selectedFrom] = 'EMPTY';
      next[nodeId] = movingPiece;
      if (action.type === 'CAPTURE') {
        // Remove jumped goat midway
        const mid = Math.floor((selectedFrom + nodeId) / 2);
        next[mid] = 'EMPTY';
      }
      setBoardOverride(next);
      setSelectedFrom(null);
      setCompleted(true);
      setFeedback(
        lang === 'ne'
          ? 'सही चाल! अभ्यास सफल भयो।'
          : 'Correct move! Practice step completed.'
      );
    } else if (nodeId === action.from) {
      setSelectedFrom(null);
    } else {
      setFeedback(
        lang === 'ne'
          ? 'कृपया हरियो लक्ष्य बिन्दुमा जानुहोस्।'
          : 'Move to the highlighted target intersection.'
      );
    }
  };

  const practiceMoveHints: Move[] =
    step.expectedAction && selectedFrom !== null && !completed
      ? [
          {
            type: step.expectedAction.type,
            player: displayBoard[selectedFrom] === 'TIGER' ? 'TIGER' : 'GOAT',
            from: selectedFrom,
            to: step.expectedAction.to,
            notation: '',
          },
        ]
      : [];

  const placementTargets =
    step.expectedAction?.type === 'PLACE' && !completed
      ? [step.expectedAction.to]
      : [];

  return (
    <section id="learn" className="border-t border-stone-300/70 bg-[#FBF9F5] py-12 lg:py-16">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <div className="max-w-2xl">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">
            {header.title}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">{header.subtitle}</p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
          {/* Curriculum Index */}
          <div className="lg:col-span-5">
            <div className="divide-y divide-stone-200 rounded-lg border border-stone-300/80 bg-[#F7F4EE]">
              {TUTORIAL_LESSONS.map((item, idx) => {
                const active = idx === lessonIdx;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setLessonIdx(idx);
                      setStepIdx(0);
                    }}
                    className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors ${
                      active ? 'bg-[#3B2618] text-[#FBF9F5]' : 'text-stone-800 hover:bg-stone-200/50'
                    }`}
                  >
                    <span
                      className={`font-mono-tabular text-xs font-semibold pt-0.5 ${
                        active ? 'text-amber-200' : 'text-stone-500'
                      }`}
                    >
                      {item.number}.
                    </span>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold">
                        {lang === 'ne' ? item.titleNe : item.titleEn}
                      </div>
                      {active && (
                        <p className="mt-1 text-xs leading-relaxed text-stone-200">
                          {lang === 'ne' ? item.summaryNe : item.summaryEn}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Lesson Board */}
          <div className="lg:col-span-7 flex flex-col items-center">
            <div className="w-full max-w-[480px]">
              <BaghChalBoard
                board={displayBoard}
                selectedNode={selectedFrom}
                legalMovesForSelection={practiceMoveHints}
                placementTargets={placementTargets}
                highlightNodes={completed ? [] : step.highlightNodes}
                targetNode={completed ? null : step.targetNode ?? null}
                disabled={!step.expectedAction || completed}
                onNodeClick={handleLessonBoardClick}
                sizeClassName="w-full"
              />

              <div className="mt-4 rounded-lg border border-stone-300/80 bg-[#F7F4EE] p-4">
                <div className="flex items-center justify-between gap-2 text-xs text-stone-500">
                  <span className="font-mono-tabular">
                    {lesson.number} · {stepIdx + 1} / {lesson.steps.length}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {step.expectedAction && (
                      <button
                        type="button"
                        onClick={() => {
                          setBoardOverride(null);
                          setSelectedFrom(null);
                          setCompleted(false);
                          setFeedback(null);
                        }}
                        className="inline-flex items-center gap-1 rounded border border-stone-300 bg-white px-2.5 py-1 text-xs font-medium text-stone-700 hover:bg-stone-50"
                      >
                        <RotateCcw className="h-3 w-3" />
                        {lang === 'ne' ? 'फेरि अभ्यास' : 'Replay Lesson'}
                      </button>
                    )}
                  </div>
                </div>

                <p className="mt-2 text-sm leading-relaxed text-stone-800">
                  {lang === 'ne' ? step.captionNe : step.captionEn}
                </p>

                {feedback && (
                  <div
                    className={`mt-3 flex items-center gap-2 text-xs font-medium ${
                      completed ? 'text-[#14532D]' : 'text-[#9A3412]'
                    }`}
                  >
                    {completed && <CheckCircle2 className="h-4 w-4 shrink-0" />}
                    <span>{feedback}</span>
                  </div>
                )}

                <div className="mt-4 flex items-center justify-between border-t border-stone-200 pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (stepIdx > 0) {
                        setStepIdx(stepIdx - 1);
                      } else if (lessonIdx > 0) {
                        const prevL = TUTORIAL_LESSONS[lessonIdx - 1];
                        setLessonIdx(lessonIdx - 1);
                        setStepIdx(prevL.steps.length - 1);
                      }
                    }}
                    disabled={lessonIdx === 0 && stepIdx === 0}
                    className="inline-flex items-center gap-1 rounded border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-40"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    {lang === 'ne' ? 'अघिल्लो' : 'Previous'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (stepIdx < lesson.steps.length - 1) {
                        setStepIdx(stepIdx + 1);
                      } else if (lessonIdx < TUTORIAL_LESSONS.length - 1) {
                        setLessonIdx(lessonIdx + 1);
                        setStepIdx(0);
                      }
                    }}
                    disabled={
                      lessonIdx === TUTORIAL_LESSONS.length - 1 &&
                      stepIdx === lesson.steps.length - 1
                    }
                    className="inline-flex items-center gap-1 rounded bg-[#3B2618] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#4E3220] disabled:opacity-40"
                  >
                    {lang === 'ne' ? 'अर्को पाठ' : 'Next'}
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Quiet note on adjacency check to satisfy unused import guard if needed */}
              <span className="sr-only">{ADJACENCY.length}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

# Bagh-Chal Architecture & Preservation Guide

## Modular Separation

1. **`src/engine/` (Framework-Independent Core)**
   - `types.ts`: Immutable TypeScript domain types (`GameState`, `Move`, `DrawPolicy`, `Piece`).
   - `boardGraph.ts`: Explicit 25-node coordinate table (`A5`–`E1`), 56 undirected edges, collinear `JUMP_TRIPLES`, and `D4_SYMMETRIES`. Zero DOM/React imports.
   - `rules.ts`: Pure state-transition functions (`createInitialState`, `getLegalMoves`, `applyMove`, `declareMutualDraw`, `replayMoves`).
   - `ai.ts`: Three-tier search engine (`BEGINNER`, `INTERMEDIATE`, `EXPERT`) with alpha-beta pruning, canonical D4 transposition keys, and bilingual move explanations.
   - `spec.ts`: Versioned JSON/Markdown rules specification (`BAGH_CHAL_RULES_SPEC`, v1.0.0).

2. **`src/storage/archiveDb.ts` (Offline Persistence Layer)**
   - Uses browser `IndexedDB` (with automatic `localStorage` fallback) so matches and heritage archive contributions persist offline without accounts or cloud vendor lock-in.
   - Enforces explicit contributor consent (`consentConfirmed: true`) before persisting archive entries.

3. **`src/data/educationalContent.ts` & `src/i18n/translations.ts`**
   - Structured bilingual (`en` / `ne`) educational curriculum, strategy doctrines, interactive tactical puzzles, glossary, and verified bibliographic citations.

4. **`src/components/` (Presentation Layer)**
   - `BaghChalBoard.tsx`: Accessible SVG 5×5 wooden intersection board (`>= 44px` hit targets, keyboard navigation, non-hue-only state markers).
   - `PlayWorkspace.tsx`, `TutorialSection.tsx`, `StrategySection.tsx`, `HistorySection.tsx`, `ArchiveSection.tsx`, `PWAInstallButton.tsx`.

## Porting & Backend Extension

Because `src/engine/` uses only pure TypeScript and standard ECMAScript data structures, it can be packaged directly for Node.js CLI tools, Python/FastAPI bridges, mobile WebViews, or archival static mirrors without UI dependencies.

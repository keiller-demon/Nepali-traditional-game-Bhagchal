# Bagh-Chal (बाघचाल) — Digital Cultural Heritage Preservation Platform

**Bagh-Chal (बाघचाल)** is an offline-first, account-free digital preservation edition of Nepal's traditional Tigers and Goats strategy board game. Designed as both an authentic playable instrument and an independently archivable cultural record, it separates the formal graph-based rules engine from the user interface so future generations and developers can study, verify, and rebuild the game across platforms.

## Features

- **Faithful 5×5 Intersection Engine (`src/engine/`)**: Explicit 25-node, 56-edge graph with parity-verified diagonal lines, strict Phase A (20 placements) and Phase B (movement) rules, collinear jump captures, and victory detection.
- **Documented Draw & Repetition Handling**: Configurable policies (`THREEFOLD_REPETITION`, `PREVENT_REPETITION_MOVE`, and `NONE_STRICT_TRADITIONAL`) with explicit provenance distinguishing oral chautari customs from modern algorithmic tournament safeguards.
- **Three-Tier AI Opponent**: Beginner (safety-aware), Intermediate (2-ply heuristic search), and Expert (iterative alpha-beta pruning, transposition tables, and D4 dihedral symmetry reduction), paired with bilingual tactical explanations.
- **Play Modes**: Player vs. AI, Local 2-Player, Practice Coach (live suggestions & threat highlights), and Replay Mode (step/auto-play, sample games, JSON match export/import).
- **Bilingual English & Nepali (`नेपाली`)**: Complete UI, Devanagari typography, interactive 10-lesson playing guide, strategy doctrines, and 4 interactive tactical puzzles.
- **Evidence-Based History & Open Heritage Archive**: Distinguishes verified material facts and academic research (*The Kathmandu Post* 2021, Lim & Nievergelt 2004, H.J.R. Murray 1952) from oral traditions and unverified origin claims. Includes IndexedDB local archive persistence with mandatory contributor consent, attribution, Creative Commons licensing, and JSON/Markdown exports.
- **Progressive Web App (PWA)**: Installable on desktop and mobile with full offline caching via `vite-plugin-pwa`.

## Local Execution & Verification

```bash
# Install dependencies
npm install

# Run automated rules engine & AI test suite (11 test suites)
npm test

# Typecheck
npm run lint

# Start local development server on port 3000
npm run dev

# Build static offline-ready bundle
npm run build
```

## Backup & Long-Term Preservation Guidance

1. **Export Rules Specification**: Use the in-app **Rules Spec (JSON)** or **Rules Spec (Markdown)** buttons to archive the exact `v1.0.0` board topology and ruleset.
2. **Export Archive Records**: Use **Archive JSON** or **Archive Markdown** inside the Community Heritage Archive section to back up contributed records in open plain-text formats.
3. **Export Matches**: Export any played match as a portable `.json` move log for correspondence play or historical study.

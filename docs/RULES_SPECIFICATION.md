# Bagh-Chal (बाघचाल) — Standard Rules Specification v1.0.0

- **Specification ID**: `bagh-chal-standard-np`
- **Board**: 5×5 intersections (25 nodes `0..24`, labeled `A5`..`E1`), 56 explicit edges (20 horizontal, 20 vertical, 16 diagonal connecting even-parity intersections `(row + col) % 2 === 0`).
- **Initial Position**: 4 Tigers at corners (`A5`, `E5`, `A1`, `E1`), 20 Goats in reserve (`goatsInReserve = 20`), Goat moves first.
- **Phase A (Placement)**: Goat places 1 Goat per turn on an empty node; Tiger moves 1 step or captures 1 Goat per turn. Goats on board cannot move until all 20 have entered.
- **Phase B (Movement)**: Both sides move 1 connected edge per turn to an empty node; Tigers may continue capturing by collinear jump over an adjacent Goat to an immediately following empty node. Tigers cannot jump Tigers.
- **Victory**:
  - **Tigers**: Capture 5 Goats.
  - **Goats**: Immobilize all 4 Tigers (0 legal Tiger moves or captures).
- **Draw & Repetition Policies**:
  - `THREEFOLD_REPETITION` (Modern tournament/algorithmic safeguard, Lim & Nievergelt 2004).
  - `PREVENT_REPETITION_MOVE` (Optional modern anti-cycle rule).
  - `NONE_STRICT_TRADITIONAL` (Traditional village chautari custom: mutual draw by agreement only).

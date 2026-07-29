# Sudoku Puzzle Preparation Pipeline

The Sudoku release bundle is built ahead of time. Gameplay imports only the
generated bundle; it does not run uniqueness search or difficulty
classification in the browser.

## Source format

The input is UTF-8 JSON with a versioned envelope:

```json
{
  "version": 1,
  "puzzles": [
    {
      "id": "easy-001",
      "difficulty": "easy",
      "puzzle": "53..7....6..195....98....6.8...6...34..8.3..17...2...6.6....28....419..5....8..79",
      "solution": "534678912672195348198342567859761423426853791713924856961537284287419635345286179"
    }
  ]
}
```

- `id` uses lowercase ASCII letters, digits, and hyphens.
- `difficulty` is `easy`, `medium`, `hard`, or `expert`.
- `puzzle` and `solution` contain exactly 81 cells. A puzzle may use `.` or
  `0` for blanks; output always uses `.`.
- `solution` must be complete and conflict-free.

## Validation

Preparation is atomic. Any issue prevents bundle output. The pipeline checks:

1. envelope and entry shape;
2. duplicate IDs and duplicate canonical puzzle grids;
3. clue/solution consistency;
4. zero, one, or multiple solutions with bounded backtracking;
5. exact agreement between the declared and discovered solution;
6. completion by the approved logical-only solver;
7. agreement between declared difficulty and the hardest logical technique.

Issues are reported in source order. Duplicate checks mark the later entry.
The summary reports total, accepted, rejected, and accepted counts by
difficulty even when the overall source is rejected.

## Bundle format and command

Run:

```text
npm run prepare:sudoku -- <source.json> <bundle.json>
```

A valid source produces:

```json
{
  "version": 1,
  "puzzles": []
}
```

Puzzles are normalized and sorted by Easy, Medium, Hard, Expert, then by ID.
The same accepted definitions therefore always produce byte-stable JSON
regardless of source order. Invalid input exits unsuccessfully and does not
write a partial bundle.

## Gameplay loading

Gameplay loads the generated artifact with `loadSudokuPuzzleBundle`. This
lightweight boundary validates the bundle version and exact JSON shape,
canonical puzzle and solution strings, clue/solution consistency, duplicate
IDs and grids, and exactly 100 entries for each difficulty.

The gameplay loader intentionally does not rerun solution search, logical
solving, or difficulty classification. Those expensive checks remain the
responsibility of the ahead-of-time preparation command.

## Release assembly

The version 1 release data is separated into:

- `sources/release-seeds-v1.json`: four verified difficulty seeds;
- `sources/release-v1.json`: the assembled 400-entry candidate source;
- `generated/release-v1.json`: the stable gameplay artifact.

Run `npm run assemble:sudoku` to reproduce the candidate source. The assembler
creates deterministic clue variants and Sudoku-preserving transformations,
retains only candidates with the declared logical difficulty, and validates the
complete 400-entry source atomically.

Then regenerate the gameplay artifact:

```text
npm run prepare:sudoku -- src/features/sudoku/puzzles/sources/release-v1.json src/features/sudoku/puzzles/generated/release-v1.json
```

The committed gameplay entry point imports only the generated artifact and
passes it through the lightweight loader.

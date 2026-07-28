import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { prepareSudokuPuzzleBundle } from "../src/features/sudoku/puzzles/index.ts";

const [inputArgument, outputArgument] = process.argv.slice(2);

if (inputArgument === undefined || outputArgument === undefined) {
  console.error(
    "Usage: npm run prepare:sudoku -- <source.json> <bundle.json>",
  );
  process.exitCode = 1;
} else {
  const inputPath = resolve(inputArgument);
  const outputPath = resolve(outputArgument);

  try {
    const source = JSON.parse(await readFile(inputPath, "utf8"));
    const result = prepareSudokuPuzzleBundle(source);

    if (!result.valid || result.bundle === null) {
      console.error(JSON.stringify({
        valid: false,
        issues: result.issues,
        summary: result.summary,
      }, null, 2));
      process.exitCode = 1;
    } else {
      await mkdir(dirname(outputPath), { recursive: true });
      await writeFile(
        outputPath,
        `${JSON.stringify(result.bundle, null, 2)}\n`,
        "utf8",
      );
      console.log(JSON.stringify(result.summary));
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

export interface MinesweeperPointerInteraction {
  isTouch: boolean;
  longPressCompleted: boolean;
}

export function beginMinesweeperPointerInteraction(
  pointerType: string,
): MinesweeperPointerInteraction | null {
  return pointerType === "touch"
    ? { isTouch: true, longPressCompleted: false }
    : null;
}

export function completeMinesweeperLongPress(
  interaction: MinesweeperPointerInteraction | null,
): MinesweeperPointerInteraction | null {
  return interaction?.isTouch
    ? { ...interaction, longPressCompleted: true }
    : interaction;
}

export function consumeMinesweeperPointerClick(
  interaction: MinesweeperPointerInteraction | null,
) {
  return {
    suppress: interaction?.longPressCompleted === true,
    nextInteraction: null,
  };
}

export function shouldAutosaveMinesweeperGame(input: {
  hydrated: boolean;
  hasSavedGameChoice: boolean;
  phase: "ready" | "playing" | "won" | "lost";
}) {
  return (
    input.hydrated &&
    !input.hasSavedGameChoice &&
    input.phase !== "won" &&
    input.phase !== "lost"
  );
}

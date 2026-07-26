import { findAdvancedMove } from "./advanced.ts";
import type { AiWorkerRequest, AiWorkerResponse } from "./types.ts";

interface WorkerScope {
  onmessage: ((event: MessageEvent<AiWorkerRequest>) => void) | null;
  postMessage(message: AiWorkerResponse): void;
}

const workerScope = self as unknown as WorkerScope;

workerScope.onmessage = (event) => {
  const { id, board, player, options } = event.data;
  const result = findAdvancedMove(board, player, options);
  workerScope.postMessage({ id, ...result });
};

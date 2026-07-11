import type { GameState } from "../game/types";

export type TutorialHighlightTarget =
  | "top-action-bar"
  | "draft-panel"
  | "draft-card-0"
  | "draft-card-1"
  | "bottle-0"
  | "bottle-1"
  | "customer-pool"
  | "score-panel";

export type TutorialCompletion =
  | { type: "manual" }
  | { type: "confirm_choice"; draftIndexes: number[] }
  | { type: "place_die"; draftIndex: number; bottleIndex: 0 | 1 }
  | { type: "finish_round" }
  | { type: "seal_bottle"; bottleIndex: 0 | 1 };

export interface TutorialStep {
  id: string;
  title: string;
  body: string;
  highlightTargets: TutorialHighlightTarget[];
  board: GameState;
  completion: TutorialCompletion;
  primaryLabel?: string;
}

export interface TutorialSession {
  mode: "inactive" | "active" | "completed";
  stepIndex: number;
}

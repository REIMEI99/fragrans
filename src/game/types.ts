export type Ingredient =
  | "citrus"
  | "green"
  | "floral"
  | "fruit"
  | "wood"
  | "spice";

export type Density = "light" | "mid" | "heavy";

export type SlotState = "empty" | "filled";

export type BottleStage = "none" | "fresh" | "faded";

export type Phase = "choose" | "place" | "seal" | "finalAutoSeal" | "finished";

export interface Slot {
  ingredient: Ingredient | null;
  state: SlotState;
}

export interface CustomerCard {
  id: string;
  title: string;
  text: string;
  reward: number;
  predicate: CustomerPredicate;
}

export type CustomerPredicate =
  | { type: "containsIngredients"; ingredients: Ingredient[] }
  | { type: "startsWith"; ingredient: Ingredient }
  | { type: "endsWith"; ingredient: Ingredient }
  | { type: "containsPairAdjacent"; pair: [Ingredient, Ingredient] }
  | { type: "bottleSizeAtLeast"; count: number }
  | { type: "bottleSizeExactly"; count: number }
  | { type: "allDistinct" }
  | { type: "uniqueIngredientExactly"; count: number }
  | { type: "countPattern"; counts: number[] }
  | { type: "ingredientsRepeatedExactly"; repeatCount: number; ingredientKinds: number }
  | { type: "stageIs"; stage: Exclude<BottleStage, "none"> }
  | { type: "rotTokensExactly"; count: number }
  | { type: "bottleSizeAtLeastAndRotExactly"; minimum: number; rotCount: number };

export interface BottleScoreBreakdown {
  base: number;
  order: number;
  density: number;
  customer: number;
  rotPenalty: number;
  total: number;
}

export interface Bottle {
  id: string;
  label: string;
  slots: Slot[];
  stage: BottleStage;
  rotTokens: number;
}

export interface LogEntry {
  id: string;
  text: string;
}

export interface GameState {
  phase: Phase;
  seed: number;
  rngState: number;
  round: number;
  maxRounds: number;
  score: number;
  bottles: [Bottle | null, Bottle | null];
  sealedBottles: Bottle[];
  customerDeck: CustomerCard[];
  currentCustomers: CustomerCard[];
  rolledDice: Ingredient[];
  chosenDice: number[];
  pendingDice: number[];
  log: LogEntry[];
}

export type GameAction =
  | { type: "start"; seed: number }
  | { type: "toggleDie"; index: number }
  | { type: "confirmChoice" }
  | { type: "placeDie"; draftIndex: number; bottleIndex: 0 | 1 }
  | { type: "sealBottle"; bottleIndex: 0 | 1 }
  | { type: "finishSealPhase" }
  | { type: "finishGame" };

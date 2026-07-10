import {
  BASE_SCORE_BY_COUNT,
  CUSTOMER_CARDS,
  DENSITY_SCORE_BY_REPEAT,
  INGREDIENT_INFO,
  ORDER_SCORE_BY_LENGTH,
  POSITION_INFO,
} from "./data";
import { rollDice, shuffleWithSeed } from "./random";
import type {
  Bottle,
  BottleScoreBreakdown,
  CustomerCard,
  GameState,
  Ingredient,
  Slot,
} from "./types";

function emptySlot(): Slot {
  return { ingredient: null, state: "empty" };
}

export function createBottle(index: 0 | 1): Bottle {
  return {
    id: `bottle-${index + 1}`,
    label: index === 0 ? "一号瓶" : "二号瓶",
    slots: Array.from({ length: 6 }, emptySlot),
    stage: "none",
    rotTokens: 0,
  };
}

export function cloneBottle(bottle: Bottle): Bottle {
  return {
    ...bottle,
    slots: bottle.slots.map((slot) => ({ ...slot })),
  };
}

export function createInitialState(seed = 20260711): GameState {
  const normalizedSeed = seed >>> 0;
  const [deck, nextSeed] = shuffleWithSeed(CUSTOMER_CARDS, normalizedSeed);
  const [dice, rngState] = rollDice(nextSeed, 4);

  return {
    phase: "choose",
    seed: normalizedSeed,
    rngState,
    round: 1,
    maxRounds: 10,
    score: 0,
    bottles: [null, null],
    sealedBottles: [],
    customerDeck: deck.slice(2),
    currentCustomers: deck.slice(0, 2),
    rolledDice: dice,
    chosenDice: [],
    pendingDice: [],
    log: [{ id: crypto.randomUUID(), text: `使用种子 ${normalizedSeed} 开局。` }],
  };
}

export function filledCount(bottle: Bottle): number {
  return bottle.slots.filter((slot) => slot.state === "filled" && slot.ingredient).length;
}

export function canStartSeal(bottle: Bottle): boolean {
  return filledCount(bottle) >= 3;
}

export function nextEmptySlotIndex(bottle: Bottle): number {
  return bottle.slots.findIndex((slot) => slot.state === "empty");
}

export function canPlaceIngredient(bottle: Bottle): boolean {
  return nextEmptySlotIndex(bottle) !== -1;
}

export function placeIngredient(bottle: Bottle, ingredient: Ingredient): Bottle {
  const next = cloneBottle(bottle);
  const slotIndex = nextEmptySlotIndex(next);
  if (slotIndex === -1) {
    throw new Error("Bottle is full");
  }

  next.slots[slotIndex] = { ingredient, state: "filled" };
  if (filledCount(next) >= 3 && next.stage === "none") {
    next.stage = "fresh";
  }
  return next;
}

export function baseScoreForBottle(bottle: Bottle): number {
  return BASE_SCORE_BY_COUNT[filledCount(bottle)] ?? 0;
}

export function orderChainLength(bottle: Bottle): number {
  const filled = bottle.slots
    .filter((slot) => slot.state === "filled" && slot.ingredient)
    .map((slot) => slot.ingredient as Ingredient);

  let best = 0;
  for (let start = 0; start < filled.length; start += 1) {
    let length = 1;
    let previousOrder = INGREDIENT_INFO[filled[start]].order;
    for (let index = start + 1; index < filled.length; index += 1) {
      const currentOrder = INGREDIENT_INFO[filled[index]].order;
      if (currentOrder !== previousOrder + 1) {
        break;
      }
      length += 1;
      previousOrder = currentOrder;
    }
    best = Math.max(best, length);
  }

  return best >= 2 ? best : 0;
}

export function orderScoreForBottle(bottle: Bottle): number {
  return ORDER_SCORE_BY_LENGTH[orderChainLength(bottle)] ?? 0;
}

export function densityScoreForBottle(bottle: Bottle): number {
  const counts = ingredientCounts(bottle);
  const bestRepeat = Math.max(0, ...Object.values(counts));
  return DENSITY_SCORE_BY_REPEAT[bestRepeat] ?? 0;
}

export function correctnessScoreForBottle(bottle: Bottle): number {
  return bottle.slots.reduce((sum, slot, index) => {
    if (!slot.ingredient) {
      return sum;
    }
    return sum + (INGREDIENT_INFO[slot.ingredient].density === POSITION_INFO[index].expected ? 1 : 0);
  }, 0);
}

export function currentIngredients(bottle: Bottle): Ingredient[] {
  return bottle.slots
    .filter((slot) => slot.state === "filled" && slot.ingredient)
    .map((slot) => slot.ingredient as Ingredient);
}

export function customerSatisfied(bottle: Bottle, card: CustomerCard): boolean {
  const ingredients = currentIngredients(bottle);
  const filled = filledCount(bottle);
  const counts = Object.values(ingredientCounts(bottle)).sort((left, right) => right - left);

  switch (card.predicate.type) {
    case "containsIngredients":
      return card.predicate.ingredients.every((ingredient) => ingredients.includes(ingredient));
    case "startsWith":
      return bottle.slots[0]?.ingredient === card.predicate.ingredient;
    case "endsWith": {
      const last = ingredients[ingredients.length - 1];
      return last === card.predicate.ingredient;
    }
    case "containsPairAdjacent":
      return hasAdjacentPair(bottle, card.predicate.pair);
    case "bottleSizeAtLeast":
      return filled >= card.predicate.count;
    case "bottleSizeExactly":
      return filled === card.predicate.count;
    case "allDistinct":
      return filled === 6 && new Set(ingredients).size === 6;
    case "uniqueIngredientExactly":
      return new Set(ingredients).size === card.predicate.count;
    case "countPattern":
      return matchesCountPattern(counts, card.predicate.counts, filled);
    case "ingredientsRepeatedExactly": {
      const { repeatCount, ingredientKinds } = card.predicate;
      return counts.filter((count) => count === repeatCount).length === ingredientKinds;
    }
    case "stageIs":
      return bottle.stage === card.predicate.stage;
    case "rotTokensExactly":
      return bottle.rotTokens === card.predicate.count;
    case "bottleSizeAtLeastAndRotExactly":
      return filled >= card.predicate.minimum && bottle.rotTokens === card.predicate.rotCount;
  }
}

export function matchedCustomerIndexes(bottle: Bottle, customers: CustomerCard[]): number[] {
  return customers.flatMap((card, index) => (customerSatisfied(bottle, card) ? [index] : []));
}

export function customerScoreForBottle(bottle: Bottle, customers: CustomerCard[]): number {
  return matchedCustomerIndexes(bottle, customers).reduce((sum, index) => sum + customers[index].reward, 0);
}

export function scoreBottle(
  bottle: Bottle,
  customers: CustomerCard[],
  withCustomer: boolean,
): BottleScoreBreakdown {
  const base = baseScoreForBottle(bottle);
  const order = orderScoreForBottle(bottle);
  const density = densityScoreForBottle(bottle);
  const customer = withCustomer ? customerScoreForBottle(bottle, customers) : 0;
  const rotPenalty = bottle.rotTokens * 2;

  return {
    base,
    order,
    density,
    customer,
    rotPenalty,
    total: base + order + density + customer - rotPenalty,
  };
}

export function bottleSummary(bottle: Bottle): string {
  return bottle.slots
    .map((slot, index) => (slot.ingredient ? `${index + 1}:${INGREDIENT_INFO[slot.ingredient].label}` : `${index + 1}:空`))
    .join(" | ");
}

export function applyRoundEndAging(bottle: Bottle): Bottle {
  const next = cloneBottle(bottle);
  if (filledCount(next) < 3) {
    return next;
  }
  if (next.stage === "none") {
    next.stage = "fresh";
    return next;
  }
  if (next.stage === "fresh") {
    next.stage = "faded";
    return next;
  }

  next.slots.shift();
  next.slots.push(emptySlot());
  next.rotTokens += 1;
  next.stage = filledCount(next) >= 3 ? "fresh" : "none";
  return next;
}

export function advanceRound(state: GameState): GameState {
  const [dice, rngState] = rollDice(state.rngState, 4);
  return {
    ...state,
    phase: "choose",
    rngState,
    round: state.round + 1,
    rolledDice: dice,
    chosenDice: [],
    pendingDice: [],
  };
}

function ingredientCounts(bottle: Bottle): Partial<Record<Ingredient, number>> {
  return currentIngredients(bottle).reduce<Partial<Record<Ingredient, number>>>((acc, ingredient) => {
    acc[ingredient] = (acc[ingredient] ?? 0) + 1;
    return acc;
  }, {});
}

function hasAdjacentPair(bottle: Bottle, pair: [Ingredient, Ingredient]): boolean {
  for (let index = 0; index < bottle.slots.length - 1; index += 1) {
    const left = bottle.slots[index].ingredient;
    const right = bottle.slots[index + 1].ingredient;
    if (left === pair[0] && right === pair[1]) {
      return true;
    }
  }
  return false;
}

function matchesCountPattern(actualCounts: number[], targetCounts: number[], filled: number): boolean {
  const sortedActual = [...actualCounts].sort((left, right) => right - left);
  const sortedTarget = [...targetCounts].sort((left, right) => right - left);

  if (sortedActual.length !== sortedTarget.length) {
    return false;
  }

  if (sortedTarget.reduce((sum, count) => sum + count, 0) !== filled) {
    return false;
  }

  return sortedActual.every((count, index) => count === sortedTarget[index]);
}

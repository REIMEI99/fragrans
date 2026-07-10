const INGREDIENTS = ["citrus", "green", "floral", "fruit", "wood", "spice"];

const INGREDIENT_INFO = {
  citrus: { order: 0 },
  green: { order: 1 },
  floral: { order: 2 },
  fruit: { order: 3 },
  wood: { order: 4 },
  spice: { order: 5 },
};

const BASE_SCORE_BY_COUNT = { 3: 1, 4: 2, 5: 4, 6: 6 };
const ORDER_SCORE_BY_LENGTH = { 2: 1, 3: 2, 4: 3, 5: 5, 6: 8 };
const DENSITY_SCORE_BY_REPEAT = { 2: 1, 3: 3, 4: 5, 5: 7, 6: 10 };

const CUSTOMER_CARDS = [
  { id: "c1", title: "dual-shape", reward: 3, predicate: { type: "uniqueIngredientExactly", count: 2 } },
  { id: "c2", title: "five-unique", reward: 4, predicate: { type: "uniqueIngredientExactly", count: 5 } },
  { id: "c3", title: "all-distinct", reward: 8, predicate: { type: "allDistinct" } },
  { id: "c4", title: "double-pair", reward: 4, predicate: { type: "ingredientsRepeatedExactly", repeatCount: 2, ingredientKinds: 2 } },
  { id: "c5", title: "core-theme", reward: 6, predicate: { type: "countPattern", counts: [3, 1, 1, 1] } },
  { id: "c6", title: "seal-3", reward: 4, predicate: { type: "bottleSizeExactly", count: 3 } },
  { id: "c7", title: "seal-4", reward: 3, predicate: { type: "bottleSizeExactly", count: 4 } },
  { id: "c8", title: "grow-clean", reward: 3, predicate: { type: "bottleSizeAtLeastAndRotExactly", minimum: 5, rotCount: 0 } },
  { id: "c9", title: "seal-with-rot", reward: 3, predicate: { type: "rotTokensExactly", count: 1 } },
  { id: "c10", title: "seal-5", reward: 4, predicate: { type: "bottleSizeExactly", count: 5 } },
  { id: "c11", title: "seal-faded", reward: 4, predicate: { type: "stageIs", stage: "faded" } },
  { id: "c12", title: "triple-balance", reward: 6, predicate: { type: "countPattern", counts: [2, 2, 2] } },
];

function nextSeed(seed) {
  return (seed * 1664525 + 1013904223) >>> 0;
}

function randomInt(seed, maxExclusive) {
  const next = nextSeed(seed);
  return [next % maxExclusive, next];
}

function rollDice(seed, count = 4) {
  const dice = [];
  let cursor = seed;
  for (let index = 0; index < count; index += 1) {
    const [value, next] = randomInt(cursor, INGREDIENTS.length);
    dice.push(INGREDIENTS[value]);
    cursor = next;
  }
  return [dice, cursor];
}

function shuffleWithSeed(items, seed) {
  const next = [...items];
  let cursor = seed;
  for (let index = next.length - 1; index > 0; index -= 1) {
    const [pick, newSeed] = randomInt(cursor, index + 1);
    [next[index], next[pick]] = [next[pick], next[index]];
    cursor = newSeed;
  }
  return [next, cursor];
}

function createBottle(index) {
  return {
    id: `bottle-${index + 1}`,
    label: index === 0 ? "bottle-1" : "bottle-2",
    slots: Array.from({ length: 6 }, () => ({ ingredient: null, state: "empty" })),
    stage: "none",
    rotTokens: 0,
  };
}

function cloneBottle(bottle) {
  return {
    ...bottle,
    slots: bottle.slots.map((slot) => ({ ...slot })),
  };
}

function createInitialState(seed) {
  const normalizedSeed = seed >>> 0;
  const [deck, next] = shuffleWithSeed(CUSTOMER_CARDS, normalizedSeed);
  const [rolledDice, rngState] = rollDice(next, 4);
  return {
    seed: normalizedSeed,
    rngState,
    round: 1,
    maxRounds: 10,
    score: 0,
    bottles: [null, null],
    sealedBottles: [],
    customerDeck: deck.slice(2),
    currentCustomers: deck.slice(0, 2),
    rolledDice,
  };
}

function filledCount(bottle) {
  return bottle.slots.filter((slot) => slot.ingredient).length;
}

function currentIngredients(bottle) {
  return bottle.slots.filter((slot) => slot.ingredient).map((slot) => slot.ingredient);
}

function ingredientCounts(bottle) {
  const counts = {};
  for (const ingredient of currentIngredients(bottle)) {
    counts[ingredient] = (counts[ingredient] ?? 0) + 1;
  }
  return counts;
}

function canStartSeal(bottle) {
  return filledCount(bottle) >= 3;
}

function nextEmptySlotIndex(bottle) {
  return bottle.slots.findIndex((slot) => slot.state === "empty");
}

function canPlaceIngredient(bottle) {
  return nextEmptySlotIndex(bottle) !== -1;
}

function placeIngredient(bottle, ingredient) {
  const next = cloneBottle(bottle);
  const slotIndex = nextEmptySlotIndex(next);
  if (slotIndex === -1) {
    return null;
  }
  next.slots[slotIndex] = { ingredient, state: "filled" };
  if (filledCount(next) >= 3 && next.stage === "none") {
    next.stage = "fresh";
  }
  return next;
}

function baseScoreForBottle(bottle) {
  return BASE_SCORE_BY_COUNT[filledCount(bottle)] ?? 0;
}

function orderChainLength(bottle) {
  const filled = currentIngredients(bottle);
  let best = 0;
  for (let start = 0; start < filled.length; start += 1) {
    let length = 1;
    let previousOrder = INGREDIENT_INFO[filled[start]].order;
    for (let index = start + 1; index < filled.length; index += 1) {
      const currentOrder = INGREDIENT_INFO[filled[index]].order;
      if (currentOrder !== previousOrder + 1) {
        break;
      }
      previousOrder = currentOrder;
      length += 1;
    }
    best = Math.max(best, length);
  }
  return best >= 2 ? best : 0;
}

function orderScoreForBottle(bottle) {
  return ORDER_SCORE_BY_LENGTH[orderChainLength(bottle)] ?? 0;
}

function densityScoreForBottle(bottle) {
  const bestRepeat = Math.max(0, ...Object.values(ingredientCounts(bottle)));
  return DENSITY_SCORE_BY_REPEAT[bestRepeat] ?? 0;
}

function matchesCountPattern(actualCounts, targetCounts, filled) {
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

function hasAdjacentPair(bottle, pair) {
  for (let index = 0; index < bottle.slots.length - 1; index += 1) {
    const left = bottle.slots[index].ingredient;
    const right = bottle.slots[index + 1].ingredient;
    if (left === pair[0] && right === pair[1]) {
      return true;
    }
  }
  return false;
}

function customerSatisfied(bottle, card) {
  const ingredients = currentIngredients(bottle);
  const filled = filledCount(bottle);
  const counts = Object.values(ingredientCounts(bottle)).sort((left, right) => right - left);

  switch (card.predicate.type) {
    case "containsIngredients":
      return card.predicate.ingredients.every((ingredient) => ingredients.includes(ingredient));
    case "startsWith":
      return bottle.slots[0]?.ingredient === card.predicate.ingredient;
    case "endsWith":
      return ingredients.at(-1) === card.predicate.ingredient;
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
    case "ingredientsRepeatedExactly":
      return counts.filter((count) => count === card.predicate.repeatCount).length === card.predicate.ingredientKinds;
    case "stageIs":
      return bottle.stage === card.predicate.stage;
    case "rotTokensExactly":
      return bottle.rotTokens === card.predicate.count;
    case "bottleSizeAtLeastAndRotExactly":
      return filled >= card.predicate.minimum && bottle.rotTokens === card.predicate.rotCount;
  }
}

function matchedCustomerIndexes(bottle, customers) {
  return customers.flatMap((card, index) => (customerSatisfied(bottle, card) ? [index] : []));
}

function customerScoreForBottle(bottle, customers) {
  return matchedCustomerIndexes(bottle, customers).reduce((sum, index) => sum + customers[index].reward, 0);
}

function scoreBottle(bottle, customers, withCustomer) {
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

function applyRoundEndAging(bottle) {
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
  next.slots.push({ ingredient: null, state: "empty" });
  next.rotTokens += 1;
  next.stage = filledCount(next) >= 3 ? "fresh" : "none";
  return next;
}

function advanceRound(state) {
  const [rolledDice, rngState] = rollDice(state.rngState, 4);
  return {
    ...state,
    rngState,
    round: state.round + 1,
    rolledDice,
  };
}

function serializeState(state) {
  return JSON.stringify({
    round: state.round,
    score: state.score,
    bottles: state.bottles.map((bottle) =>
      bottle
        ? {
            slots: bottle.slots.map((slot) => slot.ingredient ?? "_"),
            stage: bottle.stage,
            rotTokens: bottle.rotTokens,
          }
        : null,
    ),
    customers: state.currentCustomers.map((card) => card.id),
    deck: state.customerDeck.map((card) => card.id),
    rolledDice: state.rolledDice,
  });
}

function sealBottle(state, bottleIndex, withCustomer) {
  const bottle = state.bottles[bottleIndex];
  if (!bottle || !canStartSeal(bottle)) {
    return state;
  }

  const matchedIndexes = withCustomer ? matchedCustomerIndexes(bottle, state.currentCustomers) : [];
  const score = scoreBottle(bottle, state.currentCustomers, withCustomer);

  let nextCustomers = [...state.currentCustomers];
  let nextDeck = [...state.customerDeck];
  if (withCustomer && matchedIndexes.length > 0) {
    nextCustomers = nextCustomers.filter((_, index) => !matchedIndexes.includes(index));
    while (nextCustomers.length < 2 && nextDeck.length > 0) {
      nextCustomers.push(nextDeck[0]);
      nextDeck = nextDeck.slice(1);
    }
  }

  const bottles = [...state.bottles];
  bottles[bottleIndex] = null;

  return {
    ...state,
    score: state.score + score.total,
    bottles,
    sealedBottles: [...state.sealedBottles, cloneBottle(bottle)],
    currentCustomers: nextCustomers,
    customerDeck: nextDeck,
  };
}

function resolveTurnEnd(state) {
  const agedBottles = state.bottles.map((bottle) => (bottle ? applyRoundEndAging(bottle) : null));
  const afterAging = { ...state, bottles: agedBottles };

  if (afterAging.round >= afterAging.maxRounds) {
    let current = { ...afterAging, currentCustomers: [] };
    for (const bottleIndex of [0, 1]) {
      if (current.bottles[bottleIndex]) {
        current = sealBottle(current, bottleIndex, false);
      }
    }
    return current;
  }

  return advanceRound(afterAging);
}

function chosenIndexPairs() {
  return [
    [0, 1],
    [0, 2],
    [0, 3],
    [1, 2],
    [1, 3],
    [2, 3],
  ];
}

function enumeratePlacementResults(state, pair) {
  const items = pair.map((draftIndex) => ({ draftIndex, ingredient: state.rolledDice[draftIndex] }));
  const results = new Map();

  function step(currentState, remainingItems) {
    if (remainingItems.length === 0) {
      results.set(serializeState(currentState), currentState);
      return;
    }

    for (let itemIndex = 0; itemIndex < remainingItems.length; itemIndex += 1) {
      const item = remainingItems[itemIndex];
      const nextItems = remainingItems.filter((_, index) => index !== itemIndex);

      for (const bottleIndex of [0, 1]) {
        const currentBottle = currentState.bottles[bottleIndex] ?? createBottle(bottleIndex);
        if (!canPlaceIngredient(currentBottle)) {
          continue;
        }
        const placedBottle = placeIngredient(currentBottle, item.ingredient);
        const nextBottles = [...currentState.bottles];
        nextBottles[bottleIndex] = placedBottle;
        step({ ...currentState, bottles: nextBottles }, nextItems);
      }
    }
  }

  step(
    {
      ...state,
      bottles: state.bottles.map((bottle) => (bottle ? cloneBottle(bottle) : null)),
      currentCustomers: [...state.currentCustomers],
      customerDeck: [...state.customerDeck],
      sealedBottles: [...state.sealedBottles],
    },
    items,
  );

  return [...results.values()];
}

function enumerateSealResults(state) {
  const results = new Map();

  function visit(currentState) {
    results.set(serializeState(currentState), currentState);
    for (const bottleIndex of [0, 1]) {
      const bottle = currentState.bottles[bottleIndex];
      if (!bottle || !canStartSeal(bottle)) {
        continue;
      }
      visit(sealBottle(currentState, bottleIndex, true));
    }
  }

  visit(state);
  return [...results.values()];
}

function enumerateTurnOutcomes(state) {
  const outcomes = [];
  for (const pair of chosenIndexPairs()) {
    for (const placedState of enumeratePlacementResults(state, pair)) {
      for (const sealedState of enumerateSealResults(placedState)) {
        outcomes.push({
          choice: pair,
          result: resolveTurnEnd(sealedState),
          immediate: sealedState.score - state.score,
        });
      }
    }
  }
  return outcomes;
}

function enumerateEmergencySealStates(state) {
  const results = new Map();

  function visit(currentState) {
    results.set(serializeState(currentState), currentState);
    for (const bottleIndex of [0, 1]) {
      const bottle = currentState.bottles[bottleIndex];
      if (!bottle || !canStartSeal(bottle)) {
        continue;
      }
      visit(sealBottle(currentState, bottleIndex, true));
    }
  }

  visit(state);
  return [...results.values()].filter((candidate) => candidate !== state);
}

function liveRotPenalty(state) {
  return state.bottles.reduce((sum, bottle) => sum + (bottle?.rotTokens ?? 0) * 2, 0);
}

function currentCustomerPotential(bottle, customers) {
  if (!bottle) {
    return 0;
  }
  return customerScoreForBottle(bottle, customers);
}

function bottleMetrics(bottle, customers) {
  if (!bottle) {
    return {
      filled: 0,
      unique: 0,
      orderLength: 0,
      orderScore: 0,
      densityScore: 0,
      customerPotential: 0,
      stagePenalty: 0,
      rotTokens: 0,
      rotPenalty: 0,
      canSeal: false,
    };
  }

  const filled = filledCount(bottle);
  const unique = new Set(currentIngredients(bottle)).size;
  const orderLength = orderChainLength(bottle);
  const orderScore = orderScoreForBottle(bottle);
  const densityScore = densityScoreForBottle(bottle);
  const customerPotential = currentCustomerPotential(bottle, customers);
  const stagePenalty = bottle.stage === "faded" ? 2.4 : bottle.stage === "fresh" ? 1.1 : 0;

  return {
    filled,
    unique,
    orderLength,
    orderScore,
    densityScore,
    customerPotential,
    stagePenalty,
    rotTokens: bottle.rotTokens,
    rotPenalty: bottle.rotTokens * 2,
    canSeal: canStartSeal(bottle),
  };
}

function heuristicBottleValue(bottle) {
  if (!bottle) {
    return 0;
  }
  const uniqueCount = new Set(currentIngredients(bottle)).size;
  const stagePenalty = bottle.stage === "faded" ? 2.4 : bottle.stage === "fresh" ? 1.1 : 0;
  return (
    baseScoreForBottle(bottle) +
    orderScoreForBottle(bottle) +
    densityScoreForBottle(bottle) +
    filledCount(bottle) * 0.85 +
    uniqueCount * 0.55 -
    bottle.rotTokens * 2 -
    stagePenalty
  );
}

function evaluateState(state, strategy) {
  const metrics = state.bottles.map((bottle) => bottleMetrics(bottle, state.currentCustomers));
  const openBottleValue = state.bottles.reduce((sum, bottle) => sum + heuristicBottleValue(bottle), 0);
  const liveTotal = state.score - liveRotPenalty(state);
  const sealableCount = metrics.filter((item) => item.canSeal).length;
  const fadedCount = state.bottles.reduce((sum, bottle) => sum + (bottle?.stage === "faded" ? 1 : 0), 0);
  const totalFilled = metrics.reduce((sum, item) => sum + item.filled, 0);
  const totalOrderScore = metrics.reduce((sum, item) => sum + item.orderScore, 0);
  const totalOrderLength = metrics.reduce((sum, item) => sum + item.orderLength, 0);
  const totalDensityScore = metrics.reduce((sum, item) => sum + item.densityScore, 0);
  const totalCustomerPotential = metrics.reduce((sum, item) => sum + item.customerPotential, 0);
  const totalRotTokens = metrics.reduce((sum, item) => sum + item.rotTokens, 0);
  const largeBottleCount = metrics.reduce((sum, item) => sum + (item.filled >= 5 ? 1 : 0), 0);
  const exactlyOneRotBottleCount = metrics.reduce((sum, item) => sum + (item.rotTokens === 1 ? 1 : 0), 0);

  switch (strategy) {
    case "random":
      return 0;
    case "safe":
      return (
        liveTotal +
        openBottleValue * 0.55 -
        state.bottles.filter(Boolean).length * 0.7 -
        fadedCount * 3
      );
    case "tempo":
      return liveTotal + openBottleValue * 0.45 + sealableCount * 2.8 - fadedCount * 3.2 - totalRotTokens * 1.4;
    case "growth":
      return (
        liveTotal +
        openBottleValue * 0.95 +
        totalFilled * 0.8
      );
    case "customer":
      return liveTotal + openBottleValue * 0.4 + totalCustomerPotential * 2.5 + sealableCount * 1.2 - fadedCount * 1.6;
    case "order":
      return liveTotal + openBottleValue * 0.55 + totalOrderScore * 2.6 + totalOrderLength * 0.8 + totalFilled * 0.35;
    case "density":
      return liveTotal + openBottleValue * 0.5 + totalDensityScore * 2.7 + totalFilled * 0.2 - totalRotTokens * 0.6;
    case "rot":
      return (
        liveTotal +
        openBottleValue * 0.7 +
        largeBottleCount * 2.3 +
        exactlyOneRotBottleCount * 2.4 +
        totalCustomerPotential * 0.8 -
        Math.max(0, totalRotTokens - 1) * 1.5 -
        fadedCount * 0.8
      );
    case "greedy":
    default:
      return liveTotal + openBottleValue * 0.75;
  }
}

function chooseOutcome(state, strategy, rngState) {
  let outcomes = enumerateTurnOutcomes(state);
  if (outcomes.length === 0) {
    outcomes = enumerateEmergencySealStates(state).flatMap((sealedState) =>
      enumerateTurnOutcomes(sealedState).map((outcome) => ({
        ...outcome,
        immediate: outcome.result.score - state.score,
      })),
    );
  }
  if (outcomes.length === 0) {
    return resolveTurnEnd(state);
  }
  if (strategy === "random") {
    const [pick] = randomInt(rngState, outcomes.length);
    return outcomes[pick].result;
  }

  let best = [];
  let bestScore = Number.NEGATIVE_INFINITY;
  for (const outcome of outcomes) {
    const score = evaluateState(outcome.result, strategy);
    if (score > bestScore) {
      bestScore = score;
      best = [outcome.result];
    } else if (score === bestScore) {
      best.push(outcome.result);
    }
  }

  const [pick] = randomInt(rngState, best.length);
  return best[pick];
}

function simulateGame(seed, strategy) {
  let state = createInitialState(seed);
  while (state.round <= state.maxRounds) {
    const chosen = chooseOutcome(state, strategy, state.rngState ^ state.seed ^ state.round);
    if (chosen.round === state.round && state.round === state.maxRounds) {
      state = chosen;
      break;
    }
    state = chosen;
    if (state.round > state.maxRounds) {
      break;
    }
  }
  return state.score;
}

function summarize(scores) {
  const sorted = [...scores].sort((left, right) => left - right);
  const sum = scores.reduce((total, score) => total + score, 0);
  return {
    games: scores.length,
    average: sum / scores.length,
    min: sorted[0],
    median: sorted[Math.floor(sorted.length / 2)],
    p90: sorted[Math.floor(sorted.length * 0.9)],
    max: sorted[sorted.length - 1],
  };
}

function parseArgs(argv) {
  const options = {
    games: 500,
    baseSeed: 20260711,
    strategies: ["random", "safe", "tempo", "greedy", "growth", "customer", "order", "density", "rot"],
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--games") {
      options.games = Number(argv[index + 1]);
      index += 1;
    } else if (arg === "--seed") {
      options.baseSeed = Number(argv[index + 1]);
      index += 1;
    } else if (arg === "--strategies") {
      options.strategies = argv[index + 1].split(",").map((item) => item.trim()).filter(Boolean);
      index += 1;
    }
  }

  return options;
}

function main() {
  const { games, baseSeed, strategies } = parseArgs(process.argv.slice(2));

  console.log(`Simulating ${games} games per strategy from base seed ${baseSeed}...`);
  for (const strategy of strategies) {
    const scores = [];
    for (let index = 0; index < games; index += 1) {
      scores.push(simulateGame(baseSeed + index, strategy));
    }
    const summary = summarize(scores);
    console.log(
      [
        strategy.padEnd(8, " "),
        `avg=${summary.average.toFixed(2)}`,
        `median=${summary.median}`,
        `min=${summary.min}`,
        `p90=${summary.p90}`,
        `max=${summary.max}`,
      ].join("  "),
    );
  }
}

main();

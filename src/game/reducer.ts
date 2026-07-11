import { INGREDIENT_INFO } from "./data";
import {
  advanceRound,
  applyRoundEndAging,
  bottleSummary,
  canPlaceIngredient,
  canStartSeal,
  cloneBottle,
  createBottle,
  createInitialState,
  matchedCustomerIndexes,
  placeIngredient,
  scoreBottle,
} from "./rules";
import type { Bottle, GameAction, GameState } from "./types";

function log(state: GameState, text: string): GameState {
  return {
    ...state,
    log: [{ id: crypto.randomUUID(), text }, ...state.log].slice(0, 24),
  };
}

function updateBottle(state: GameState, bottleIndex: 0 | 1, bottle: Bottle | null): GameState {
  const bottles = [...state.bottles] as GameState["bottles"];
  bottles[bottleIndex] = bottle;
  return { ...state, bottles };
}

function sealBottleInternal(state: GameState, bottleIndex: 0 | 1, withCustomer: boolean): GameState {
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

  const next = updateBottle(
    {
      ...state,
      score: state.score + score.total,
      sealedBottles: [...state.sealedBottles, cloneBottle(bottle)],
      currentCustomers: nextCustomers,
      customerDeck: nextDeck,
    },
    bottleIndex,
    null,
  );

  return log(
    next,
    `${bottle.label}封瓶：基础 ${score.base}，排列 ${score.order}，浓度 ${score.density}${
      withCustomer ? `，顾客 ${score.customer}` : ""
    }，腐朽 -${score.rotPenalty}，总计 ${score.total}。${bottleSummary(bottle)}`,
  );
}

function applyRoundEnd(state: GameState): GameState {
  const bottles = [...state.bottles] as GameState["bottles"];
  bottles.forEach((bottle, index) => {
    if (!bottle) {
      return;
    }
    bottles[index as 0 | 1] = applyRoundEndAging(bottle);
  });

  const current = { ...state, bottles };

  if (current.round >= current.maxRounds) {
    let settled: GameState = {
      ...current,
      currentCustomers: [],
      rolledDice: [],
      chosenDice: [],
      pendingDice: [],
    };

    for (const index of [0, 1] as const) {
      if (settled.bottles[index]) {
        settled = sealBottleInternal(settled, index, false);
      }
    }

    return {
      ...log(settled, `第 ${state.maxRounds} 回合结束后已自动封瓶。最终总分 ${settled.score}。`),
      phase: "finished",
    };
  }

  return advanceRound(current);
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "start":
      return createInitialState(action.seed);

    case "toggleDie":
      if (state.phase !== "choose") {
        return state;
      }
      return {
        ...state,
        chosenDice: state.chosenDice.includes(action.index)
          ? state.chosenDice.filter((index) => index !== action.index)
          : state.chosenDice.length < 2
            ? [...state.chosenDice, action.index]
            : state.chosenDice,
      };

    case "confirmChoice":
      if (state.phase !== "choose" || state.chosenDice.length !== 2) {
        return state;
      }
      return log(
        {
          ...state,
          phase: "place",
          pendingDice: [...state.chosenDice],
        },
        `选择了 ${state.chosenDice.map((index) => INGREDIENT_INFO[state.rolledDice[index]].label).join("、")}。`,
      );

    case "placeDie": {
      if (state.phase !== "place" || !state.pendingDice.includes(action.draftIndex)) {
        return state;
      }

      const ingredient = state.rolledDice[action.draftIndex];
      const currentBottle = state.bottles[action.bottleIndex] ?? createBottle(action.bottleIndex);

      if (!canPlaceIngredient(currentBottle)) {
        return log(state, `${currentBottle.label}已满，不能继续放置。`);
      }

      const placedBottle = placeIngredient(currentBottle, ingredient);
      const nextState = updateBottle(state, action.bottleIndex, placedBottle);
      const pendingDice = nextState.pendingDice.filter((index) => index !== action.draftIndex);
      const slotNumber = placedBottle.slots.filter((slot) => slot.ingredient).length;

      return log(
        {
          ...nextState,
          pendingDice,
          phase: pendingDice.length === 0 ? "seal" : "place",
        },
        `${INGREDIENT_INFO[ingredient].label}放入${placedBottle.label}的第 ${slotNumber} 格。`,
      );
    }

    case "sealBottle":
      if (state.phase !== "seal") {
        return state;
      }
      return sealBottleInternal(state, action.bottleIndex, true);

    case "finishSealPhase":
      if (state.phase !== "seal") {
        return state;
      }
      return applyRoundEnd(log(state, `第 ${state.round} 回合进入回合结尾挥发。`));

    default:
      return state;
  }
}
